import React, { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import FinancialCard from "./FinancialCard.jsx";
import AudioWaveform from "./AudioWaveform.jsx";
import {
  Mic,
  Square,
  Send,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  Clock,
  Brain,
  X,
  RefreshCw,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  ChevronDown,
  Layers,
  PanelLeft,
} from "lucide-react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5001";

/**
 * Encodes Float32Array PCM samples into a 16-bit mono WAV ArrayBuffer.
 */
function encodeWavPcm(samples, sampleRate = 16000) {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  const writeString = (offset, string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, "data");
  view.setUint32(40, samples.length * 2, true);

  let offset = 44;
  for (let i = 0; i < samples.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }

  return buffer;
}

async function convertBlobToWav(audioBlob) {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return audioBlob;
    const audioCtx = new AudioCtx();
    try {
      const arrayBuffer = await audioBlob.arrayBuffer();
      if (!arrayBuffer || arrayBuffer.byteLength === 0) return audioBlob;
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

      const offlineCtx = new OfflineAudioContext(1, Math.ceil(audioBuffer.duration * 16000), 16000);
      const source = offlineCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(offlineCtx.destination);
      source.start(0);

      const renderedBuffer = await offlineCtx.startRendering();
      const channelData = renderedBuffer.getChannelData(0);
      const wavBytes = encodeWavPcm(channelData, 16000);

      return new Blob([wavBytes], { type: "audio/wav" });
    } finally {
      if (audioCtx.state !== "closed") {
        audioCtx.close().catch(() => {});
      }
    }
  } catch (err) {
    console.warn("Client WAV transcoding skipped, falling back to rawBlob:", err);
    return audioBlob;
  }
}

