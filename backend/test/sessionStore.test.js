import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  getSession,
  updateSessionProfile,
  setPendingConfirmation,
  clearPendingConfirmation,
  resetSession,
  isAffirmative,
  isNegative,
  setLastActivity,
  getLastActivity,
  addConversationTurn,
  getConversationHistory,
} from "../src/memory/sessionStore.js";

describe("Session Store & Confirmation Suite", () => {
  beforeEach(() => {
    resetSession("session-1");
    resetSession("session-2");
  });

  it("maintains strict isolation between concurrent sessions", () => {
    updateSessionProfile("session-1", { income: 80000, expenses: 30000 });
    updateSessionProfile("session-2", { income: 45000, expenses: 15000 });

    const s1 = getSession("session-1");
    const s2 = getSession("session-2");

    assert.equal(s1.profile.income, 80000);
    assert.equal(s1.profile.expenses, 30000);
    assert.equal(s2.profile.income, 45000);
    assert.equal(s2.profile.expenses, 15000);
  });

  it("handles pending confirmation lifecycle per session", () => {
    setPendingConfirmation("session-1", {
      type: "UPDATE_PROFILE",
      proposedData: { income: 90000 },
      summaryText: "income to ₹90,000",
    });

    const s1 = getSession("session-1");
    const s2 = getSession("session-2");

    assert.ok(s1.pendingConfirmation !== null);
    assert.equal(s1.pendingConfirmation.proposedData.income, 90000);
    assert.equal(s2.pendingConfirmation, null);

    clearPendingConfirmation("session-1");
    assert.equal(getSession("session-1").pendingConfirmation, null);
  });

  it("detects multilingual affirmative responses (Telugu, Hindi, English)", () => {
    assert.ok(isAffirmative("yes"));
    assert.ok(isAffirmative("sure"));
    assert.ok(isAffirmative("okay"));
    assert.ok(isAffirmative("అవును"));
    assert.ok(isAffirmative("సరే"));
    assert.ok(isAffirmative("హా"));
    assert.ok(isAffirmative("haan"));
    assert.ok(isAffirmative("theek hai"));
    assert.ok(isAffirmative("అవును."));
    assert.ok(isAffirmative("Yes!"));
    assert.ok(isAffirmative("हाँ।"));
    assert.ok(!isAffirmative("random words"));
  });

  it("detects multilingual negative responses (Telugu, Hindi, English)", () => {
    assert.ok(isNegative("no"));
    assert.ok(isNegative("cancel"));
    assert.ok(isNegative("వద్దు"));
    assert.ok(isNegative("లేదు"));
    assert.ok(isNegative("కాదు"));
    assert.ok(isNegative("వద్దు."));
    assert.ok(isNegative("కాదు!"));
    assert.ok(isNegative("नहीं।"));
    assert.ok(isNegative("nahi"));
    assert.ok(isNegative("nahin"));
    assert.ok(isNegative("mat karo"));
    assert.ok(!isNegative("ok"));
  });

  it("resets session profile and confirmation cleanly", () => {
    updateSessionProfile("session-1", { income: 100000 });
    setPendingConfirmation("session-1", { type: "RESET_PROFILE" });
    setLastActivity("session-1", { intent: "loan_emi", params: { amount: 500000 } });

    resetSession("session-1");

    const s1 = getSession("session-1");
    assert.equal(s1.profile.income, null);
    assert.equal(s1.pendingConfirmation, null);
    assert.equal(s1.lastActivity, null);
    assert.deepEqual(s1.conversationHistory, []);
  });

  it("stores and retrieves active conversational activity per session", () => {
    setLastActivity("session-1", {
      intent: "loan_emi",
      agent: "Loan Agent",
      params: { amount: 600000, rate: 6.5, tenureYears: 5 },
      data: { emi: 11740 },
    });

    const act1 = getLastActivity("session-1");
    assert.ok(act1);
    assert.equal(act1.intent, "loan_emi");
    assert.equal(act1.params.amount, 600000);
    assert.equal(act1.params.rate, 6.5);

    // Session 2 remains empty
    const act2 = getLastActivity("session-2");
    assert.equal(act2, null);
  });

  it("records and limits conversation turn history", () => {
    addConversationTurn("session-1", { role: "user", text: "Turn 1" });
    addConversationTurn("session-1", { role: "assistant", text: "Reply 1" });

    const history = getConversationHistory("session-1");
    assert.equal(history.length, 2);
    assert.equal(history[0].text, "Turn 1");
    assert.equal(history[1].text, "Reply 1");
  });
});
