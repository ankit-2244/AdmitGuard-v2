# AdmitGuard v2

## Overview

AdmitGuard v2 is an AI-assisted admission validation and decision-support system.

It validates applicant data, detects inconsistencies, assigns a risk score, and categorizes candidates into actionable segments.

---

## Key Features

### 1. Validation Engine

* Enforces correct education sequence (10th → 12th/Diploma → UG → PG)
* Rejects invalid or incomplete data
* Validates work experience dates

### 2. Flagging System

* Education gaps (>24 months)
* Backlogs present
* Career gaps
* No work experience

### 3. Intelligence Layer

* Risk Score (0–100)
* Categories:

  * Strong Fit
  * Needs Review
  * Weak Fit
* Explanation for each score component

### 4. Data Storage

* Stores structured applicant data in Google Sheets using Apps Script webhook

---

## Tech Stack

* AI Platform: Google AI Studio (Gemini)
* Backend: Node.js / TypeScript
* Frontend: HTML, CSS, JavaScript
* Storage: Google Sheets

---

## How It Works

1. User fills application form
2. Backend validates data
3. Flags are generated
4. Risk score is calculated
5. Data is stored in Google Sheets
6. Output displayed to user

---

## Setup Instructions

1. Add your webhook URL in `.env.example`
2. Run backend server
3. Open frontend and submit form

---

## Screenshots

(Add screenshots here)

---

## Note

This project is built using AI-assisted vibe coding methodology via Google AI Studio.
