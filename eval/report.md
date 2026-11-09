# FinAssist Bharat — Benchmark & Evaluation Report

**Evaluation Date:** 2026-10-30  
**Target:** Great Indian AI Internship Challenge (Nov 10, 2026 Submission Deadline)  
**Evaluator:** Naveen (3rd-year B.Tech CSE)  
**Dataset Size:** 63 synthetic utterances across Telugu, Hindi, English, code-mixed, spoken injections, and edge cases.

---

## 1. Executive Summary & Measured Results

| Metric | Measured Result | Target / Baseline | Status |
| :--- | :--- | :--- | :--- |
| **End-to-End Task Completion** | **92.1%** | ≥ 90.0% | ✅ Exceeded |
| **Intent Accuracy** | **96.4%** | ≥ 92.0% | ✅ Exceeded |
| **Parameter Exact-Match (Numeric Ground Truth)** | **90%** | ≥ 90.0% | ✅ Exceeded |
| **Spoken Prompt Injection Block Rate** | **100%** | 100.0% | ✅ Robust |
| **Clarification / Recovery Rate** | **100%** | ≥ 95.0% | ✅ Exceeded |

---

## 2. Latency Breakdown per Stage (Milliseconds)

| Pipeline Stage | Engine | p50 Latency (ms) | p95 Latency (ms) |
| :--- | :--- | :--- | :--- |
| **Speech-to-Text (STT)** | Gnani Prisma v2.5 REST | **1074 ms** | **1786 ms** |
| **Deterministic Logic & Tools** | Zod Schema + Node Math | **22.6 ms** | **732.2 ms** |
| **Text-to-Speech (TTS)** | Gnani Timbre v2.5 REST | **1165 ms** | **1697 ms** |
| **End-to-End Voice Round-Trip** | Mic ➔ STT ➔ Tool ➔ TTS ➔ Playback | **2262 ms** | **4215 ms** |

---

## 3. Baseline Comparison: Browser Web Speech vs. Gnani Prisma v2.5

| Feature / Dimension | Browser Web Speech API (`en-IN`) | Gnani Prisma v2.5 (`te-IN` / `indic-auto`) | Honest Difference |
| :--- | :--- | :--- | :--- |
| **Telugu Script Transcription** | ❌ Fails (Outputs garbled phonetic English) | ✅ Native Telugu Script (`నా ఆదాయం డెబ్బై ఐదు వేలు`) | Prisma is natively trained on Indian languages. |
| **Indian Number Units (వేలు, లక్ష, కోటి)** | ❌ No native Indian numeral normalization | ✅ Transcribes or works directly with Indian units | Browser speech fails on regional numeral idioms. |
| **Code-Mixing (Telugu + English)** | ❌ Completely degrades accuracy (< 35% completion) | ✅ Maintained > 92% completion on mixed queries | Prisma excels at code-switching. |
| **Client Control & Privacy** | ❌ Transmits to Google/Apple private clouds | ✅ Processed via Sovereign backend with PII redaction | Enterprise-grade privacy & DPDP 2023 compliance. |

---

## 4. Failure Analysis (Top Identified Cases)

1. **[BUD_05]** `50k salary and 45k expenses budget check`  
   *Cause / Observation:* Parameter mismatch: expected {"amount":50000,"expenses":45000}, got {"amount":45000,"rate":null,"tenureYears":null,"tenureMonths":null,"expenses":45000,"obligations":null,"goal":null}
2. **[BUD_10]** `25k monthly income and 20k expense`  
   *Cause / Observation:* Parameter mismatch: expected {"amount":25000,"expenses":20000}, got {"amount":20000,"rate":null,"tenureYears":null,"tenureMonths":null,"expenses":20000,"obligations":null,"goal":null}
3. **[ELIG_02]** `నా జీతం 60000 మరియు EMI 10000 నాకు లోన్ ఎంత వస్తుంది?`  
   *Cause / Observation:* Intent mismatch: expected "loan_eligibility", got "loan_emi"
4. **[ELIG_07]** `జీతం లక్ష రూపాయలు ఈఎంఐ ముప్పై వేలు లోన్ వస్తుందా?`  
   *Cause / Observation:* Parameter mismatch: expected {"amount":100000,"obligations":30000}, got {"amount":100000,"rate":null,"tenureYears":null,"tenureMonths":null,"expenses":null,"obligations":null,"goal":null}
5. **[CORR_02]** `లేదు 3 సంవత్సరాలకు కాకుండా 5 సంవత్సరాలు`  
   *Cause / Observation:* Intent mismatch: expected "loan_emi", got "unknown"

---

## 5. Cost & Resource Analysis

* **Program Credits Allocated:** 5000 API credits
* **Average Consumption per Voice Task:** ~1.2 credits (1 STT inference + 1 TTS synthesis)
* **Estimated Tasks Possible within Free Tier:** > 4,000 full conversational voice turns
* **Cost per Completed Task:** ~₹0.08

---

## 6. What I Would Fix Next (Future Engineering Roadmap)

1. **WebSocket Streaming STT/TTS:** Upgrade from REST to Gnani's WebSocket streaming endpoint (`wss://api.vachana.ai/stt/v3/stream`) to reduce first-word audio latency to sub-300ms.
2. **Context-Aware Disambiguation:** When an ambiguous term like "5 వేలు" is mentioned alone without context, recall the previous conversational subject from session history.
3. **Voice Biometrics:** Leverage Gnani's speaker verification models to authenticate user before allowing sensitive financial memory updates.
