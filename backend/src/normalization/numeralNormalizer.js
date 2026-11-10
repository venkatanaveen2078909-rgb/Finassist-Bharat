/**
 * Multilingual Numeral and Unit Normalizer for FinAssist Bharat.
 * Converts Telugu, Hindi, English, and code-mixed number phrases and units into integers.
 */

// Basic single digits & small numbers
const NUMBER_WORDS = {
  // Telugu Romanized (STT phonetic variants — e.g. Gnani ASR output)
  okati: 1,
  okka: 1,
  "ok ka": 1,
  rendu: 2,
  randu: 2,
  rende: 2,
  moodu: 3,
  mudu: 3,
  moode: 3,
  naalugu: 4,
  nalugu: 4,
  naaluge: 4,
  aidu: 5,
  aide: 5,
  ayidu: 5,
  ayide: 5,
  aidwa: 5,
  aido: 5,
  aid: 5,          // STT often transcribes ఐదు as "aid"
  ayd: 5,
  aaru: 6,
  aare: 6,
  edu: 7,
  yedu: 7,
  ede: 7,
  enimidi: 8,
  yenimidi: 8,
  enimide: 8,
  tommidi: 9,
  tommide: 9,
  padi: 10,
  pade: 10,
  padhi: 10,
  padakondhu: 11,
  pannandu: 12,
  iruvai: 20,
  muppai: 30,
  nalbhai: 40,
  yabhai: 50,
  aravai: 60,
  debbhai: 70,
  enabhai: 80,
  tombhai: 90,
  vanda: 100,
  nooru: 100,

  // Telugu
  సున్నా: 0,
  ఒకటి: 1,
  ఒక: 1,
  రెండు: 2,
  రెండే: 2,
  మూడు: 3,
  మూడే: 3,
  నాలుగు: 4,
  నాలుగే: 4,
  ఐదు: 5,
  అయిదు: 5,
  ఐదే: 5,
  అయిదే: 5,
  ఐదో: 5,
  ఆరు: 6,
  ఆరే: 6,
  ఏడు: 7,
  ఏడే: 7,
  ఎనిమిది: 8,
  ఎనిమిదే: 8,
  తొమ్మిది: 9,
  తొమ్మిదే: 9,
  పది: 10,
  పదే: 10,
  పదకొండు: 11,
  పన్నెండు: 12,
  పదమూడు: 13,
  పద్నాలుగు: 14,
  పదిహేను: 15,
  పదహారు: 16,
  పదిహేడు: 17,
  పద్దెనిమిది: 18,
  పంతొమ్మిది: 19,
  ఇరవై: 20,
  ముప్పై: 30,
  నలభై: 40,
  యాభై: 50,
  అరవై: 60,
  డెబ్బై: 70,
  డెబ్భై: 70,
  ఎనభై: 80,
  తొంభై: 90,
  వంద: 100,
  నూరు: 100,

  // Telugu English Phonetic Transliterations (Gnani ASR output)
  జీరో: 0,
  వన్: 1,
  ఒన్: 1,
  టూ: 2,
  తూ: 2,
  త్రీ: 3,
  ఫోర్: 4,
  ఫైవ్: 5,
  పైవ్: 5,
  సిక్స్: 6,
  శిక్స్: 6,
  సెవెన్: 7,
  శేవెన్: 7,
  ఎయిట్: 8,
  నైన్: 9,
  నైను: 9,
  టెన్: 10,
  లెవెన్: 11,
  ట్వెల్వ్: 12,
  థర్టీన్: 13,
  ఫోర్టీన్: 14,
  ఫిఫ్టీన్: 15,
  సిక్స్‌టీన్: 16,
  సెవెంటీన్: 17,
  ఎయిటీన్: 18,
  నైంటీన్: 19,
  ట్వంటీ: 20,
  ట్వంటీఫైవ్: 25,
  థర్టీ: 30,
  ఫార్టీ: 40,
  ఫిఫ్టీ: 50,
  సిక్స్టీ: 60,
  సెవెంటీ: 70,
  ఎయిటీ: 80,
  నైంటీ: 90,
  హండ్రెడ్: 100,

  // Hindi Devanagari English Phonetics (Gnani ASR output)
  ज़ीरो: 0,
  जीरो: 0,
  सिफर: 0,
  वन: 1,
  टू: 2,
  थ्री: 3,
  फोर: 4,
  फाइव: 5,
  फाईव: 5,
  सिक्स: 6,
  शिक्ष: 6,
  शिक्स: 6,
  शीक्स: 6,
  सेवन: 7,
  सेवेन: 7,
  एट: 8,
  नाइन: 9,
  नाईन: 9,
  टेन: 10,
  इलेवन: 11,
  ट्वेलव: 12,
  ट्वेल्व: 12,
  थर्टीन: 13,
  फोर्टीन: 14,
  फिफ्टीन: 15,
  फीफ्टीन: 15,
  सिक्सटीन: 16,
  सिक्सटिन: 16,
  सेवेंटीन: 17,
  सेवेन्टीन: 17,
  एइटीन: 18,
  एटीन: 18,
  नाइन्टीन: 19,
  ट्वेंटी: 20,
  ट्वेनटी: 20,
  ट्वेंटीफाइव: 25,
  थर्टी: 30,
  फार्टी: 40,
  फोर्टी: 40,
  फिफ्टी: 50,
  फीफ्टी: 50,
  फिफटी: 50,
  सिक्सटी: 60,
  सिकस्टी: 60,
  शिक्सटी: 60,
  शिकस्टी: 60,
  सिक्सटि: 60,
  सेवेंटी: 70,
  सेवेन्टी: 70,
  एटी: 80,
  एइटी: 80,
  नाइंटी: 90,
  नाइन्टी: 90,
  हंड्रेड: 100,
  हण्ड्रेड: 100,

  // Hindi Devanagari
  शून्य: 0,
  एक: 1,
  दो: 2,
  तीन: 3,
  चार: 4,
  पांच: 5,
  पाँच: 5,
  छह: 6,
  सात: 7,
  आठ: 8,
  नौ: 9,
  दस: 10,
  ग्यारह: 11,
  बारह: 12,
  पंद्रह: 15,
  बीस: 20,
  पच्चीस: 25,
  तीस: 30,
  पैंतीस: 35,
  चालीस: 40,
  पचास: 50,
  साठ: 60,
  सत्तर: 70,
  अस्सी: 80,
  नब्बे: 90,
  सौ: 100,

  // Hindi Latin Transliterated
  ek: 1,
  do: 2,
  teen: 3,
  char: 4,
  paanch: 5,
  panch: 5,
  chhe: 6,
  saat: 7,
  aath: 8,
  nau: 9,
  dus: 10,
  gyarah: 11,
  barah: 12,
  pandrah: 15,
  bees: 20,
  pachees: 25,
  tees: 30,
  paintees: 35,
  chalis: 40,
  pachaas: 50,
  pachas: 50,
  saath: 60,
  sattar: 70,
  assi: 80,
  nabbe: 90,
  sau: 100,

  // English
  zero: 0,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  thirteen: 13,
  fourteen: 14,
  fifteen: 15,
  sixteen: 16,
  seventeen: 17,
  eighteen: 18,
  nineteen: 19,
  twenty: 20,
  thirty: 30,
  forty: 40,
  fifty: 50,
  sixty: 60,
  seventy: 70,
  eighty: 80,
  ninety: 90,
  hundred: 100,
};

