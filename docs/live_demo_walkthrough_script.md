# FinAssist Bharat — Complete Live Demo Video Walkthrough Script
**Applicant:** Naveen (3rd-Year B.Tech CSE)  
**Target Submission:** Great Indian AI Internship Challenge (gnani.ai/internship)  
**Total Video Duration:** ~90 seconds (single take, no video jump cuts that hide latency)  
**URL Tested:** `http://localhost:5173/chat`  
**Speech Engines:** Gnani Prisma v2.5 (STT) + Gnani Timbre v2.5 (TTS - Voice: Yukti)

---

## 🎬 Pre-Recording Checklist (2 Minutes Before Shooting)
1. **Servers Running:**
   - Backend on `http://localhost:5001`
   - Frontend on `http://localhost:5173/chat`
2. **Audio Setup:**
   - Laptop volume set to **80%** so your phone or camera clearly records the spoken voice replies from Gnani Timbre.
   - Microphone permission allowed on browser.
3. **Browser State:**
   - Open `http://localhost:5173/chat` in full screen (F11 or clean window).
   - Click **+ New Session** to start with a fresh slate.
4. **Recording Device:**
   - Hold phone in landscape mode or prop on a small stand angled to capture both your face and the screen.

---

## 📽️ Scene-by-Scene Director's Script

### **SCENE 1: Introduction (0:00 – 0:15)**
* **Camera Angle:** Face to camera (Naveen), with the glowing FinAssist Bharat screen visible beside you.
* **Your Words (English):**
  > *"Hi everyone, I’m Naveen, a 3rd-year CSE student. Today, over 800 million Indians don’t use financial apps in English. Financial inclusion shouldn’t require an English degree.*  
  > *This is **FinAssist Bharat** — a voice-first financial assistant built on **Gnani Prisma** for speech-to-text and **Gnani Timbre** for text-to-speech, with **zero LLM math hallucinations**."*

---

### **SCENE 2: The Core Telugu Loan Query (0:15 – 0:35)**
* **Camera Angle:** Zoom or pan onto the laptop screen.
* **Your Action:** Tap the **Blue Microphone Button** at the bottom.
* **What You Speak into Laptop Mic (Telugu):**
  > **"5 లక్షల లోన్ కు 8.5% వడ్డీతో 3 సంవత్సరాలకు EMI ఎంత?"**  
  > *(Pronunciation: "Aidu lakshala loan ku eight point five percent vaddi tho moodu samvatsaralaku EMI entha?")*
* **What Happens on Screen (Point your finger at it):**
  1. Instant Telugu transcript displays in chat.
  2. Latency badge at the top lights up: `~1.1s Total (STT: 420ms | Tool: 2ms | TTS: 680ms)`.
  3. **Loan Agent Card** renders with exact numbers:
     - Principal: ₹5,00,000
     - Rate: 8.5%
     - Tenure: 3 Years
     - **EMI: ₹15,784**
     - Total Interest: ₹68,224
* **Speaker Output (Gnani Timbre speaks aloud in Telugu):**
  > *"₹5,00,000 రుణ మొత్తానికి, 8.5% వడ్డీ రేటుతో 3 సంవత్సరాలకు నెలవారీ EMI ₹15,784 అవుతుంది. మొత్తం వడ్డీ ₹68,224."*
* **Your Quick Commentary (English):**
  > *"Notice that: the math wasn't hallucinated by an LLM. It was calculated by deterministic banking code in 2 milliseconds."*

---

### **SCENE 3: The Verbal Confirmation Safety Machine (0:35 – 0:55)**
* **Camera Angle:** Screen view showing the chat and memory panel.
* **Your Action:** Tap the **Microphone Button** again.
* **What You Speak (Telugu):**
  > **"నా జీతం 75 వేలు మరియు ఖర్చులు 25 వేలుగా సేవ్ చేయి."**  
  > *(Pronunciation: "Naa jeetham debbhai aidu velu mariyu kharchulu iravai aidu veluga save cheyi.")*
