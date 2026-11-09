import AgentExecutionPanel from "./AgentExecutionPanel";

function MessageBubble({ sender, text, agent }) {
  const isUser = sender === "user";

  return (
    <div
      className={`flex mb-4 ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-md ${
          isUser
            ? "bg-blue-600 text-white"
            : "bg-white text-gray-900 border"
        }`}
      >
        {!isUser && agent && (
          <div className="mb-2 font-semibold text-blue-600">
            🤖 {agent}
          </div>
        )}

        {!isUser && agent === "Multi-Agent Orchestrator" && (
          <AgentExecutionPanel />
        )}

        <div className="whitespace-pre-line text-sm">
          {text || "No response available"}
        </div>
      </div>
    </div>
  );
}

export default MessageBubble;