// Unit Multipliers
const UNIT_MULTIPLIERS = {
  // Telugu Romanized STT variants (Gnani ASR phonetic output)
  lakshalu: 100000,
  lakshaalu: 100000,
  lakshalu: 100000,
  lakshadu: 100000,   // "ఐదు లక్షలు" often heard as "aid lakshadu"
  lakshaadu: 100000,
  laksham: 100000,
  velu: 1000,
  vela: 1000,
  veyyi: 1000,
  kotlu: 10000000,
  koti: 10000000,

  // Telugu
  లక్షలు: 100000,
  లక్షల: 100000,
  లక్ష: 100000,
  లక్షలుగా: 100000,
  లక్షలగా: 100000,
  లక్షగా: 100000,
  లక్షలకి: 100000,
  లక్షలకు: 100000,
  లక్షలతో: 100000,
  లక్షల్లో: 100000,
  లక్షలలో: 100000,
  కోట్లు: 10000000,
  కోట్ల: 10000000,
  కోటి: 10000000,
  కోట్లుగా: 10000000,
  కోటిగా: 10000000,
  కోట్లకి: 10000000,
  కోట్లకు: 10000000,
  కోట్లతో: 10000000,
  కోట్లలో: 10000000,
  వేలు: 1000,
  వేల: 1000,
  వేలుగా: 1000,
  వేలగా: 1000,
  వేలకి: 1000,
  వేలకు: 1000,
  వేలతో: 1000,
  వేలలో: 1000,
  వేల్: 1000,
  వెయ్యి: 1000,
  వంద: 100,
  వందలు: 100,
  వందల: 100,
  వందలుగా: 100,
  వందలకి: 100,
  వందలకు: 100,
  థౌజండ్: 1000,
  థౌసండ్: 1000,
  థౌజండ్స్: 1000,
  థౌజండ్లుగా: 1000,
  థౌజండ్లకి: 1000,
  థౌజండ్లకు: 1000,
  హండ్రెడ్: 100,
  లాక్స్: 100000,
  లాక్: 100000,
  క్రోర్స్: 10000000,
  క్రోర్: 10000000,
  veluga: 1000,
  velaki: 1000,
  velaku: 1000,
  lakshaluga: 100000,
  lakshalaki: 100000,
  lakshalaku: 100000,

  // Hindi Devanagari
  थाउजेंड: 1000,
  थाउज़ेंड: 1000,
  थाउजंड: 1000,
  थाउज़ंड: 1000,
  थाउजेण्ड: 1000,
  थाउजेंट: 1000,
  थाउसेन्ड: 1000,
  थाउजेंड्स: 1000,
  थाउज़ेंड्स: 1000,
  हंड्रेड: 100,
  हण्ड्रेड: 100,
  लैक्स: 100000,
  लैक: 100000,
  करोर्स: 10000000,
  करोर: 10000000,
  हज़ार: 1000,
  हजार: 1000,
  हज़ारों: 1000,
  हजारों: 1000,
  लाख: 100000,
  लाखों: 100000,
  करोड़: 10000000,
  करोड: 10000000,
  करोड़ों: 10000000,
  करोडों: 10000000,

  // Pan-Indian Language Units (Kannada, Tamil, Malayalam, Bengali)
  ಸಾವಿರ: 1000,
  ಲಕ್ಷ: 100000,
  ಕೋಟಿ: 10000000,
  ஆயிரம்: 1000,
  லட்சம்: 100000,
  கோடி: 10000000,
  ആയിരം: 1000,
  ലക്ഷം: 100000,
  കോടി: 10000000,
  হাজার: 1000,
  লাখ: 100000,
  কোটি: 10000000,
  karod: 10000000,
  karodu: 10000000,

  // English / Hindi Latin - sorted small to large for proper hierarchical compounding
  hundreds: 100,
  hundred: 100,
  thousands: 1000,
  thousand: 1000,
  hazaar: 1000,
  hazar: 1000,
  k: 1000,
  lakhs: 100000,
  lakh: 100000,
  lacs: 100000,
  lac: 100000,
  lpa: 100000,
  millions: 1000000,
  million: 1000000,
  crores: 10000000,
  crore: 10000000,
  cr: 10000000,
};

