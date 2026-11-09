import { normalizeSpokenText } from "./src/normalization/numeralNormalizer.js";
import { extractFinancialIntentAndParams } from "./src/extraction/extractor.js";

const turn1 = "ఆరు లక్షల లోన్కు ఆరు పాయింట్ ఐదు వడ్డీతో ఐదు సంవత్సరాలకు ఈఎంఐ ఎంత?";
console.log("--- TURN 1 ---");
console.log("Input:", turn1);
const norm1 = normalizeSpokenText(turn1);
console.log("Normalized:", norm1);
const ext1 = await extractFinancialIntentAndParams(turn1);
console.log("Extracted:", ext1.params);

const turn2 = "ఆరు పాయింట్ ఐదు వడ్డీతో అయితే ఎంత వస్తుంది?";
console.log("\n--- TURN 2 ---");
console.log("Input:", turn2);
const norm2 = normalizeSpokenText(turn2);
console.log("Normalized:", norm2);
const ext2 = await extractFinancialIntentAndParams(turn2);
console.log("Extracted params:", ext2.params);
console.log("Extracted intent:", ext2.intent);
console.log("Needs clarification:", ext2.needs_clarification);
