/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Plus, Trash2, CheckCircle, AlertCircle, Loader2, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

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

interface IntelligenceResult {
  riskScore: number;
  category: string;
  flags: string[];
  breakdown: string[];
  totalExperienceMonths: number;
  expCategory: string;
}

export default function App() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    dob: "",
    education: [
      { level: "10th", board: "", yearOfPassing: 2020, score: 0, scoreScale: "Percentage", gapAfter: 0 } as Education
    ],
    workExperience: [] as WorkExperience[]
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<IntelligenceResult | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  const addEducation = () => {
    setFormData({
      ...formData,
      education: [...formData.education, { level: "12th", board: "", yearOfPassing: 2022, score: 0, scoreScale: "Percentage", gapAfter: 0 }]
    });
  };

  const removeEducation = (index: number) => {
    const newEd = [...formData.education];
    newEd.splice(index, 1);
    setFormData({ ...formData, education: newEd });
  };

  const addWork = () => {
    setFormData({
      ...formData,
      workExperience: [...formData.workExperience, { company: "", role: "", domain: "IT", startDate: "", endDate: "Present", employmentType: "Full-time", skills: [] }]
    });
  };

  const removeWork = (index: number) => {
    const newWork = [...formData.workExperience];
    newWork.splice(index, 1);
    setFormData({ ...formData, workExperience: newWork });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors([]);
    setResult(null);

    try {
      const response = await fetch("/api/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (!response.ok) {
        setErrors(data.errors || ["An unexpected error occurred."]);
      } else {
        setResult(data);
      }
    } catch (err) {
      setErrors(["Failed to connect to the server."]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-[#1a1a1a] font-sans py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-[#0a0a0a] mb-2">AdmitGuard v2</h1>
          <p className="text-[#666] text-lg">Admission Validation & Intelligence Platform</p>
        </div>

        {!result ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-sm border border-[#e5e5e5] overflow-hidden"
          >
            <form onSubmit={handleSubmit} className="p-8 space-y-12">
              {/* Basic Details */}
              <section>
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-[#0a0a0a] text-white flex items-center justify-center text-sm">1</span>
                  Basic Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-[#666] mb-1">Full Name</label>
                    <input
                      required
                      type="text"
                      className="w-full px-4 py-3 rounded-xl border border-[#e5e5e5] focus:outline-none focus:ring-2 focus:ring-[#0a0a0a]/5 transition-all"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#666] mb-1">Email Address</label>
                    <input
                      required
                      type="email"
                      className="w-full px-4 py-3 rounded-xl border border-[#e5e5e5] focus:outline-none focus:ring-2 focus:ring-[#0a0a0a]/5 transition-all"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#666] mb-1">Phone Number</label>
                    <input
                      required
                      type="tel"
                      className="w-full px-4 py-3 rounded-xl border border-[#e5e5e5] focus:outline-none focus:ring-2 focus:ring-[#0a0a0a]/5 transition-all"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#666] mb-1">Date of Birth</label>
                    <input
                      required
                      type="date"
                      className="w-full px-4 py-3 rounded-xl border border-[#e5e5e5] focus:outline-none focus:ring-2 focus:ring-[#0a0a0a]/5 transition-all"
                      value={formData.dob}
                      onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    />
                  </div>
                </div>
              </section>

              {/* Education Section */}
              <section>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-[#0a0a0a] text-white flex items-center justify-center text-sm">2</span>
                    Education History
                  </h2>
                  <button
                    type="button"
                    onClick={addEducation}
                    className="flex items-center gap-2 text-sm font-medium text-[#0a0a0a] hover:opacity-70 transition-opacity"
                  >
                    <Plus size={18} /> Add Level
                  </button>
                </div>
                <div className="space-y-6">
                  {formData.education.map((ed, idx) => (
                    <div key={idx} className="p-6 rounded-2xl border border-[#e5e5e5] bg-[#fafafa] relative group">
                      {idx > 0 && (
                        <button
                          type="button"
                          onClick={() => removeEducation(idx)}
                          className="absolute top-4 right-4 text-[#ff4444] opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-[#999] uppercase tracking-wider mb-1">Level</label>
                          <select
                            className="w-full px-3 py-2 rounded-lg border border-[#e5e5e5] bg-white text-sm"
                            value={ed.level}
                            onChange={(e) => {
                              const newEd = [...formData.education];
                              newEd[idx].level = e.target.value;
                              setFormData({ ...formData, education: newEd });
                            }}
                          >
                            <option>10th</option>
                            <option>12th</option>
                            <option>Diploma</option>
                            <option>ITI</option>
                            <option>UG</option>
                            <option>PG</option>
                          </select>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs font-semibold text-[#999] uppercase tracking-wider mb-1">Board / University</label>
                          <input
                            required
                            type="text"
                            className="w-full px-3 py-2 rounded-lg border border-[#e5e5e5] bg-white text-sm"
                            value={ed.board}
                            onChange={(e) => {
                              const newEd = [...formData.education];
                              newEd[idx].board = e.target.value;
                              setFormData({ ...formData, education: newEd });
                            }}
                          />
                        </div>
                        {(ed.level === "12th" || ed.level === "UG" || ed.level === "PG" || ed.level === "Diploma") && (
                          <div>
                            <label className="block text-xs font-semibold text-[#999] uppercase tracking-wider mb-1">Stream</label>
                            <input
                              required
                              type="text"
                              className="w-full px-3 py-2 rounded-lg border border-[#e5e5e5] bg-white text-sm"
                              value={ed.stream}
                              onChange={(e) => {
                                const newEd = [...formData.education];
                                newEd[idx].stream = e.target.value;
                                setFormData({ ...formData, education: newEd });
                              }}
                            />
                          </div>
                        )}
                        <div>
                          <label className="block text-xs font-semibold text-[#999] uppercase tracking-wider mb-1">Year of Passing</label>
                          <input
                            required
                            type="number"
                            className="w-full px-3 py-2 rounded-lg border border-[#e5e5e5] bg-white text-sm"
                            value={isNaN(ed.yearOfPassing) ? "" : ed.yearOfPassing}
                            onChange={(e) => {
                              const val = parseInt(e.target.value);
                              const newEd = [...formData.education];
                              newEd[idx].yearOfPassing = isNaN(val) ? 0 : val;
                              setFormData({ ...formData, education: newEd });
                            }}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#999] uppercase tracking-wider mb-1">Score</label>
                          <div className="flex gap-2">
                            <input
                              required
                              type="number"
                              step="0.01"
                              className="w-full px-3 py-2 rounded-lg border border-[#e5e5e5] bg-white text-sm"
                              value={isNaN(ed.score) ? "" : ed.score}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value);
                                const newEd = [...formData.education];
                                newEd[idx].score = isNaN(val) ? 0 : val;
                                setFormData({ ...formData, education: newEd });
                              }}
                            />
                            <select
                              className="px-2 py-2 rounded-lg border border-[#e5e5e5] bg-white text-xs"
                              value={ed.scoreScale}
                              onChange={(e) => {
                                const newEd = [...formData.education];
                                newEd[idx].scoreScale = e.target.value as any;
                                setFormData({ ...formData, education: newEd });
                              }}
                            >
                              <option>Percentage</option>
                              <option>CGPA 10</option>
                              <option>CGPA 4</option>
                            </select>
                          </div>
                        </div>
                        {(ed.level === "UG" || ed.level === "PG") && (
                          <div>
                            <label className="block text-xs font-semibold text-[#999] uppercase tracking-wider mb-1">Backlogs</label>
                            <input
                              type="number"
                              className="w-full px-3 py-2 rounded-lg border border-[#e5e5e5] bg-white text-sm"
                              value={isNaN(ed.backlogs || 0) ? "" : (ed.backlogs || 0)}
                              onChange={(e) => {
                                const val = parseInt(e.target.value);
                                const newEd = [...formData.education];
                                newEd[idx].backlogs = isNaN(val) ? 0 : val;
                                setFormData({ ...formData, education: newEd });
                              }}
                            />
                          </div>
                        )}
                        <div>
                          <label className="block text-xs font-semibold text-[#999] uppercase tracking-wider mb-1">Gap After (Months)</label>
                          <input
                            type="number"
                            className="w-full px-3 py-2 rounded-lg border border-[#e5e5e5] bg-white text-sm"
                            value={isNaN(ed.gapAfter || 0) ? "" : (ed.gapAfter || 0)}
                            onChange={(e) => {
                              const val = parseInt(e.target.value);
                              const newEd = [...formData.education];
                              newEd[idx].gapAfter = isNaN(val) ? 0 : val;
                              setFormData({ ...formData, education: newEd });
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Work Experience Section */}
              <section>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-[#0a0a0a] text-white flex items-center justify-center text-sm">3</span>
                    Work Experience
                  </h2>
                  <button
                    type="button"
                    onClick={addWork}
                    className="flex items-center gap-2 text-sm font-medium text-[#0a0a0a] hover:opacity-70 transition-opacity"
                  >
                    <Plus size={18} /> Add Experience
                  </button>
                </div>
                <div className="space-y-6">
                  {formData.workExperience.map((work, idx) => (
                    <div key={idx} className="p-6 rounded-2xl border border-[#e5e5e5] bg-[#fafafa] relative group">
                      <button
                        type="button"
                        onClick={() => removeWork(idx)}
                        className="absolute top-4 right-4 text-[#ff4444] opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={18} />
                      </button>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-[#999] uppercase tracking-wider mb-1">Company Name</label>
                          <input
                            required
                            type="text"
                            className="w-full px-3 py-2 rounded-lg border border-[#e5e5e5] bg-white text-sm"
                            value={work.company}
                            onChange={(e) => {
                              const newWork = [...formData.workExperience];
                              newWork[idx].company = e.target.value;
                              setFormData({ ...formData, workExperience: newWork });
                            }}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#999] uppercase tracking-wider mb-1">Role</label>
                          <input
                            required
                            type="text"
                            className="w-full px-3 py-2 rounded-lg border border-[#e5e5e5] bg-white text-sm"
                            value={work.role}
                            onChange={(e) => {
                              const newWork = [...formData.workExperience];
                              newWork[idx].role = e.target.value;
                              setFormData({ ...formData, workExperience: newWork });
                            }}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#999] uppercase tracking-wider mb-1">Domain</label>
                          <select
                            className="w-full px-3 py-2 rounded-lg border border-[#e5e5e5] bg-white text-sm"
                            value={work.domain}
                            onChange={(e) => {
                              const newWork = [...formData.workExperience];
                              newWork[idx].domain = e.target.value;
                              setFormData({ ...formData, workExperience: newWork });
                            }}
                          >
                            <option>IT</option>
                            <option>Non-IT</option>
                            <option>Govt</option>
                            <option>Startup</option>
                            <option>Freelance</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#999] uppercase tracking-wider mb-1">Employment Type</label>
                          <select
                            className="w-full px-3 py-2 rounded-lg border border-[#e5e5e5] bg-white text-sm"
                            value={work.employmentType}
                            onChange={(e) => {
                              const newWork = [...formData.workExperience];
                              newWork[idx].employmentType = e.target.value;
                              setFormData({ ...formData, workExperience: newWork });
                            }}
                          >
                            <option>Full-time</option>
                            <option>Part-time</option>
                            <option>Contract</option>
                            <option>Internship</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#999] uppercase tracking-wider mb-1">Start Date</label>
                          <input
                            required
                            type="date"
                            className="w-full px-3 py-2 rounded-lg border border-[#e5e5e5] bg-white text-sm"
                            value={work.startDate}
                            onChange={(e) => {
                              const newWork = [...formData.workExperience];
                              newWork[idx].startDate = e.target.value;
                              setFormData({ ...formData, workExperience: newWork });
                            }}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#999] uppercase tracking-wider mb-1">End Date</label>
                          <div className="flex gap-2">
                            <input
                              disabled={work.endDate === "Present"}
                              type="date"
                              className="w-full px-3 py-2 rounded-lg border border-[#e5e5e5] bg-white text-sm disabled:opacity-50"
                              value={work.endDate === "Present" ? "" : work.endDate}
                              onChange={(e) => {
                                const newWork = [...formData.workExperience];
                                newWork[idx].endDate = e.target.value;
                                setFormData({ ...formData, workExperience: newWork });
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const newWork = [...formData.workExperience];
                                newWork[idx].endDate = work.endDate === "Present" ? "" : "Present";
                                setFormData({ ...formData, workExperience: newWork });
                              }}
                              className={`px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${
                                work.endDate === "Present" ? "bg-[#0a0a0a] text-white border-[#0a0a0a]" : "bg-white text-[#666] border-[#e5e5e5]"
                              }`}
                            >
                              Present
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {formData.workExperience.length === 0 && (
                    <div className="text-center py-8 border-2 border-dashed border-[#e5e5e5] rounded-2xl text-[#999] text-sm">
                      No work experience added.
                    </div>
                  )}
                </div>
              </section>

              {/* Errors */}
              <AnimatePresence>
                {errors.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-[#fff5f5] border border-[#ffcccc] rounded-2xl p-6"
                  >
                    <div className="flex items-center gap-2 text-[#ff4444] font-semibold mb-2">
                      <AlertCircle size={20} />
                      Validation Errors (Hard Reject)
                    </div>
                    <ul className="list-disc list-inside text-sm text-[#cc0000] space-y-1">
                      {errors.map((err, i) => <li key={i}>{err}</li>)}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit */}
              <div className="pt-8">
                <button
                  disabled={loading}
                  type="submit"
                  className="w-full bg-[#0a0a0a] text-white py-4 rounded-2xl font-semibold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" /> Processing...
                    </>
                  ) : (
                    <>
                      Analyze Application <ChevronRight size={20} />
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        ) : (
          /* Results View */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8"
          >
            {/* Main Result Card */}
            <div className="bg-white rounded-3xl shadow-sm border border-[#e5e5e5] overflow-hidden">
              <div className="p-10 text-center border-b border-[#f5f5f5]">
                <div className="mb-4">
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#999]">Application Risk Analysis</span>
                </div>
                
                <div className="flex flex-col items-center justify-center mb-6">
                  <div className="text-8xl font-black tracking-tighter text-[#0a0a0a] mb-2">
                    {result.riskScore}
                  </div>
                  <div className="text-sm font-medium text-[#666] uppercase tracking-widest">Risk Score</div>
                </div>

                <div className="inline-flex items-center px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wider border-2 transition-colors"
                  style={{
                    backgroundColor: result.category === "Strong Fit" ? "#ecfdf5" : result.category === "Needs Review" ? "#fffbeb" : "#fef2f2",
                    color: result.category === "Strong Fit" ? "#059669" : result.category === "Needs Review" ? "#d97706" : "#dc2626",
                    borderColor: result.category === "Strong Fit" ? "#10b981" : result.category === "Needs Review" ? "#f59e0b" : "#ef4444"
                  }}
                >
                  {result.category}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#f5f5f5]">
                {/* Experience Summary */}
                <div className="p-8 flex flex-col items-center justify-center text-center">
                  <div className="text-4xl font-bold text-[#0a0a0a] mb-1">{result.totalExperienceMonths}</div>
                  <div className="text-[10px] font-bold text-[#999] uppercase tracking-widest">Total Months Exp</div>
                </div>
                <div className="p-8 flex flex-col items-center justify-center text-center">
                  <div className="text-4xl font-bold text-[#0a0a0a] mb-1">{result.expCategory}</div>
                  <div className="text-[10px] font-bold text-[#999] uppercase tracking-widest">Experience Tier</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Detailed Breakdown */}
              <div className="bg-white rounded-3xl shadow-sm border border-[#e5e5e5] p-8">
                <h3 className="text-sm font-bold uppercase tracking-widest text-[#0a0a0a] mb-6 flex items-center gap-2">
                  <CheckCircle size={16} className="text-emerald-500" />
                  Risk Breakdown
                </h3>
                <div className="space-y-4">
                  {result.breakdown.length > 0 ? (
                    result.breakdown.map((item, i) => {
                      const [label, value] = item.split(":");
                      return (
                        <div key={i} className="group">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium text-[#666]">{label}</span>
                            <span className="text-sm font-bold text-[#0a0a0a]">{value}</span>
                          </div>
                          <div className="h-1 w-full bg-[#f5f5f5] rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: "100%" }}
                              className="h-full bg-[#0a0a0a]/10"
                            />
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-8 text-center">
                      <p className="text-sm text-[#999] italic">No risk factors detected. Perfect score!</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Flags Section */}
              <div className="bg-white rounded-3xl shadow-sm border border-[#e5e5e5] p-8">
                <h3 className="text-sm font-bold uppercase tracking-widest text-[#0a0a0a] mb-6 flex items-center gap-2">
                  <AlertCircle size={16} className="text-amber-500" />
                  Intelligence Flags
                </h3>
                <div className="space-y-4">
                  {result.flags.length > 0 ? (
                    <ul className="space-y-3">
                      {result.flags.map((flag, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-[#444]">
                          <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                          <span>{flag}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="py-8 text-center">
                      <p className="text-sm text-[#999] italic">No intelligence flags raised for this profile.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => setResult(null)}
              className="w-full bg-[#0a0a0a] text-white py-5 rounded-2xl font-bold text-sm uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-[#0a0a0a]/10"
            >
              Process New Application
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
