import StatCard from "./StatCard";

const stats = [
  {
    icon: "💬",
    title: "Total Chats",
    value: "24"
  },
  {
    icon: "🤖",
    title: "AI Status",
    value: "Online"
  },
  {
    icon: "🔒",
    title: "Privacy",
    value: "100%"
  },
  {
    icon: "📈",
    title: "Accuracy",
    value: "98%"
  }
];

function Statistics() {
  return (
    <div className="mt-10">
      <h2 className="mb-6 text-3xl font-bold text-white">
        Dashboard Overview
      </h2>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <StatCard
            key={item.title}
            icon={item.icon}
            title={item.title}
            value={item.value}
          />
        ))}
      </div>
    </div>
  );
}

export default Statistics;