import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Home } from "lucide-react";

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#030712] flex flex-col items-center justify-center text-slate-100 p-6 text-center">
      <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6">
        <Home className="w-8 h-8" />
      </div>

      <h1 className="text-6xl font-black text-white tracking-tight mb-2">404</h1>
      <h2 className="text-xl font-bold text-slate-300 mb-3">Page Not Found</h2>
      <p className="text-sm text-slate-400 max-w-md mb-8">
        The financial page or module you are looking for does not exist or has been relocated.
      </p>

      <button
        onClick={() => navigate("/dashboard")}
        className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition active:scale-95"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Dashboard</span>
      </button>
    </div>
  );
}

export default NotFound;
