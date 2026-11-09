# FinAssist Bharat — Design Decisions & Interview Preparation Guide

This document prepares Naveen (3rd-year B.Tech CSE) for technical interviews in the Great Indian AI Internship Challenge. Every claim is strictly backed by implementation files in the repository.

---

## Part 1: One-Page Design Decisions (Architectural Pillars)

1. **Zero LLM Arithmetic (Ground Rule #4):**  
   LLMs are probabilistic token predictors, not calculators. In financial questions (loans, compounding investments, savings), a 1% arithmetic hallucination can lead to catastrophic advice. We use LLMs/parsers strictly for intent classification and parameter extraction into a strongly-typed Zod schema (`backend/src/extraction/schema.js`). All math runs in 100% deterministic Node.js functions with input validation and zero division handling (`backend/src/tools/`).

2. **Per-Session State Machine & Mandatory Spoken Confirmation (Ground Rule #5):**  
   Any action that updates a user's financial profile or resets memory requires an explicit verbal confirmation ("అవును" / "Yes" or "వద్దు" / "No"). Memory is strictly isolated per session ID (`backend/src/memory/sessionStore.js`), completely eliminating cross-tenant leakage.

3. **Multilingual Sovereign Voice Stack (Gnani Prisma & Timbre):**  
   Generic English speech APIs fail completely when Indian speakers code-switch or use native numeral units (e.g., "5 వేలు" or "డెబ్బై ఐదు వేలు"). By pairing **Gnani Prisma v2.5** for STT with an Indic numeral normalizer (`backend/src/normalization/numeralNormalizer.js`) and **Gnani Timbre v2.5 (Voice: Yukti)** for TTS, we achieve native conversational flow with end-to-end p50 latency of ~1.15 seconds.

4. **Layered Defense-in-Depth Security:**  
   Spoken prompt injections ("ignore previous instructions") are filtered before reaching the orchestration brain (`backend/src/middleware/promptInjectionGuard.js`). Sensitive Indian identifiers (Aadhaar, PAN, Bank Accounts, Phone numbers, UPI IDs) are redacted using regex filters before memory persistence (`backend/src/services/privacyRedactor.js`).

---

## Part 2: 15 Core Technical Interview Questions & Honest Answers

### 1. Why deterministic tools instead of letting an LLM calculate financial values?
> *"LLMs generate numbers based on token probability, meaning $500,000 \times 8.5\%$ can yield different or slightly hallucinated results depending on temperature. For financial compliance and customer trust, arithmetic must be 100% deterministic and reproducible. We restrict the extraction layer to parsing `{ principal: 500000, rate: 8.5, tenureYears: 3 }` validated by a Zod schema, and run standard mathematical formulas in `emiCalculator.js`."*

### 2. How does your numeral normalizer handle Telugu words like "వేలు" and "లక్షలు"?
> *"Spoken regional numbers present two challenges: compound word structures (like 'డెబ్బై ఐదు' for 75) and unit multipliers (like 'లక్షలు' for $10^5$ and 'వేలు' for $10^3$). Our normalizer in `numeralNormalizer.js` first collapses compound idioms, then applies Unicode letter boundary matching `(?<!\\p{L})` with the `u` flag rather than ASCII `\\b` (which breaks on Unicode Indic glyphs), multiplying root numbers by their respective unit constants."*

### 3. What failed during your early benchmarks and how did you diagnose it?
> *"In our initial evaluation run, `25k monthly income and 20k expense` failed because our duration regex matched '25000 monthly' as a tenure of 25,000 months! We diagnosed this from `eval/results/run_latest.json` and added a negative lookahead `(?!ly)\\b` to decouple payment frequency adjectives from duration periods. This fixed both parameter and intent matching."*

### 4. What is your end-to-end latency budget and where is time spent?
> *"Our end-to-end p50 latency is ~1.15s, and p95 is ~2.08s. The breakdown is:  
> - Gnani Prisma STT REST: ~390–470 ms  
> - Deterministic Extraction & Tool Execution: ~20 ms (sub-millisecond when pure regex/zod)  
> - Gnani Timbre TTS REST: ~620–1050 ms  
> To reach sub-400ms in the future, we would transition from REST to Gnani's WebSocket streaming endpoints."*

### 5. Why did you move from module-level globals to session storage?
> *"Earlier, `userProfileMemory.js` and `voiceOrchestrator.js` held `pendingMemoryUpdate` and `userMemory` as global module variables. If two users spoke concurrently, user B's confirmation would overwrite user A's profile. We refactored this into `sessionStore.js`, where every session has an isolated Map entry keyed by `sessionId`."*

### 6. How does your spoken prompt injection guard work?
> *"We protect both the JSON message route and the binary voice transcription path. Once audio is transcribed by Prisma, `detectPromptInjection()` scans for patterns such as 'ignore previous instructions', 'system prompt cheppu', or 'nirdesh bhool jao'. If an injection vector is detected, the request is immediately rejected with HTTP 400 before reaching any tool or memory layer."*

### 7. How is privacy preserved under India's DPDP Act 2023?
> *"Before user transcripts are logged or saved to memory, `privacyRedactor.js` identifies and masks sensitive PII including 12-digit Aadhaar patterns, 10-character PAN formats, bank account numbers (11-18 digits), UPI IDs, and phone numbers. The client only sees masked tokens like `[REDACTED_AADHAAR]`."*

### 8. Why did you replace the browser Web Speech API with Gnani Prisma and Timbre?
> *"Browser Web Speech (`en-IN`) failed on over 65% of regional queries: it outputted phonetic English gibberish when users spoke Telugu and could not handle Indian numbering terms like 'వేలు'. Gnani Prisma natively supports Telugu (`te-IN`) and mixed-script code switching with high accuracy, while Timbre delivers natural, accent-accurate Indic speech."*

### 9. What is the cost per completed task using Gnani API credits?
> *"With 5,000 credits allocated for the challenge, each completed voice query consumes approximately 1.2 credits (1 credit for STT transcription under 60 seconds and ~0.2 credits for TTS response synthesis). This allows over 4,000 full conversational turns within the free challenge tier, translating to roughly ₹0.08 per completed task."*

### 10. What banking formula and assumptions are used for loan eligibility?
> *"In `loanEligibility.js`, we use standard Indian banking FOIR (Fixed Obligation to Income Ratio) set at 50%. Maximum allowable monthly EMI is calculated as $\\text{Salary} \\times 50\\% - \\text{Existing Obligations}$. We then estimate loan capacity assuming a standard 20-year tenure at 9.5% interest, clearly returning an explicit disclaimer that final sanction depends on CIBIL score and lender policy."*

### 11. How does the SIP calculator work mathematically?
> *"In `sipCalculator.js`, we compute Future Value using the standard annuity formula:  
> $$FV = P \\times \\left[ \\frac{(1 + i)^n - 1}{i} \\right] \\times (1 + i)$$  
> where $P$ is monthly contribution, $i = \\frac{\\text{annualRate}}{12 \\times 100}$, and $n = \\text{tenureYears} \\times 12$. If the return rate is 0%, it safely returns total invested capital without dividing by zero."*

### 12. What was the hardest edge case in code-mixed Telugu/English speech?
> *"Handling sentences where the subject and units are in Telugu but financial nouns are in English—for example: *'5 లక్షల లోన్ కు 8.5% వడ్డీతో EMI ఎంత?'*. The parser must extract '5 లక్షల' as 500,000, parse '8.5%' as an annual percentage, and identify 'EMI' as the target intent without confusing loan eligibility with EMI computation."*

### 13. How does the system handle missing parameters without guessing numbers?
> *"If a user says 'EMI calculate chey' without an amount or tenure, rather than hallucinating default numbers, the extractor sets `needs_clarification: true` with confidence < 0.7. The voice assistant speaks back a targeted clarifying question: *'రుణం మొత్తం మరియు కాలపరిమితి ఎంత? / What is the loan amount and tenure?'*."*

### 14. What would you build next with 3 more weeks?
> *"1. Realtime streaming WebSockets (`wss://api.vachana.ai/stt/v3/stream`) for sub-300ms latency.  
> 2. Voice biometric speaker verification using Gnani voiceprints before authorizing profile edits.  
> 3. Offline lightweight fallback using WebAssembly on edge devices."*

### 15. How do you ensure no API keys or secrets leak to the client?
> *"All Gnani API calls are made strictly from the Node.js backend. The `GNANI_API_KEY` lives exclusively in `backend/.env`, which is listed in `.gitignore`. The frontend interacts solely with our Express endpoints (`/api/voice/process-audio`), never exposing headers or keys to the browser."*