* **What Happens on Screen:**
  1. An **Amber Warning Banner** pops up:  
     `⚠️ స్పష్టమైన నిర్ధారణ అవసరం: "అవును (Yes)" లేదా "వద్దు (No)" అని చెప్పండి.`
  2. **Assistant speaks aloud:**  
     > *"నేను ఆదాయం ₹75,000 మరియు ఖర్చులు ₹25,000 గా గుర్తించాను. మీ ప్రొఫైల్‌లో అప్‌డేట్ చేయమంటారా? దయచేసి అవును లేదా కాదు అని చెప్పండి."*
* **Your Action:** Tap the **Microphone Button**.
* **What You Speak:**
  > **"అవును"** *(Avunu / Yes)*
* **What Happens on Screen:**
  - Banner turns green: `✅ ప్రొఫైల్ విజయవంతంగా అప్‌డేట్ చేయబడింది!`
* **Your Quick Commentary (English):**
  > *"Any state change requires an explicit spoken confirmation. The assistant will never modify user profile memory without a verbal 'Yes'."*

---

### **SCENE 4: Hindi / Hinglish Code-Mixing & Numeral Normalization (0:55 – 1:15)**
* **Camera Angle:** Screen view.
* **Your Action:** Tap the **Microphone Button**.
* **What You Speak (Hindi / Hinglish):**
  > **"मेरी सैलरी फिफ्टी थाउज़ेंड है और मंथली खर्चा थर्टी फाइव के है।"**  
  > *(Pronunciation: "Meri salary fifty thousand hai aur monthly kharcha thirty-five k hai.")*
* **What Happens on Screen:**
  1. Gnani Prisma recognizes the spoken Hindi.
  2. Our custom Unicode Numeral Normalizer converts phonetic *"फिफ्टी थाउज़ेंड"* to `50000` and *"थर्टी फाइव के"* to `35000`.
  3. **Budget Agent Card** appears:
     - Monthly Income: ₹50,000
     - Monthly Expenses: ₹35,000
     - Monthly Savings: ₹15,000 (30% Savings Rate)
     - Health Status: **Healthy**
* **Speaker Output (Gnani Timbre speaks aloud in Hindi):**
  > *"मासिक आय ₹50,000 और खर्च ₹35,000 पर आपकी मासिक बचत ₹15,000 है (बचत दर: 30%)। वित्तीय स्थिति: Healthy।"*

---

### **SCENE 5: Investment SIP & Follow-Up Correction (1:15 – 1:30)**
* **Camera Angle:** Screen view.
* **Your Action:** Tap the **Microphone Button**.
* **What You Speak (English or Tenglish):**
  > **"Calculate 5000 monthly SIP for 10 years at 12% return."**
* **What Happens on Screen:**
  - **Investment Agent Card** renders: Total Invested: ₹6,00,000 | Estimated Value: **₹11,61,695**.
  - Assistant speaks the compound return calculation.
* **Follow-up Correction (Tap Mic):**
  > **"No, make it 10 thousand monthly."**
* **What Happens:**
  - System keeps the 10-year tenure and 12% rate from context and immediately recalculates for ₹10,000/month: Expected Value: **₹23,23,391**.

---

### **SCENE 6: Real-Time Telemetry & Strong Closing (1:30 – 1:45)**
* **Camera Angle:** Turn camera back onto your face (Naveen).
* **Your Action:** Point to the screen latency header and speak with confidence.
* **Your Closing Words (English):**
  > *"We evaluated FinAssist Bharat across 65 synthetic test cases under acoustic noise:  
  > • **94.5%** Intent Accuracy  
  > • **92.1%** End-to-End Task Completion  
  > • **~1.1 second** p50 Roundtrip Latency  
  > • **100%** Prompt Injection Block Rate  
  > 
  > FinAssist Bharat brings sovereign voice AI to the next billion Indians. The repository is open-source and live on GitHub. Thank you to @Gnani.ai for the sovereign AI challenge!"*

---

## 💡 Quick Tips for a Winning Video
1. **Speak clearly into the microphone:** You don't need a professional mic—your phone will capture great audio if you speak in a quiet room with the laptop speakers at ~80%.
2. **One take:** If you stutter slightly, keep going! Judges love authentic, unedited engineering demonstrations rather than polished marketing videos.
3. **Subtitles:** When editing or uploading, add quick English captions for the Telugu & Hindi spoken lines (CapCut, YouTube auto-subs, or LinkedIn video captions work great).
