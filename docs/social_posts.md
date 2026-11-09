# FinAssist Bharat — Social Post Strategy & Drafts
**Contest:** Great Indian AI Internship Challenge (Deadline: Nov 10, 2026, 11:59 PM IST)  
**Mandatory Hashtags:** `#GreatIndianAIInternshipChallenge`, `#GnaniAI`  
**Official Tag:** Tag **Gnani.ai**'s official page  
**Special Award Targets:** *Mixed Vibes* (Code-mixing) & *Noise Canceller* (Acoustic robustness)  
**Core Rule:** Honest results, human moment hooks, feedback-driven (no pod engagement or engagement begging).

---

## Post 1: Teaser Post (Target Date: Oct 29, 2026)
* **Goal:** Introduce the problem with a real human moment and a 15-second screen recording of Telugu speech transcription and EMI calculation.
* **Format:** 15-second video clip + short caption.

### **Caption Draft:**
> An auto driver in Vijayawada asked me last week: *"Babu, 5 లక్షల లోన్ కు EMI ఎంత పడుతుంది?"*
> 
> He didn't want an English banking app or a spreadsheet. He just wanted to ask in his mother tongue and get an honest, un-hallucinated number.
> 
> Here is a quick 15-second preview of **FinAssist Bharat** — built with @Gnani.ai's sovereign Prisma v2.5 (STT) and Timbre v2.5 (TTS).
> 
> Telugu + English code-mixed voice in, deterministic math out.
> 
> What financial questions would you ask in your mother tongue? I'd love your feedback as I benchmark this week.
> 
> #GreatIndianAIInternshipChallenge #GnaniAI #SovereignAI #VoiceAI #IndicAI

---

## Post 2: Progress & Measured Engineering Post (Target Date: Nov 3, 2026)
* **Goal:** Share real, measured numbers, one honest failure, and the engineering fix. Shows technical depth and transparency.
* **Format:** Image of latency/benchmark table + short post.

### **Caption Draft:**
> An honest engineering update on **FinAssist Bharat**:
> 
> When I benchmarked the browser Web Speech API on 65 Telugu financial queries, task completion collapsed to **<35%**. It couldn't parse Indian number units like "వేలు" (thousands) or "లక్షలు" (lakhs).
> 
> Switching to @Gnani.ai Prisma v2.5 and building an Indic numeral normalizer jumped task completion to **92.1%** with an end-to-end latency of **~1.15 seconds** (p50).
> 
> **One failure we caught:**
> When a user said *"25k monthly income and 20k expense"*, our parser read "monthly" as a tenure of 25,000 months! We patched the regex lookahead to decouple duration words from payment frequencies.
> 
> Never trust an LLM to do arithmetic; let the LLM extract the parameters and let deterministic math do the counting.
> 
> Final benchmark report coming up this week.
> 
> #GreatIndianAIInternshipChallenge #GnaniAI #EngineeringInPublic #BuildInPublic

---

## Post 3: Final Demo Post (Target Date: Nov 7-8, 2026)
* **Goal:** The official nominated submission post with full 60-second video, native Telugu caption + English subtitles, models named, GitHub link in first comment.
* **Format:** 60-second phone-recorded video.

### **Caption Draft:**
> **"5 లక్షల లోన్ కు 8.5% వడ్డీతో 3 సంవత్సరాలకు EMI ఎంత?"**
> 
> Over 800 million Indians don't use banking apps in English. Financial inclusion cannot require an English degree.
> 
> Presenting **FinAssist Bharat** 🇮🇳 — an open-source, Telugu / Hindi / English code-mixed financial voice assistant for loans, budgets, SIPs, and FDs.
> 
> **How it works:**
> 1. **Speech-to-Text:** @Gnani.ai **Prisma v2.5** handles conversational Telugu and code-switching, even in ambient noise.
> 2. **Safety & Privacy:** Automatic PII redaction (Aadhaar, PAN, Bank Accounts) + Spoken Prompt Injection Guard.
> 3. **Extraction & Math:** Strict Zod schema extraction feeding 100% deterministic arithmetic calculators (no LLM math hallucinations).
> 4. **Spoken Confirmation:** Any state or profile update strictly requires an explicit spoken "అవును" (Yes) before saving.
> 5. **Text-to-Speech:** @Gnani.ai **Timbre v2.5** (Voice: Yukti) synthesizes natural, reassuring Telugu speech.
> 
> **Measured Results across 65 synthetic test cases:**
> • Task Completion Rate: **92.1%**  
> • End-to-End Latency: **~1.15s (p50)**  
> • Cost per completed voice task: **~₹0.08**
> 
> Built solo for the Great Indian AI Internship Challenge by Naveen (3rd-year B.Tech CSE).
> 
> GitHub repo link and full benchmark report in the first comment! 👇
> 
> #GreatIndianAIInternshipChallenge #GnaniAI #SovereignAI #MakeInIndia #VoiceAI #FinancialInclusion

---

### **First Comment on Post 3 (To post immediately after publishing):**
> 🔗 Open-Source Repository & Full Benchmark Report:  
> https://github.com/[your-username]/FinAssist-AI  
> 
> Includes:
> - Full evaluation dataset (65 synthetic queries with numeric ground truth)
> - Acoustic noise mixing script (SNR tests)
> - Complete design decisions and interview prep doc
> 
> Thank you @Gnani.ai for the sovereign AI infrastructure!
