function QuickActions() {
  return (
    <div className="mt-10">
      <h2 className="text-3xl font-bold text-white mb-6">
        Quick Banking Services
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          "💳 Credit Cards",
          "🏦 Savings",
          "🏠 Home Loans",
          "📈 Investments",
          "💰 Fixed Deposits",
          "🛡 Insurance",
          "🚗 Vehicle Loans",
          "📊 Budget Planner",
        ].map((item) => (
          <div
            key={item}
            className="rounded-2xl bg-slate-900 border border-slate-800 p-6 text-white hover:border-cyan-500 hover:scale-105 transition cursor-pointer"
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

export default QuickActions;