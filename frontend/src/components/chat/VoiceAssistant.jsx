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

import { BACKEND_URL } from "../../config/api.js";

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

function downsampleFloat32(buffer, srcRate, targetRate = 16000) {
  if (!buffer || buffer.length === 0) return new Float32Array(0);
  if (srcRate === targetRate) return new Float32Array(buffer);
  const ratio = srcRate / targetRate;
  const outLen = Math.max(1, Math.floor(buffer.length / ratio));
  const out = new Float32Array(outLen);
  for (let i = 0; i < outLen; i++) {
    const start = Math.floor(i * ratio);
    const end = Math.min(buffer.length, Math.floor((i + 1) * ratio));
    let sum = 0;
    let count = 0;
    for (let j = start; j < end; j++) {
      sum += buffer[j];
      count++;
    }
    out[i] = count > 0 ? sum / count : buffer[Math.min(start, buffer.length - 1)];
  }
  return out;
}

function processVoicePcm(samples, sampleRate = 16000) {
  if (!samples || samples.length === 0) {
    return { blob: null, reason: "too_short" };
  }
  const duration = samples.length / sampleRate;
  if (duration < 0.25) {
    return { blob: null, reason: "too_short" };
  }

  // 1. Remove hardware DC offset + apply gentle ~75Hz high-pass filter for AC hum & fan rumble
  let mean = 0;
  for (let i = 0; i < samples.length; i++) mean += samples[i];
  mean /= samples.length;

  const filtered = new Float32Array(samples.length);
  let prevX = 0;
  let prevY = 0;
  let maxAbs = 0;
  let sumSq = 0;
  for (let i = 0; i < samples.length; i++) {
    const x = samples[i] - mean;
    const y = 0.97 * (prevY + x - prevX);
    prevX = x;
    prevY = y;
    filtered[i] = y;
    const abs = Math.abs(y);
    if (abs > maxAbs) maxAbs = abs;
    sumSq += y * y;
  }

  const totalRms = Math.sqrt(sumSq / filtered.length);
  // Only block completely dead/muted hardware audio
  if (maxAbs < 0.00015 && totalRms < 0.00003) {
    return { blob: null, reason: "silent" };
  }

  // 2. Click-immune 90th-percentile frame RMS normalization so initial mouse clicks never suppress quiet speech
  const frameSize = 320; // 20ms at 16kHz
  const frameRmsList = [];
  for (let start = 0; start < filtered.length; start += frameSize) {
    const end = Math.min(filtered.length, start + frameSize);
    let sq = 0;
    for (let i = start; i < end; i++) sq += filtered[i] * filtered[i];
    frameRmsList.push(Math.sqrt(sq / (end - start)));
  }
  frameRmsList.sort((a, b) => a - b);
  const p90Idx = Math.min(frameRmsList.length - 1, Math.floor(frameRmsList.length * 0.9));
  const speechRms = frameRmsList[p90Idx] || totalRms;

  const gain = Math.min(40, Math.max(1, 0.16 / Math.max(speechRms, 0.004)));
  if (gain > 1.02) {
    for (let i = 0; i < filtered.length; i++) {
      const scaled = filtered[i] * gain;
      // Soft-knee saturation prevents click clipping while preserving crisp speech dynamics
      filtered[i] = Math.abs(scaled) > 0.88 ? Math.tanh(scaled * 0.9) : scaled;
    }
  }

  const wavBytes = encodeWavPcm(filtered, 16000);
  return { blob: new Blob([wavBytes], { type: "audio/wav" }), reason: null };
}

