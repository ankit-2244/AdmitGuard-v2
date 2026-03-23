import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// --- Types ---
interface Education {
  level: string;
  board: string;
  stream?: string;
  yearOfPassing: number;
  score: number;
  scoreScale: "Percentage" | "CGPA 10" | "CGPA 4";
  backlogs?: number;
  gapAfter?: number;
}

interface WorkExperience {
  company: string;
  role: string;
  domain: string;
  startDate: string;
  endDate: string | "Present";
  employmentType: string;
  skills: string[];
}

interface ApplicationData {
  name: string;
  email: string;
  phone: string;
  dob: string; // Added for age validation
  education: Education[];
  workExperience: WorkExperience[];
}

// --- Intelligence Layer Logic ---
function calculateIntelligence(data: ApplicationData) {
  let riskScore = 0;
  const flags: string[] = [];
  const breakdown: string[] = [];

  // 1. Education Gap
  const totalEdGap = data.education.reduce((sum, ed) => sum + (ed.gapAfter || 0), 0);
  if (totalEdGap > 24) {
    riskScore += 30;
    flags.push(`Significant Education Gap (${totalEdGap} months)`);
    breakdown.push(`Education gap of ${totalEdGap} months exceeds the 24-month threshold: +30 risk`);
  }

  // 2. Backlogs
  const totalBacklogs = data.education.reduce((sum, ed) => sum + (ed.backlogs || 0), 0);
  if (totalBacklogs > 0) {
    riskScore += 20;
    flags.push(`Backlogs detected (${totalBacklogs})`);
    breakdown.push(`Presence of ${totalBacklogs} backlogs in higher education: +20 risk`);
  }

  // 3. Work Experience (Handling Overlaps)
  let totalExperienceMonths = 0;
  if (data.workExperience.length > 0) {
    // Convert all experiences to intervals [start, end]
    const intervals = data.workExperience.map(exp => {
      const start = new Date(exp.startDate).getTime();
      const end = exp.endDate === "Present" ? new Date().getTime() : new Date(exp.endDate).getTime();
      return [start, end];
    }).sort((a, b) => a[0] - b[0]);

    // Merge overlapping intervals
    const merged: number[][] = [];
    if (intervals.length > 0) {
      let current = intervals[0];
      for (let i = 1; i < intervals.length; i++) {
        const next = intervals[i];
        if (next[0] <= current[1]) {
          current[1] = Math.max(current[1], next[1]);
        } else {
          merged.push(current);
          current = next;
        }
      }
      merged.push(current);
    }

    const totalMs = merged.reduce((sum, interval) => sum + (interval[1] - interval[0]), 0);
    totalExperienceMonths = totalMs / (1000 * 60 * 60 * 24 * 30.44);

    // Check for overlaps to flag
    if (merged.length < data.workExperience.length) {
      flags.push("Overlapping work experience detected");
      breakdown.push("Overlapping work experience periods merged for duration calculation");
    }
  }

  if (data.workExperience.length === 0) {
    riskScore += 15;
    flags.push("No Work Experience");
    breakdown.push("No professional work experience recorded: +15 risk");
  }

  // 4. Career Gaps (between jobs)
  let gapCount = 0;
  if (data.workExperience.length > 1) {
    const sortedExp = [...data.workExperience].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    for (let i = 0; i < sortedExp.length - 1; i++) {
      const currentEnd = sortedExp[i].endDate === "Present" ? new Date().getTime() : new Date(sortedExp[i].endDate).getTime();
      const nextStart = new Date(sortedExp[i + 1].startDate).getTime();
      const gapMonths = (nextStart - currentEnd) / (1000 * 60 * 60 * 24 * 30.44);
      if (gapMonths > 6) {
        gapCount++;
      }
    }
  }
  if (gapCount > 0) {
    riskScore += 10;
    flags.push(`Career Gaps between jobs detected (${gapCount} gaps)`);
    breakdown.push(`Detected ${gapCount} career gaps exceeding 6 months between employments: +10 risk`);
  }

  // 5. Lateral Entry Check (Diploma -> UG)
  const hasDiploma = data.education.some(ed => ed.level === "Diploma");
  const hasUG = data.education.some(ed => ed.level === "UG");
  if (hasDiploma && hasUG) {
    flags.push("Lateral Entry Pathway (Diploma to UG)");
  }

  // 5. No work experience AND > 3 years since last education
  const lastEd = [...data.education].sort((a, b) => b.yearOfPassing - a.yearOfPassing)[0];
  const yearsSinceEd = new Date().getFullYear() - lastEd.yearOfPassing;
  if (data.workExperience.length === 0 && yearsSinceEd > 3) {
    flags.push(`Long-term inactivity (${yearsSinceEd} years since last education)`);
    breakdown.push(`Inactivity of ${yearsSinceEd} years since graduation with no work experience: Flagged for review`);
  }

  // 6. Low Academic Score (<60%)
  const lowScores = data.education.filter(ed => {
    let normalizedScore = ed.score;
    if (ed.scoreScale === "CGPA 10") normalizedScore = ed.score * 10;
    if (ed.scoreScale === "CGPA 4") normalizedScore = (ed.score / 4) * 100;
    return normalizedScore < 60;
  });
  if (lowScores.length > 0) {
    riskScore += 15;
    const lowLevels = lowScores.map(ed => ed.level).join(", ");
    flags.push(`Low Academic Score in ${lowLevels}`);
    breakdown.push(`Academic score below 60% threshold in ${lowLevels}: +15 risk`);
  }

  // Final Score Cap
  riskScore = Math.min(100, riskScore);

  // Categorization
  let category = "Strong Fit";
  if (riskScore > 30 && riskScore <= 60) category = "Needs Review";
  if (riskScore > 60) category = "Weak Fit";

  // Experience Category
  let expCategory = "Fresher";
  if (totalExperienceMonths > 0 && totalExperienceMonths <= 24) expCategory = "Junior";
  if (totalExperienceMonths > 24 && totalExperienceMonths <= 60) expCategory = "Mid";
  if (totalExperienceMonths > 60) expCategory = "Senior";

  return {
    riskScore,
    category,
    flags,
    breakdown,
    totalExperienceMonths: Math.round(totalExperienceMonths),
    expCategory
  };
}

