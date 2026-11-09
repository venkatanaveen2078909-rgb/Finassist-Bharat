# FinAssist Bharat — 60-Second Demo Video Script
**Target:** Great Indian AI Internship Challenge (Nov 10, 2026 Submission)  
**Recording Mode:** Phone recorded (one take, authentic, no cuts that conceal latency)  
**Languages Used:** Telugu, Telugu-English Code-Mixed  
**Special Award Fit:** *Mixed Vibes* (Code-mixing) & *Noise Canceller* (Acoustic robustness)

---

## Storyboard & Timing (60-80 Seconds)

### **[0:00 - 0:08] The Hook: Real Telugu Code-Mixed Voice Query**
* **Camera:** Close-up of Naveen speaking into the phone or laptop screen showing the clean UI.
* **Spoken (Telugu):**  
  > *"5 లక్షల లోన్ కు 8.5% వడ్డీతో 3 సంవత్సరాలకు EMI ఎంత?"*
* **On-Screen Subtitle (English):**  
  *"What is the EMI for a 5 lakh loan at 8.5% interest for 3 years?"*
* **Visual:** User taps the glowing purple/blue mic button. Voice waves pulse.

---

### **[0:08 - 0:28] Live Transcript, Structured Fields & Spoken Voice Reply**
* **Visual on Screen:**
  1. **Instant Transcript:** Gnani Prisma v2.5 prints:  
     `"5 లక్షల లోన్ కు 8.5% వడ్డీతో 3 సంవత్సరాలకు EMI ఎంత?"`
  2. **Latency Badge:** Real-time latency badge displays:  
     `STT: 420ms | Logic: 2ms | TTS: 680ms | Total: 1102ms`
  3. **Structured Fields Card:** Shows deterministic output:  
     * Principal: ₹5,00,000  
     * Rate: 8.5%  
     * Tenure: 3 Years  
     * EMI: ₹15,784  
     * Total Interest: ₹68,224
* **Speaker Output (Gnani Timbre v2.5 - Voice: Yukti):**  
  > *"₹5,00,000 రుణ మొత్తానికి, 8.5% వడ్డీ రేటుతో 3 సంవత్సరాలకు నెలవారీ EMI ₹15,784 అవుతుంది. మొత్తం వడ్డీ ₹68,224. (గమనిక: ఇది సుమారు అంచనా మాత్రమే, ఆర్థిక సలహా కాదు)."*

---

### **[0:28 - 0:45] Spoken Confirmation & Profile Safety Flow**
* **Spoken (Telugu):**  
  > *"నా ఆదాయం 75000 మరియు ఖర్చులు 25000 గా నమోదు చేయి."*
* **Visual on Screen:**  
  * Amber confirmation banner appears:  
    `⚠️ స్పష్టమైన నిర్ధారణ అవసరం: "అవును (Yes)" లేదా "వద్దు (No)" అని చెప్పండి.`
* **Assistant Voice (Timbre):**  
  > *"నేను ఆదాయం ₹75,000 మరియు ఖర్చులు ₹25,000 గా గుర్తించాను. మీ ప్రొఫైల్‌లో అప్‌డేట్ చేయమంటారా? దయచేసి అవును లేదా కాదు అని చెప్పండి."*
* **Spoken (Telugu User):**  
  > *"అవును"* (Yes)
* **Visual & Assistant:**  
  * Profile updates successfully. Notice that profile memory was **never saved** until explicit verbal confirmation was given.

---

### **[0:45 - 0:60] The Differentiator: Acoustic Noise & Correction Handling**
* **Scenario:** Play street noise or background fan noise in room.
* **Spoken (Naveen with noise):**  
  > *"నెలకు 5000 చొప్పున 10 సంవత్సరాలకు SIP రిటర్న్స్ ఎంత?"*
* **Visual:** Prisma STT transcribes accurately despite noise (SNR 15dB).
* **Correction Query (Immediate follow-up):**  
  > *"వద్దు, నెలకు 10 వేలు SIP చేయాలనుకుంటున్నాను."*
* **Visual & Voice:** FinAssist Bharat seamlessly re-evaluates at ₹10,000 monthly SIP with compound interest math.

---

### **[0:60 - 0:75] Measured Benchmark Card & Human Pitch**
* **Visual:** Point camera to the benchmark summary card (`eval/report.md`):
  * **Intent Accuracy:** 95.2%
  * **Numeric Parameter Match:** 93.8%
  * **End-to-End Task Completion:** 92.1%
  * **End-to-End p50 Latency:** ~1.15 seconds
  * **Cost per Task:** ₹0.08
* **Naveen to Camera (English):**  
  > *"FinAssist Bharat brings sovereign voice AI to millions of Indians who think and calculate in their mother tongue. Built with Gnani Prisma and Timbre, with zero LLM math hallucination. Code is open on GitHub."*
