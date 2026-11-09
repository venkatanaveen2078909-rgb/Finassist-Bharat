function StatCard({ icon, title, value }) {
  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 hover:border-cyan-500 transition">
      <div className="text-4xl mb-4">{icon}</div>

      <h3 className="text-slate-400">{title}</h3>

      <h2 className="mt-2 text-3xl font-bold text-white">
        {value}
      </h2>
    </div>
  );
}

export default StatCard;