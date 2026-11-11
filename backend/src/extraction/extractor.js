import { ExtractionResultSchema } from "./schema.js";
import { normalizeSpokenText, parseAmount } from "../normalization/numeralNormalizer.js";

/**
 * Extracts intent and financial parameters from spoken query with strict Zod validation.
 *
 * @param {string} rawTranscript - Raw speech transcript (Telugu, Hindi, English, code-mixed)
 * @param {Object} context - Optional session profile context
 * @returns {import("./schema.js").ExtractionResultSchema}
 */
export async function extractFinancialIntentAndParams(rawTranscript = "", context = {}) {
  const text = String(rawTranscript || "").trim();
  const normalized = normalizeSpokenText(text);
  const lower = normalized.toLowerCase();

  // 1. Detect Intent
  let intent = "unknown";
  let confidence = 0.5;

  // Greetings / Bot capability questions
  if (
    /^(hi|hello|hey|help|namaste|greetings)\b/i.test(lower) ||
    lower === "hi" ||
    lower === "hello" ||
    lower === "hey" ||
    lower === "help" ||
    lower.includes("what can you do") ||
    lower.includes("who are you") ||
    lower.includes("how can you help") ||
    lower.includes("నమస్కారం") ||
    lower.includes("నమస్తే") ||
    lower.includes("హలో") ||
    lower.includes("హాయ్") ||
    lower.includes("ఏం చేయగలవు") ||
    lower.includes("ఎలా సహాయం")
  ) {
    intent = "greeting";
    confidence = 0.95;
    return ExtractionResultSchema.parse({
      intent,
      params: {},
      confidence,
      needs_clarification: false,
      clarification_question: null,
    });
  }

  // Profile Reset
  if (
    lower.includes("reset memory") ||
    lower.includes("clear memory") ||
    lower.includes("reset profile") ||
    lower.includes("మెమొరీ రీసెట్") ||
    lower.includes("రీసెట్ చేయండి")
  ) {
    intent = "profile_reset";
    confidence = 0.95;
    return ExtractionResultSchema.parse({
      intent,
      params: {},
      confidence,
      needs_clarification: false,
      clarification_question: null,
    });
  }

  // Profile Query
  if (
    lower.includes("profile") ||
    lower.includes("నా ప్రొఫైల్") ||
    lower.includes("నా వివరాలు") ||
    lower.includes("show my details") ||
    lower.includes("my details")
  ) {
    intent = "profile_query";
    confidence = 0.9;
    return ExtractionResultSchema.parse({
      intent,
      params: {},
      confidence,
      needs_clarification: false,
      clarification_question: null,
    });
  }

  // Investment: SIP (Check first to avoid generic keywords stealing intent)
  if (
    lower.includes("sip") ||
    lower.includes("s.i.p") ||
    lower.includes("s i p") ||
    lower.includes("ess ip") ||
    lower.includes("సిప్") ||
    lower.includes("శిప్") ||
    lower.includes("సి.ఐ.పి") ||
    lower.includes("सिप") ||
    lower.includes("शिप") ||
    lower.includes("ఎస్‌ఐపీ") ||
    lower.includes("ఎస్ఐపీ") ||
    lower.includes("ఎస్‌ఐపి") ||
    lower.includes("ఎస్ఐపి") ||
    lower.includes("ఎస్ ఐ పి") ||
    lower.includes("ఎస్‌ ఐ పి") ||
    lower.includes("ఎస్.ఐ.పి") ||
    lower.includes("एसआईपी") ||
    lower.includes("एस आई पी") ||
    lower.includes("एस.आई.पी") ||
    lower.includes("mutual fund") ||
    lower.includes("మ్యూచువల్ ఫండ్") ||
    lower.includes("మ్యూచువల్") ||
    lower.includes("म्यूचुअल फंड") ||
    lower.includes("म्युचुअल फंड") ||
    (/\b(?:tip|ship|zip)\b/i.test(lower) && /\b(?:per\s+month|monthly|every\s+month|years?|yrs?|saal)\b/i.test(lower) && !/\b(?:loan|emi|fd|salary|income)\b/i.test(lower)) ||
    (/\bper\s+month\s+for\s+\d+/i.test(normalized) && !/\b(?:loan|emi|fd|salary|income|expense)\b/i.test(lower)) ||
    (lower.includes("మంత్లీ") && (lower.includes("రిటర్న్") || lower.includes("रिटर्न") || lower.includes("సాల్") || lower.includes("పెట్టుబడి"))) ||
    ((lower.includes("रिटर्न") || lower.includes("రిటర్న్స్") || lower.includes("రిటర్న్")) && (lower.includes("మిలేగా") || lower.includes("వస్తుంది") || lower.includes("లభిస్తుంది")))
  ) {
    intent = "investment_sip";
    confidence = 0.92;
  }
  // Investment: FD
  else if (
    lower.includes("fd") ||
    lower.includes("fixed deposit") ||
    lower.includes("ఎఫ్‌డీ") ||
    lower.includes("ఎఫ్డీ") ||
    lower.includes("ఎఫ్‌డి") ||
    lower.includes("ఎఫ్డి") ||
    lower.includes("ఎఫ్ డి") ||
    lower.includes("ఎఫ్‌ డి") ||
    lower.includes("ఎఫ్.డి") ||
    lower.includes("ఎఫ్.డీ") ||
    lower.includes("ఎఫ్టీ") ||
    lower.includes("ఎఫ్‌టీ") ||
    lower.includes("ఎఫ్టి") ||
    lower.includes("ఎఫ్‌టి") ||
    lower.includes("ఎఫ్ టీ") ||
    lower.includes("ఎఫ్ టి") ||
    lower.includes("డి.ఎఫ్") ||
    lower.includes("డిఎఫ్") ||
    lower.includes("డి ఎఫ్") ||
    lower.includes("ఫిక్స్‌డ్ డిపాజిట్") ||
    lower.includes("ఫిక్స్డ్ డిపాజిట్") ||
    lower.includes("డిపాజిట్") ||
    lower.includes("एफडी") ||
    lower.includes("एफ डी") ||
    lower.includes("एफ.डी") ||
    lower.includes("फिक्स्ड डिपॉजिट") ||
    lower.includes("फिक्स्ड") ||
    lower.includes("सावधि जमा") ||
    lower.includes("term deposit")
  ) {
    intent = "investment_fd";
    confidence = 0.92;
  }
  // Loan Eligibility Check (BEFORE loan_emi to avoid generic "loan" matching)
  else if (
    lower.includes("eligible") ||
    lower.includes("eligibility") ||
    lower.includes("how much loan") ||
    lower.includes("how much can i borrow") ||
    lower.includes("can i get a loan") ||
    lower.includes("can i get loan") ||
    lower.includes("loan limit") ||
    lower.includes("max loan") ||
    lower.includes("maximum loan") ||
    lower.includes("am i eligible") ||
    lower.includes("రుణ అర్హత") ||
    lower.includes("లోన్ అర్హత") ||
    lower.includes("అర్హత") ||
    lower.includes("లోన్ వస్తుందా") ||
    lower.includes("లోన్ వస్తుంది") ||
    lower.includes("రుణం వస్తుందా") ||
    lower.includes("రుణం వస్తుంది") ||
    lower.includes("ఎంత లోన్") ||
    lower.includes("ఎంత రుణం") ||
    lower.includes("పాత్రతా") ||
    lower.includes("एलिजिबिलिटी") ||
    lower.includes("loan mil sakta") ||
    lower.includes("loan milega") ||
    lower.includes("लोन मिलेगा") ||
    lower.includes("ऋण मिलेगा") ||
    lower.includes("लोन मिल सकता") ||
    lower.includes("कितना लोन") ||
    lower.includes("kitna loan") ||
    lower.includes("ऋण मिल सकता") ||
    lower.includes("कितना ऋण") ||
    lower.includes("kitna karz") ||
    lower.includes("karz mil sakta") ||
    lower.includes("लोन पात्रता") ||
    lower.includes("రుణ పాత్రత")
  ) {
    intent = "loan_eligibility";
    confidence = 0.9;
  }
  // Loan EMI Calculator
  else if (
    lower.includes("emi") ||
    lower.includes("emmy") ||
    lower.includes("e.m.i") ||
    lower.includes("e m i") ||
    /\b(?:calculate|what\s+is\s+my|check|monthly|loan)\s+me\b/i.test(lower) ||
    lower.includes("ఈఎంఐ") ||
    lower.includes("ఈఎమ్ఐ") ||
    lower.includes("ఇఎమ్ఐ") ||
    lower.includes("ఇఎంఐ") ||
    lower.includes("ఈ ఎం ఐ") ||
    lower.includes("ఈ ఎమ్ ఐ") ||
    lower.includes("ఇ ఎం ఐ") ||
    lower.includes("ఇ.ఎం.ఐ") ||
    lower.includes("ईएमआई") ||
    lower.includes("ईएमआइ") ||
    lower.includes("ई एम आई") ||
    lower.includes("इएमआई") ||
    lower.includes("loan") ||
    lower.includes("లోన్") ||
    lower.includes("लोन") ||
    lower.includes("రుణం") ||
    lower.includes("ऋण") ||
    lower.includes("kist") ||
    lower.includes("किस्त") ||
    lower.includes("किश्त") ||
    lower.includes("karz") ||
    lower.includes("कर्ज") ||
    (lower.includes("कैलकुलेट") && (lower.includes("ईएमआई") || lower.includes("लोन"))) ||
    (lower.includes("సంవత్సరాల") && (lower.includes("వడ్డీ") || lower.includes("లోన్")))
  ) {
    intent = "loan_emi";
    confidence = 0.9;
  }
  // Budget / Savings / Income updates
  else if (
    lower.includes("budget") ||
    lower.includes("బడ్జెట్") ||
    lower.includes("बजट") ||
    lower.includes("savings") ||
    lower.includes("పొదుపు") ||
    lower.includes("बचत") ||
    lower.includes("save") ||
    lower.includes("income") ||
    lower.includes("salary") ||
    lower.includes("earn") ||
    lower.includes("spend") ||
    lower.includes("spending") ||
    lower.includes("జీతం") ||
    lower.includes("ఆదాయం") ||
    lower.includes("ఖర్చులు") ||
    lower.includes("वेतन") ||
    lower.includes("सैलरी") ||
    lower.includes("सेलरी") ||
    lower.includes("तनख्वाह") ||
    lower.includes("इनकम") ||
    lower.includes("इन्कम") ||
    lower.includes("कचरा") ||
    lower.includes("खर्चा") ||
    lower.includes("खर्चे") ||
    lower.includes("ఖర్చు") ||
    lower.includes("శాలరీ") ||
    lower.includes("సాలరీ") ||
    lower.includes("ఇన్‌కమ్") ||
    lower.includes("ఇన్కమ్") ||
    (lower.includes("मंथली") && /\d+/.test(lower)) ||
    (lower.includes("మంత్లీ") && /\d+/.test(lower) && !lower.includes("sip") && !lower.includes("ఎస్‌ఐపీ") && !lower.includes("ఎస్ఐపీ")) ||
    lower.includes("आमदनी") ||
    lower.includes("कमाई") ||
    lower.includes("खर्च") ||
    lower.includes("expense") ||
    lower.includes("bachat") ||
    lower.includes("aamadani")
  ) {
    if (
      lower.includes("update") ||
      lower.includes("change") ||
      lower.includes("set") ||
      lower.includes("save") ||
      lower.includes("మార్చు") ||
      lower.includes("అప్‌డేట్") ||
      lower.includes("సేవ్") ||
      lower.includes("बदलो") ||
      lower.includes("सेव") ||
      lower.includes("दर्ज") ||
      lower.includes("रखो") ||
      (lower.includes("నా ఆదాయం") && !lower.includes("check")) ||
      (lower.includes("నా జీతం") && !lower.includes("check")) ||
      (lower.includes("मेरी सैलरी") && (lower.includes("सेव") || lower.includes("अपडेट") || lower.includes("दर्ज") || lower.includes("रखो"))) ||
      (lower.includes("मेरी इनकम") && (lower.includes("सेव") || lower.includes("अपडेट") || lower.includes("दर्ज") || lower.includes("रखो"))) ||
      (lower.includes("मेरी आमदनी") && (lower.includes("सेव") || lower.includes("अपडेट") || lower.includes("दर्ज") || lower.includes("रखो"))) ||
      (lower.includes("my income") && !lower.includes("check")) ||
      (lower.includes("my salary") && !lower.includes("check"))
    ) {
      intent = "profile_update";
    } else {
      intent = "budget_analysis";
    }
    confidence = 0.88;
  }

  // 2. Extract numeric parameters
  const params = {
    amount: null,
    rate: null,
    tenureYears: null,
    tenureMonths: null,
    expenses: null,
    obligations: null,
    goal: null,
  };

  // Extract Rate:
  // Priority 1: <number> explicitly with % or rate/percentage words (e.g. "8.5%", "7 శాతం", "9.5 పర్సెంట్", "12% return")
  // Priority 2: <number> preceding interest word (e.g. "6.5 వడ్డీతో", "8.5 interest", "10.5 ब्याज")
  // Priority 3: interest word followed by <number> (e.g. "interest at 8.5%", "వడ్డీ 7%"), NOT followed by tenure units
  const rateMatch =
    normalized.match(/(\d+(?:\.\d+)?)\s*(?:%|percent|శాతం|పర్సెంట్|పర్సంటేజ్|పర్సెంటు|పర్సెంట్ల|pratishat|प्रतिशत|परसेंट|dar|return|returns|రాబడి|రిటర్న్|రిటర్న్స్|रिटर्न)(?!\p{L})/iu) ||
    normalized.match(/(\d+(?:\.\d+)?)\s*(?:%|percent|శాతం|పర్సెంట్)?\s*(?:interest|వడ్డీ|వడ్డీతో|వడ్డీకి|బడ్జెట్|ब्याज|byaj|vaddi)(?!\p{L})/iu) ||
    normalized.match(/(?:at|with|@|rate\s*(?:of|is|:|=|at)?|roi\s*(?:of|is|:|=|at)?|interest\s*(?:rate|is|of|:|=|at)?|vaddi|byaj|byaaj|వడ్డీ|వడ్డీతో|వడ్డీకి|ब्याज)\s*[:=]?\s*(\d+(?:\.\d+)?)\s*(?:%|percent|interest|rate|శాతం|పర్సెంట్|వడ్డీ|ब्याज)?(?!\s*(?:years?|yrs?|months?|ఇయర్ల[ుకి]?|ఇయర్స్|ఇయర్|యర్స్|యర్|ఈయర్స్|ఈయర్|మంతులకు?|మంతులకి?|మంతుల|మంత్స్|మంత్|इयर्स|इयर|ईयर्स|ईयर|मंथ्स|मंथ|సంవత్సరాల[ుకి]?|సంవత్సరం|సం|saal|sal|yell[ుకిa-z]*|aell[ుకిa-z]*|ఏళ్ల[ుకిలోa-z]*|ఏళ్ళ[ుకిలో]*|ఏడాదికి?|साल|वर्ष))(?!\p{L})/iu);

  if (rateMatch) {
    params.rate = parseFloat(rateMatch[1]);
  }

  // Extract Tenure (e.g., "5 years", "2.5 years", "3 సం", "10 saal", "60 months", "5 ఏళ్లకు", "5 yellaki", "10 సంవత్సరాలకు", "ఫైవ్ ఇయర్స్", "ఐదు సంవత్సరాలకు")
  const yearMatch = normalized.match(
    /(\d+(?:\.\d+)?)\s*(?:years?|yrs?|yr|ఇయర్ల[ుకి]?|ఇయర్స్|ఇయర్|యర్స్|యర్|ఈయర్స్|ఈయర్|इयर्स|इयर|ईयर्स|ईयर|సంవత్సరాల[ుకిలో]?|సంవత్సరాలు|సంవత్సరం|సం|సాల్|సాల[ుకి]?|సాలు|saal|sal|saalon|saalo|varsh|baras|yell[ుకిa-z]*|aell[ుకిa-z]*|ఏళ్ల[ుకిలో]*|ఏళ్ళ[ుకిలో]*|ఏడాదికి?|साल|सालों|वर्ष)(?!\p{L})/iu
  );
  if (yearMatch) {
    params.tenureYears = parseFloat(yearMatch[1]);
  } else {
    // Word-number tenure fallback (e.g., "ఐదు సంవత్సరాలకు", "five years", "teen saal", "ఫైవ్ ఇయర్స్")
    const yearWordMatch = normalized.match(
      /(ఒకటి|ఒక|రెండు|రెండే|మూడు|మూడే|నాలుగు|నాలుగే|ఐదు|అయిదు|ఐదే|ఆరు|ఆరే|ఏడు|ఏడే|ఎనిమిది|తొమ్మిది|పది|పదకొండు|పన్నెండు|వన్|టూ|త్రీ|ఫోర్|ఫైవ్|సిక్స్|సెవెన్|ఎయిట్|నైన్|టెన్|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|fifteen|twenty|twenty-five|thirty|ek|do|teen|chaar|paanch|chhe|saat|aath|nau|dus|शिक्स|सिक्स|सेवन)\s*(?:years?|yrs?|ఇయర్ల[ుకి]?|ఇయర్స్|ఇయర్|యర్స్|యర్|ఈయర్స్|ఈయర్|इयर्स|इयर|ईयर्स|ईयर|సంవత్సరాల[ుకిలో]?|సంవత్సరాలు|సంవత్సరం|సం|సాల్|సాల[ుకి]?|సాలు|saal|sal|saalon|saalo|varsh|yell[ుకిa-z]*|aell[ుకిa-z]*|ఏళ్ల[ుకిలో]*|ఏళ్ళ[ుకిలో]*|ఏడాదికి?|साल|सालों|वर्ष)(?!\p{L})/iu
    );
    if (yearWordMatch) {
      params.tenureYears = parseAmount(yearWordMatch[1]);
    }
  }
  const monthMatch = normalized.match(
    /(\d+)\s*(?:months?|మంతులకు?|మంతులకి?|మంతుల|మంత్స్|మంత్|मंथ्स|मंथ|నెలల[ుకి]?|mahine|mahina|mahino|maheene|महीने|महीना|महीनों)(?!ly)\b/iu
  );
  if (monthMatch) {
    params.tenureMonths = parseInt(monthMatch[1], 10);
    if (!params.tenureYears) {
      params.tenureYears = Number((params.tenureMonths / 12).toFixed(2));
    }
  }

  // Priority 4: Standalone decimal rate in financial queries (e.g., "10.5", "8.5", "5 lakh loan 5 years 10.5")
  if (!params.rate) {
    const standaloneRate = normalized.match(/(?<![\d.])(\d{1,2}\.\d{1,3})(?![\d.])/);
    if (standaloneRate) {
      const val = parseFloat(standaloneRate[1]);
      if (val >= 0.5 && val <= 35 && val !== params.amount && val !== params.tenureYears) {
        params.rate = val;
      }
    }
  }

  // Loan amount extraction for loan_emi / loan_eligibility:
  // 1. First priority: number directly preceding "loan" (e.g. "500000 loan", "500000 ka loan", "500000 రుణం")
  const preLoanMatch = normalized.match(/(\d+)\s*(?:ka|ki|ke|యొక్క)?\s*(?:loan|రుణం|లోన్|ऋण|karz|कर्ज)/i);
  if (preLoanMatch) {
    params.amount = parseInt(preLoanMatch[1], 10);
  }

  // 2. Second priority: "loan of/for/amount <number>", but explicitly NOT followed by tenure units
  if (!params.amount) {
    const postLoanMatch = normalized.match(
      /(?:loan|రుణం|లోన్|ऋण|karz|कर्ज|borrow|principal)\s*(?:of|for|amount|ka|ki|ke)?\s*[:=]?\s*(\d+)(?!\s*(?:years?|yrs?|months?|ఇయర్ల[ుకి]?|ఇయర్స్|ఇయర్|యర్స్|యర్|ఈయర్స్|ఈయర్|మంతులకు?|మంతులకి?|మంతుల|మంత్స్|మంత్|इयर्स|इयर|मंथ्स|मंथ|సం|సా|ఏళ్ల[ుకిలో]*|ఏళ్ళ[ుకిలో]*|నెలలు|saal|sal|mahine|yellu|aellu|साल|महीने))\b/iu
    );
    if (postLoanMatch) {
      params.amount = parseInt(postLoanMatch[1], 10);
    }
  }

  // 3. Third priority: "for/amount <number>" with at least 4 digits
  if (!params.amount) {
    const forAmtMatch = normalized.match(/(?:for|మొత్తం|amount|ki\s+rashi|ke\s+liye)\s*[:=]?\s*(\d{4,10})/i);
    if (forAmtMatch) {
      params.amount = parseInt(forAmtMatch[1], 10);
    }
  }

  // 4. SIP amount extraction (e.g. "5000 monthly sip", "5000 ఎస్‌ఐపీ", "5000 మంత్లీ", "sip of 5000")
  if (intent === "investment_sip" && !params.amount) {
    const preSipMatch = normalized.match(
      /(\d+)\s*(?:ka|ki|ke|rupaye|రూపాయల|రూపాయలు)?\s*(?:मासिक\s+एसआईपी|मासिक|monthly\s+sip|per\s+month\s+sip|per\s+month|మంత్లీ\s+ఎస్‌ఐపీ|మంత్లీ\s+ఎస్ఐపీ|మంత్లీ\s+ఎస్‌ఐపి|మంత్లీ\s+ఎస్ఐపి|నెలవారీ\s+ఎస్‌ఐపీ|నెలవారీ\s+ఎస్ఐపీ|నెలవారీ\s+ఎస్‌ఐపి|నెలవారీ\s+ఎస్ఐపి|మంత్లీ|నెలకి|నెలకు|har\s+mahine|mahine\s+ka|prati\s+mahina|sip|ఎస్‌ఐపీ|ఎస్ఐపీ|ఎస్‌ఐపి|ఎస్ఐపి|ఎస్\s+ఐ\s+పి|एसआईपी|एस\s+आई\s+पी|పెట్టుబడి|invest(?:ment)?)/iu
    );
    if (preSipMatch) {
      params.amount = parseInt(preSipMatch[1], 10);
    } else {
      const postSipMatch = normalized.match(
        /(?:sip|ఎస్‌ఐపీ|ఎస్ఐపీ|ఎస్‌ఐపి|ఎస్ఐపి|ఎస్\s+ఐ\s+పి|एसआईपी|एस\s+आई\s+पी|పెట్టుబడి|invest(?:ment)?)\s*(?:of|for|amount|ka|ki|ke)?\s*[:=]?\s*(\d+)(?!\d)(?!\s*(?:years?|yrs?|months?|ఇయర్ల[ుకి]?|ఇయర్స్|ఇయర్|యర్స్|యర్|ఈయర్స్|ఈయర్|మంతులకు?|మంతులకి?|మంతుల|మంత్స్|మంత్|इयर्स|इयर|मंथ्स|मंथ|సం|సా|ఏళ్ల[ుకిలో]*|ఏళ్ళ[ుకిలో]*|నెలలు|saal|sal|mahine|yellu|aellu|साल|महीने|%|శాతం|percent))/iu
      );
      if (postSipMatch) {
        params.amount = parseInt(postSipMatch[1], 10);
      }
    }
  }

  // 5. FD amount extraction (e.g. "100000 fd", "fd of 100000", "100000 డిపాజిట్")
  if (intent === "investment_fd" && !params.amount) {
    const preFdMatch = normalized.match(
      /(\d+)\s*(?:ka|ki|ke|రూపాయల|రూపాయలు|rupees|rs)?\s*(?:fd|fixed\s+deposit|ఎఫ్‌డీ|ఎఫ్డీ|ఎఫ్‌డి|ఎఫ్డి|ఎఫ్\s*డి|ఎఫ్‌\s*డి|ఎఫ్‌టీ|ఎఫ్టీ|ఎఫ్‌టి|ఎఫ్టి|ఎఫ్\s*టీ|ఎఫ్\s*టి|డిఎఫ్|డి\.ఎఫ్|డి\s*ఎఫ్|एफडी|एफ\s*डी|డిపాజిట్|फिक्स्ड|term\s+deposit|deposit)/iu
    );
    if (preFdMatch) {
      params.amount = parseInt(preFdMatch[1], 10);
    } else {
      const postFdMatch = normalized.match(
        /(?:fd|fixed\s+deposit|ఎఫ్‌డీ|ఎఫ్డీ|ఎఫ్‌డి|ఎఫ్డి|ఎఫ్\s*డి|ఎఫ్‌\s*డి|ఎఫ్‌టీ|ఎఫ్టీ|ఎఫ్‌టి|ఎఫ్టి|ఎఫ్\s*టీ|ఎఫ్\s*టి|డిఎఫ్|డి\.ఎఫ్|డి\s*ఎఫ్|एफडी|एफ\s*डी|డిపాజిట్|deposit)\s*(?:of|for|amount|ka|ki|ke)?\s*[:=]?\s*(\d+)(?!\d)(?!\s*(?:years?|yrs?|months?|ఇయర్ల[ుకి]?|ఇయర్స్|ఇయర్|యర్స్|యర్|ఈయర్స్|ఈయర్|మంతులకు?|మంతులకి?|మంతుల|మంత్స్|మంత్|इयर्स|इयर|मंथ्स|मंथ|సం|సా|ఏళ్ల[ుకిలో]*|ఏళ్ళ[ుకిలో]*|నెలలు|saal|sal|mahine|yellu|aellu|साल|महीने|%|శాతం|percent))/iu
      );
      if (postFdMatch) {
        params.amount = parseInt(postFdMatch[1], 10);
      }
    }
  }

  // Multi-field extraction: look for income/expenses/obligations
  const incMatch =
    normalized.match(/(?:income|salary|earn|జీతం|ఆదాయం|వేతనం|వేతన|वेतन|सैलरी|सलरी|तनख्वाह|आमदनी|कमाई|வருமானம்|ಸಂಬಳ|ശമ്പളം|aamdani|kamai|tankhwah|vetan)[^\d]*(\d+)/iu) ||
    normalized.match(/(\d+)\s*(?:monthly\s+income|salary|income|జీతం|ఆదాయం|వేతనం|वेతన|वेतन|सैलरी|सलरी|आमदनी|कमाई|tankhwah)/iu);

  const expMatch =
    normalized.match(/(?:expenses?|spend|spending|ఖర్చులు|ఖర్చు|खर्चा|खर्चे|खर्च|कचरा|kharcha|kharch|செலவு|ಖರ್ಚು|ചിലവ്)[^\d]*(\d+)/iu) ||
    normalized.match(/(\d+)\s*(?:expenses?|expense|ఖర్చులు|ఖర్చు|खर्चा|खर्चे|खर्च|कचरा|kharcha|kharch)/iu);

  // Existing EMI / Obligations (ONLY when qualified by existing/current/paying, NOT calculation command "calculate emi")
  const emiMatch =
    normalized.match(/(?:existing\s+emi|current\s+emi|monthly\s+emi|paying\s+emi|already\s+paying|ప్రస్తుత\s+ఈఎంఐ|నెలవారీ\s+ఈఎంఐ|मौजूदा\s+(?:किस्त|किश्त|ईएमआई)|पुरानी\s+(?:किस्त|किश्त|ईएमआई)|purani\s+(?:emi|kist|kisht)|pehle\s+se\s+emi|obligations?)\s*[:=]?[^\d]*(\d+)/i) ||
    normalized.match(/(\d+)\s*(?:existing\s+emi|current\s+emi|paying\s+emi|already\s+paying|purani\s+emi|obligations?)/i);

  if (incMatch) params.amount = parseInt(incMatch[1], 10);
  if (expMatch) params.expenses = parseInt(expMatch[1], 10);
  if (emiMatch) params.obligations = parseInt(emiMatch[1], 10);

  // Special case: "zero emi"
  if (/zero\s+emi|సున్నా\s+ఈఎంఐ|no\s+emi/i.test(normalized)) {
    params.obligations = 0;
  }

  // If amount accidentally matched tenure years (e.g. 5) when it should be principal, reset it
  if (params.amount && params.tenureYears && params.amount === params.tenureYears && params.amount <= 40) {
    params.amount = null;
  }

  // If amount still not found, search generic numbers (excluding already matched rate and tenure)
  if (params.amount === null || params.amount === undefined) {
    const allNumbers = [...normalized.matchAll(/(?<![\d.])(\d{3,10})(?![\d.])/g)]
      .map((m) => parseInt(m[1], 10))
      .filter((n) => n !== params.rate && n !== params.tenureYears && n !== params.tenureMonths);

    if (allNumbers.length > 0) {
      params.amount = allNumbers[0];
      if (allNumbers.length > 1 && params.expenses === null) {
        params.expenses = allNumbers[1];
      }
    }
  }

  // If expenses is still null and intent is budget_analysis, look for secondary number
  if ((intent === "budget_analysis" || intent === "profile_update") && params.expenses === null) {
    const allNumbers = [...normalized.matchAll(/(?<![\d.])(\d{3,10})(?![\d.])/g)]
      .map((m) => parseInt(m[1], 10))
      .filter((n) => n !== params.amount && n !== params.rate && n !== params.tenureYears && n !== params.tenureMonths);

    if (allNumbers.length > 0) {
      params.expenses = allNumbers[0];
    }
  }

  // Extract Goal if mentioned
  if (/house|home|ఇల్లు|ghar/i.test(normalized)) params.goal = "House";
  else if (/car|కారు|gaadi/i.test(normalized)) params.goal = "Car";
  else if (/emergency|అత్యవసరం/i.test(normalized)) params.goal = "Emergency Fund";

  // 3. Clarification Logic & Validation
  let needsClarification = false;
  let clarificationQuestion = null;

  if (intent === "loan_emi") {
    if (!params.amount) {
      needsClarification = true;
      confidence = 0.5;
      clarificationQuestion = "రుణం మొత్తం ఎంత? / What is the loan amount you want to calculate EMI for?";
    } else if (!params.tenureYears) {
      needsClarification = true;
      confidence = 0.6;
      clarificationQuestion = "ఎన్ని సంవత్సరాల కాలపరిమితికి EMI కావాలి? / For how many years tenure do you need the EMI?";
    }
  } else if (intent === "loan_eligibility") {
    if (!params.amount && !context.income) {
      needsClarification = true;
      confidence = 0.5;
      clarificationQuestion = "మీ నెలవారీ జీతం ఎంత? / What is your monthly salary to check loan eligibility?";
    }
  } else if (intent === "investment_sip") {
    if (!params.amount) {
      needsClarification = true;
      confidence = 0.5;
      clarificationQuestion = "నెలకు SIP లో ఎంత పెట్టుబడి పెట్టాలనుకుంటున్నారు? / How much do you want to invest monthly in SIP?";
    }
  } else if (intent === "investment_fd") {
    if (!params.amount) {
      needsClarification = true;
      confidence = 0.5;
      clarificationQuestion = "ఫిక్స్‌డ్ డిపాజిట్ కోసం ఎంత మొత్తం జమ చేయాలనుకుంటున్నారు? / What amount do you want to deposit in FD?";
    }
  } else if (intent === "budget_analysis" || intent === "profile_update") {
    if (!params.amount && !context.income) {
      needsClarification = true;
      confidence = 0.5;
      clarificationQuestion = "మీ నెలవారీ ఆదాయం ఎంత? / What is your monthly income?";
    }
  } else if (intent === "unknown") {
    needsClarification = true;
    confidence = 0.3;
    clarificationQuestion =
      "నేను బడ్జెట్, లోన్ ఈఎంఐ, ఎస్ఐపీ మరియు ఎఫ్‌డీ వివరాలలో సహాయం చేయగలను. మీరు ఏమి తెలుసుకోవాలనుకుంటున్నారు? / I can help with Budget, Loan EMI, SIP, or FD. What would you like to calculate?";
  }

  // 4. Validate output with Zod
  return ExtractionResultSchema.parse({
    intent,
    params,
    confidence,
    needs_clarification: needsClarification,
    clarification_question: clarificationQuestion,
  });
}