export default function VoiceAssistant({ onToggleSidebar, isSidebarOpen }) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [language, setLanguage] = useState("indic-auto");
  const [sessionId, setSessionId] = useState("");
  const [pendingConfirmation, setPendingConfirmation] = useState(false);
  const [latencies, setLatencies] = useState(null);
  const [audioStream, setAudioStream] = useState(null);
  const [isMemoryOpen, setIsMemoryOpen] = useState(false);
  const [memoryData, setMemoryData] = useState(null);
  const [activeActivity, setActiveActivity] = useState(null);
  const [activeAgentName, setActiveAgentName] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerIntervalRef = useRef(null);
  const activeAudioRef = useRef(null);
  const chatEndRef = useRef(null);

  const location = useLocation();
  const initialQueryHandledRef = useRef(false);

  // Initialize or restore session ID & trigger initial query if routed from Hero/Dashboard
  useEffect(() => {
    let sid = localStorage.getItem("finassist_session_id");
    if (!sid) {
      sid = "session_" + Math.random().toString(36).substring(2, 10);
      localStorage.setItem("finassist_session_id", sid);
    }
    setSessionId(sid);
    loadMemory(sid);

    const initialQ = location.state?.initialQuery || new URLSearchParams(location.search).get("q");
    if (initialQ && !initialQueryHandledRef.current) {
      initialQueryHandledRef.current = true;
      submitText(initialQ);
    }
  }, [location]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, isRecording]);

  // Audio recording timer
  useEffect(() => {
    if (isRecording) {
      setRecordingSeconds(0);
      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerIntervalRef.current);
    }
    return () => clearInterval(timerIntervalRef.current);
  }, [isRecording]);

  const loadMemory = async (sid) => {
    try {
      const activeSid = sid || sessionId || localStorage.getItem("finassist_session_id") || "default";
      const res = await fetch(`${BACKEND_URL}/api/chat/memory?sessionId=${encodeURIComponent(activeSid)}`);
      const data = await res.json();
      if (data && data.memory) {
        setMemoryData(data.memory);
      }
      if (data && data.lastActivity) {
        setActiveActivity(data.lastActivity);
      }
    } catch (e) {
      console.warn("Memory load error:", e);
    }
  };

  const handleResetMemory = async () => {
    try {
      const activeSid = sessionId || localStorage.getItem("finassist_session_id") || "default";
      await fetch(`${BACKEND_URL}/api/chat/memory?sessionId=${encodeURIComponent(activeSid)}`, {
        method: "DELETE",
      });
      setActiveActivity(null);
      await loadMemory(activeSid);
    } catch (e) {
      console.error("Memory reset error:", e);
    }
  };

  const playAudioBase64 = (base64Audio, fallbackText = null, langHint = "te-IN") => {
    try {
      if (activeAudioRef.current) {
        activeAudioRef.current.pause();
        activeAudioRef.current = null;
      }

      if (base64Audio) {
        const audioUrl = `data:audio/wav;base64,${base64Audio}`;
        const audio = new Audio(audioUrl);
        activeAudioRef.current = audio;
        audio.play().catch((e) => {
          console.warn("Autoplay audio blocked or error:", e);
          if (fallbackText && typeof window !== "undefined" && "speechSynthesis" in window) {
            speakWithBrowserTts(fallbackText, langHint);
          }
        });
        return;
      }

      if (fallbackText && typeof window !== "undefined" && "speechSynthesis" in window) {
        speakWithBrowserTts(fallbackText, langHint);
      }
    } catch (err) {
      console.error("Audio error:", err);
      if (fallbackText && typeof window !== "undefined" && "speechSynthesis" in window) {
        speakWithBrowserTts(fallbackText, langHint);
      }
    }
  };

  const speakWithBrowserTts = (text, langHint = "te-IN") => {
    try {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
      window.speechSynthesis.cancel();
      const clean = String(text || "")
        .replace(/\s*\([^)]*\)/g, "")
        .trim();
      if (!clean) return;

      const utterance = new SpeechSynthesisUtterance(clean);
      const isTe = /[\u0C00-\u0C7F]/.test(clean);
      const isHi = /[\u0900-\u097F]/.test(clean);
      utterance.lang = isTe ? "te-IN" : isHi ? "hi-IN" : "en-IN";
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Browser TTS fallback failed:", e);
    }
  };

  const startRecording = async () => {
    try {
      if (activeAudioRef.current) activeAudioRef.current.pause();

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioStream(stream);
      audioChunksRef.current = [];

      const mimeType = MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : MediaRecorder.isTypeSupported("audio/mp4")
        ? "audio/mp4"
        : "";

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        setAudioStream(null);
        try {
          if (!audioChunksRef.current || audioChunksRef.current.length === 0) {
            console.warn("No audio chunks captured");
            return;
          }
          const rawBlob = new Blob(audioChunksRef.current, {
            type: mimeType || "audio/webm",
          });
          stream.getTracks().forEach((track) => track.stop());

          if (rawBlob.size < 200) {
            alert("Spoken audio was too short. Please tap the mic, speak clearly, and tap to finish.");
            return;
          }

          let wavBlob = rawBlob;
          try {
            wavBlob = await convertBlobToWav(rawBlob);
          } catch (cErr) {
            console.warn("Client WAV transcoding skipped, sending raw audio:", cErr);
          }
          await submitAudio(wavBlob);
        } catch (err) {
          console.error("Audio submission failed:", err);
          setIsLoading(false);
        }
      };

      recorder.start();
      setIsRecording(true);
    } catch (err) {
      alert("Microphone permission denied or microphone not found: " + err.message);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const submitAudio = async (audioBlob) => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append("audio", audioBlob, "user_voice.wav");
    formData.append("sessionId", sessionId);
    formData.append("language", language);

    try {
      const res = await fetch(`${BACKEND_URL}/api/voice/process-audio`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      handleAssistantResponse(data);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          agent: "System",
          text: `Backend connection error: ${err.message}. Is backend running on port 5001?`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const submitText = async (textToSend) => {
    const text = String(textToSend || textInput).trim();
    if (!text || isLoading) return;

    setTextInput("");
    setIsLoading(true);

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        agent: "You",
        text,
      },
    ]);

    try {
      const res = await fetch(`${BACKEND_URL}/api/voice/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript: text,
          sessionId,
          language,
        }),
      });

      const data = await res.json();
      handleAssistantResponse(data, false);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          agent: "System",
          text: `Backend connection error: ${err.message}.`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssistantResponse = (data, appendUserMessage = true) => {
    if (appendUserMessage && data.transcript) {
      setMessages((prev) => [
        ...prev,
        {
          role: "user",
          agent: "You (Voice)",
          text: data.transcript,
          privacy: data.privacy,
        },
      ]);
    }

    setPendingConfirmation(data.pendingConfirmation || false);
    if (data.latencies) {
      setLatencies(data.latencies);
    }

    const agentName = data.agent || "FinAssist Bharat";
    setActiveAgentName(agentName);

    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        agent: agentName,
        text: data.reply || data.message || "No response received",
        data: data.data || null,
        parsedFields: data.parsedFields || null,
        audioBase64: data.audioBase64 || null,
        pendingConfirmation: data.pendingConfirmation || false,
        needsClarification: data.needsClarification || false,
      },
    ]);

    const replyText = data.reply || data.message || "";
    playAudioBase64(data.audioBase64, replyText, data.detectedLanguage || language);

    // Trigger sidebar event and refresh memory
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("finassist:agent_active", {
          detail: { agent: agentName, data: data.data },
        })
      );
      if (data.lastActivity) {
        setActiveActivity(data.lastActivity);
      }
      if (data.agent === "Memory Agent" && !data.pendingConfirmation) {
        loadMemory();
      }
    }
  };

  const clearChat = () => {
    setMessages([]);
    setPendingConfirmation(false);
    setLatencies(null);
    setActiveAgentName(null);
    setActiveActivity(null);
    if (activeAudioRef.current) activeAudioRef.current.pause();
  };

  const samplePrompts = [
    { label: "Loan EMI (Tenglish)", text: "naaku 5 lakh loan kavali for 5 years at 9.5% interest" },
    { label: "SIP Growth (Hinglish)", text: "5000 monthly SIP 10 saal ke liye 12 percent return pe kitna milega" },
    { label: "Loan EMI (తెలుగు)", text: "5 లక్షల లోన్ కు 8.5% వడ్డీతో 3 సంవత్సరాలకు EMI ఎంత?" },
    { label: "Budget Check (Hinglish)", text: "meri salary 75000 hai aur monthly kharcha 25000" },
  ];

  return (
    <div className="flex-1 flex flex-col h-full w-full bg-[#030712] text-slate-100 overflow-hidden relative">
      {/* Sleek Top Navigation Header */}
      <header className="h-16 px-6 border-b border-white/[0.06] bg-[#070b14]/80 backdrop-blur-xl flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-3">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              title={isSidebarOpen ? "Collapse sidebar" : "Open sidebar"}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition"
            >
              <PanelLeft className="w-4 h-4" />
            </button>
          )}

          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-white tracking-wide">
              FinAssist Bharat
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
              Voice AI
            </span>
            {activeAgentName && (
              <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {activeAgentName}
              </span>
            )}
          </div>
        </div>

        {/* Right Header Controls */}
        <div className="flex items-center gap-2.5">
          {/* Telemetry pill */}
          {latencies && (
            <div
              title={`STT: ${latencies.sttMs}ms | Logic: ${latencies.toolMs}ms | TTS: ${latencies.ttsMs}ms`}
              className="hidden md:flex items-center gap-1 text-[11px] font-mono text-slate-400 bg-white/[0.03] border border-white/[0.08] px-2.5 py-1 rounded-lg cursor-help"
            >
              <Clock className="w-3 h-3 text-cyan-400" />
              <span>{latencies.totalMs}ms</span>
            </div>
          )}

          {/* Language Selector */}
          <div className="relative">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="appearance-none bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 text-xs font-medium border border-white/[0.1] rounded-lg pl-3 pr-7 py-1.5 outline-none cursor-pointer transition"
            >
              <option value="indic-auto" className="bg-slate-900">Auto-Detect / Code-Mixed (తెలుగు • हिन्दी • English)</option>
              <option value="te-IN" className="bg-slate-900">Telugu / Tenglish (తెలుగు)</option>
              <option value="hi-IN" className="bg-slate-900">Hindi / Hinglish (हिन्दी)</option>
              <option value="en-IN" className="bg-slate-900">English (India)</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Profile Memory Toggle Button */}
          <button
            onClick={() => {
              setIsMemoryOpen(!isMemoryOpen);
              loadMemory();
            }}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition ${
              isMemoryOpen || activeActivity || (memoryData && memoryData.income)
                ? "bg-purple-500/10 border-purple-500/30 text-purple-300"
                : "bg-white/[0.04] border-white/[0.1] text-slate-400 hover:text-white"
            }`}
            title="View active conversation memory & profile"
          >
            <Brain className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">Memory</span>
            {(activeActivity || memoryData?.income) && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
            )}
          </button>

          {/* Clear Session */}
          <button
            onClick={clearChat}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/[0.06] transition"
            title="Clear Chat"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Floating Slide-Out Memory Card */}
      {isMemoryOpen && (
        <div className="absolute right-6 top-20 w-80 p-4 rounded-2xl bg-slate-900/95 border border-white/[0.1] shadow-2xl backdrop-blur-2xl z-40 animate-in fade-in zoom-in-95 duration-200 text-slate-100">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.08]">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-bold text-white tracking-wide">
                Memory & Conversational Context
              </span>
            </div>
            <button
              onClick={() => setIsMemoryOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Active Calculation / Topic Memory */}
          {activeActivity ? (
            <div className="mb-3 p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-purple-300">
                  Active Topic ({activeActivity.agent || activeActivity.intent})
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  In Memory
                </span>
              </div>
              <div className="text-slate-200 font-medium text-[11px] leading-relaxed">
                {activeActivity.params?.amount && (
                  <span>Amount: ₹{Number(activeActivity.params.amount).toLocaleString("en-IN")} • </span>
                )}
                {activeActivity.params?.rate && (
                  <span>Rate: {activeActivity.params.rate}% • </span>
                )}
                {activeActivity.params?.tenureYears && (
                  <span>Tenure: {activeActivity.params.tenureYears} yrs • </span>
                )}
                {activeActivity.params?.expenses && (
                  <span>Expenses: ₹{Number(activeActivity.params.expenses).toLocaleString("en-IN")} • </span>
                )}
                {activeActivity.data?.emi && (
                  <span className="text-emerald-300 font-bold">EMI: ₹{Number(activeActivity.data.emi).toLocaleString("en-IN")}</span>
                )}
              </div>
              <div className="text-[10px] text-slate-400 flex items-center gap-1.5 pt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Active context: Ask follow-ups naturally</span>
              </div>
            </div>
          ) : null}

          {/* Persistent Financial Profile */}
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            Financial Profile Memory
          </div>
          {memoryData && (memoryData.income || memoryData.expenses || memoryData.emi) ? (
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between p-2 rounded-lg bg-white/[0.03] border border-white/[0.05]">
                <span className="text-slate-400">Monthly Income:</span>
                <span className="font-bold text-emerald-400">
                  ₹{Number(memoryData.income || 0).toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-white/[0.03] border border-white/[0.05]">
                <span className="text-slate-400">Monthly Expenses:</span>
                <span className="font-bold text-rose-400">
                  ₹{Number(memoryData.expenses || 0).toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-white/[0.03] border border-white/[0.05]">
                <span className="text-slate-400">Monthly EMI:</span>
                <span className="font-bold text-amber-400">
                  ₹{Number(memoryData.emi || 0).toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-2.5 px-2 text-center bg-white/[0.02] rounded-lg border border-white/[0.04]">
              No profile stored yet. Say: <em>"My income is 50000"</em> to save.
            </p>
          )}

          <div className="flex gap-2 mt-4 pt-3 border-t border-white/[0.08]">
            <button
              onClick={() => loadMemory()}
              className="flex-1 py-1.5 rounded-lg text-xs font-medium bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 transition"
            >
              Refresh
            </button>
            <button
              onClick={handleResetMemory}
              className="py-1.5 px-3 rounded-lg text-xs font-medium bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition"
            >
              Reset
            </button>
          </div>
        </div>
      )}

      {/* Main Conversation Stream */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
        <div className="max-w-3xl mx-auto space-y-5">
          {messages.length === 0 ? (
            /* Immersive Modern Empty State */
            <div className="py-16 flex flex-col items-center justify-center text-center space-y-6">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-xl shadow-blue-500/25">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -inset-1 rounded-2xl bg-blue-500/20 blur-lg -z-10" />
              </div>

              <div className="space-y-2 max-w-lg">
                <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  FinAssist Bharat
                </h2>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Sovereign Multilingual Financial Voice AI with native code-mix understanding (Tenglish, Hinglish, Telugu, Hindi, English). Ask about Loan EMI, SIP Returns, Fixed Deposits, or evaluate your monthly budget.
                </p>
              </div>

              {/* Quick Prompt Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-xl pt-4">
                {samplePrompts.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => submitText(p.text)}
                    className="p-3.5 rounded-xl text-left bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] hover:border-blue-500/50 transition group flex flex-col justify-between"
                  >
                    <span className="text-[11px] font-semibold text-blue-400 group-hover:text-blue-300 transition flex items-center justify-between">
                      {p.label}
                      <ArrowUpRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition" />
                    </span>
                    <span className="text-xs text-slate-300 mt-1 line-clamp-2">
                      {p.text}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m, idx) => {
              const isUser = m.role === "user";
              return (
                <div
                  key={idx}
                  className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[92%] sm:max-w-[85%] rounded-2xl p-4 shadow-sm transition ${
                      isUser
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-sm"
                        : "bg-[#0b1120] border border-white/[0.08] text-slate-100 rounded-bl-sm"
                    }`}
                  >
                    {/* Header info */}
                    <div className="flex items-center justify-between gap-3 mb-1.5 text-xs">
                      <span className="font-semibold text-slate-300 text-[11px]">
                        {m.agent}
                      </span>
                      {!isUser && (m.audioBase64 || m.text) && (
                        <button
                          onClick={() => playAudioBase64(m.audioBase64, m.text, language)}
                          title="Speak / Replay Voice"
                          className="text-slate-400 hover:text-white transition p-1 rounded-md hover:bg-white/[0.05]"
                        >
                          <Volume2 className="w-4 h-4 text-cyan-400" />
                        </button>
                      )}
                    </div>

                    {/* Main Message Text */}
                    <p className="text-sm whitespace-pre-line leading-relaxed text-slate-100">
                      {m.text}
                    </p>

                    {/* Visual Financial Breakdown Card */}
                    {m.data && (
                      <FinancialCard data={m.data} agent={m.agent} />
                    )}
                  </div>
                </div>
              );
            })
          )}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex items-center gap-2.5 text-xs text-slate-400 py-2">
              <div className="w-3.5 h-3.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span>Processing voice via Gnani.ai...</span>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Spoken Confirmation Banner */}
      {pendingConfirmation && (
        <div className="max-w-2xl mx-auto w-full px-4 mb-2 z-20">
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-2 text-amber-300 text-xs font-medium">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Please confirm: Say <strong>"Yes"</strong> or <strong>"No"</strong>.</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => submitText("అవును")}
                className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition"
              >
                Yes (అవును)
              </button>
              <button
                onClick={() => submitText("వద్దు")}
                className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition"
              >
                No (వద్దు)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Bottom Voice & Text Input Dock */}
      <footer className="p-4 border-t border-white/[0.06] bg-[#070b14]/90 backdrop-blur-xl shrink-0 z-20">
        <div className="max-w-3xl mx-auto">
          {/* Active Audio Waveform Indicator */}
          {isRecording && (
            <div className="flex justify-center mb-3 animate-fade-in">
              <AudioWaveform isRecording={isRecording} stream={audioStream} />
            </div>
          )}

          <div className="flex items-center gap-2.5">
            {/* Primary Voice Action Button with Glow Ripple */}
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isLoading}
              title={isRecording ? "Stop recording" : "Speak voice query"}
              className={`relative flex items-center justify-center w-12 h-12 rounded-xl transition-all shadow-lg active:scale-95 shrink-0 ${
                isRecording
                  ? "bg-rose-600 text-white voice-ripple-active shadow-rose-600/40"
                  : "bg-gradient-to-tr from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/25"
              }`}
            >
              {isRecording ? (
                <Square className="w-5 h-5 fill-current" />
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </button>

            {/* Clean Input Field */}
            <div className="relative flex-1">
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submitText()}
                placeholder={
                  isRecording
                    ? `Recording voice (${recordingSeconds}s)... Tap mic to finish`
                    : "Speak with mic or type your financial question..."
                }
                disabled={isRecording || isLoading}
                className="w-full bg-white/[0.04] hover:bg-white/[0.06] focus:bg-white/[0.07] border border-white/[0.1] focus:border-blue-500/80 rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder-slate-500 outline-none transition"
              />
              <button
                onClick={() => submitText()}
                disabled={!textInput.trim() || isLoading || isRecording}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-30 disabled:hover:bg-blue-600 transition"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
