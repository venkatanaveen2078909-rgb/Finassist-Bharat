import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { extractFinancialIntentAndParams } from "../src/extraction/extractor.js";

describe("Structured Extraction & Schema Validation Suite", () => {
  it("extracts loan EMI query in English", async () => {
    const res = await extractFinancialIntentAndParams(
      "Calculate EMI for 500000 loan at 10% interest for 5 years"
    );

    assert.equal(res.intent, "loan_emi");
    assert.equal(res.params.amount, 500000);
    assert.equal(res.params.rate, 10);
    assert.equal(res.params.tenureYears, 5);
    assert.equal(res.needs_clarification, false);
    assert.ok(res.confidence >= 0.85);
  });

  it("extracts loan EMI query in Telugu code-mixed", async () => {
    const res = await extractFinancialIntentAndParams(
      "5 లక్షల లోన్ కు 8.5% వడ్డీతో 3 సంవత్సరాలకు EMI ఎంత?"
    );

    assert.equal(res.intent, "loan_emi");
    assert.equal(res.params.amount, 500000);
    assert.equal(res.params.rate, 8.5);
    assert.equal(res.params.tenureYears, 3);
    assert.equal(res.needs_clarification, false);
  });

  it("extracts SIP query in Hindi/English code-mixed", async () => {
    const res = await extractFinancialIntentAndParams(
      "5k per month SIP for 10 years at 12%"
    );

    assert.equal(res.intent, "investment_sip");
    assert.equal(res.params.amount, 5000);
    assert.equal(res.params.tenureYears, 10);
    assert.equal(res.params.rate, 12);
  });

  it("extracts FD query with Telugu number words", async () => {
    const res = await extractFinancialIntentAndParams(
      "ఒక లక్ష రూపాయలు FD లో 2 సంవత్సరాలకు 7% వడ్డీకి వేస్తే ఎంత వస్తుంది?"
    );

    assert.equal(res.intent, "investment_fd");
    assert.equal(res.params.amount, 100000);
    assert.equal(res.params.tenureYears, 2);
    assert.equal(res.params.rate, 7);
  });

  it("flags needs_clarification when required amount is missing for loan", async () => {
    const res = await extractFinancialIntentAndParams("EMI calculate chey");

    assert.equal(res.intent, "loan_emi");
    assert.equal(res.needs_clarification, true);
    assert.ok(res.clarification_question.length > 5);
    assert.ok(res.confidence < 0.7);
  });

  it("extracts multi-field budget income and expenses in Telugu", async () => {
    const res = await extractFinancialIntentAndParams(
      "నా ఆదాయం 75000 మరియు ఖర్చులు 25000"
    );

    assert.equal(res.intent, "profile_update");
    assert.equal(res.params.amount, 75000);
    assert.equal(res.params.expenses, 25000);
    assert.equal(res.needs_clarification, false);
  });

  it("extracts spoken decimal rates like '10 point 5% interest'", async () => {
    const res = await extractFinancialIntentAndParams(
      "i need 3,00,000 loan for three years at 10 point 5% interest"
    );

    assert.equal(res.intent, "loan_emi");
    assert.equal(res.params.amount, 300000);
    assert.equal(res.params.tenureYears, 3);
    assert.equal(res.params.rate, 10.5);
  });

  it("extracts STT timestamp colon rates like '10:05 interest'", async () => {
    const res = await extractFinancialIntentAndParams(
      "i need 3,00,000 loan for three years at 10:05 interest"
    );

    assert.equal(res.intent, "loan_emi");
    assert.equal(res.params.amount, 300000);
    assert.equal(res.params.tenureYears, 3);
    assert.equal(res.params.rate, 10.5);
  });

  it("extracts Tenglish code-mixed loan EMI query", async () => {
    const res = await extractFinancialIntentAndParams(
      "naaku 5 lakh loan kavali for 5 years at 9.5% interest"
    );

    assert.equal(res.intent, "loan_emi");
    assert.equal(res.params.amount, 500000);
    assert.equal(res.params.tenureYears, 5);
    assert.equal(res.params.rate, 9.5);
    assert.equal(res.needs_clarification, false);
  });

  it("extracts Hinglish code-mixed loan EMI query", async () => {
    const res = await extractFinancialIntentAndParams(
      "5 lakh ka loan chahiye 5 saal ke liye 9.5 percent interest pe"
    );

    assert.equal(res.intent, "loan_emi");
    assert.equal(res.params.amount, 500000);
    assert.equal(res.params.tenureYears, 5);
    assert.equal(res.params.rate, 9.5);
    assert.equal(res.needs_clarification, false);
  });

  it("extracts Tenglish code-mixed SIP query with Telugu tenure 'yellaki'", async () => {
    const res = await extractFinancialIntentAndParams(
      "aide velu monthly SIP 10 yellaki 12 percent tho"
    );

    assert.equal(res.intent, "investment_sip");
    assert.equal(res.params.amount, 5000);
    assert.equal(res.params.tenureYears, 10);
    assert.equal(res.params.rate, 12);
  });

  it("extracts Hinglish code-mixed SIP query with 'saal ke liye'", async () => {
    const res = await extractFinancialIntentAndParams(
      "5000 monthly SIP 10 saal ke liye 12 percent return pe kitna milega"
    );

    assert.equal(res.intent, "investment_sip");
    assert.equal(res.params.amount, 5000);
    assert.equal(res.params.tenureYears, 10);
    assert.equal(res.params.rate, 12);
  });

  it("extracts Hinglish budget query with 'salary' and 'kharcha'", async () => {
    const res = await extractFinancialIntentAndParams(
      "meri salary 75000 hai aur kharcha 25000"
    );

    assert.equal(res.intent, "budget_analysis");
    assert.equal(res.params.amount, 75000);
    assert.equal(res.params.expenses, 25000);
  });

  it("extracts loan query with Telugu English phonetics 'నైన్ పాయింట్ ఫైవ్ పర్సెంట్' and 'ఐదు సంవత్సరాలకు'", async () => {
    const res = await extractFinancialIntentAndParams(
      "ఆరు లక్షల లోన్కు నైన్ పాయింట్ ఫైవ్ పర్సెంట్ వడ్డీతో ఐదు సంవత్సరాలకు ఈఎంఐ ఎంత?"
    );

    assert.equal(res.intent, "loan_emi");
    assert.equal(res.params.amount, 600000);
    assert.equal(res.params.rate, 9.5);
    assert.equal(res.params.tenureYears, 5);
    assert.equal(res.needs_clarification, false);
  });

  it("extracts multi-script Telugu/Hindi/English code-mixed SIP query", async () => {
    const res = await extractFinancialIntentAndParams(
      "సిక్స్ థౌజండ్ మంత్లీ ఎస్ఐపి ఫర్ సెవెన్ సాల్ కేలియె. शिक्स परसेंट रिटर्न पर कितना मिलेगा?"
    );

    assert.equal(res.intent, "investment_sip");
    assert.equal(res.params.amount, 6000);
    assert.equal(res.params.tenureYears, 7);
    assert.equal(res.params.rate, 6);
    assert.equal(res.needs_clarification, false);
  });

  it("extracts Telugu SIP with 'ఐదు వేల' and 'పది ఏళ్ల పాటు' and 'పన్నెండు శాతం'", async () => {
    const res = await extractFinancialIntentAndParams(
      "ఐదు వేల మంత్లీ ఎస్ఐపీ అది కూడా పది ఏళ్ల పాటు పన్నెండు శాతం"
    );

    assert.equal(res.intent, "investment_sip");
    assert.equal(res.params.amount, 5000);
    assert.equal(res.params.tenureYears, 10);
    assert.equal(res.params.rate, 12);
    assert.equal(res.needs_clarification, false);
  });

  it("extracts Hindi Devanagari salary 50000 and kharcha 60000 with nuktas", async () => {
    const res = await extractFinancialIntentAndParams(
      "मेरी सैलरी फ़िफ्टी थाउजेंड है और मंथली खर्चा सिकस्टी थाउजेंड है।"
    );

    assert.equal(res.intent, "budget_analysis");
    assert.equal(res.params.amount, 50000);
    assert.equal(res.params.expenses, 60000);
    assert.equal(res.needs_clarification, false);
  });

  it("extracts mixed Telugu/Hindi query with 'शिक्ष परसेंट' and 'సెవెన్ సాల్'", async () => {
    const res = await extractFinancialIntentAndParams(
      "సిక్స్ థౌజండ్ మంత్లీ ఎస్ఐపీ ఫర్ సెవెన్ సాల్ కేలియే. शिक्ष परसेंट रिटर्न पर कितना मिलेगा?"
    );

    assert.equal(res.intent, "investment_sip");
    assert.equal(res.params.amount, 6000);
    assert.equal(res.params.tenureYears, 7);
    assert.equal(res.params.rate, 6);
    assert.equal(res.needs_clarification, false);
  });

  it("extracts Hindi salary 'फिफ्टी थाउज़ेंड' and monthly expense 'थर्टी फाइव के'", async () => {
    const res = await extractFinancialIntentAndParams(
      "मेरी सैलरी फिफ्टी थाउज़ेंड है और मंथली कचरा थर्टी फाइव के है।"
    );

    assert.equal(res.intent, "budget_analysis");
    assert.equal(res.params.amount, 50000);
    assert.equal(res.params.expenses, 35000);
    assert.equal(res.needs_clarification, false);
  });

  it("extracts Telugu profile update with inflected suffix '35 వేలుగా'", async () => {
    const res = await extractFinancialIntentAndParams(
      "నా జీతం 75 వేలు మరియు ఖర్చులు 35 వేలుగా సేవ్ చేయి"
    );

    assert.equal(res.intent, "profile_update");
    assert.equal(res.params.amount, 75000);
    assert.equal(res.params.expenses, 35000);
    assert.equal(res.needs_clarification, false);
  });

  it("extracts Hindi profile update with 'मेरी सैलरी 50000 और खर्चा 35000 सेव करो'", async () => {
    const res = await extractFinancialIntentAndParams(
      "मेरी सैलरी 50000 और खर्चा 35000 सेव करो"
    );

    assert.equal(res.intent, "profile_update");
    assert.equal(res.params.amount, 50000);
    assert.equal(res.params.expenses, 35000);
    assert.equal(res.needs_clarification, false);
  });

  it("extracts Telugu phonetic English loan tenure 'ఫర్ ఫైవ్ ఇయర్స్' and rate 'నైన్ పాయింట్ ఫైవ్ పర్సెంట్'", async () => {
    const res = await extractFinancialIntentAndParams(
      "నాకు ఫైవ్ లాక్ లోన్ కావాలి ఫర్ ఫైవ్ ఇయర్స్ ఎట్ నైన్ పాయింట్ ఫైవ్ పర్సెంట్ ఇంట్రెస్ట్."
    );

    assert.equal(res.intent, "loan_emi");
    assert.equal(res.params.amount, 500000);
    assert.equal(res.params.tenureYears, 5);
    assert.equal(res.params.rate, 9.5);
    assert.equal(res.needs_clarification, false);
  });

  it("extracts Hindi phonetic English loan tenure 'फॉर फाइव इयर्स' and rate '9.5 परसेंट ब्याज'", async () => {
    const res = await extractFinancialIntentAndParams(
      "मुझे फाइव लाख लोन चाहिए फॉर फाइव इयर्स एट 9.5 परसेंट ब्याज"
    );

    assert.equal(res.intent, "loan_emi");
    assert.equal(res.params.amount, 500000);
    assert.equal(res.params.tenureYears, 5);
    assert.equal(res.params.rate, 9.5);
    assert.equal(res.needs_clarification, false);
  });

  it("extracts decimal tenure and amounts (2.5 years, two point five lakh, ढाई लाख, 8.75%)", async () => {
    const r1 = await extractFinancialIntentAndParams("50000 loan for 2.5 years at 9% interest");
    assert.equal(r1.params.amount, 50000);
    assert.equal(r1.params.tenureYears, 2.5);
    assert.equal(r1.params.rate, 9);

    const r2 = await extractFinancialIntentAndParams("two point five lakh loan at eight point five percent for three years");
    assert.equal(r2.params.amount, 250000);
    assert.equal(r2.params.rate, 8.5);
    assert.equal(r2.params.tenureYears, 3);

    const r3 = await extractFinancialIntentAndParams("ढाई लाख का लोन 8.5% ब्याज पर 3 साल के लिए");
    assert.equal(r3.params.amount, 250000);
    assert.equal(r3.params.rate, 8.5);
    assert.equal(r3.params.tenureYears, 3);

    const r4 = await extractFinancialIntentAndParams("डेढ़ लाख का लोन 9.5% ब्याज पर 2 साल के लिए");
    assert.equal(r4.params.amount, 150000);
    assert.equal(r4.params.rate, 9.5);
    assert.equal(r4.params.tenureYears, 2);

    const r5 = await extractFinancialIntentAndParams("5 lakh loan for 5 years at 8.75% interest");
    assert.equal(r5.params.rate, 8.75);
  });

  it("extracts STT Telugu FD/EMI variants, sandhi tenures, and Hindi 75000 budget", async () => {
    const bareFd = await extractFinancialIntentAndParams("ఎఫ్డి.");
    assert.equal(bareFd.intent, "investment_fd");
    assert.equal(bareFd.needs_clarification, true);

    const bareFdPhonetic = await extractFinancialIntentAndParams("ఎఫ్టీ.");
    assert.equal(bareFdPhonetic.intent, "investment_fd");
    assert.equal(bareFdPhonetic.needs_clarification, true);

    const lowVolFd = await extractFinancialIntentAndParams("డి.ఎఫ్. వన్ లాక్ ఫర్ టూ ఇయర్స్.");
    assert.equal(lowVolFd.intent, "investment_fd");
    assert.equal(lowVolFd.params.amount, 100000);
    assert.equal(lowVolFd.params.tenureYears, 2);
    assert.equal(lowVolFd.needs_clarification, false);

    const teFd = await extractFinancialIntentAndParams("నాకు రెండు లక్షల ఎఫ్డి కావాలి.");
    assert.equal(teFd.intent, "investment_fd");
    assert.equal(teFd.params.amount, 200000);
    assert.equal(teFd.needs_clarification, false);

    const teSandhiFd = await extractFinancialIntentAndParams("లక్ష రూపాయలు రెండేళ్లకు ఫిక్స్‌డ్ డిపాజిట్ చేస్తే ఎంత");
    assert.equal(teSandhiFd.intent, "investment_fd");
    assert.equal(teSandhiFd.params.amount, 100000);
    assert.equal(teSandhiFd.params.tenureYears, 2);

    const teEmi = await extractFinancialIntentAndParams("ఐదు లక్షల లోన్ ఈఎమ్ఐ ఐదేళ్లకు");
    assert.equal(teEmi.intent, "loan_emi");
    assert.equal(teEmi.params.amount, 500000);
    assert.equal(teEmi.params.tenureYears, 5);

    const hiBudget = await extractFinancialIntentAndParams("मेरी सैलरी पचहत्तर हज़ार है और खर्चा पच्चीस हज़ार है।");
    assert.equal(hiBudget.intent, "budget_analysis");
    assert.equal(hiBudget.params.amount, 75000);
    assert.equal(hiBudget.params.expenses, 25000);
  });
});