// Compound multi-word numbers
const COMPOUND_NUMBERS = {
  // Telugu
  "డెబ్బై ఐదు": 75,
  "డెబ్భై ఐదు": 75,
  "ఇరవై ఐదు": 25,
  "యాభై ఐదు": 55,
  "ముప్పై ఐదు": 35,
  "నలభై ఐదు": 45,
  "అరవై ఐదు": 65,
  "ఎనభై ఐదు": 85,
  "తొంభై ఐదు": 95,
  రెండున్నర: 2.5,
  ఒకటిన్నర: 1.5,
  మూడున్నర: 3.5,
  నాలుగున్నర: 4.5,
  ఐదున్నర: 5.5,
  ఆరున్నర: 6.5,
  ఏడున్నర: 7.5,
  ఎనిమిదిన్నర: 8.5,
  తొమ్మిదిన్నర: 9.5,
  పదిన్నర: 10.5,

  // Hindi
  "पच्चीस हजार": 25000,
  "पचास हजार": 50000,
  "दस लाख": 1000000,
  "एक करोड़": 10000000,
  "पांच हजार": 5000,
  "ढाई": 2.5,
  "डेढ़": 1.5,
  "डेढ": 1.5,
  "सवा": 1.25,
  "पौने": 0.75,
  "साढ़े तीन": 3.5,
  "साढ़े चार": 4.5,
  "साढ़े पांच": 5.5,
  "साढ़े छह": 6.5,
  "साढ़े दस": 10.5,
  "साढ़े नौ": 9.5,
  "साढ़े आठ": 8.5,
  "साढ़े सात": 7.5,
  derh: 1.5,
  dhai: 2.5,
  "saade dus": 10.5,
  "saadhe dus": 10.5,
  "sadhe dus": 10.5,
  "saade nau": 9.5,
  "saadhe nau": 9.5,
  "sadhe nau": 9.5,
  "saade aath": 8.5,
  "saadhe aath": 8.5,
  "sadhe aath": 8.5,
  "saade saat": 7.5,
  "saadhe saat": 7.5,
  "sadhe saat": 7.5,
  padinnara: 10.5,
  tommidinnara: 9.5,
  enimidinnara: 8.5,
  edunnara: 7.5,
  aidunnara: 5.5,
  nalugunnara: 4.5,
  moodunnara: 3.5,
  rendunnara: 2.5,
  okatinnara: 1.5,

  // English
  "twenty five": 25,
  "twenty-five": 25,
  "thirty five": 35,
  "forty five": 45,
  "fifty five": 55,
  "sixty five": 65,
  "seventy five": 75,
  "eighty five": 85,
  "ninety five": 95,
  "ten and a half": 10.5,
  "nine and a half": 9.5,
  "eight and a half": 8.5,
  "seven and a half": 7.5,

  // Hindi Devanagari English Phonetics (Gnani ASR output)
  "ट्वेंटी वन": 21, "ट्वेंटी टू": 22, "ट्वेंटी थ्री": 23, "ट्वेंटी फोर": 24, "ट्वेंटी फाइव": 25, "ट्वेंटी फाईव": 25, "ट्वेंटीफाइव": 25, "ट्वेंटी सिक्स": 26, "ट्वेंटी सेवन": 27, "ट्वेंटी एट": 28, "ट्वेंटी नाइन": 29,
  "थर्टी वन": 31, "थर्टी टू": 32, "थर्टी थ्री": 33, "थर्टी फोर": 34, "थर्टी फाइव": 35, "थर्टी फाईव": 35, "थर्टीफाइव": 35, "थर्टी सिक्स": 36, "थर्टी सेवन": 37, "थर्टी एट": 38, "थर्टी नाइन": 39,
  "फोर्टी वन": 41, "फोर्टी टू": 42, "फोर्टी थ्री": 43, "फोर्टी फोर": 44, "फोर्टी फाइव": 45, "फोर्टी फाईव": 45, "फोर्टीफाइव": 45, "फोर्टी सिक्स": 46, "फोर्टी सेवन": 47, "फोर्टी एट": 48, "फोर्टी नाइन": 49,
  "फार्टी वन": 41, "फार्टी फाइव": 45, "फार्टीफाइव": 45,
  "फिफ्टी वन": 51, "फिफ्टी टू": 52, "फिफ्टी थ्री": 53, "फिफ्टी फोर": 54, "फिफ्टी फाइव": 55, "फिफ्टी फाईव": 55, "फिफ्टीफाइव": 55, "फिफ्टी सिक्स": 56, "फिफ्टी सेवन": 57, "फिफ्टी एट": 58, "फिफ्टी नाइन": 59,
  "सिक्सटी वन": 61, "सिक्सटी फाइव": 65, "सिक्सटीफाइव": 65,
  "सेवेंटी वन": 71, "सेवेंटी फाइव": 75, "सेवेंटीफाइव": 75,
  "एटी वन": 81, "एटी फाइव": 85, "एटीफाइव": 85,
  "नाइंटी वन": 91, "नाइंटी फाइव": 95, "नाइंटीफाइव": 95,

  // Telugu English Phonetics (Gnani ASR output)
  "ట్వంటీ వన్": 21, "ట్వంటీ టూ": 22, "ట్వంటీ త్రీ": 23, "ట్వంటీ ఫోర్": 24, "ట్వంటీ ఫైవ్": 25, "ట్వంటీఫైవ్": 25,
  "థర్టీ వన్": 31, "థర్టీ టూ": 32, "థర్టీ త్రీ": 33, "థర్టీ ఫోర్": 34, "థర్టీ ఫైవ్": 35, "థర్టీఫైవ్": 35,
  "ఫార్టీ వన్": 41, "ఫార్టీ ఫైవ్": 45, "ఫార్టీఫైవ్": 45,
  "ఫిఫ్టీ వన్": 51, "ఫిఫ్టీ ఫైవ్": 55, "ఫిఫ్టీఫైవ్": 55,
  "సిక్స్టీ వన్": 61, "సిక్స్టీ ఫైవ్": 65, "సిక్స్టీఫైవ్": 65,
  "సెవెంటీ వన్": 71, "సెవెంటీ ఫైవ్": 75, "సెవెంటీఫైవ్": 75,
  "ఎయిటీ వన్": 81, "ఎయిటీ ఫైవ్": 85, "ఎయిటీఫైవ్": 85,
  "నైంటీ వన్": 91, "నైంటీ ఫైవ్": 95, "నైంటీఫైవ్": 95,
};

