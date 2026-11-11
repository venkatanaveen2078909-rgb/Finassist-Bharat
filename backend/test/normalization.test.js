import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { normalizeSpokenText, parseAmount } from "../src/normalization/numeralNormalizer.js";

describe("Multilingual Numeral Normalization Suite (40+ Cases)", () => {
  const testCases = [
    // Telugu Number Words + Units
    { input: "నా జీతం డెబ్బై ఐదు వేలు", expectedContains: "75000", amount: 75000 },
    { input: "ఖర్చులు ఇరవై ఐదు వేలు", expectedContains: "25000", amount: 25000 },
    { input: "యాభై వేలు", expectedContains: "50000", amount: 50000 },
    { input: "ముప్పై వేలు", expectedContains: "30000", amount: 30000 },
    { input: "నలభై వేలు", expectedContains: "40000", amount: 40000 },
    { input: "పది వేలు", expectedContains: "10000", amount: 10000 },
    { input: "ఐదు వేలు", expectedContains: "5000", amount: 5000 },
    { input: "రెండు వేలు", expectedContains: "2000", amount: 2000 },
    { input: "లక్ష రూపాయలు", expectedContains: "100000", amount: 100000 },
    { input: "రెండు లక్షలు", expectedContains: "200000", amount: 200000 },
    { input: "ఐదు లక్షలు", expectedContains: "500000", amount: 500000 },
    { input: "పది లక్షలు", expectedContains: "1000000", amount: 1000000 },
    { input: "ఒక కోటి", expectedContains: "10000000", amount: 10000000 },
    { input: "రెండు కోట్లు", expectedContains: "20000000", amount: 20000000 },
    { input: "రెండున్నర లక్షలు", expectedContains: "250000", amount: 250000 },
    { input: "ఒకటిన్నర లక్ష", expectedContains: "150000", amount: 150000 },

    // Telugu Digits + Telugu Units
    { input: "5 లక్షలు", expectedContains: "500000", amount: 500000 },
    { input: "10 వేలు", expectedContains: "10000", amount: 10000 },
    { input: "2.5 లక్షలు", expectedContains: "250000", amount: 250000 },
    { input: "50 వేల రుణం", expectedContains: "50000", amount: 50000 },
    { input: "1 కోటి", expectedContains: "10000000", amount: 10000000 },

    // Hindi Transliterated + Units
    { input: "paanch hazaar", expectedContains: "5000", amount: 5000 },
    { input: "dus hazaar", expectedContains: "10000", amount: 10000 },
    { input: "bees hazaar", expectedContains: "20000", amount: 20000 },
    { input: "pachees hazaar", expectedContains: "25000", amount: 25000 },
    { input: "pachaas hazaar", expectedContains: "50000", amount: 50000 },
    { input: "ek lakh", expectedContains: "100000", amount: 100000 },
    { input: "do lakh", expectedContains: "200000", amount: 200000 },
    { input: "paanch lakh", expectedContains: "500000", amount: 500000 },
    { input: "dus lakh", expectedContains: "1000000", amount: 1000000 },
    { input: "ek crore", expectedContains: "10000000", amount: 10000000 },
    { input: "dhai lakh", expectedContains: "250000", amount: 250000 },

    // Hindi Devanagari + Units
    { input: "पांच हजार", expectedContains: "5000", amount: 5000 },
    { input: "दस लाख", expectedContains: "1000000", amount: 1000000 },
    { input: "एक करोड़", expectedContains: "10000000", amount: 10000000 },
    { input: "पचास हजार", expectedContains: "50000", amount: 50000 },

    // English Spoken Words & Abbreviations
    { input: "5k monthly SIP", expectedContains: "5000", amount: 5000 },
    { input: "50k salary", expectedContains: "50000", amount: 50000 },
    { input: "75k income", expectedContains: "75000", amount: 75000 },
    { input: "5 lakh loan", expectedContains: "500000", amount: 500000 },
    { input: "10 lakhs", expectedContains: "1000000", amount: 1000000 },
    { input: "1 crore", expectedContains: "10000000", amount: 10000000 },
    { input: "2 cr", expectedContains: "20000000", amount: 20000000 },
    { input: "1.5 lakh", expectedContains: "150000", amount: 150000 },
    { input: "fifty thousand", expectedContains: "50000", amount: 50000 },
    { input: "twenty five thousand", expectedContains: "25000", amount: 25000 },
    { input: "ten thousand", expectedContains: "10000", amount: 10000 },
    { input: "five thousand", expectedContains: "5000", amount: 5000 },
    { input: "1 lac", expectedContains: "100000", amount: 100000 },
    { input: "3 lacs", expectedContains: "300000", amount: 300000 },
  ];

  it("verifies there are at least 40 test cases", () => {
    assert.ok(testCases.length >= 40, `Expected at least 40 cases, got ${testCases.length}`);
  });

  testCases.forEach(({ input, expectedContains, amount }, idx) => {
    it(`Case ${idx + 1}: parses "${input}" -> contains "${expectedContains}" (amount=${amount})`, () => {
      const normalized = normalizeSpokenText(input);
      assert.ok(
        normalized.includes(expectedContains),
        `Failed for input: "${input}". Got: "${normalized}", expected to contain "${expectedContains}"`
      );
      if (amount !== undefined) {
        const parsed = parseAmount(input);
        assert.equal(parsed, amount, `Failed parseAmount for "${input}": got ${parsed}, expected ${amount}`);
      }
    });
  });

  it("normalizes Hindi 0-100, Telugu sandhi durations, zero tuples, and STT abbreviation dots", () => {
    const hindiSalary = normalizeSpokenText("मेरी सैलरी पचहत्तर हज़ार है और खर्चा पच्चीस हज़ार है।");
    assert.ok(hindiSalary.includes("75000"), `Expected 75000 in "${hindiSalary}"`);
    assert.ok(hindiSalary.includes("25000"), `Expected 25000 in "${hindiSalary}"`);

    const teSandhi = normalizeSpokenText("లక్ష రూపాయలు రెండేళ్లకు ఫిక్స్‌డ్ డిపాజిట్ చేస్తే ఎంత");
    assert.ok(teSandhi.includes("100000"), `Expected 100000 in "${teSandhi}"`);
    assert.ok(teSandhi.includes("2 ఏళ్లకు"), `Expected "2 ఏళ్లకు" in "${teSandhi}"`);

    assert.equal(parseAmount("ఫైవ్ ట్రిపుల్ జీరో డబల్ జీరో."), 500000);
    assert.ok(normalizeSpokenText("డి.ఎఫ్. వన్ లాక్ ఫర్ టూ ఇయర్స్.").includes("డిఎఫ్"));
  });

  it("safely handles null, undefined, and empty string", () => {
    assert.equal(normalizeSpokenText(""), "");
    assert.equal(normalizeSpokenText(null), "");
    assert.equal(normalizeSpokenText(undefined), "");
    assert.equal(parseAmount(""), null);
    assert.equal(parseAmount(null), null);
  });
});
