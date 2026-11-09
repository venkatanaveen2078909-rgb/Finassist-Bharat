import { escapeRegex } from "./src/normalization/numeralNormalizer.js";

const query = "ఆరు పాయింట్ ఐదు వడ్డీతో అయితే ఎంత వస్తుంది?";

// Test two-pass decimal conversion
let text = query;
// Pass 1:
text = text.replace(/(?<!\p{L})ఆరు\s*పాయింట్\s*/giu, "6.");
console.log("After pass 1:", text);

// Pass 2:
text = text.replace(/(\d+\.)\s*ఐదు(?!\p{L})/giu, "$15");
console.log("After pass 2:", text);
