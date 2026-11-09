export const redactSensitiveData = (text = "") => {
  let redactedText = text;

  const patterns = [
    {
      label: "ACCOUNT_NUMBER",
      regex: /\b\d{11,18}\b/g,
      replacement: "[REDACTED_ACCOUNT_NUMBER]",
    },
    {
      label: "IFSC",
      regex: /\b[A-Z]{4}0[A-Z0-9]{6}\b/g,
      replacement: "[REDACTED_IFSC]",
    },
    {
      label: "CARD_NUMBER",
      regex: /\b(?:\d[ -]*?){13,16}\b/g,
      replacement: "[REDACTED_CARD_NUMBER]",
    },
    {
      label: "PAN",
      regex: /\b[A-Z]{5}[0-9]{4}[A-Z]\b/g,
      replacement: "[REDACTED_PAN]",
    },
    {
      label: "AADHAAR",
      regex: /\b\d{4}\s?\d{4}\s?\d{4}\b/g,
      replacement: "[REDACTED_AADHAAR]",
    },
    {
      label: "UPI_ID",
      regex: /\b[\w.-]+@[\w.-]+\b/g,
      replacement: "[REDACTED_UPI]",
    },
    {
      label: "EMAIL",
      regex: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
      replacement: "[REDACTED_EMAIL]",
    },
    {
      label: "PHONE",
      regex: /\b(?:\+91[-\s]?)?[6-9]\d{9}\b/g,
      replacement: "[REDACTED_PHONE]",
    },
  ];

  const findings = [];

  patterns.forEach((item) => {
    const matches = redactedText.match(item.regex);

    if (matches) {
      findings.push({
        type: item.label,
        count: matches.length,
      });

      redactedText = redactedText.replace(item.regex, item.replacement);
    }
  });

  return {
    originalText: text,
    redactedText,
    findings,
    isSensitive: findings.length > 0,
  };
};