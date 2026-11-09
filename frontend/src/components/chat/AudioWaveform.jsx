import React, { useEffect, useRef } from "react";

export default function AudioWaveform({ isRecording, stream }) {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const audioContextRef = useRef(null);

  useEffect(() => {
    if (!isRecording) {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        audioContextRef.current.close().catch(() => {});
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let analyser;
    let dataArray;

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx && stream) {
        const audioCtx = new AudioCtx();
        audioContextRef.current = audioCtx;
        const source = audioCtx.createMediaStreamSource(stream);
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        source.connect(analyser);
        dataArray = new Uint8Array(analyser.frequencyBinCount);
      }
    } catch (e) {
      console.warn("Web Audio API visualizer fallback:", e);
    }

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const numBars = 18;
      const barWidth = 4;
      const gap = 3;
      const totalWidth = numBars * barWidth + (numBars - 1) * gap;
      const startX = (width - totalWidth) / 2;

      if (analyser && dataArray) {
        analyser.getByteFrequencyData(dataArray);
      }

      for (let i = 0; i < numBars; i++) {
        let value = 12;
        if (dataArray) {
          const dataIdx = Math.floor((i / numBars) * dataArray.length);
          value = Math.max(8, (dataArray[dataIdx] / 255) * (height - 6));
        } else {
          // Animated wave fallback
          const time = Date.now() / 150;
          value = Math.max(6, Math.sin(time + i * 0.4) * (height / 2.5) + (height / 3));
        }

        const x = startX + i * (barWidth + gap);
        const y = (height - value) / 2;

        // Gradient bar
        const gradient = ctx.createLinearGradient(0, y, 0, y + value);
        gradient.addColorStop(0, "#38bdf8"); // Sky 400
        gradient.addColorStop(0.5, "#6366f1"); // Indigo 500
        gradient.addColorStop(1, "#ec4899"); // Pink 500

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, value, [2]);
        ctx.fill();
      }
    };

    draw();

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, [isRecording, stream]);

  if (!isRecording) return null;

  return (
    <div className="flex items-center justify-center gap-2 py-1 px-3 bg-slate-900/90 rounded-full border border-blue-500/30 shadow-inner">
      <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping inline-block" />
      <canvas
        ref={canvasRef}
        width={140}
        height={26}
        className="block"
      />
      <span className="text-[11px] font-mono text-cyan-300 font-semibold tracking-wide">
        Listening...
      </span>
    </div>
  );
}