export { NUMBER_WORDS, UNIT_MULTIPLIERS, COMPOUND_NUMBERS };

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Precompile compounds
const sortedCompounds = Object.entries(COMPOUND_NUMBERS).sort((a, b) => b[0].length - a[0].length);
const COMPOUND_REGEX = new RegExp(
  `(?<![\\p{L}\\p{M}])(${sortedCompounds.map(([p]) => escapeRegex(p)).join("|")})(?![\\p{L}\\p{M}])`,
  "giu"
);
const COMPOUND_MAP = new Map(sortedCompounds.map(([k, v]) => [k.toLowerCase(), v]));

// Precompile words
const sortedWords = Object.entries(NUMBER_WORDS).sort((a, b) => b[0].length - a[0].length);
const WORD_PATTERN = sortedWords.map(([w]) => escapeRegex(w)).join("|");
const WORD_MAP = new Map(sortedWords.map(([k, v]) => [k.toLowerCase(), v]));

// Precompile units
const sortedUnits = Object.entries(UNIT_MULTIPLIERS).sort((a, b) => b[0].length - a[0].length);
const UNIT_PATTERN = sortedUnits.map(([u]) => escapeRegex(u)).join("|");
const UNIT_MAP = new Map(sortedUnits.map(([k, v]) => [k.toLowerCase(), v]));