async function convertBlobToWav(audioBlob) {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return { blob: audioBlob, reason: null };
    const audioCtx = new AudioCtx();
    try {
      const arrayBuffer = await audioBlob.arrayBuffer();
      if (!arrayBuffer || arrayBuffer.byteLength === 0) {
        return { blob: null, reason: "too_short" };
      }
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
      if (!Number.isFinite(audioBuffer.duration) || audioBuffer.duration < 0.25) {
        return { blob: null, reason: "too_short" };
      }

      // Mix all channels explicitly before downsampling to 16kHz mono
      const len = audioBuffer.length;
      const numCh = Math.max(1, audioBuffer.numberOfChannels);
      const mono = new Float32Array(len);
      for (let c = 0; c < numCh; c++) {
        const ch = audioBuffer.getChannelData(c);
        for (let i = 0; i < len; i++) mono[i] += ch[i] / numCh;
      }
      const pcm16k = downsampleFloat32(mono, audioBuffer.sampleRate, 16000);
      return processVoicePcm(pcm16k, 16000);
    } finally {
      if (audioCtx.state !== "closed") {
        audioCtx.close().catch(() => {});
      }
    }
  } catch (err) {
    console.warn("Client WAV transcoding skipped, falling back to rawBlob:", err);
    return { blob: audioBlob, reason: null };
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
  const [micDevices, setMicDevices] = useState([]);
  const [selectedMicId, setSelectedMicId] = useState(() => localStorage.getItem("finassist_mic_id") || "default");
  const [micLevel, setMicLevel] = useState(0);
  const [lowSignalWarning, setLowSignalWarning] = useState(false);
  const [isMemoryOpen, setIsMemoryOpen] = useState(false);
  const [memoryData, setMemoryData] = useState(null);
  const [activeActivity, setActiveActivity] = useState(null);
  const [activeAgentName, setActiveAgentName] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const pcmCtxRef = useRef(null);
  const pcmNodeRef = useRef(null);
  const pcmChunksRef = useRef([]);
  const pcmSampleRateRef = useRef(16000);
  const activeStreamRef = useRef(null);
  const isRecordingRef = useRef(false);
  const isStartingRef = useRef(false);
  const handledByPcmRef = useRef(false);
  const micPeakRef = useRef(0);
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

  // Discover audio input devices & release active audio on unmount
  const refreshMicDevices = async () => {
    try {
      if (!navigator.mediaDevices?.enumerateDevices) return;
      const devices = await navigator.mediaDevices.enumerateDevices();
      const inputs = devices.filter((d) => d.kind === "audioinput");
      setMicDevices(inputs);
    } catch {
      // Ignore device enumeration failure before permission
    }
  };

  useEffect(() => {
    refreshMicDevices();
    navigator.mediaDevices?.addEventListener?.("devicechange", refreshMicDevices);
    return () => {
      navigator.mediaDevices?.removeEventListener?.("devicechange", refreshMicDevices);
      cleanupCaptureNodes();
    };
  }, []);

  // Audio recording timer + silent-mic hint after 2s
  useEffect(() => {
    if (isRecording) {
      setRecordingSeconds(0);
      setLowSignalWarning(false);
      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => {
          const next = prev + 1;
          if (next >= 2 && micPeakRef.current < 0.0004) {
            setLowSignalWarning(true);
          } else if (micPeakRef.current >= 0.0004) {
            setLowSignalWarning(false);
          }
          return next;
        });
      }, 1000);
    } else {
      clearInterval(timerIntervalRef.current);
      setLowSignalWarning(false);
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
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
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

  const cleanupCaptureNodes = () => {
    try {
      if (pcmNodeRef.current) {
        pcmNodeRef.current.proc.onaudioprocess = null;
        pcmNodeRef.current.src.disconnect();
        pcmNodeRef.current.proc.disconnect();
        pcmNodeRef.current.muteGain.disconnect();
        pcmNodeRef.current = null;
      }
      if (pcmCtxRef.current && pcmCtxRef.current.state !== "closed") {
        pcmCtxRef.current.close().catch(() => {});
        pcmCtxRef.current = null;
      }
    } catch {
      // Safe teardown
    }
    if (activeStreamRef.current) {
      activeStreamRef.current.getTracks().forEach((track) => track.stop());
      activeStreamRef.current = null;
    }
    setAudioStream(null);
    setMicLevel(0);
  };

  const handleSilentOrShortReason = (reason) => {
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        agent: "FinAssist Bharat",
        text:
          reason === "silent"
            ? "No microphone sound was detected (muted or wrong input device). Check the microphone selector at the top or Windows sound input settings and try again."
            : "Spoken audio was too short. Please tap the mic, speak your full question, and tap stop when finished.",
      },
    ]);
  };

  const startRecording = async () => {
    if (isRecordingRef.current || isStartingRef.current || isLoading) return;
    isStartingRef.current = true;

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        handleSilentOrShortReason("silent");
        return;
      }

      if (activeAudioRef.current) {
        activeAudioRef.current.pause();
        activeAudioRef.current = null;
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }

      const preferredAudio = {
        echoCancellation: true,
        // Disable aggressive WebRTC noiseSuppression so soft Indic consonants & mic startup audio aren't suppressed
        noiseSuppression: false,
        autoGainControl: true,
        ...(selectedMicId && selectedMicId !== "default" ? { deviceId: { ideal: selectedMicId } } : {}),
      };

      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: preferredAudio });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      }

      activeStreamRef.current = stream;
      setAudioStream(stream);
      refreshMicDevices();

      pcmChunksRef.current = [];
      audioChunksRef.current = [];
      micPeakRef.current = 0;
      handledByPcmRef.current = false;
      isRecordingRef.current = true;
      setIsRecording(true);

      // 1. Primary capture: Direct lossless PCM via Web Audio API (avoids Opus encode->decode drops)
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        try {
          const ctx = new AudioCtx();
          if (ctx.state === "suspended") await ctx.resume();
          pcmCtxRef.current = ctx;
          pcmSampleRateRef.current = ctx.sampleRate || 48000;
          const src = ctx.createMediaStreamSource(stream);
          const proc = ctx.createScriptProcessor(2048, 1, 1);
          const muteGain = ctx.createGain();
          muteGain.gain.value = 0;

          proc.onaudioprocess = (ev) => {
            if (!isRecordingRef.current) return;
            const input = ev.inputBuffer.getChannelData(0);
            const copy = new Float32Array(input.length);
            copy.set(input);
            pcmChunksRef.current.push(copy);

            let sq = 0;
            for (let i = 0; i < input.length; i++) sq += input[i] * input[i];
            const rms = Math.sqrt(sq / input.length);
            if (rms > micPeakRef.current) micPeakRef.current = rms;
            const pct = Math.min(100, Math.round(Math.log10(1 + rms * 65) * 60));
            setMicLevel(pct);
          };

          src.connect(proc);
          proc.connect(muteGain);
          muteGain.connect(ctx.destination);
          pcmNodeRef.current = { src, proc, muteGain };
        } catch (pcmErr) {
          console.warn("Direct PCM capture fallback to MediaRecorder:", pcmErr);
        }
      }

      // 2. Redundant backup: MediaRecorder in case AudioContext ScriptProcessor is unavailable
      if (typeof MediaRecorder !== "undefined") {
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
          if (handledByPcmRef.current) return;
          cleanupCaptureNodes();
          try {
            if (!audioChunksRef.current || audioChunksRef.current.length === 0) {
              handleSilentOrShortReason("too_short");
              return;
            }
            const rawBlob = new Blob(audioChunksRef.current, {
              type: mimeType || "audio/webm",
            });
            if (rawBlob.size < 200) {
              handleSilentOrShortReason("too_short");
              return;
            }
            const { blob: wavBlob, reason } = await convertBlobToWav(rawBlob);
            if (reason === "silent" || reason === "too_short" || !wavBlob) {
              handleSilentOrShortReason(reason || "silent");
              return;
            }
            await submitAudio(wavBlob);
          } catch (err) {
            console.error("Audio fallback submission failed:", err);
            setIsLoading(false);
          }
        };

        recorder.start(200);
      }
    } catch (err) {
      cleanupCaptureNodes();
      isRecordingRef.current = false;
      setIsRecording(false);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          agent: "System",
          text: `Microphone access failed: ${err.message}. Please allow microphone permission in your browser and select an active mic.`,
        },
      ]);
    } finally {
      isStartingRef.current = false;
    }
  };

  const stopRecording = async () => {
    if (!isRecordingRef.current) return;
    isRecordingRef.current = false;
    setIsRecording(false);

    const capturedPcm = pcmChunksRef.current;
    const srcRate = pcmSampleRateRef.current;
    const hasPcm = capturedPcm && capturedPcm.length > 0;

    if (hasPcm) {
      handledByPcmRef.current = true;
      try {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
          mediaRecorderRef.current.stop();
        }
      } catch {
        // Ignore recorder stop race
      }
      cleanupCaptureNodes();

      const totalLen = capturedPcm.reduce((sum, arr) => sum + arr.length, 0);
      const merged = new Float32Array(totalLen);
      let offset = 0;
      for (const chunk of capturedPcm) {
        merged.set(chunk, offset);
        offset += chunk.length;
      }

      const pcm16k = downsampleFloat32(merged, srcRate, 16000);
      const { blob: wavBlob, reason } = processVoicePcm(pcm16k, 16000);
      if (reason || !wavBlob) {
        handleSilentOrShortReason(reason || "silent");
        return;
      }
      await submitAudio(wavBlob);
    } else if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    } else {
      cleanupCaptureNodes();
      handleSilentOrShortReason("too_short");
    }
  };

  const parseSafeJson = async (res) => {
    const rawText = await res.text();
    let data;
    try {
      data = JSON.parse(rawText);
    } catch {
      throw new Error(
        res.ok
          ? "Invalid JSON response from server"
          : `Server returned HTTP ${res.status}. Backend may be warming up — please retry.`
      );
    }
    if (!res.ok && !data.reply) {
      throw new Error(data.message || data.error || `Server error (${res.status})`);
    }
    return data;
  };

  const submitAudio = async (audioBlob) => {
    setIsLoading(true);
    const activeSid = sessionId || localStorage.getItem("finassist_session_id") || "default";
    const filename = audioBlob.type?.includes("webm")
      ? "user_voice.webm"
      : audioBlob.type?.includes("mp4")
      ? "user_voice.m4a"
      : "user_voice.wav";
    const formData = new FormData();
    formData.append("audio", audioBlob, filename);
    formData.append("sessionId", activeSid);
    formData.append("language", language);

    try {
      const res = await fetch(`${BACKEND_URL}/api/voice/process-audio`, {
        method: "POST",
        body: formData,
      });

      const data = await parseSafeJson(res);
      handleAssistantResponse(data);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          agent: "System",
          text: `Voice processing error: ${err.message}`,
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
      const activeSid = sessionId || localStorage.getItem("finassist_session_id") || "default";
      const res = await fetch(`${BACKEND_URL}/api/voice/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript: text,
          sessionId: activeSid,
          language,
        }),
      });

      const data = await parseSafeJson(res);
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

  const clearChat = async () => {
    setMessages([]);
    setPendingConfirmation(false);
    setLatencies(null);
    setActiveAgentName(null);
    setActiveActivity(null);
    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    await handleResetMemory();
    const newSid = "session_" + Math.random().toString(36).substring(2, 10);
    localStorage.setItem("finassist_session_id", newSid);
    setSessionId(newSid);
    loadMemory(newSid);
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

          {/* Microphone Device Selector */}
          {micDevices.length > 0 && (
            <div className="relative hidden sm:block max-w-[165px]">
              <select
                value={selectedMicId}
                onChange={(e) => {
                  setSelectedMicId(e.target.value);
                  localStorage.setItem("finassist_mic_id", e.target.value);
                }}
                title="Select Microphone Input Device"
                className="w-full appearance-none bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 text-xs font-medium border border-white/[0.1] rounded-lg pl-2.5 pr-6 py-1.5 outline-none cursor-pointer transition truncate"
              >
                <option value="default" className="bg-slate-900">Default Mic</option>
                {micDevices.map((d, idx) => (
                  <option key={d.deviceId || idx} value={d.deviceId} className="bg-slate-900">
                    {d.label || `Microphone ${idx + 1}`}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
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
          {/* Active Audio Waveform & Live Mic Signal Meter */}
          {isRecording && (
            <div className="flex flex-col items-center gap-1.5 mb-3 animate-fade-in">
              <div className="flex items-center justify-center gap-3">
                <AudioWaveform isRecording={isRecording} stream={audioStream} />
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/90 border border-white/[0.1] text-[11px] font-mono">
                  <span className="text-slate-400">Mic</span>
                  <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-75 ${micLevel > 12 ? "bg-emerald-400" : "bg-amber-400"}`}
                      style={{ width: `${Math.max(4, micLevel)}%` }}
                    />
                  </div>
                </div>
              </div>
              {lowSignalWarning && (
                <span className="text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
                  No mic signal detected — check hardware mute or pick another Mic above
                </span>
              )}
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
