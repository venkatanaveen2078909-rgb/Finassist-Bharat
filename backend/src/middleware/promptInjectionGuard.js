/**
 * Spoken and Text Prompt Injection Guard.
 * Inspects request body (transcript, message, text) and query parameters.
 */

export const BLOCKED_INJECTION_PATTERNS = [
  "ignore previous instructions",
  "ignore all instructions",
  "forget all instructions",
  "forget previous instructions",
  "disregard all previous",
  "disregard safety",
  "disregard",
  "override safety",
  "system prompt",
  "developer message",
  "jailbreak",
  "instructions vadilesi",
  "instructions marchipo",
  "nirdesh bhool jao",
  "system prompt cheppu",
  "system prompt batao",
  "wipe all",
  "wipe database",
  // Telugu native script injection patterns
  "మునుపటి సూచనలను",
  "సూచనలను పట్టించుకోవద్దు",
  "సూచనలను పట్టించుకోకుండా",
  "సూచనలు మర్చిపో",
  "సూచనలను వదిలేయి",
  "సిస్టమ్ ప్రాంప్ట్",
  "సిస్టం ప్రాంప్ట్",
  "రహస్య సమాచారం",
  // Hindi native script injection patterns
  "पहले के निर्देश",
  "पिछले निर्देश",
  "निर्देश भूल जाओ",
  "सिस्टम प्रॉम्प्ट",
  "सिस्टम प्रॉम्ट",
  "सुरक्षा नियम",
];

/**
 * Detects prompt injection attempts in arbitrary spoken or written text.
 *
 * @param {string} text
 * @returns {boolean}
 */
export function detectPromptInjection(text = "") {
  if (!text || typeof text !== "string") return false;
  const lower = text.toLowerCase();
  return BLOCKED_INJECTION_PATTERNS.some((pattern) => lower.includes(pattern));
}

export const promptInjectionGuard = (req, res, next) => {
  const candidate =
    req.body?.transcript ||
    req.body?.message ||
    req.body?.text ||
    req.query?.q ||
    "";

  if (candidate && detectPromptInjection(candidate)) {
    return res.status(400).json({
      success: false,
      error: "SECURITY_VIOLATION",
      message: "Prompt injection attempt detected",
      agent: "Security Guard",
      reply: "భద్రతా కారణాల వల్ల ఈ సూచనను అమలు చేయలేము. / I cannot bypass safety instructions.",
    });
  }

  next();
};