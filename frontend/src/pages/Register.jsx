import React from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../components/auth/AuthLayout";

function Register() {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/dashboard");
  };

  return (
    <AuthLayout>
      <h1 className="mb-2 text-center text-3xl font-extrabold text-white">
        Create Your Account 🚀
      </h1>

      <p className="mb-8 text-center text-sm text-slate-400">
        Start using sovereign Indic financial intelligence
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
            Full Name
          </label>
          <input
            type="text"
            required
            defaultValue="Harshadha"
            placeholder="Your name"
            className="w-full rounded-xl border border-white/[0.08] bg-slate-950/80 px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-indigo-500 text-sm transition"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
            Email Address
          </label>
          <input
            type="email"
            required
            defaultValue="harshadha@finassist.ai"
            placeholder="name@finassist.ai"
            className="w-full rounded-xl border border-white/[0.08] bg-slate-950/80 px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-indigo-500 text-sm transition"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
            Password
          </label>
          <input
            type="password"
            required
            defaultValue="••••••••••••"
            placeholder="Create password"
            className="w-full rounded-xl border border-white/[0.08] bg-slate-950/80 px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-indigo-500 text-sm transition"
          />
        </div>

        <button
          type="submit"
          className="w-full mt-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition active:scale-95"
        >
          Create Free Account
        </button>
      </form>
    </AuthLayout>
  );
}

export default Register;
