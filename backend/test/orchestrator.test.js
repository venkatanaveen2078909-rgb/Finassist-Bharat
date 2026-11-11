import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { voiceOrchestrator } from "../src/agents/voiceOrchestrator.js";
import { getSession, resetSession } from "../src/memory/sessionStore.js";

describe("Voice Orchestrator End-to-End Suite", () => {
  it("processes Loan EMI query deterministically", async () => {
    const res = await voiceOrchestrator(
      "Calculate EMI for 500000 loan at 10% interest for 5 years",
      { sessionId: "test-emi" }
    );

    assert.equal(res.agent, "Loan Agent");
    assert.equal(res.parsedFields.intent, "loan_emi");
    assert.equal(res.parsedFields.principal, 500000);
    assert.equal(res.parsedFields.emi, 10624);
    assert.ok(res.reply.includes("10624"));
    assert.ok(res.reply.includes("ఆర్థిక సలహా కాదు"));
  });

  it("processes SIP query deterministically with Telugu code-mix", async () => {
    const res = await voiceOrchestrator(
      "నెలకు 5000 చొప్పున 10 సంవత్సరాలకు SIP రిటర్న్స్ ఎంత?",
      { sessionId: "test-sip" }
    );

    assert.equal(res.agent, "Investment Agent");
    assert.equal(res.parsedFields.intent, "investment_sip");
    assert.equal(res.parsedFields.monthlyAmount, 5000);
    assert.ok(res.data.investedAmount === 600000);
    assert.ok(res.data.totalValue > 1100000);
  });

  it("processes FD query with Telugu number words", async () => {
    const res = await voiceOrchestrator(
      "ఒక లక్ష రూపాయలు FD లో 2 సంవత్సరాలకు 7% వడ్డీకి వేస్తే ఎంత?",
      { sessionId: "test-fd" }
    );

    assert.equal(res.agent, "Investment Agent");
    assert.equal(res.parsedFields.amount, 100000);
    assert.equal(res.parsedFields.maturityAmount, 114490);
  });

  it("enforces explicit spoken confirmation before saving profile memory", async () => {
    const sid = "test-confirm-profile";
    resetSession(sid);

    // Step 1: User states income and expenses
    const step1 = await voiceOrchestrator("నా ఆదాయం 75000 మరియు ఖర్చులు 25000", {
      sessionId: sid,
    });

    assert.equal(step1.agent, "Memory Agent");
    assert.equal(step1.pendingConfirmation, true);
    assert.ok(step1.reply.includes("అవును లేదా కాదు అని చెప్పండి"));

    // Verify profile is NOT updated yet
    const profileBefore = getSession(sid).profile;
    assert.equal(profileBefore.income, null);
    assert.equal(profileBefore.expenses, null);

    // Step 2: User says "అవును" (yes in Telugu)
    const step2 = await voiceOrchestrator("అవును", { sessionId: sid });
    assert.equal(step2.agent, "Memory Agent");
    assert.equal(step2.pendingConfirmation, false);
    assert.ok(step2.reply.includes("విజయవంతంగా అప్‌డేట్"));

    // Verify profile IS updated now
    const profileAfter = getSession(sid).profile;
    assert.equal(profileAfter.income, 75000);
    assert.equal(profileAfter.expenses, 25000);
  });

  it("cancels profile update when user says 'వద్దు' (no)", async () => {
    const sid = "test-cancel-profile";
    resetSession(sid);

    await voiceOrchestrator("నా ఆదాయం 50000", { sessionId: sid });
    const step2 = await voiceOrchestrator("వద్దు", { sessionId: sid });

    assert.equal(step2.pendingConfirmation, false);
    assert.ok(step2.reply.includes("ఎటువంటి మార్పులు చేయలేదు"));
    assert.equal(getSession(sid).profile.income, null);
  });

  it("processes Tenglish loan query with Telugu language output", async () => {
    const res = await voiceOrchestrator(
      "naaku 5 lakh loan kavali for 5 years at 9.5% interest",
      { sessionId: "test-tenglish-loan" }
    );

    assert.equal(res.agent, "Loan Agent");
    assert.equal(res.detectedLanguage, "te");
    assert.equal(res.parsedFields.principal, 500000);
    assert.equal(res.parsedFields.rate, 9.5);
    assert.equal(res.parsedFields.years, 5);
    assert.ok(res.reply.includes("EMI"));
  });

  it("processes Hinglish SIP query with Hindi language output", async () => {
    const res = await voiceOrchestrator(
      "5000 monthly SIP 10 saal ke liye 12 percent return pe kitna milega",
      { sessionId: "test-hinglish-sip" }
    );

    assert.equal(res.agent, "Investment Agent");
    assert.equal(res.detectedLanguage, "hi");
    assert.equal(res.parsedFields.monthlyAmount, 5000);
    assert.equal(res.parsedFields.years, 10);
    assert.equal(res.parsedFields.rate, 12);
    assert.ok(res.reply.includes("एसआईपी"));
  });

  it("processes Hinglish budget query with Hindi output", async () => {
    const res = await voiceOrchestrator(
      "meri salary 75000 hai aur kharcha 25000",
      { sessionId: "test-hinglish-budget" }
    );

    assert.equal(res.agent, "Budget Agent");
    assert.equal(res.detectedLanguage, "hi");
    assert.equal(res.parsedFields.income, 75000);
    assert.equal(res.parsedFields.expenses, 25000);
    assert.ok(res.reply.includes("मासिक"));
  });

  it("processes Hindi budget query with phonetic numbers 'फिफ्टी थाउज़ेंड' and 'थर्टी फाइव के'", async () => {
    const res = await voiceOrchestrator(
      "मेरी सैलरी फिफ्टी थाउज़ेंड है और मंथली कचरा थर्टी फाइव के है।",
      { sessionId: "test-hindi-phonetic-budget" }
    );

    assert.equal(res.agent, "Budget Agent");
    assert.equal(res.detectedLanguage, "hi");
    assert.equal(res.parsedFields.income, 50000);
    assert.equal(res.parsedFields.expenses, 35000);
    assert.equal(res.parsedFields.savings, 15000);
    assert.ok(res.reply.includes("मासिक"));
  });

  it("continues previous loan conversation across multiple turns seamlessly", async () => {
    const sid = "test-multi-turn-continuity-" + Date.now();
    resetSession(sid);

    // Turn 1: Initial query with decimal rate in spoken Telugu words
    const t1 = await voiceOrchestrator(
      "ఆరు లక్షల లోన్కు ఆరు పాయింట్ ఐదు వడ్డీతో ఐదు సంవత్సరాలకు ఈఎంఐ ఎంత?",
      { sessionId: sid }
    );
    assert.equal(t1.agent, "Loan Agent");
    assert.equal(t1.parsedFields.principal, 600000);
    assert.equal(t1.parsedFields.rate, 6.5);
    assert.equal(t1.parsedFields.years, 5);
    assert.equal(t1.parsedFields.emi, 11740);

    // Turn 2: Follow-up confirming with 6.5% interest without repeating amount or tenure
    const t2 = await voiceOrchestrator("ఆరు పాయింట్ ఐదు వడ్డీతో అయితే ఎంత వస్తుంది?", {
      sessionId: sid,
    });
    assert.equal(t2.agent, "Loan Agent");
    assert.equal(t2.needsClarification, false);
    assert.equal(t2.parsedFields.principal, 600000);
    assert.equal(t2.parsedFields.rate, 6.5);
    assert.equal(t2.parsedFields.years, 5);
    assert.equal(t2.parsedFields.emi, 11740);

    // Turn 3: Follow-up changing tenure to 7 years
    const t3 = await voiceOrchestrator("ఏడు సంవత్సరాల కాలపరిమితికి అయితే ఎంత?", {
      sessionId: sid,
    });
    assert.equal(t3.agent, "Loan Agent");
    assert.equal(t3.parsedFields.principal, 600000);
    assert.equal(t3.parsedFields.rate, 6.5);
    assert.equal(t3.parsedFields.years, 7);
    assert.equal(t3.parsedFields.emi, 8910);

    // Turn 4: Spoken repeat / recall previous calculation
    const t4 = await voiceOrchestrator("మళ్ళీ చెప్పు", { sessionId: sid });
    assert.ok(t4.reply.includes("గతంలో లెక్కించిన వివరాలు"));
    assert.ok(t4.reply.includes("8,910"));
  });

  it("continues previous SIP conversation when modifying tenure", async () => {
    const sid = "test-sip-continuity-" + Date.now();
    resetSession(sid);

    // Turn 1: 5000 monthly SIP for 10 years at 12%
    const t1 = await voiceOrchestrator("5000 monthly SIP for 10 years at 12%", { sessionId: sid });
    assert.equal(t1.agent, "Investment Agent");
    assert.equal(t1.parsedFields.monthlyAmount, 5000);
    assert.equal(t1.parsedFields.years, 10);

    // Turn 2: Follow-up: what if 15 years?
    const t2 = await voiceOrchestrator("what if 15 years?", { sessionId: sid });
    assert.equal(t2.agent, "Investment Agent");
    assert.equal(t2.parsedFields.monthlyAmount, 5000);
    assert.equal(t2.parsedFields.years, 15);
    assert.ok(t2.data.totalValue > t1.data.totalValue);
  });

  it("calculates 5-year loan EMI accurately for spoken Telugu 'ఫర్ ఫైవ్ ఇయర్స్ ఎట్ నైన్ పాయింట్ ఫైవ్ పర్సెంట్'", async () => {
    const sid = "test-telugu-five-years-tenure-" + Date.now();
    resetSession(sid);

    const res = await voiceOrchestrator(
      "నాకు ఫైవ్ లాక్ లోన్ కావాలి ఫర్ ఫైవ్ ఇయర్స్ ఎట్ నైన్ పాయింట్ ఫైవ్ పర్సెంట్ ఇంట్రెస్ట్.",
      { sessionId: sid, language: "indic-auto" }
    );

    assert.equal(res.agent, "Loan Agent");
    assert.equal(res.detectedLanguage, "te");
    assert.equal(res.needsClarification, false);
    assert.equal(res.parsedFields.principal, 500000);
    assert.equal(res.parsedFields.rate, 9.5);
    assert.equal(res.parsedFields.years, 5);
    assert.equal(res.parsedFields.emi, 10501);
    assert.equal(res.data.totalInterest, 130060);
    assert.equal(res.data.totalPayment, 630060);
    assert.ok(res.reply.includes("₹10,501"));
    assert.ok(res.reply.includes("5 సంవత్సరాలకు"));
  });

  it("disambiguates standalone numbers '10', '5', and decimal rate '10.5' across multi-turn follow-ups", async () => {
    const sid = "test-multi-turn-tenure-disambiguation-" + Date.now();
    resetSession(sid);

    // Turn 1: 5 lakh loan for 5 years at 8.5%
    const t1 = await voiceOrchestrator("5 lakh loan for 5 years at 8.5%", { sessionId: sid });
    assert.equal(t1.parsedFields.principal, 500000);
    assert.equal(t1.parsedFields.years, 5);
    assert.equal(t1.parsedFields.rate, 8.5);

    // Turn 2: User says standalone "10" (modifying tenure from 5 to 10 years)
    const t2 = await voiceOrchestrator("what if 10?", { sessionId: sid });
    assert.equal(t2.parsedFields.years, 10);
    assert.equal(t2.parsedFields.rate, 8.5);

    // Turn 3: User says standalone "5" (modifying tenure back from 10 to 5 years)
    const t3 = await voiceOrchestrator("5", { sessionId: sid });
    assert.equal(t3.parsedFields.years, 5);
    assert.equal(t3.parsedFields.rate, 8.5);

    // Turn 4: User says decimal rate "10.5" (modifying rate to 10.5% while preserving 5-year tenure)
    const t4 = await voiceOrchestrator("10.5", { sessionId: sid });
    assert.equal(t4.parsedFields.years, 5);
    assert.equal(t4.parsedFields.rate, 10.5);

    // Turn 5: STT trailing period after whole number "10." must remain tenure, not rate
    const t5 = await voiceOrchestrator("10.", { sessionId: sid });
    assert.equal(t5.parsedFields.years, 10);
    assert.equal(t5.parsedFields.rate, 10.5);
  });

  it("confirms Telugu voice profile save when STT appends trailing punctuation ('అవును.')", async () => {
    const sid = "test-telugu-stt-period-confirm-" + Date.now();
    resetSession(sid);

    const step1 = await voiceOrchestrator(
      "నా యొక్క ఆదాయం డెబ్బై ఐదు వేలు మరియు నా యొక్క ఖర్చులు ముప్పై ఐదు వేలు సేవ్ చేయి.",
      { sessionId: sid, language: "indic-auto" }
    );
    assert.equal(step1.agent, "Memory Agent");
    assert.equal(step1.pendingConfirmation, true);
    assert.equal(step1.parsedFields.income, 75000);
    assert.equal(step1.parsedFields.expenses, 35000);

    const step2 = await voiceOrchestrator("అవును.", {
      sessionId: sid,
      language: "indic-auto",
    });
    assert.equal(step2.agent, "Memory Agent");
    assert.equal(step2.pendingConfirmation, false);
    assert.equal(step2.needsClarification, false);
    assert.ok(step2.reply.includes("విజయవంతంగా అప్‌డేట్"));
    assert.equal(getSession(sid).profile.income, 75000);
    assert.equal(getSession(sid).profile.expenses, 35000);
  });

  it("localizes Hindi budget feedback without mixing English status or suggestion", async () => {
    const sid = "test-hindi-budget-local-" + Date.now();
    resetSession(sid);

    const res = await voiceOrchestrator("मेरी सैलरी पचहत्तर हज़ार है और खर्चा पच्चीस हज़ार है।", {
      sessionId: sid,
      language: "indic-auto",
    });
    assert.equal(res.agent, "Budget Agent");
    assert.equal(res.detectedLanguage, "hi");
    assert.equal(res.parsedFields.income, 75000);
    assert.equal(res.parsedFields.expenses, 25000);
    assert.equal(res.data.status, "Healthy");
    assert.ok(res.reply.includes("स्वस्थ"));
    assert.ok(!res.reply.includes("Great job!"));
  });

  it("handles ₹500 SIP clarification, clarification cancellation, FD STT variants, and intent switching", async () => {
    const sid = "test-clarify-flow-" + Date.now();
    resetSession(sid);

    // 1. Bare "SIP" asks for amount, accepts ₹500 (previously blocked by >=1000 check)
    const sipAsk = await voiceOrchestrator("SIP", { sessionId: sid });
    assert.equal(sipAsk.needsClarification, true);
    const sipDone = await voiceOrchestrator("500", { sessionId: sid });
    assert.equal(sipDone.agent, "Investment Agent");
    assert.equal(sipDone.parsedFields.monthlyAmount, 500);
    assert.equal(sipDone.needsClarification, false);

    // 2. Bare "ఎఫ్డి." asks FD amount in pure Telugu (not generic unknown loop) and supports cancel
    const fdAsk = await voiceOrchestrator("ఎఫ్డి.", { sessionId: sid });
    assert.equal(fdAsk.needsClarification, true);
    assert.ok(fdAsk.reply.includes("ఫిక్స్‌డ్ డిపాజిట్"));
    assert.ok(!fdAsk.reply.includes("What amount do you want"));

    const cancelled = await voiceOrchestrator("stop", { sessionId: sid });
    assert.equal(cancelled.needsClarification, false);

    // 3. Full Telugu FD query succeeds
    const teFd = await voiceOrchestrator("నాకు రెండు లక్షల ఎఫ్డి కావాలి.", { sessionId: sid });
    assert.equal(teFd.agent, "Investment Agent");
    assert.equal(teFd.parsedFields.amount, 200000);

    // 4. Switching intent during clarification drops old clarification & language
    const ask2 = await voiceOrchestrator("SIP", { sessionId: sid });
    assert.equal(ask2.detectedLanguage, "en");
    const switched = await voiceOrchestrator("డి.ఎఫ్. వన్ లాక్ ఫర్ టూ ఇయర్స్.", { sessionId: sid });
    assert.equal(switched.agent, "Investment Agent");
    assert.equal(switched.parsedFields.amount, 100000);
    assert.equal(switched.parsedFields.years, 2);
  });

  it("preserves active English language when STT renders a numeric follow-up phonetically ('టెన్.')", async () => {
    const sid = "test-phonetic-num-lang-" + Date.now();
    resetSession(sid);

    const t1 = await voiceOrchestrator("Calculate EMI for 5 lakh loan for 5 years", { sessionId: sid });
    assert.equal(t1.detectedLanguage, "en");
    assert.equal(t1.parsedFields.years, 5);

    const t2 = await voiceOrchestrator("టెన్.", { sessionId: sid, sttDetectedLanguage: "te-IN" });
    assert.equal(t2.detectedLanguage, "en");
    assert.equal(t2.parsedFields.years, 10);
  });
});
