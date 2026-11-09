/**
 * Per-Session Memory and Spoken Confirmation State Manager.
 * Replaces global singleton memory with isolated session contexts.
 */

const sessions = new Map();

function createDefaultSession() {
  return {
    profile: {
      income: null,
      expenses: null,
      emi: null,
      goal: null,
      targetAmount: null,
    },
    pendingConfirmation: null,
    pendingClarification: null,
    lastActivity: null,
    conversationHistory: [],
    createdAt: Date.now(),
    lastActiveAt: Date.now(),
  };
}

/**
 * Gets or initializes a session by ID.
 *
 * @param {string} sessionId
 * @returns {Object} Session object
 */
export function getSession(sessionId = "default") {
  const sid = String(sessionId || "default").trim() || "default";
  if (!sessions.has(sid)) {
    sessions.set(sid, createDefaultSession());
  }
  const session = sessions.get(sid);
  session.lastActiveAt = Date.now();
  return session;
}

/**
 * Updates profile fields for a session.
 *
 * @param {string} sessionId
 * @param {Object} updates
 */
export function updateSessionProfile(sessionId, updates = {}) {
  const session = getSession(sessionId);
  for (const [key, val] of Object.entries(updates)) {
    if (val !== undefined && val !== null) {
      session.profile[key] = val;
    }
  }
  session.lastActiveAt = Date.now();
  return session.profile;
}

/**
 * Sets a pending confirmation for a session.
 *
 * @param {string} sessionId
 * @param {Object} pending { type, proposedData, summaryText }
 */
export function setPendingConfirmation(sessionId, pending) {
  const session = getSession(sessionId);
  session.pendingConfirmation = pending;
  session.lastActiveAt = Date.now();
}

/**
 * Clears pending confirmation for a session.
 *
 * @param {string} sessionId
 */
export function clearPendingConfirmation(sessionId) {
  const session = getSession(sessionId);
  session.pendingConfirmation = null;
  session.lastActiveAt = Date.now();
}

/**
 * Sets pending clarification for a multi-turn conversation.
 * E.g. when waiting for amount or tenure.
 *
 * @param {string} sessionId
 * @param {Object} clarification { intent, params, question }
 */
export function setPendingClarification(sessionId, clarification) {
  const session = getSession(sessionId);
  session.pendingClarification = clarification;
  session.lastActiveAt = Date.now();
}

/**
 * Clears pending clarification for a session.
 *
 * @param {string} sessionId
 */
export function clearPendingClarification(sessionId) {
  const session = getSession(sessionId);
  session.pendingClarification = null;
  session.lastActiveAt = Date.now();
}

/**
 * Sets the last completed calculation activity for a session to support conversational follow-ups.
 *
 * @param {string} sessionId
 * @param {Object} activity { intent, agent, params, data, reply, detectedLanguage, timestamp }
 */
export function setLastActivity(sessionId, activity) {
  const session = getSession(sessionId);
  session.lastActivity = activity;
  session.lastActiveAt = Date.now();
}

/**
 * Gets the last completed calculation activity for a session.
 *
 * @param {string} sessionId
 * @returns {Object|null}
 */
export function getLastActivity(sessionId) {
  const session = getSession(sessionId);
  return session.lastActivity || null;
}

/**
 * Appends a conversation turn to session history (capped at 20 turns).
 *
 * @param {string} sessionId
 * @param {Object} turn { role: 'user'|'assistant', text, agent, intent }
 */
export function addConversationTurn(sessionId, turn) {
  const session = getSession(sessionId);
  if (!session.conversationHistory) {
    session.conversationHistory = [];
  }
  session.conversationHistory.push({
    ...turn,
    timestamp: Date.now(),
  });
  if (session.conversationHistory.length > 20) {
    session.conversationHistory.shift();
  }
  session.lastActiveAt = Date.now();
}

/**
 * Gets the conversation turn history for a session.
 *
 * @param {string} sessionId
 * @returns {Array}
 */
export function getConversationHistory(sessionId) {
  const session = getSession(sessionId);
  return session.conversationHistory || [];
}

/**
 * Resets profile and confirmation state for a session.
 *
 * @param {string} sessionId
 */
export function resetSession(sessionId) {
  const sid = String(sessionId || "default").trim() || "default";
  sessions.set(sid, createDefaultSession());
}

/**
 * Checks if spoken input represents an affirmation (Yes) in Telugu, Hindi, or English.
 *
 * @param {string} text
 * @returns {boolean}
 */
export function isAffirmative(text = "") {
  const clean = String(text || "").trim().toLowerCase();
  const affirmativePatterns = [
    "yes",
    "yeah",
    "yep",
    "sure",
    "ok",
    "okay",
    "confirm",
    "అవును",
    "హా",
    "సరే",
    "చెయ్యండి",
    "మార్చండి",
    "చేయండి",
    "haan",
    "ha",
    "theek hai",
    "sahi hai",
    "kardo",
    "kar do",
    "हाँ",
    "हां",
    "जी हाँ",
    "जी हां",
    "जी",
    "ठीक है",
    "सही है",
    "कर दो",
    "करदो",
    "सेव करो",
    "अपडेट करो",
  ];
  return affirmativePatterns.some((pattern) => {
    return clean === pattern || clean.startsWith(pattern + " ") || clean.endsWith(" " + pattern);
  });
}

/**
 * Checks if spoken input represents a rejection (No) in Telugu, Hindi, or English.
 *
 * @param {string} text
 * @returns {boolean}
 */
export function isNegative(text = "") {
  const clean = String(text || "").trim().toLowerCase();
  const negativePatterns = [
    "no",
    "nope",
    "cancel",
    "don't",
    "dont",
    "వద్దు",
    "లేదు",
    "కాదు",
    "చెయ్యద్దు",
    "చేయవద్దు",
    "nahi",
    "nahin",
    "mat karo",
    "mana",
    "नहीं",
    "नही",
    "ना",
    "मत करो",
    "रद्द करो",
    "कैंसिल",
  ];
  return negativePatterns.some((pattern) => {
    return clean === pattern || clean.startsWith(pattern + " ") || clean.endsWith(" " + pattern);
  });
}

/**
 * Prunes sessions inactive for longer than maxAgeMs.
 *
 * @param {number} maxAgeMs - Default 24 hours
 */
export function pruneInactiveSessions(maxAgeMs = 24 * 60 * 60 * 1000) {
  const now = Date.now();
  for (const [sid, session] of sessions.entries()) {
    if (now - session.lastActiveAt > maxAgeMs) {
      sessions.delete(sid);
    }
  }
}
