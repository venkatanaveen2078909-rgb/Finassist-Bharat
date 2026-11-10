import {
  getSession,
  updateSessionProfile,
  setPendingConfirmation,
  clearPendingConfirmation,
  setPendingClarification,
  clearPendingClarification,
  resetSession,
  isAffirmative,
  isNegative,
  getLastActivity,
  setLastActivity,
  addConversationTurn,
  getConversationHistory,
} from "../memory/sessionStore.js";
import { extractFinancialIntentAndParams } from "../extraction/extractor.js";
import { parseAmount } from "../normalization/numeralNormalizer.js";
import { emiCalculator } from "../tools/emiCalculator.js";
import { sipCalculator } from "../tools/sipCalculator.js";
import { fdCalculator } from "../tools/fdCalculator.js";
import { budgetAnalyzer } from "../tools/budgetAnalyzer.js";
import { loanEligibility } from "../tools/loanEligibility.js";
import { makeVoiceSafe } from "../utils/spokenFormat.js";

/**
 * Detects whether the user is querying in English, Telugu, or Hindi.
 */
export function detectLanguage(text = "", preferred = "indic-auto") {
  const clean = String(text || "").trim();
  if (preferred === "te-IN" || preferred === "te") return "te";
  if (preferred === "hi-IN" || preferred === "hi") return "hi";
  if (preferred === "en-IN" || preferred === "en") return "en";

  // Check script Unicode ranges
  if (/[\u0C00-\u0C7F]/.test(clean)) return "te";
  if (/[\u0900-\u097F]/.test(clean)) return "hi";

  const lower = clean.toLowerCase();
  // Telugu & Tenglish romanized phonetic indicators
  if (
    /\b(kavali|kaavali|cheppandi|cheppu|cheyyandi|cheyi|chudu|samvatsaralu|samvatsaram|samvatsaralaki|lakshalu|lakshala|laksha|laksham|lakshadu|lakshaadu|aidu|aide|ayidu|ayide|aidwa|aido|aid|ayd|velu|vela|veyyi|yellu|yellaki|yellaku|yella|aellu|aellaki|aella|rendu|moodu|naalugu|nalugu|aaru|yedu|enimidi|tommidi|padi|padhi|iravai|iruvai|muppai|nalbhai|nalabhai|yaabhai|yabhai|naku|naaku|naa|maaku|enta|entha|vaddi|vaddiki|vaddiloki|sukha|jeetham|kharchulu|kharchu|roopayalu|rupayalu|vaddu|avunu|nelalu|nelalaki)\b/i.test(
      lower
    )
  ) {
    return "te";
  }

  // Hindi & Hinglish romanized phonetic indicators
  if (
    /\b(chahiye|chaahiye|batao|bataiye|kardo|karo|kijiye|dekhna|hazar|hazaar|laakh|karod|karodu|pachaas|pachas|pachees|dus|bees|tees|chaalis|mera|meri|mere|mujhe|mujhko|humko|kitna|kitne|kitni|kamai|aamdani|aay|vetan|tankhwah|kharcha|kharch|bachat|byaj|byaaj|dar|saal|sal|mahine|mahina|mahino|maheene|milega|hoga|karna|paanch|pandrah|gyarah|barah|ek|do|teen|chaar|chhe|saat|aath|nau)\b/i.test(
      lower
    )
  ) {
    return "hi";
  }

  // Default to English for Latin text
  return "en";
}

/**
 * Main Voice Orchestrator for FinAssist Bharat.
 * Single clean voice loop across:
 * 1. Budget / Savings
 * 2. Loan / EMI + Eligibility
 * 3. Investment: SIP and FD
 *
 * All state mutations strictly require explicit spoken confirmation per session.
 * All arithmetic is deterministic code.
 *
 * @param {string} transcript - User spoken transcript
 * @param {Object} options - { sessionId, emotion, language }
 * @returns {Promise<{agent: string, reply: string, detectedLanguage: string, data: any, parsedFields: any, pendingConfirmation: boolean, needsClarification: boolean}>}
 */