// Decimal patterns
const POINT_PATTERN = "(?:point|dot|పాయింట్|పాఇంట్|పాయింటు|డాట్|డ్యాట్|पॉइंट|पॉइन्ट|डॉट|dashamlav|దశమలవ|दశमलव)";
const DECIMAL_WORD_POINT_REGEX = new RegExp(`(?<![\\p{L}\\p{M}])(${WORD_PATTERN})\\s*${POINT_PATTERN}\\s*`, "giu");
const DECIMAL_DIGIT_POINT_REGEX = new RegExp(`(\\d+)\\s*${POINT_PATTERN}\\s*`, "giu");
const DECIMAL_POINT_WORD_REGEX = new RegExp(`(\\d+\\.)\\s*(${WORD_PATTERN})(?![\\p{L}\\p{M}])`, "giu");

// Time & percentage units
const TIME_PERCENT_UNITS = [
  "years", "year", "yrs", "yr", "months", "month", "percent", "percentage", "%",
  "పర్సెంట్", "పర్సంటేజ్", "పర్సెంటు", "పర్సెంట్ల", "శాతం", "శాతము",
  "saal", "sal", "mahine", "mahina", "mahino", "maheene",
  "సంవత్సరాలకు", "సంవత్సరాలకి", "సంవత్సరానికి", "సంవత్సరాలు", "సంవత్సరం", "సంవత్సరాల", "సం",
  "ఇయర్లకు", "ఇయర్లకి", "ఇయర్ల", "ఇయర్స్", "ఇయర్", "ఈయర్స్", "ఈయర్", "యర్స్", "యర్",
  "మంతులకు", "మంతులకి", "మంతుల", "మంత్స్", "మంత్",
  "సాల్", "సాలు", "సాలకి", "సాలకు", "నెలలకు", "నెలలకి", "నెలలు", "నెల",
  "ఏళ్లకు", "ఏళ్లకి", "ఏళ్ల పాటు", "ఏళ్ల", "ఏళ్ళు", "yellaki", "yellaku", "yella", "yellu", "aellu",
  "प्रतिशत", "परसेंट", "पर्सेंट", "पर्सेंटेज", "इयर्स", "इयर", "ईयर्स", "ईयर", "मंथ्स", "मंथ", "साल", "सालों", "वर्ष", "महीने", "महीना", "महीनों"
].sort((a, b) => b.length - a.length).map(escapeRegex).join("|");