// --- API Routes ---
app.post("/api/validate", async (req, res) => {
  const data: ApplicationData = req.body;
  const errors: string[] = [];

  // Tier 1: Hard Rejects
  if (!data.email) errors.push("Email is required.");
  
  const edMap = new Map<string, Education>();
  data.education.forEach(ed => edMap.set(ed.level, ed));

  // 1. 10th is mandatory
  if (!edMap.has("10th")) {
    errors.push("10th education is mandatory.");
  }

  // 2. Path Validation
  const has12th = edMap.has("12th");
  const hasDiploma = edMap.has("Diploma");
  const hasUG = edMap.has("UG");
  const hasPG = edMap.has("PG");

  if (hasUG && !has12th && !hasDiploma) {
    errors.push("UG requires either 12th or Diploma completion.");
  }

  if (hasPG && !hasUG) {
    errors.push("PG requires UG completion.");
  }

  // 3. Strict Chronological Order
  // Hierarchy: 10th -> (12th | Diploma | ITI) -> UG -> PG
  const ed10 = edMap.get("10th");
  const ed12 = edMap.get("12th");
  const edDip = edMap.get("Diploma");
  const edITI = edMap.get("ITI");
  const edUG = edMap.get("UG");
  const edPG = edMap.get("PG");

  if (ed10) {
    if (ed12 && ed12.yearOfPassing <= ed10.yearOfPassing) errors.push("12th passing year must be after 10th.");
    if (edDip && edDip.yearOfPassing <= ed10.yearOfPassing) errors.push("Diploma passing year must be after 10th.");
    if (edITI && edITI.yearOfPassing <= ed10.yearOfPassing) errors.push("ITI passing year must be after 10th.");
  }

  if (edUG) {
    if (ed12 && edUG.yearOfPassing <= ed12.yearOfPassing) errors.push("UG passing year must be after 12th.");
    if (edDip && edUG.yearOfPassing <= edDip.yearOfPassing) errors.push("UG passing year must be after Diploma.");
    if (edITI && !ed12 && !edDip && edUG.yearOfPassing <= edITI.yearOfPassing) errors.push("UG passing year must be after ITI.");
  }

  if (edPG && edUG && edPG.yearOfPassing <= edUG.yearOfPassing) {
    errors.push("PG passing year must be after UG.");
  }

  // General chronological check for any other levels added
  const sortedEd = [...data.education].sort((a, b) => a.yearOfPassing - b.yearOfPassing);
  // (Optional: we could check if the user submitted them in order, but the above logic is more robust for academic paths)

  // Work experience dates
  data.workExperience.forEach(exp => {
    if (exp.endDate !== "Present") {
      if (new Date(exp.endDate) < new Date(exp.startDate)) {
        errors.push(`Invalid dates for ${exp.company}: End date cannot be before start date.`);
      }
    }
  });

  // Age < 18
  if (data.dob) {
    const age = (new Date().getTime() - new Date(data.dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    if (age < 18) errors.push("Applicant must be at least 18 years old.");
  }

  // Score out of range
  data.education.forEach(ed => {
    if (ed.scoreScale === "Percentage" && (ed.score < 0 || ed.score > 100)) errors.push(`Invalid percentage for ${ed.level}.`);
    if (ed.scoreScale === "CGPA 10" && (ed.score < 0 || ed.score > 10)) errors.push(`Invalid CGPA for ${ed.level}.`);
    if (ed.scoreScale === "CGPA 4" && (ed.score < 0 || ed.score > 4)) errors.push(`Invalid CGPA for ${ed.level}.`);
  });

  if (errors.length > 0) {
    return res.status(400).json({ type: "HARD_REJECT", errors });
  }

  // Intelligence Layer
  const intelligence = calculateIntelligence(data);

  // Google Sheets Integration
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  console.log("Checking webhook URL:", webhookUrl ? "Present" : "Missing");
  
  if (webhookUrl && webhookUrl !== "https://script.google.com/macros/s/.../exec") {
    try {
      console.log("Attempting to send data to Google Sheets webhook...");
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          ...intelligence,
          timestamp: new Date().toISOString()
        })
      });
      
      const responseText = await response.text();
      console.log("Webhook response status:", response.status);
      console.log("Webhook response body:", responseText);
      
      if (!response.ok) {
        console.error(`Webhook failed with status ${response.status}: ${responseText}`);
      } else {
        console.log("Data successfully sent to Google Sheets.");
      }
    } catch (e) {
      console.error("Webhook fetch failed:", e);
    }
  } else {
    console.warn("Webhook URL is missing or still set to placeholder. Data will not be sent to Google Sheets.");
  }

  res.json({
    success: true,
    ...intelligence
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
