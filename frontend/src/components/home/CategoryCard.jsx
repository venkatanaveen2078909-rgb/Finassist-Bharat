import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

function CategoryCard({ title, description, icon: Icon, color }) {
  const navigate = useNavigate();

  return (
    <motion.div
      whileHover={{
        scale: 1.03,
        y: -6,
      }}
      onClick={() => navigate("/chat")}
      className="group rounded-3xl border border-white/[0.08] bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl cursor-pointer hover:border-indigo-500/40 transition-all flex flex-col justify-between"
    >
      <div>
        <div
          className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r ${color} shadow-lg shadow-black/40 group-hover:scale-105 transition`}
        >
          <Icon className="text-white" size={26} />
        </div>

        <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition">
          {title}
        </h3>

        <p className="mt-2 text-sm text-slate-400 leading-relaxed">
          {description}
        </p>
      </div>

      <div className="pt-4 flex items-center gap-1.5 text-xs font-semibold text-indigo-400 group-hover:translate-x-1 transition">
        <span>Consult Specialist Agent</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </div>
    </motion.div>
  );
}

export default CategoryCard;
