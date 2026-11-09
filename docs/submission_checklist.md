# Great Indian AI Internship Challenge — Official Submission Checklist
**Applicant:** Naveen (3rd-year B.Tech CSE)  
**Submission Portal:** https://gnani.ai/internship  
**Target Submission Date:** November 9, 2026 (Official Deadline: Nov 10, 2026, 11:59 PM IST)  
**Project:** FinAssist Bharat (Telugu / Hindi / English Code-Mixed Financial Voice Assistant)

---

## 1. Pre-Submission Repository Audit
- [ ] **No Secrets in Repo:**
  - `backend/.env` is strictly ignored by `.gitignore`.
  - `git status` verifies no `.env` or sensitive API key is committed.
  - `backend/.env.example` is present with clear placeholder variables (`GNANI_API_KEY=your_key_here`).
- [ ] **Codebase Cleanliness:**
  - All stray empty files and out-of-scope agents removed.
  - Hardcoded Vapi keys in `LiveAudioCall.jsx` completely removed.
  - Only the 3 core domains retained (Budget/Savings, Loan/EMI + eligibility, Investment: SIP & FD).
- [ ] **Automated Tests Pass with One Command:**
  - In `backend/`: `npm test` runs all 105 tests across 17 suites with 0 failures in under 10 seconds.
- [ ] **Frontend Builds Cleanly:**
  - In `frontend/`: `npm run build` generates production bundle in `< 2s` with zero errors.

---

## 2. Benchmark & Evaluation Deliverables
- [ ] **Evaluation Dataset:** `eval/dataset.jsonl` contains 63 synthetic test cases across Telugu, Hindi, English, code-mixed, injections, and edge cases.
- [ ] **Benchmark Report:** `eval/report.md` renders live metrics:
  - Task Completion: **92.1%**
  - Intent Accuracy: **94.5%**
  - Numeric Ground Truth Match: **90.0%**
  - Prompt Injection Block Rate: **100%**
  - End-to-End p50 Latency: **~1.03s**
- [ ] **Honest Comparison:** Baseline comparison between browser Web Speech and Gnani Prisma v2.5 documented honestly.

---

## 3. Demo Video Requirements (60-80 Seconds)
- [ ] **Recording Authenticity:**
  - Phone-recorded in good lighting and clear audio.
  - Single take with **no cuts** that hide actual round-trip latency.
- [ ] **Storyboard Checklist:**
  - [ ] 0–8s: Spoken Telugu query (*"5 లక్షల లోన్ కు 8.5% వడ్డీతో EMI ఎంత?"*) with English subtitles.
  - [ ] 8–28s: Live transcript + parsed fields card + spoken answer (Yukti voice).
  - [ ] 28–45s: Spoken confirmation flow (*"నా ఆదాయం 75000..."* -> *"అవును"*).
  - [ ] 45–60s: Acoustic noise case + quick correction (*"వద్దు, నెలకు 10 వేలు"*).
  - [ ] 60–75s: Benchmark summary card + Naveen's direct pitch on sovereign voice AI.
- [ ] **Video Host:** Upload to Google Drive / YouTube (Unlisted) / LinkedIn video.

---

## 4. LinkedIn & Social Media Distribution
- [ ] **Post Content Checklist:**
  - Direct hook based on a real user moment (auto driver asking in Telugu), not a feature list.
  - Native Telugu caption + English subtitles.
  - Clear attribution to **Gnani Prisma v2.5** and **Gnani Timbre v2.5**.
  - Tagged official **@Gnani.ai** account.
  - Mandatory hashtags included:
    - `#GreatIndianAIInternshipChallenge`
    - `#GnaniAI`
- [ ] **First Comment:**
  - GitHub repository link placed immediately in the first comment.
- [ ] **Distribution Milestones:**
  - [ ] Oct 29: 15-second teaser clip published.
  - [ ] Nov 3: Progress & measured failure/fix post published.
  - [ ] Nov 7-8: Final demo video post published.

---

## 5. Portal Submission Form (Nov 9, 2026)
- [ ] **Applicant Details:** Name, college, email, phone number, branch, year of graduation.
- [ ] **Project Name:** `FinAssist Bharat`
- [ ] **Repository URL:** Public GitHub repository link.
- [ ] **Nominated Post URL:** Verified link to the live LinkedIn final demo post.
- [ ] **Demo Video URL:** Direct playable video link.
- [ ] **Tech Stack Selected:** Gnani Prisma v2.5 (STT), Gnani Timbre v2.5 (TTS), Node.js, React.
- [ ] **Special Awards Selected:**
  - [x] *Mixed Vibes* (Code-mixing Telugu/Hindi/English)
  - [x] *Noise Canceller* (Acoustic robustness under SNR testing)
- [ ] **Submission Confirmation:** Screenshot confirmation screen and save email confirmation.
