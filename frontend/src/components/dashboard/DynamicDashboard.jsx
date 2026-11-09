import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Wallet,
  ArrowUpCircle,
  ArrowDownCircle,
  Landmark,
  TrendingUp,
  Sliders,
  Sparkles,
  PieChart,
  ShieldCheck,
  CheckCircle2,
  Mic,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

export default function DynamicDashboard() {
  const navigate = useNavigate();

  // 1. Session Profile State from backend
  const [profile, setProfile] = useState({
    income: 0,
    expenses: 0,
    emi: 0,
    goal: null,
  });
  const [loadingProfile, setLoadingProfile] = useState(true);

  // 2. Interactive EMI Calculator State
  const [emiPrincipal, setEmiPrincipal] = useState(500000);
  const [emiRate, setEmiRate] = useState(9.5);
  const [emiYears, setEmiYears] = useState(5);

  // 3. Interactive SIP Calculator State
  const [sipAmount, setSipAmount] = useState(5000);
  const [sipRate, setSipRate] = useState(12);
  const [sipYears, setSipYears] = useState(10);

  const formatINR = (val) => `₹${Math.round(val || 0).toLocaleString("en-IN")}`;

  const fetchProfile = async () => {
    try {
      const sid = localStorage.getItem("finassist_session_id") || "default";
      const res = await fetch(`http://localhost:5001/api/chat/memory?sessionId=${encodeURIComponent(sid)}`);
      const data = await res.json();
      if (data && data.memory) {
        setProfile({
          income: Number(data.memory.income) || 0,
          expenses: Number(data.memory.expenses) || 0,
          emi: Number(data.memory.emi) || 0,
          goal: data.memory.goal || null,
        });
      }
    } catch (e) {
      console.warn("Profile fetch error:", e);
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Deterministic EMI formula
  const monthlyRate = emiRate / 12 / 100;
  const totalMonths = emiYears * 12;
  const calculatedEmi =
    monthlyRate > 0
      ? Math.round(
          (emiPrincipal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
            (Math.pow(1 + monthlyRate, totalMonths) - 1)
        )
      : Math.round(emiPrincipal / totalMonths);
  const totalEmiPayment = calculatedEmi * totalMonths;
  const totalEmiInterest = Math.max(0, totalEmiPayment - emiPrincipal);
  const principalRatio = totalEmiPayment > 0 ? Math.round((emiPrincipal / totalEmiPayment) * 100) : 100;

  // Deterministic SIP formula (Monthly compounding annuity)
  const sipMonthlyRate = sipRate / 12 / 100;
  const sipTotalMonths = sipYears * 12;
  const sipTotalInvested = sipAmount * sipTotalMonths;
  const sipMaturity =
    sipMonthlyRate > 0
      ? Math.round(
          sipAmount *
            ((Math.pow(1 + sipMonthlyRate, sipTotalMonths) - 1) / sipMonthlyRate) *
            (1 + sipMonthlyRate)
        )
      : sipTotalInvested;
  const sipEstimatedGain = Math.max(0, sipMaturity - sipTotalInvested);
  const sipGainRatio = sipMaturity > 0 ? Math.round((sipEstimatedGain / sipMaturity) * 100) : 0;

  // Profile Savings metrics
  const netSurplus = profile.income - profile.expenses - profile.emi;
  const savingsRate = profile.income > 0 ? Math.round((netSurplus / profile.income) * 100) : 0;
  const isHealthySavings = savingsRate >= 25;
  const isModerateSavings = savingsRate >= 10 && savingsRate < 25;

  return (
    <div className="space-y-8 mt-6">
      {/* SECTION 1: Live Profile Financial Snapshot */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-wide">
              Financial Health Snapshot
            </h2>
            <p className="text-xs text-slate-400">
              Live session memory verified by FinAssist State Machine
            </p>
          </div>
          <button
            onClick={fetchProfile}
            title="Refresh Memory"
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Income Card */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/[0.08] backdrop-blur-xl relative overflow-hidden group hover:border-emerald-500/40 transition">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Monthly Income
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <ArrowUpCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-white tracking-tight">
              {profile.income > 0 ? formatINR(profile.income) : "₹0"}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {profile.income > 0 ? "Confirmed via Voice Memory" : "Speak: 'My income is 50000'"}
            </p>
          </div>

          {/* Expenses Card */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/[0.08] backdrop-blur-xl relative overflow-hidden group hover:border-rose-500/40 transition">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Monthly Expenses
              </span>
              <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400">
                <ArrowDownCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-rose-300 tracking-tight">
              {profile.expenses > 0 ? formatINR(profile.expenses) : "₹0"}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {profile.expenses > 0 ? "Living & Household Costs" : "Speak: 'My expenses are 20000'"}
            </p>
          </div>

          {/* Active EMI Obligations */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/[0.08] backdrop-blur-xl relative overflow-hidden group hover:border-amber-500/40 transition">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                EMI Obligations
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-amber-300 tracking-tight">
              {profile.emi > 0 ? formatINR(profile.emi) : "₹0"}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {profile.emi > 0 ? "Existing Loan Commitments" : "Zero active obligations"}
            </p>
          </div>

          {/* Net Monthly Savings & Health Gauge */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/[0.08] backdrop-blur-xl relative overflow-hidden group hover:border-cyan-500/40 transition">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Net Monthly Surplus
              </span>
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                <PieChart className="w-4 h-4" />
              </div>
            </div>
            <div className={`text-2xl font-black tracking-tight ${netSurplus >= 0 ? "text-cyan-300" : "text-rose-400"}`}>
              {formatINR(netSurplus)}
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Savings Rate: {savingsRate}%</span>
              <span
                className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
                  isHealthySavings
                    ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                    : isModerateSavings
                    ? "bg-amber-500/10 text-amber-300 border border-amber-500/20"
                    : "bg-rose-500/10 text-rose-300 border border-rose-500/20"
                }`}
              >
                {isHealthySavings ? "Healthy" : isModerateSavings ? "Moderate" : "Needs Care"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Dynamic Interactive Financial Calculators */}
      <div>
        <div className="mb-4">
          <h2 className="text-xl font-bold text-white tracking-wide">
            Interactive Financial Simulators
          </h2>
          <p className="text-xs text-slate-400">
            Real-time deterministic calculations mirroring the Voice Agent's tools
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* SIMULATOR 1: Live Loan EMI Calculator */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/[0.08] backdrop-blur-xl shadow-xl flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                    <Landmark className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">Loan EMI Simulator</h3>
                    <p className="text-[11px] text-slate-400">Reducing Balance Compound Annuity</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate("/chat")}
                  className="flex items-center gap-1 text-[11px] font-semibold text-blue-400 hover:text-blue-300 transition"
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>Ask in Voice</span>
                </button>
              </div>

              {/* Live Output Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/60 to-slate-950 border border-blue-500/30 mb-6 flex items-baseline justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Calculated Monthly EMI
                  </span>
                  <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                    {formatINR(calculatedEmi)}
                  </span>
                  <span className="text-xs text-slate-400 ml-1">/ month</span>
                </div>
                <div className="text-right text-xs">
                  <span className="text-slate-400 block text-[11px]">Total Interest</span>
                  <span className="font-bold text-amber-300">{formatINR(totalEmiInterest)}</span>
                </div>
              </div>

              {/* Sliders */}
              <div className="space-y-4 text-xs">
                {/* Principal Slider */}
                <div>
                  <div className="flex justify-between font-medium mb-1.5">
                    <span className="text-slate-400">Loan Amount (Principal)</span>
                    <span className="text-white font-bold">{formatINR(emiPrincipal)}</span>
                  </div>
                  <input
                    type="range"
                    min="50000"
                    max="10000000"
                    step="50000"
                    value={emiPrincipal}
                    onChange={(e) => setEmiPrincipal(Number(e.target.value))}
                    className="w-full accent-blue-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>₹50k</span>
                    <span>₹50 Lakh</span>
                    <span>₹1 Crore</span>
                  </div>
                </div>

                {/* Interest Rate Slider */}
                <div>
                  <div className="flex justify-between font-medium mb-1.5">
                    <span className="text-slate-400">Interest Rate (% p.a.)</span>
                    <span className="text-white font-bold">{emiRate}%</span>
                  </div>
                  <input
                    type="range"
                    min="6"
                    max="18"
                    step="0.25"
                    value={emiRate}
                    onChange={(e) => setEmiRate(Number(e.target.value))}
                    className="w-full accent-blue-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>6% (Home Loan)</span>
                    <span>10.5% (Personal)</span>
                    <span>18%</span>
                  </div>
                </div>

                {/* Tenure Slider */}
                <div>
                  <div className="flex justify-between font-medium mb-1.5">
                    <span className="text-slate-400">Loan Tenure</span>
                    <span className="text-white font-bold">{emiYears} Years ({totalMonths} mo)</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="30"
                    step="1"
                    value={emiYears}
                    onChange={(e) => setEmiYears(Number(e.target.value))}
                    className="w-full accent-blue-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>1 Year</span>
                    <span>15 Years</span>
                    <span>30 Years</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Principal vs Interest Visual Bar */}
            <div className="pt-4 border-t border-white/[0.06]">
              <div className="flex justify-between text-[11px] text-slate-400 mb-1.5">
                <span>Principal: {principalRatio}% ({formatINR(emiPrincipal)})</span>
                <span>Interest: {100 - principalRatio}% ({formatINR(totalEmiInterest)})</span>
              </div>
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden flex">
                <div style={{ width: `${principalRatio}%` }} className="bg-blue-500 h-full" />
                <div style={{ width: `${100 - principalRatio}%` }} className="bg-amber-400 h-full" />
              </div>
            </div>
          </div>

          {/* SIMULATOR 2: Live SIP Wealth Simulator */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/[0.08] backdrop-blur-xl shadow-xl flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">SIP Wealth Simulator</h3>
                    <p className="text-[11px] text-slate-400">Monthly Compounding Mutual Fund Growth</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate("/chat")}
                  className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 transition"
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>Ask in Voice</span>
                </button>
              </div>

              {/* Live Output Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-slate-950 border border-emerald-500/30 mb-6 flex items-baseline justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Total Expected Wealth
                  </span>
                  <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                    {formatINR(sipMaturity)}
                  </span>
                </div>
                <div className="text-right text-xs">
                  <span className="text-slate-400 block text-[11px]">Estimated Wealth Gain</span>
                  <span className="font-bold text-emerald-400">+{formatINR(sipEstimatedGain)}</span>
                </div>
              </div>

              {/* Sliders */}
              <div className="space-y-4 text-xs">
                {/* Monthly Investment Slider */}
                <div>
                  <div className="flex justify-between font-medium mb-1.5">
                    <span className="text-slate-400">Monthly SIP Amount</span>
                    <span className="text-white font-bold">{formatINR(sipAmount)} / mo</span>
                  </div>
                  <input
                    type="range"
                    min="500"
                    max="100000"
                    step="500"
                    value={sipAmount}
                    onChange={(e) => setSipAmount(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>₹500</span>
                    <span>₹50,000</span>
                    <span>₹1 Lakh</span>
                  </div>
                </div>

                {/* Expected Return Slider */}
                <div>
                  <div className="flex justify-between font-medium mb-1.5">
                    <span className="text-slate-400">Expected Annual Return</span>
                    <span className="text-white font-bold">{sipRate}% p.a.</span>
                  </div>
                  <input
                    type="range"
                    min="6"
                    max="22"
                    step="0.5"
                    value={sipRate}
                    onChange={(e) => setSipRate(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>8% (Conservative)</span>
                    <span>12% (Nifty 50)</span>
                    <span>16% (Midcap)</span>
                  </div>
                </div>

                {/* Tenure Slider */}
                <div>
                  <div className="flex justify-between font-medium mb-1.5">
                    <span className="text-slate-400">Investment Horizon</span>
                    <span className="text-white font-bold">{sipYears} Years</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="30"
                    step="1"
                    value={sipYears}
                    onChange={(e) => setSipYears(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>1 Year</span>
                    <span>10 Years</span>
                    <span>30 Years</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Invested vs Returns Visual Bar */}
            <div className="pt-4 border-t border-white/[0.06]">
              <div className="flex justify-between text-[11px] text-slate-400 mb-1.5">
                <span>Invested: {formatINR(sipTotalInvested)}</span>
                <span className="text-emerald-400 font-semibold">Wealth Gain: {formatINR(sipEstimatedGain)}</span>
              </div>
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden flex">
                <div style={{ width: `${100 - sipGainRatio}%` }} className="bg-slate-500 h-full" />
                <div style={{ width: `${sipGainRatio}%` }} className="bg-gradient-to-r from-emerald-400 to-teal-400 h-full" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: Live Specialist Multi-Agent Capabilities */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/[0.08] backdrop-blur-xl">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h3 className="font-bold text-sm text-white">
              Specialized Voice Agents Ready to Assist
            </h3>
          </div>
          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            5 Online
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div
            onClick={() => navigate("/chat")}
            className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-blue-500/40 cursor-pointer transition group"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-blue-300">Loan Agent</span>
              <Landmark className="w-3.5 h-3.5 text-blue-400 group-hover:scale-110 transition" />
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Reducing EMI calculation &amp; 50% FOIR banking capacity assessment.
            </p>
          </div>

          <div
            onClick={() => navigate("/chat")}
            className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-emerald-500/40 cursor-pointer transition group"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-emerald-300">Investment Agent</span>
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition" />
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Monthly mutual fund SIP accumulation &amp; Fixed Deposit compounding.
            </p>
          </div>

          <div
            onClick={() => navigate("/chat")}
            className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-amber-500/40 cursor-pointer transition group"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-amber-300">Budget Agent</span>
              <PieChart className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition" />
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Savings rate analysis, 50/30/20 rule health evaluation, expense review.
            </p>
          </div>

          <div
            onClick={() => navigate("/chat")}
            className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-purple-500/40 cursor-pointer transition group"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-purple-300">Memory Agent</span>
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400 group-hover:scale-110 transition" />
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Explicit verbal confirmation gating before saving profile state.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