const WORD_TIME_PERCENT_REGEX = new RegExp(
  `(?<![\\p{L}\\p{M}])(${WORD_PATTERN})\\s*(${TIME_PERCENT_UNITS})(?![\\p{L}\\p{M}])`,
  "giu"
);

// Unit multiplier regexes
const DIGIT_UNIT_REGEX = new RegExp(`(\\d+(?:\\.\\d+)?)\\s*(${UNIT_PATTERN})(?![\\p{L}\\p{M}])`, "giu");
const WORD_UNIT_REGEX = new RegExp(`(?<![\\p{L}\\p{M}])(${WORD_PATTERN})\\s+(${UNIT_PATTERN})(?![\\p{L}\\p{M}])`, "giu");

// Standalone units
const STANDALONE_UNITS = {
  వెయ్యి: 1000,
  లక్ష: 100000,
  కోటి: 10000000,
  lakh: 100000,
  crore: 10000000,
};
const STANDALONE_REGEX = new RegExp(
  `(?<!\\d\\s*)(?<![\\p{L}\\p{M}])(${Object.keys(STANDALONE_UNITS).map(escapeRegex).join("|")})(?![\\p{L}\\p{M}])`,
  "giu"
);

// Large standalone numbers (>= 10)
const largeWords = sortedWords.filter(([_, val]) => val >= 10);
const LARGE_WORD_REGEX = new RegExp(
  `(?<![\\p{L}\\p{M}])(${largeWords.map(([w]) => escapeRegex(w)).join("|")})(?![\\p{L}\\p{M}])`,
  "giu"
);

// Small word numbers (< 10) for fallback in parseAmount
const smallWords = sortedWords.filter(([_, val]) => val < 10);
const SMALL_WORD_REGEX = new RegExp(
  `(?<![\\p{L}\\p{M}])(${smallWords.map(([w]) => escapeRegex(w)).join("|")})(?![\\p{L}\\p{M}])`,
  "giu"
);

/**
 * Normalizes all number words and unit phrases inside arbitrary speech transcript.
 * E.g., "నా జీతం డెబ్బై ఐదు వేలు" -> "నా జీతం 75000"
 * E.g., "5 lakh loan at 8.5%" -> "500000 loan at 8.5%"
 *
 * @param {string} text - Raw speech transcript
 * @returns {string} Normalized text with digits
 */
