import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BACKEND_URL } from "../config/api.js";
import Sidebar from "../components/dashboard/Sidebar";
import {
  FileText,
  Download,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  PieChart,
  Wallet,
  Landmark,
  ArrowRight,
  RefreshCw,
  Sparkles,
  Info,
} from "lucide-react";

export default function Reports() {
  const navigate = useNavigate();

  // Profile data
  const [income, setIncome] = useState(75000);
  const [expenses, setExpenses] = useState(32000);
  const [emi, setEmi] = useState(10000);
  const [savings, setSavings] = useState(180000);
  const [goal, setGoal] = useState("Retirement Wealth / Emergency Fund");
  const [loading, setLoading] = useState(true);

  const formatINR = (val) => `₹${Math.round(val || 0).toLocaleString("en-IN")}`;

  // Fetch from chat memory if exists
  useEffect(() => {
    const fetchMemory = async () => {
      try {
        const sid = localStorage.getItem("finassist_session_id") || "default";
        const res = await fetch(
          `${BACKEND_URL}/api/chat/memory?sessionId=${encodeURIComponent(sid)}`
        );
        const data = await res.json();
        if (data && data.memory) {
          if (data.memory.income > 0) setIncome(Number(data.memory.income));
          if (data.memory.expenses > 0) setExpenses(Number(data.memory.expenses));
          if (data.memory.emi > 0) setEmi(Number(data.memory.emi));
          if (data.memory.goal) setGoal(data.memory.goal);
        }
      } catch (err) {
        console.warn("Could not load backend memory:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMemory();
  }, []);

  // 1. 50/30/20 Rule Calculations
  const idealNeeds = income * 0.5;
  const idealWants = income * 0.3;
  const idealSavings = income * 0.2;

  const actualNeeds = expenses;
  const actualDebt = emi;
  const actualSurplus = Math.max(0, income - expenses - emi);
  const savingsRate = income > 0 ? ((actualSurplus / income) * 100).toFixed(1) : 0;

  // 2. RBI 50% FOIR (Fixed Obligation to Income Ratio)
  const maxPermissibleEmi = income * 0.5;
  const currentFoir = income > 0 ? ((emi / income) * 100).toFixed(1) : 0;
  const availableEmiHeadroom = Math.max(0, maxPermissibleEmi - emi);

  // Maximum loan borrowing capacity at 9.5% p.a. for 5 years based on headroom
  const r = 9.5 / 12 / 100;
  const n = 60; // 5 years
  const maxLoanCapacity =
    availableEmiHeadroom > 0
      ? (availableEmiHeadroom * (Math.pow(1 + r, n) - 1)) / (r * Math.pow(1 + r, n))
      : 0;

  // 3. Emergency Runway
  const monthlyBurn = expenses + emi;
  const emergencyRunwayMonths = monthlyBurn > 0 ? (savings / monthlyBurn).toFixed(1) : 0;
  const recommendedEmergencyFund = monthlyBurn * 6;

  // 4. Financial Health Score (0 - 100)
  const computeHealthScore = () => {
    let score = 50;
    // Savings rate component (max +25)
    if (savingsRate >= 20) score += 25;
    else if (savingsRate >= 10) score += 15;
    else if (savingsRate > 0) score += 5;
    else score -= 15;

    // FOIR debt component (max +25)
    if (currentFoir <= 30) score += 25;
    else if (currentFoir <= 45) score += 15;
    else if (currentFoir <= 50) score += 5;
    else score -= 20;

    // Emergency runway component (max +25)
    if (emergencyRunwayMonths >= 6) score += 25;
    else if (emergencyRunwayMonths >= 3) score += 15;
    else score += 5;

    return Math.min(100, Math.max(10, score));
  };
  const healthScore = computeHealthScore();

  // Export dossier report download
  const downloadDossier = () => {
    const reportText = `=====================================================
FINASSIST BHARAT - COMPREHENSIVE FINANCIAL DOSSIER
Generated: ${new Date().toLocaleString("en-IN")}
Session ID: ${localStorage.getItem("finassist_session_id") || "default"}
=====================================================

1. MONTHLY CASHFLOW SUMMARY
-----------------------------------------------------
Gross Monthly Income   : ${formatINR(income)}
Living Expenses        : ${formatINR(expenses)}
Committed EMIs         : ${formatINR(emi)}
Net Monthly Surplus    : ${formatINR(actualSurplus)}
Effective Savings Rate : ${savingsRate}%

2. 50/30/20 BUDGET BENCHMARKING
-----------------------------------------------------
Recommended Needs (50%)     : ${formatINR(idealNeeds)}
Your Actual Living Expenses : ${formatINR(actualNeeds)} (${income > 0 ? ((actualNeeds / income) * 100).toFixed(1) : 0}%)
Recommended Wants (30%)     : ${formatINR(idealWants)}
Recommended Savings (20%)   : ${formatINR(idealSavings)}
Budget Discipline Status    : ${actualNeeds <= idealNeeds ? "OPTIMAL (Within 50% Needs)" : "HIGH SPENDING (Exceeds 50% Needs)"}

3. RBI 50% FOIR LOAN UNDERWRITING CAPACITY
-----------------------------------------------------
Max Permissible Monthly Debt : ${formatINR(maxPermissibleEmi)} (50% FOIR cap)
Current Debt Servicing       : ${formatINR(emi)} (${currentFoir}% FOIR)
Permissible New EMI Headroom : ${formatINR(availableEmiHeadroom)}/month
Estimated Max Loan Capacity  : ${formatINR(maxLoanCapacity)} (@ 9.5% p.a., 5-Year Tenure)
Debt Underwriting Grade      : ${currentFoir > 50 ? "CRITICAL (Over 50% FOIR)" : currentFoir > 35 ? "MODERATE EXPOSURE" : "EXCELLENT (Low Risk)"}

4. LIQUIDITY & EMERGENCY READINESS
-----------------------------------------------------
Current Liquid Savings      : ${formatINR(savings)}
Monthly Living Burn Rate    : ${formatINR(monthlyBurn)}
Emergency Cushion Runway    : ${emergencyRunwayMonths} Months
Recommended 6-Month Reserve : ${formatINR(recommendedEmergencyFund)}
Readiness Status            : ${emergencyRunwayMonths >= 6 ? "SECURED (6+ Months)" : "ACCUMULATE MORE (Below 6 Months)"}

5. OVERALL FINANCIAL HEALTH SCORE
-----------------------------------------------------
Composite Health Score: ${healthScore} / 100 (${healthScore >= 80 ? "Tier 1: Excellent" : healthScore >= 60 ? "Tier 2: Good" : "Tier 3: Needs Attention"})

DISCLAIMER:
This dossier is generated by FinAssist AI deterministic financial algorithms for informational purposes only. Not official financial advice.
=====================================================`;

    const blob = new Blob([reportText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `FinAssist_Dossier_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex min-h-screen bg-[#030712] text-slate-100 font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      <Sidebar />

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl">
        {/* Header Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-indigo-950/50 border border-emerald-500/20 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Deterministic RBI FOIR &amp; 50/30/20 Standards</span>
              </div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">
                Financial Planning &amp; Underwriting Dossier
              </h1>
              <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
                Real-time financial diagnosis synchronized with your live voice assistant session.
                Verify 50% FOIR debt capacity, savings velocity, and download your export dossier.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <button
                onClick={downloadDossier}
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 transition active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>Download Dossier</span>
              </button>

              <button
                onClick={() => navigate("/chat")}
                className="flex items-center justify-center gap-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] px-5 py-3 text-sm font-semibold text-slate-300 hover:text-white transition"
              >
                <span>Ask Voice Agent</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Live Profile Quick Tuner */}
        <div className="rounded-2xl border border-white/[0.08] bg-slate-900/60 backdrop-blur-md p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Interactive Financial Variables (Live Synced with Voice Memory)</span>
            </h3>
            {loading && <RefreshCw className="w-4 h-4 text-indigo-400 animate-spin" />}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-white/[0.05]">
              <label className="text-xs text-slate-400 font-medium">Monthly Net Income</label>
              <div className="flex items-center gap-1 mt-1.5">
                <span className="text-slate-400 font-bold">₹</span>
                <input
                  type="number"
                  step="5000"
                  value={income}
                  onChange={(e) => setIncome(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-transparent font-bold text-lg text-emerald-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-white/[0.05]">
              <label className="text-xs text-slate-400 font-medium">Monthly Living Expenses</label>
              <div className="flex items-center gap-1 mt-1.5">
                <span className="text-slate-400 font-bold">₹</span>
                <input
                  type="number"
                  step="2000"
                  value={expenses}
                  onChange={(e) => setExpenses(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-transparent font-bold text-lg text-rose-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-white/[0.05]">
              <label className="text-xs text-slate-400 font-medium">Existing Committed EMIs</label>
              <div className="flex items-center gap-1 mt-1.5">
                <span className="text-slate-400 font-bold">₹</span>
                <input
                  type="number"
                  step="2000"
                  value={emi}
                  onChange={(e) => setEmi(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-transparent font-bold text-lg text-amber-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-white/[0.05]">
              <label className="text-xs text-slate-400 font-medium">Liquid Savings Reserve</label>
              <div className="flex items-center gap-1 mt-1.5">
                <span className="text-slate-400 font-bold">₹</span>
                <input
                  type="number"
                  step="10000"
                  value={savings}
                  onChange={(e) => setSavings(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-transparent font-bold text-lg text-cyan-400 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 4 Core Intelligence Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card 1: 50/30/20 Budget Breakdown */}
          <div className="rounded-3xl border border-white/[0.08] bg-slate-900/60 backdrop-blur-xl p-6 space-y-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <PieChart className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-bold text-white text-base">50/30/20 Budget Rule</h2>
                    <p className="text-xs text-slate-400">Gold standard wealth allocation</p>
                  </div>
                </div>
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-bold border ${
                    actualNeeds <= idealNeeds
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                  }`}
                >
                  {actualNeeds <= idealNeeds ? "Within Target" : "Over Budget"}
                </span>
              </div>

              <div className="space-y-4 pt-4">
                {/* Needs */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-300">Needs (50% Target: {formatINR(idealNeeds)})</span>
                    <span className="text-rose-400">Actual: {formatINR(actualNeeds)}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        actualNeeds <= idealNeeds ? "bg-emerald-500" : "bg-rose-500"
                      }`}
                      style={{
                        width: `${Math.min(100, (actualNeeds / (income || 1)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Wants */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-300">Wants / Lifestyle (30% Target)</span>
                    <span className="text-cyan-400">{formatINR(idealWants)}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-cyan-500 transition-all duration-500"
                      style={{ width: "30%" }}
                    />
                  </div>
                </div>

                {/* Savings */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-300">Mandatory Savings (20% Target)</span>
                    <span className="text-indigo-400">{formatINR(idealSavings)}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                      style={{ width: "20%" }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 font-medium">Monthly Free Surplus</p>
                <p className="text-xl font-black text-emerald-400">{formatINR(actualSurplus)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400 font-medium">Savings Velocity</p>
                <p className="text-xl font-black text-white">{savingsRate}%</p>
              </div>
            </div>
          </div>

          {/* Card 2: RBI 50% FOIR Underwriting */}
          <div className="rounded-3xl border border-white/[0.08] bg-slate-900/60 backdrop-blur-xl p-6 space-y-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                    <Landmark className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-bold text-white text-base">RBI 50% FOIR Underwriting</h2>
                    <p className="text-xs text-slate-400">Debt servicing capacity</p>
                  </div>
                </div>
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-bold border ${
                    currentFoir <= 35
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : currentFoir <= 50
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                  }`}
                >
                  {currentFoir}% FOIR
                </span>
              </div>

              <div className="space-y-4 pt-4">
                <div className="flex justify-between items-center text-sm py-1.5 border-b border-white/[0.03]">
                  <span className="text-slate-400">Max Legal Debt Servicing:</span>
                  <span className="font-bold text-white">{formatINR(maxPermissibleEmi)}/mo</span>
                </div>
                <div className="flex justify-between items-center text-sm py-1.5 border-b border-white/[0.03]">
                  <span className="text-slate-400">Current Committed EMI:</span>
                  <span className="font-bold text-amber-400">{formatINR(emi)}/mo</span>
                </div>
                <div className="flex justify-between items-center text-sm py-1.5 border-b border-white/[0.03]">
                  <span className="text-slate-400">Free Borrowing Headroom:</span>
                  <span className="font-bold text-emerald-400">{formatINR(availableEmiHeadroom)}/mo</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/40 to-slate-900 border border-indigo-500/20 space-y-1.5">
              <p className="text-xs font-semibold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Estimated Borrowing Capacity</span>
              </p>
              <p className="text-2xl font-black text-white">{formatINR(maxLoanCapacity)}</p>
              <p className="text-[11px] text-slate-400">
                At 9.5% reducing interest over a 5-year loan tenure.
              </p>
            </div>
          </div>

          {/* Card 3: Emergency Runway & Health Score */}
          <div className="rounded-3xl border border-white/[0.08] bg-slate-900/60 backdrop-blur-xl p-6 space-y-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-bold text-white text-base">Emergency Runway</h2>
                    <p className="text-xs text-slate-400">Liquidity &amp; resilience buffer</p>
                  </div>
                </div>
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-bold border ${
                    emergencyRunwayMonths >= 6
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                  }`}
                >
                  {emergencyRunwayMonths} Months
                </span>
              </div>

              <div className="space-y-4 pt-4">
                <div className="flex justify-between items-center text-sm py-1.5 border-b border-white/[0.03]">
                  <span className="text-slate-400">Monthly Burn (Exp + EMI):</span>
                  <span className="font-bold text-white">{formatINR(monthlyBurn)}/mo</span>
                </div>
                <div className="flex justify-between items-center text-sm py-1.5 border-b border-white/[0.03]">
                  <span className="text-slate-400">Ideal 6-Month Reserve:</span>
                  <span className="font-bold text-slate-200">{formatINR(recommendedEmergencyFund)}</span>
                </div>
                <div className="flex justify-between items-center text-sm py-1.5 border-b border-white/[0.03]">
                  <span className="text-slate-400">Active Liquid Savings:</span>
                  <span className="font-bold text-cyan-400">{formatINR(savings)}</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 font-medium">Digital Financial Score</p>
                <p className="text-2xl font-black text-white">{healthScore} / 100</p>
              </div>
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center font-extrabold text-lg border ${
                  healthScore >= 75
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    : healthScore >= 50
                    ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                    : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                }`}
              >
                {healthScore >= 80 ? "A+" : healthScore >= 65 ? "A" : healthScore >= 50 ? "B" : "C"}
              </div>
            </div>
          </div>
        </div>

        {/* Actionable Insights & Next Steps */}
        <div className="rounded-3xl border border-white/[0.08] bg-slate-900/60 backdrop-blur-xl p-6 sm:p-8 space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>AI Multi-Agent Financial Directives</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/[0.05] space-y-2">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                Investment Agent Directive
              </span>
              <p className="text-sm text-slate-300 leading-relaxed">
                Allocate at least <strong>{formatINR(actualSurplus * 0.5)}</strong> of your monthly surplus
                into low-cost index SIPs yielding ~12% compounding over 10+ years.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/[0.05] space-y-2">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                Loan Underwriting Directive
              </span>
              <p className="text-sm text-slate-300 leading-relaxed">
                Your debt ratio is <strong>{currentFoir}%</strong>. You have headroom for an additional EMI of up to{" "}
                <strong>{formatINR(availableEmiHeadroom)}/month</strong> before hitting the 50% ceiling.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/[0.05] space-y-2">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                Liquidity Directive
              </span>
              <p className="text-sm text-slate-300 leading-relaxed">
                Your emergency fund currently lasts <strong>{emergencyRunwayMonths} months</strong>.
                {emergencyRunwayMonths >= 6
                  ? " Excellent liquidity cushion maintained."
                  : ` Aim to build an additional ${formatINR(Math.max(0, recommendedEmergencyFund - savings))} in liquid instruments.`}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