export async function voiceOrchestrator(transcript = "", options = {}) {
  const sessionId = options.sessionId || "default";
  const raw = String(transcript || "").trim();
  const session = getSession(sessionId);
  const contextLang = session.pendingClarification?.detectedLanguage;
  const lang = detectLanguage(raw, options.language && options.language !== "indic-auto" ? options.language : contextLang);
  const isEn = lang === "en";
  const isHi = lang === "hi";

  if (raw) {
    addConversationTurn(sessionId, { role: "user", text: raw });
  }

  if (!raw) {
    const reply = isEn
      ? "I did not catch your voice. Please speak again or type your query."
      : isHi
      ? "मुझे आपकी आवाज़ सुनाई नहीं दी। कृपया फिर से बोलें। / I did not catch your voice. Please speak again."
      : "నాకు మీ స్వరం వినపడలేదు, దయచేసి మళ్ళీ చెప్పండి. / I did not catch your voice. Please speak again.";

    return {
      agent: "Voice Orchestrator",
      reply,
      detectedLanguage: lang,
      data: null,
      parsedFields: null,
      pendingConfirmation: false,
      needsClarification: true,
    };
  }

  // 1. Check for Pending Confirmation in Current Session
  if (session.pendingConfirmation) {
    const pending = session.pendingConfirmation;

    // User confirmed YES
    if (isAffirmative(raw)) {
      if (pending.type === "UPDATE_PROFILE") {
        updateSessionProfile(sessionId, pending.proposedData);
        clearPendingConfirmation(sessionId);

        const reply = isEn
          ? `Your profile has been successfully updated (${pending.summaryTextEn || pending.summaryText}).`
          : isHi
          ? `आपकी प्रोफ़ाइल सफलतापूर्वक अपडेट हो गई है (${pending.summaryTextHi || pending.summaryText})।`
          : `ఖాతా ప్రొఫైల్ విజయవంతంగా అప్‌డేట్ చేయబడింది (${pending.summaryText}).`;

        return {
          agent: "Memory Agent",
          reply,
          detectedLanguage: lang,
          data: session.profile,
          parsedFields: pending.proposedData,
          pendingConfirmation: false,
          needsClarification: false,
        };
      }

      if (pending.type === "RESET_PROFILE") {
        resetSession(sessionId);
        const reply = isEn
          ? "Your financial profile details and memory have been completely reset."
          : isHi
          ? "आपकी प्रोफ़ाइल और मेमोरी पूरी तरह रीसेट कर दी गई है।"
          : "మీ ప్రొఫైల్ వివరాలు మరియు మెమొరీ పూర్తిగా రీసెట్ చేయబడ్డాయి.";

        return {
          agent: "Memory Agent",
          reply,
          detectedLanguage: lang,
          data: null,
          parsedFields: null,
          pendingConfirmation: false,
          needsClarification: false,
        };
      }
    }

    // User confirmed NO
    if (isNegative(raw)) {
      clearPendingConfirmation(sessionId);
      const reply = isEn
        ? "Understood, no changes were made to your profile."
        : isHi
        ? "ठीक है, आपकी प्रोफ़ाइल में कोई बदलाव नहीं किया गया है।"
        : "సరే, మీ ప్రొఫైల్‌లో ఎటువంటి మార్పులు చేయలేదు.";

      return {
        agent: "Memory Agent",
        reply,
        detectedLanguage: lang,
        data: session.profile,
        parsedFields: null,
        pendingConfirmation: false,
        needsClarification: false,
      };
    }

    // Ambiguous reply while pending confirmation
    const promptText = isEn
      ? `Please say clearly Yes or No. ${pending.promptTextEn || pending.promptText}`
      : isHi
      ? `कृपया हाँ या ना में स्पष्ट उत्तर दें। ${pending.promptTextHi || pending.promptText}`
      : `దయచేసి అవును లేదా కాదు అని స్పష్టంగా చెప్పండి. ${pending.promptText}`;

    return {
      agent: "Memory Agent",
      reply: promptText,
      detectedLanguage: lang,
      data: null,
      parsedFields: null,
      pendingConfirmation: true,
      needsClarification: true,
    };
  }

  // 2. Structured Extraction via Schema-Validated Extractor
  let extraction = await extractFinancialIntentAndParams(raw, session.profile);

  // Multi-Turn Context: If user is answering a pending clarification question
  if (session.pendingClarification) {
    const prev = session.pendingClarification;
    if (extraction.intent === "unknown" || extraction.intent === prev.intent) {
      extraction.intent = prev.intent;
      // Merge newly extracted parameters with previously extracted ones
      extraction.params = {
        ...prev.params,
        ...Object.fromEntries(
          Object.entries(extraction.params).filter(([_, v]) => v !== null && v !== undefined)
        ),
      };

      // Fallback for amount if still missing
      if (!extraction.params.amount) {
        const fallbackAmount = parseAmount(raw);
        const tenureSatisfied = !!(
          extraction.params.tenureYears ||
          extraction.params.tenureMonths ||
          prev.params?.tenureYears
        );
        if (fallbackAmount && (fallbackAmount >= 1000 || tenureSatisfied)) {
          extraction.params.amount = fallbackAmount;
        }
      }

      // Fallback for tenure if still missing
      if (!extraction.params.tenureYears && !extraction.params.tenureMonths && extraction.params.amount) {
        const fallbackTenure = parseAmount(raw);
        if (fallbackTenure && fallbackTenure >= 1 && fallbackTenure <= 40) {
          extraction.params.tenureYears = fallbackTenure;
        }
      }

      // Re-evaluate clarification requirements with merged params
      if (extraction.intent === "loan_emi") {
        if (!extraction.params.amount) {
          extraction.needs_clarification = true;
          extraction.clarification_question = isEn
            ? "What is the loan amount you want to calculate EMI for?"
            : isHi
            ? "ऋण राशि कितनी है? / What is the loan amount you want to calculate EMI for?"
            : "రుణం మొత్తం ఎంత? / What is the loan amount you want to calculate EMI for?";
        } else if (!extraction.params.tenureYears) {
          extraction.needs_clarification = true;
          extraction.clarification_question = isEn
            ? "For how many years tenure do you need the EMI?"
            : isHi
            ? "कितने वर्षों की अवधि के लिए ईएमआई चाहिए? / For how many years tenure do you need the EMI?"
            : "ఎన్ని సంవత్సరాల కాలపరిమితికి EMI కావాలి? / For how many years tenure do you need the EMI?";
        } else {
          extraction.needs_clarification = false;
          extraction.clarification_question = null;
        }
      } else if (extraction.intent === "loan_eligibility") {
        if (!extraction.params.amount && !session.profile.income) {
          extraction.needs_clarification = true;
          extraction.clarification_question = isEn
            ? "What is your monthly salary to check loan eligibility?"
            : isHi
            ? "ऋण पात्रता जांचने के लिए आपका मासिक वेतन कितना है? / What is your monthly salary to check loan eligibility?"
            : "మీ నెలవారీ జీతం ఎంత? / What is your monthly salary to check loan eligibility?";
        } else {
          extraction.needs_clarification = false;
          extraction.clarification_question = null;
        }
      } else if (extraction.intent === "investment_sip") {
        if (!extraction.params.amount) {
          extraction.needs_clarification = true;
          extraction.clarification_question = isEn
            ? "How much do you want to invest monthly in SIP?"
            : isHi
            ? "एसआईपी में हर महीने कितना निवेश करना चाहते हैं? / How much do you want to invest monthly in SIP?"
            : "నెలకు SIP లో ఎంత పెట్టుబడి పెట్టాలనుకుంటున్నారు? / How much do you want to invest monthly in SIP?";
        } else {
          extraction.needs_clarification = false;
          extraction.clarification_question = null;
        }
      } else if (extraction.intent === "investment_fd") {
        if (!extraction.params.amount) {
          extraction.needs_clarification = true;
          extraction.clarification_question = isEn
            ? "What amount do you want to deposit in Fixed Deposit (FD)?"
            : isHi
            ? "फिक्स्ड डिपॉजिट (FD) के लिए कितनी राशि जमा करना चाहते हैं? / What amount do you want to deposit in FD?"
            : "ఫిక్స్‌డ్ డిపాజిట్ కోసం ఎంత మొత్తం జమ చేయాలనుకుంటున్నారు? / What amount do you want to deposit in FD?";
        } else {
          extraction.needs_clarification = false;
          extraction.clarification_question = null;
        }
      } else if (extraction.intent === "budget_analysis" || extraction.intent === "profile_update") {
        if (!extraction.params.amount && !session.profile.income) {
          extraction.needs_clarification = true;
          extraction.clarification_question = isEn
            ? "What is your monthly income?"
            : isHi
            ? "आपकी मासिक आय (वेतन) कितनी है? / What is your monthly income?"
            : "మీ నెలవారీ ఆదాయం ఎంత? / What is your monthly income?";
        } else {
          extraction.needs_clarification = false;
          extraction.clarification_question = null;
        }
      }
    }
  }

  // Multi-Turn Conversation Continuity: Check active calculation context from previous turn
  const lastActivity = getLastActivity(sessionId);
  if (lastActivity && (extraction.intent === "unknown" || extraction.intent === lastActivity.intent)) {
    const hasAnyNewParam =
      extraction.params.rate !== null ||
      extraction.params.tenureYears !== null ||
      extraction.params.tenureMonths !== null ||
      extraction.params.amount !== null ||
      extraction.params.expenses !== null ||
      extraction.params.obligations !== null;

    const isContinuationPhrase =
      /అయితే|ఎంత\s*వస్తుంది|ఎంత\s*అవుతుంది|ఎంతండి|ఒకవేళ|వడ్డీతో|వడ్డీకి|సంవత్సరాల|సంవత్సరానికి|ఏళ్లకు|ఏళ్లకి|మరి|అలాగే|what\s+if|what\s+about|how\s+much|if\s+it\s+is|with\s+\d|for\s+\d|at\s+\d|तो\s+कितना|अगर|के\s+साथ|साल\s+के|ब्याज/iu.test(raw) ||
      parseAmount(raw) !== null;

    if (hasAnyNewParam || isContinuationPhrase) {
      extraction.intent = lastActivity.intent;
      extraction.params = {
        ...lastActivity.params,
        ...Object.fromEntries(
          Object.entries(extraction.params).filter(([_, v]) => v !== null && v !== undefined)
        ),
      };

      if (!hasAnyNewParam) {
        const fallbackAmt = parseAmount(raw);
        if (fallbackAmt !== null && fallbackAmt !== undefined) {
          const isDecimalRate = (fallbackAmt % 1 !== 0 || String(raw).includes(".")) && fallbackAmt <= 35;
          const hasRateHint = /%|percent|rate|interest|వడ్డీ|బ्याज|roi|శాతం|dar/i.test(raw);
          const hasTenureHint = /year|yr|saal|sal|సంవత్సర|ఏళ్ల|నెల|month|duration|tenure|కాలపరిమితి|अवधि|ఇయర్|इयर/iu.test(raw);

          if ((isDecimalRate || hasRateHint) && fallbackAmt <= 35) {
            extraction.params.rate = fallbackAmt;
          } else if (hasTenureHint || (fallbackAmt >= 1 && fallbackAmt <= 40 && !hasRateHint)) {
            extraction.params.tenureYears = fallbackAmt;
          } else if (fallbackAmt <= 35 && (extraction.intent === "loan_emi" || lastActivity.intent === "loan_emi")) {
            extraction.params.rate = fallbackAmt;
          } else {
            extraction.params.amount = fallbackAmt;
          }
        }
      }

      extraction.needs_clarification = false;
      extraction.clarification_question = null;
    }
  }

  const { intent, params, needs_clarification, clarification_question } = extraction;

  // Handle Repeat / Recall Intent from Memory
  if (
    /^(repeat|what did you say|say again|recall|మళ్ళీ చెప్పు|మరోసారి చెప్పు|గత వివరాలు|ముందు చెప్పింది|phir se batao|kya bataya tha)(?!\p{L})/iu.test(raw.trim())
  ) {
    if (lastActivity && lastActivity.reply) {
      const recallIntro = isEn
        ? "Here is your previous calculation: "
        : isHi
        ? "यह आपकी पिछली गणना है: "
        : "గతంలో లెక్కించిన వివరాలు: ";

      const recalledReply = `${recallIntro}${lastActivity.reply}`;
      addConversationTurn(sessionId, { role: "assistant", text: recalledReply, agent: lastActivity.agent });

      return {
        agent: lastActivity.agent || "FinAssist Bharat",
        reply: recalledReply,
        detectedLanguage: lang,
        data: lastActivity.data,
        parsedFields: lastActivity.params,
        pendingConfirmation: false,
        needsClarification: false,
        activeContext: lastActivity,
      };
    }
  }

  // Handle Greeting Intent
  if (intent === "greeting") {
    const reply = isEn
      ? "Hello! I am FinAssist Bharat, your AI financial voice assistant. I can help you calculate Loan EMI, check Loan Eligibility, plan SIP & Fixed Deposits, or analyze your monthly budget. How can I assist you today?"
      : isHi
      ? "नमस्ते! मैं FinAssist भारत वित्तीय सहायक हूँ। मैं लोन ईएमआई, ऋण पात्रता, एसआईपी, एफडी और बजट विश्लेषण में आपकी मदद कर सकता हूँ। आप क्या जानना चाहते हैं?"
      : "నమస్కారం! నేను FinAssist భారత్ ఆర్థిక వాయిస్ అసిస్టెంట్. నేను లోన్ ఈఎంఐ, రుణ అర్హత, ఎస్ఐపీ, ఎఫ్‌డీ మరియు బడ్జెట్ పొదుపు వివరాలలో సహాయం చేయగలను. మీకు ఏ విషయంలో సహాయం కావాలి?";

    return {
      agent: "FinAssist Bharat",
      reply,
      detectedLanguage: lang,
      data: null,
      parsedFields: null,
      pendingConfirmation: false,
      needsClarification: false,
    };
  }

  // If extraction needs clarification, remember state for next turn
  if (needs_clarification) {
    let localizedQuestion = clarification_question;
    if (isEn && clarification_question && clarification_question.includes(" / ")) {
      localizedQuestion = clarification_question.split(" / ")[1] || clarification_question;
    } else if (isHi && clarification_question) {
      if (/[\u0900-\u097F]/.test(clarification_question)) {
        localizedQuestion = clarification_question;
      } else {
        const enPart = clarification_question.includes(" / ")
          ? clarification_question.split(" / ")[1]
          : clarification_question;
        localizedQuestion = `कृपया विवरण बताएं: ${enPart}`;
      }
    }

    setPendingClarification(sessionId, {
      intent,
      params,
      question: localizedQuestion,
      detectedLanguage: lang,
    });

    return {
      agent: "FinAssist Bharat",
      reply: localizedQuestion,
      detectedLanguage: lang,
      data: null,
      parsedFields: params,
      pendingConfirmation: false,
      needsClarification: true,
    };
  }

  // Clear pending clarification once satisfied
  clearPendingClarification(sessionId);

  // 3. Profile Reset Intent
  if (intent === "profile_reset") {
    setPendingConfirmation(sessionId, {
      type: "RESET_PROFILE",
      promptText: "ప్రొఫైల్ రీసెట్ చేయమంటారా?",
      promptTextEn: "Do you want to reset your profile?",
      promptTextHi: "क्या आप प्रोफ़ाइल रीसेट करना चाहते हैं?",
    });

    const reply = isEn
      ? "Do you want to reset your financial profile and memory? Please say Yes or No."
      : isHi
      ? "क्या आप अपनी वित्तीय जानकारी रीसेट करना चाहते हैं? कृपया हाँ या ना कहें।"
      : "మీ ఆర్థిక వివరాలను రీసెట్ చేయాలనుకుంటున్నారా? దయచేసి అవును లేదా కాదు అని చెప్పండి.";

    return {
      agent: "Memory Agent",
      reply,
      detectedLanguage: lang,
      data: null,
      parsedFields: null,
      pendingConfirmation: true,
      needsClarification: false,
    };
  }

  // 4. Profile Query Intent
  if (intent === "profile_query") {
    const p = session.profile;
    const details = [];
    const detailsEn = [];
    const detailsHi = [];
    if (p.income) {
      details.push(`ఆదాయం: ₹${p.income}`);
      detailsEn.push(`Income: ₹${p.income.toLocaleString("en-IN")}`);
      detailsHi.push(`आय: ₹${p.income.toLocaleString("en-IN")}`);
    }
    if (p.expenses) {
      details.push(`ఖర్చులు: ₹${p.expenses}`);
      detailsEn.push(`Expenses: ₹${p.expenses.toLocaleString("en-IN")}`);
      detailsHi.push(`खर्च: ₹${p.expenses.toLocaleString("en-IN")}`);
    }
    if (p.emi) {
      details.push(`EMI: ₹${p.emi}`);
      detailsEn.push(`EMI: ₹${p.emi.toLocaleString("en-IN")}`);
      detailsHi.push(`ईएमआई: ₹${p.emi.toLocaleString("en-IN")}`);
    }

    let reply = "";
    if (isEn) {
      reply = detailsEn.length > 0
        ? `Your current profile details: ${detailsEn.join(", ")}.`
        : "No financial details recorded in your profile yet. For example, say: 'My income is 50000'.";
    } else if (isHi) {
      reply = detailsHi.length > 0
        ? `आपकी वर्तमान प्रोफ़ाइल जानकारी: ${detailsHi.join(", ")}।`
        : "आपकी प्रोफ़ाइल में अभी कोई जानकारी नहीं है। उदाहरण के लिए कहें: 'मेरी आय 50000 है'।";
    } else {
      reply = details.length > 0
        ? `మీ ప్రస్తుత ప్రొఫైల్ వివరాలు: ${details.join(", ")}.`
        : "మీ ప్రొఫైల్‌లో ఇంకా వివరాలు నమోదు కాలేదు. ఉదాహరణకు: 'నా ఆదాయం 50000' అని చెప్పండి.";
    }

    return {
      agent: "Profile Agent",
      reply,
      detectedLanguage: lang,
      data: session.profile,
      parsedFields: null,
      pendingConfirmation: false,
      needsClarification: false,
    };
  }

  // 5. Profile Update Intent -> Strictly requires confirmation
  if (intent === "profile_update") {
    const updates = {};
    const summaryParts = [];
    const summaryPartsEn = [];
    const summaryPartsHi = [];

    if (params.amount) {
      updates.income = params.amount;
      summaryParts.push(`ఆదాయం ₹${params.amount}`);
      summaryPartsEn.push(`Income ₹${params.amount.toLocaleString("en-IN")}`);
      summaryPartsHi.push(`आय ₹${params.amount.toLocaleString("en-IN")}`);
    }
    if (params.expenses) {
      updates.expenses = params.expenses;
      summaryParts.push(`ఖర్చులు ₹${params.expenses}`);
      summaryPartsEn.push(`Expenses ₹${params.expenses.toLocaleString("en-IN")}`);
      summaryPartsHi.push(`खर्च ₹${params.expenses.toLocaleString("en-IN")}`);
    }
    if (params.obligations) {
      updates.emi = params.obligations;
      summaryParts.push(`EMI ₹${params.obligations}`);
      summaryPartsEn.push(`EMI ₹${params.obligations.toLocaleString("en-IN")}`);
      summaryPartsHi.push(`ईएमआई ₹${params.obligations.toLocaleString("en-IN")}`);
    }

    const summaryText = summaryParts.join(" మరియు ");
    const summaryTextEn = summaryPartsEn.join(" and ");
    const summaryTextHi = summaryPartsHi.join(" और ");

    setPendingConfirmation(sessionId, {
      type: "UPDATE_PROFILE",
      proposedData: updates,
      summaryText,
      summaryTextEn,
      summaryTextHi,
      promptText: `${summaryText} గా అప్‌డేట్ చేయమంటారా?`,
      promptTextEn: `Update your profile with ${summaryTextEn}?`,
      promptTextHi: `क्या आपकी प्रोफ़ाइल में ${summaryTextHi} अपडेट करें?`,
    });

    const reply = isEn
      ? `I identified ${summaryTextEn}. Would you like to update your profile? Please say Yes or No.`
      : isHi
      ? `मैंने ${summaryTextHi} की पहचान की है। क्या आप अपनी प्रोफ़ाइल अपडेट करना चाहते हैं? कृपया हाँ या ना कहें।`
      : `నేను ${summaryText} గా గుర్తించాను. మీ ప్రొఫైల్‌లో అప్‌డేట్ చేయమంటారా? దయచేసి అవును లేదా కాదు అని చెప్పండి.`;

    return {
      agent: "Memory Agent",
      reply,
      detectedLanguage: lang,
      data: null,
      parsedFields: updates,
      pendingConfirmation: true,
      needsClarification: false,
    };
  }

  // 6. Capability A: Budget & Savings Analyzer
  if (intent === "budget_analysis") {
    const income = params.amount || session.profile.income || 0;
    const expenses = params.expenses || session.profile.expenses || 0;

    const result = budgetAnalyzer(income, expenses);
    const reply = isEn
      ? `For a monthly income of ₹${result.monthlyIncome.toLocaleString("en-IN")} and expenses of ₹${result.monthlyExpenses.toLocaleString("en-IN")}, your monthly savings are ₹${result.savings.toLocaleString("en-IN")} (Savings Rate: ${result.savingsRate}%). Financial Status: ${result.status}. ${result.suggestion || ""} (Note: This is an analytical estimation, not formal financial advice).`
      : isHi
      ? `मासिक आय ₹${result.monthlyIncome.toLocaleString("en-IN")} और खर्च ₹${result.monthlyExpenses.toLocaleString("en-IN")} पर आपकी मासिक बचत ₹${result.savings.toLocaleString("en-IN")} है (बचत दर: ${result.savingsRate}%)। वित्तीय स्थिति: ${result.status}। ${result.suggestion || ""} (नोट: यह विश्लेषणात्मक अनुमान है, आधिकारिक वित्तीय सलाह नहीं)।`
      : `మీ నెలవారీ ఆదాయం ₹${result.monthlyIncome.toLocaleString("en-IN")} మరియు ఖర్చులు ₹${result.monthlyExpenses.toLocaleString("en-IN")}. మిగులు పొదుపు ₹${result.savings.toLocaleString("en-IN")} (పొదుపు రేటు: ${result.savingsRate}%). ఆర్థిక స్థితి: ${result.status}. ${result.suggestion || ""} (గమనిక: ఇది ఆర్థిక సలహా కాదు).`;

    setLastActivity(sessionId, {
      intent,
      agent: "Budget Agent",
      params: { amount: income, expenses },
      data: result,
      reply,
      detectedLanguage: lang,
      timestamp: Date.now(),
    });
    addConversationTurn(sessionId, { role: "assistant", text: reply, agent: "Budget Agent", intent });

    return {
      agent: "Budget Agent",
      reply,
      detectedLanguage: lang,
      data: result,
      parsedFields: { intent, income, expenses, savings: result.savings, status: result.status },
      pendingConfirmation: false,
      needsClarification: false,
      activeContext: { intent, agent: "Budget Agent", params: { amount: income, expenses }, data: result },
    };
  }

  // 7. Capability B: Loan EMI & Eligibility
  if (intent === "loan_emi") {
    const principal = params.amount;
    const rate = params.rate ?? 9.5;
    const years = params.tenureYears ?? 5;

    const result = emiCalculator(principal, rate, years);
    const reply = isEn
      ? `For a loan amount of ₹${result.principal} at ${result.annualRate}% interest for ${result.years} years, your monthly EMI is ₹${result.emi}. Total interest payable: ₹${result.totalInterest}, Total payment: ₹${result.totalPayment}. (Note: This is an estimate, not official financial advice / ఆర్థిక సలహా కాదు).`
      : isHi
      ? `₹${result.principal.toLocaleString("en-IN")} ऋण राशि पर ${result.annualRate}% ब्याज दर से ${result.years} वर्षों के लिए मासिक ईएमआई ₹${result.emi.toLocaleString("en-IN")} होगी। कुल देय ब्याज: ₹${result.totalInterest.toLocaleString("en-IN")}, कुल भुगतान: ₹${result.totalPayment.toLocaleString("en-IN")}। (नोट: यह केवल अनुमान है, आधिकारिक वित्तीय सलाह नहीं)।`
      : `₹${result.principal.toLocaleString("en-IN")} రుణ మొత్తానికి, ${result.annualRate}% వడ్డీ రేటుతో ${result.years} సంవత్సరాలకు నెలవారీ EMI ₹${result.emi.toLocaleString("en-IN")} అవుతుంది. మొత్తం వడ్డీ ₹${result.totalInterest.toLocaleString("en-IN")}. (గమనిక: ఇది సుమారు అంచనా మాత్రమే, ఆర్థిక సలహా కాదు).`;

    setLastActivity(sessionId, {
      intent,
      agent: "Loan Agent",
      params: { amount: principal, rate, tenureYears: years },
      data: result,
      reply,
      detectedLanguage: lang,
      timestamp: Date.now(),
    });
    addConversationTurn(sessionId, { role: "assistant", text: reply, agent: "Loan Agent", intent });

    return {
      agent: "Loan Agent",
      reply,
      detectedLanguage: lang,
      data: result,
      parsedFields: { intent, principal, rate, years, emi: result.emi, totalPayment: result.totalPayment },
      pendingConfirmation: false,
      needsClarification: false,
      activeContext: { intent, agent: "Loan Agent", params: { amount: principal, rate, tenureYears: years }, data: result },
    };
  }

  if (intent === "loan_eligibility") {
    const salary = params.amount || session.profile.income || 50000;
    const obligations = params.obligations || session.profile.emi || 0;

    const result = loanEligibility(salary, obligations);
    let reply = "";
    if (result.eligible) {
      reply = isEn
        ? `Based on your monthly salary of ₹${result.monthlySalary.toLocaleString("en-IN")} (50% FOIR limit), you can afford an EMI of up to ₹${result.eligibleEMI.toLocaleString("en-IN")}/month. Your estimated maximum loan eligibility is approximately ₹${result.estimatedLoanAmount.toLocaleString("en-IN")}. (Note: Subject to CIBIL score and bank policy).`
        : isHi
        ? `आपके ₹${result.monthlySalary.toLocaleString("en-IN")} मासिक वेतन (50% FOIR सीमा) के आधार पर, आप ₹${result.eligibleEMI.toLocaleString("en-IN")}/माह तक ईएमआई दे सकते हैं। अनुमानित अधिकतम ऋण पात्रता लगभग ₹${result.estimatedLoanAmount.toLocaleString("en-IN")} है। (नोट: सिबिल स्कोर और बैंक नीति पर निर्भर)।`
        : `మీ జీతం ₹${result.monthlySalary.toLocaleString("en-IN")} ఆధారంగా (50% FOIR నిబంధన ప్రకారం), మీరు గరిష్టంగా నెలకు ₹${result.eligibleEMI.toLocaleString("en-IN")} EMI చెల్లించగలరు. సుమారు గరిష్ట లోన్ మొత్తం ₹${result.estimatedLoanAmount.toLocaleString("en-IN")} వరకు లభించే అవకాశం ఉంది. (గమనిక: సిబిల్ స్కోర్ మరియు బ్యాంక్ పాలసీని బట్టి లోన్ మంజూరు మారుతుంది).`;
    } else {
      reply = isEn
        ? "Your existing monthly debt payments are high relative to your income, so additional loan eligibility is limited. We recommend reducing existing obligations first."
        : isHi
        ? "आपकी आय की तुलना में वर्तमान ऋण किस्तें अधिक हैं, इसलिए अतिरिक्त ऋण पात्रता सीमित है। पहले मौजूदा ऋण कम करने की सलाह दी जाती है।"
        : "మీ ప్రస్తుత నెలవారీ చెల్లింపులు ఎక్కువగా ఉండటం వలన అదనపు లోన్ అర్హత పరిమితంగా ఉంది. ప్రస్తుత రుణాలను తగ్గించుకోవడం మంచిది.";
    }

    setLastActivity(sessionId, {
      intent,
      agent: "Loan Agent",
      params: { amount: salary, obligations },
      data: result,
      reply,
      detectedLanguage: lang,
      timestamp: Date.now(),
    });
    addConversationTurn(sessionId, { role: "assistant", text: reply, agent: "Loan Agent", intent });

    return {
      agent: "Loan Agent",
      reply,
      detectedLanguage: lang,
      data: result,
      parsedFields: { intent, salary, obligations, eligibleEMI: result.eligibleEMI, estimatedLoan: result.estimatedLoanAmount },
      pendingConfirmation: false,
      needsClarification: false,
      activeContext: { intent, agent: "Loan Agent", params: { amount: salary, obligations }, data: result },
    };
  }

  // 8. Capability C: Investment (SIP & FD)
  if (intent === "investment_sip") {
    const monthlyAmount = params.amount;
    const rate = params.rate ?? 12;
    const years = params.tenureYears ?? 5;

    const result = sipCalculator(monthlyAmount, rate, years);
    const reply = isEn
      ? `Investing ₹${result.monthlyAmount.toLocaleString("en-IN")} monthly for ${result.years} years at an expected ${result.expectedRate}% annual return yields a total investment of ₹${result.investedAmount.toLocaleString("en-IN")} with estimated returns of ₹${result.estimatedReturns.toLocaleString("en-IN")}. Total estimated value: ₹${result.totalValue.toLocaleString("en-IN")}. (Note: Mutual funds are subject to market risks).`
      : isHi
      ? `हर महीने ₹${result.monthlyAmount.toLocaleString("en-IN")} की दर से ${result.years} वर्षों के लिए (${result.expectedRate}% अनुमानित वार्षिक रिटर्न पर) एसआईपी करने पर आपका कुल निवेश ₹${result.investedAmount.toLocaleString("en-IN")} और अनुमानित रिटर्न ₹${result.estimatedReturns.toLocaleString("en-IN")} होगा। कुल अनुमानित मूल्य: ₹${result.totalValue.toLocaleString("en-IN")}। (नोट: म्यूचुअल फंड बाजार जोखिमों के अधीन हैं)।`
      : `నెలకు ₹${result.monthlyAmount.toLocaleString("en-IN")} చొప్పున ${result.years} సంవత్సరాలకు (${result.expectedRate}% అంచనా వార్షిక రాబడితో) SIP చేస్తే, మీ మొత్తం పెట్టుబడి ₹${result.investedAmount.toLocaleString("en-IN")} మరియు ఆశించే రాబడి ₹${result.estimatedReturns.toLocaleString("en-IN")}. మొత్తం విలువ సుమారు ₹${result.totalValue.toLocaleString("en-IN")} అవుతుంది. (గమనిక: మ్యూచువల్ ఫండ్ పెట్టుబడులు మార్కెట్ రిస్క్‌లకు లోబడి ఉంటాయి).`;

    setLastActivity(sessionId, {
      intent,
      agent: "Investment Agent",
      params: { amount: monthlyAmount, rate, tenureYears: years },
      data: result,
      reply,
      detectedLanguage: lang,
      timestamp: Date.now(),
    });
    addConversationTurn(sessionId, { role: "assistant", text: reply, agent: "Investment Agent", intent });

    return {
      agent: "Investment Agent",
      reply,
      detectedLanguage: lang,
      data: result,
      parsedFields: { intent, monthlyAmount, rate, years, investedAmount: result.investedAmount, totalValue: result.totalValue },
      pendingConfirmation: false,
      needsClarification: false,
      activeContext: { intent, agent: "Investment Agent", params: { amount: monthlyAmount, rate, tenureYears: years }, data: result },
    };
  }

  if (intent === "investment_fd") {
    const amount = params.amount;
    const rate = params.rate ?? 7.0;
    const years = params.tenureYears ?? 2;

    const result = fdCalculator(amount, rate, years);
    const reply = isEn
      ? `Depositing ₹${result.amount.toLocaleString("en-IN")} for ${result.years} years at ${result.rate}% annual interest in a Fixed Deposit (FD) yields a maturity amount of ₹${result.maturityAmount.toLocaleString("en-IN")}, earning ₹${result.interestEarned.toLocaleString("en-IN")} in interest. (Note: Compound interest estimate, not official financial advice).`
      : isHi
      ? `₹${result.amount.toLocaleString("en-IN")} की राशि को ${result.years} वर्षों के लिए ${result.rate}% वार्षिक ब्याज पर सावधि जमा (FD) में रखने पर परिपक्वता राशि ₹${result.maturityAmount.toLocaleString("en-IN")} होगी, जिसमें ₹${result.interestEarned.toLocaleString("en-IN")} का ब्याज लाभ मिलेगा। (नोट: चक्रवृद्धि ब्याज अनुमान, यह वित्तीय सलाह नहीं है)।`
      : `₹${result.amount.toLocaleString("en-IN")} మొత్తాన్ని ${result.years} సంవత్సరాలకు ${result.rate}% వార్షిక వడ్డీ రేటుతో ఫిక్స్‌డ్ డిపాజిట్ (FD) చేస్తే, మెచ్యూరిటీ మొత్తం ₹${result.maturityAmount.toLocaleString("en-IN")} అవుతుంది. వడ్డీ లాభం ₹${result.interestEarned.toLocaleString("en-IN")}. (గమనిక: వార్షిక చక్రవడ్డీ అంచనా, ఇది ఆర్థిక సలహా కాదు).`;

    setLastActivity(sessionId, {
      intent,
      agent: "Investment Agent",
      params: { amount, rate, tenureYears: years },
      data: result,
      reply,
      detectedLanguage: lang,
      timestamp: Date.now(),
    });
    addConversationTurn(sessionId, { role: "assistant", text: reply, agent: "Investment Agent", intent });

    return {
      agent: "Investment Agent",
      reply,
      detectedLanguage: lang,
      data: result,
      parsedFields: { intent, amount, rate, years, maturityAmount: result.maturityAmount, interestEarned: result.interestEarned },
      pendingConfirmation: false,
      needsClarification: false,
      activeContext: { intent, agent: "Investment Agent", params: { amount, rate, tenureYears: years }, data: result },
    };
  }

  // Default Fallback
  const fallbackReply = isEn
    ? "I can help you with Budget Planning, Loan EMI, Loan Eligibility, SIP, or Fixed Deposits. What would you like to calculate?"
    : isHi
    ? "मैं बजट योजना, लोन ईएमआई, ऋण पात्रता, एसआईपी या फिक्स्ड डिपॉजिट में आपकी मदद कर सकता हूँ। आप क्या गणना करना चाहते हैं?"
    : "నేను బడ్జెట్ పొదుపు, లోన్ ఈఎంఐ మరియు ఎస్ఐపీ/ఎఫ్‌డీ వివరాలలో సహాయం చేయగలను. మీరు ఏమి గణించాలనుకుంటున్నారు?";

  return {
    agent: "FinAssist Bharat",
    reply: fallbackReply,
    detectedLanguage: lang,
    data: null,
    parsedFields: null,
    pendingConfirmation: false,
    needsClarification: true,
  };
}