export function normalizeSpokenText(text = "") {
  if (!text || typeof text !== "string") return "";

  // 0a. Strip Unicode formatting noise (ZWNJ, ZWJ) and normalize Devanagari nukta characters for transcription invariance
  let result = text
    .trim()
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/फ़/g, "फ")
    .replace(/ज़/g, "ज")
    .replace(/ख़/g, "ख")
    .replace(/ग़/g, "ग")
    .replace(/ड़/g, "ड")
    .replace(/ढ़/g, "ढ")
    .replace(/\u093C/g, "");

  // 0b. Strip commas in numbers: e.g. "5,00,000" -> "500000", "50,000" -> "50000"
  result = result
    .replace(/(\d+),(\d+)/g, "$1$2")
    .replace(/(\d+),(\d+)/g, "$1$2");

  // 0b. STT timestamp / ratio colon artifact for interest rates & decimals: e.g. "10:05" -> "10.5", "10:5%" -> "10.5%"
  result = result.replace(/(?<!\d)(\d{1,2}):0?(\d{1,2})(?!\d)/g, "$1.$2");

  // 0c. Spoken decimal words & numbers: e.g. "10 point 5" -> "10.5", "ten point five" -> "10.5", "నైన్ పాయింట్ ఫైవ్" -> "9.5", "ఆరు పాయింట్ ఐదు" -> "6.5"
  result = result.replace(DECIMAL_WORD_POINT_REGEX, (_, w) => `${WORD_MAP.get(w.toLowerCase())}.`);
  result = result.replace(DECIMAL_DIGIT_POINT_REGEX, "$1.");
  result = result.replace(DECIMAL_POINT_WORD_REGEX, (_, prefix, w) => `${prefix}${WORD_MAP.get(w.toLowerCase())}`);
  // Chained decimal digit words (e.g. "8.2 five" -> "8.25", "9.7 five" -> "9.75")
  result = result.replace(new RegExp(`(\\d+\\.\\d+)\\s*(${WORD_PATTERN})(?![\\p{L}\\p{M}])`, "giu"), (_, prefix, w) => `${prefix}${WORD_MAP.get(w.toLowerCase())}`);
  result = result.replace(/(\d+\.)\s*(\d+)/g, "$1$2");

  // 1. Compound idioms sorted by phrase length descending
  result = result.replace(COMPOUND_REGEX, (_, phrase) => String(COMPOUND_MAP.get(phrase.toLowerCase())));

  // 1b. Word numbers directly preceding time units or percentages
  result = result.replace(WORD_TIME_PERCENT_REGEX, (_, w, u) => `${WORD_MAP.get(w.toLowerCase())} ${u}`);

  // 1c. Normalize percent words after digits: e.g. "9.5 పర్సెంట్" -> "9.5%", "10 శాతం" -> "10%"
  result = result.replace(/(\d+(?:\.\d+)?)\s*(?:పర్సెంట్|పర్సంటేజ్|పర్సెంటు|పర్సెంట్ల|శాతము|परसेंट)\b/giu, "$1%");

  // 1d. Handle "k" / "के" / "కె" / "కే" multiplier after digits (e.g. "35 के", "35k", "25 కె", "35 కేగా")
  result = result.replace(/(\d+(?:\.\d+)?)\s*(?:k|के|కె|కే)(?:గా|కి|కు)?(?!\s*(?:लिए|बाद|साथ|अनुसार|पास|अलावा|तहत|दौरान|ऊपर|नीचे|రూ|rupee|రూపాయలు|రూపాయల|రూపాయి|rupees))(?![a-zA-Z\p{L}])/giu, (_, num) => {
    return String(Math.round(parseFloat(num) * 1000));
  });

  // 2. Pattern: <digit or float> + optional space + <unit multiplier>
  result = result.replace(DIGIT_UNIT_REGEX, (_, numStr, unit) => {
    const num = parseFloat(numStr);
    const mult = UNIT_MAP.get(unit.toLowerCase());
    return mult ? String(Math.round(num * mult)) : _;
  });

  // 3. Pattern: <Word Number> + <unit multiplier>
  result = result.replace(WORD_UNIT_REGEX, (_, word, unit) => {
    const val = WORD_MAP.get(word.toLowerCase());
    const mult = UNIT_MAP.get(unit.toLowerCase());
    return val !== undefined && mult !== undefined ? String(Math.round(val * mult)) : _;
  });

  // 4. Standalone unit words with implicit 1 (e.g., "లక్ష" -> 100000, "వెయ్యి" -> 1000)
  result = result.replace(STANDALONE_REGEX, (_, unit) => String(STANDALONE_UNITS[unit]));

  // 5. Standalone single-word numbers (>= 10)
  result = result.replace(LARGE_WORD_REGEX, (_, word) => {
    const val = WORD_MAP.get(word.toLowerCase());
    return val !== undefined ? String(val) : _;
  });

  // 6. Handle "X hundred Y" and "X hundred Y thousand/lakh" compound patterns (Pass 2)
  result = result.replace(DIGIT_UNIT_REGEX, (_, numStr, unit) => {
    const num = parseFloat(numStr);
    const mult = UNIT_MAP.get(unit.toLowerCase());
    return mult ? String(Math.round(num * mult)) : _;
  });

  return result.replace(/\s+/g, " ").trim();
}

/**
 * Parses a numeric amount from a query string.
 * More aggressive than normalizeSpokenText — converts all number words including < 10.
 *
 * @param {string} input - Phrase or string containing amount
 * @returns {number|null} Parsed integer amount, or null
 */
export function parseAmount(input = "") {
  if (!input) return null;
  const normalized = normalizeSpokenText(String(input));

  // First try to find a number in the normalized text (supporting decimals)
  const match = normalized.match(/(\d+(?:\.\d+)?)/);
  if (match) return parseFloat(match[1]);

  // Fallback: also convert small number words (< 10) and retry.
  let fallback = String(input).trim().toLowerCase();
  fallback = fallback.replace(SMALL_WORD_REGEX, (_, w) => {
    const val = WORD_MAP.get(w.toLowerCase());
    return val !== undefined ? String(val) : _;
  });
  const fallbackMatch = fallback.match(/(\d+(?:\.\d+)?)/);
  return fallbackMatch ? parseFloat(fallbackMatch[1]) : null;
}
