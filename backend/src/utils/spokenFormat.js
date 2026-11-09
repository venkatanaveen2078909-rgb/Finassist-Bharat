const ones = ["zero","one","two","three","four","five","six","seven","eight","nine","ten","eleven","twelve","thirteen","fourteen","fifteen","sixteen","seventeen","eighteen","nineteen"];
const tens = ["","","twenty","thirty","forty","fifty","sixty","seventy","eighty","ninety"];

export function numberToWords(num) {
  num = Number(num || 0);
  if (!Number.isFinite(num)) return "zero";
  if (num < 0) return `minus ${numberToWords(Math.abs(num))}`;
  if (num < 20) return ones[num];
  if (num < 100) return `${tens[Math.floor(num / 10)]}${num % 10 ? "-" + ones[num % 10] : ""}`;
  if (num < 1000) return `${ones[Math.floor(num / 100)]} hundred${num % 100 ? " " + numberToWords(num % 100) : ""}`;
  if (num < 100000) return `${numberToWords(Math.floor(num / 1000))} thousand${num % 1000 ? " " + numberToWords(num % 1000) : ""}`;
  if (num < 10000000) return `${numberToWords(Math.floor(num / 100000))} lakh${num % 100000 ? " " + numberToWords(num % 100000) : ""}`;
  return `${numberToWords(Math.floor(num / 10000000))} crore${num % 10000000 ? " " + numberToWords(num % 10000000) : ""}`;
}

export function rupees(num) {
  return `${numberToWords(Number(num || 0))} rupees`;
}

export function makeVoiceSafe(text = "") {
  return String(text)
    .replace(/₹\s?(\d[\d,]*)/g, (_, n) => rupees(Number(n.replace(/,/g, ""))))
    .replace(/(\d+(?:\.\d+)?)\s?%/g, (_, n) => `${numberToWords(Math.round(Number(n)))} percent`)
    .replace(/[\*#_|`>]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
