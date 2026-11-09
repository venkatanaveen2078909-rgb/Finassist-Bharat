let userMemory = {
  name: null,
  income: null,
  expenses: null,
  emi: null,
  goal: null,
  targetAmount: null,
};

export const saveMemory = (message) => {
  if (
    message.includes("[REDACTED_ACCOUNT_NUMBER]") ||
    message.includes("[REDACTED_IFSC]") ||
    message.includes("[REDACTED_PAN]") ||
    message.includes("[REDACTED_AADHAAR]") ||
    message.includes("[REDACTED_CARD_NUMBER]") ||
    message.includes("[REDACTED_UPI]") ||
    message.includes("[REDACTED_PHONE]") ||
    message.includes("[REDACTED_EMAIL]")
  ) {
    console.log("✅ Sensitive banking data was redacted before memory save");
  }

  const lower = message.toLowerCase();

  const incomeMatch = message.match(/(?:income|earn|salary).*?(\d+)/i);
  const expensesMatch = message.match(/(?:expenses|spend).*?(\d+)/i);
  const emiMatch = message.match(/(?:emi).*?(\d+)/i);
  const targetMatch = message.match(/(?:target|save).*?(\d+)/i);
  const nameMatch = message.match(/(?:name is|i am|my name is)\s+([a-zA-Z]+)/i);

  if (nameMatch) userMemory.name = nameMatch[1];
  if (incomeMatch) userMemory.income = Number(incomeMatch[1]);
  if (expensesMatch) userMemory.expenses = Number(expensesMatch[1]);
  if (emiMatch) userMemory.emi = Number(emiMatch[1]);
  if (targetMatch) userMemory.targetAmount = Number(targetMatch[1]);

  if (lower.includes("house")) userMemory.goal = "House";
  else if (lower.includes("car")) userMemory.goal = "Car";
  else if (lower.includes("emergency fund")) userMemory.goal = "Emergency Fund";
  else if (lower.includes("business")) userMemory.goal = "Business";
  else if (lower.includes("education")) userMemory.goal = "Education";
};

export const getMemory = () => userMemory;

export const resetMemory = () => {
  userMemory = {
    name: null,
    income: null,
    expenses: null,
    emi: null,
    goal: null,
    targetAmount: null,
  };
};