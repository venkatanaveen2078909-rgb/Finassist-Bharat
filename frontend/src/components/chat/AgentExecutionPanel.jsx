function AgentExecutionPanel() {
  const agents = [
    "Memory Agent",
    "Budget Agent",
    "Goal Planning Agent",
    "Financial Health Agent",
  ];

  return (
    <div className="mb-4 rounded-xl border bg-white p-4 shadow-sm">
      <h3 className="mb-3 font-bold text-gray-800">
        Agent Execution Timeline
      </h3>

      {agents.map((agent, index) => (
        <div key={index} className="flex items-center gap-2 mb-2">
          <span className="text-green-600">✓</span>
          <span className="text-sm text-gray-700">{agent}</span>
        </div>
      ))}
    </div>
  );
}

export default AgentExecutionPanel;