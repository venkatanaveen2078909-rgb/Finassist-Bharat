import { useState } from "react";
import { Send } from "lucide-react";

function ChatInput({ onSend }) {
  const [input, setInput] = useState("");

  const handleSubmit = () => {
    if (!input.trim()) return;

    onSend(input);
    setInput("");
  };

  return (
    <div className="border-t border-slate-800 bg-slate-900 p-5">
      <div className="flex items-center gap-4">
        <input
          type="text"
          value={input}
          placeholder="Ask anything about banking..."
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSubmit();
            }
          }}
          className="flex-1 rounded-xl bg-slate-800 px-5 py-4 text-white outline-none focus:ring-2 focus:ring-cyan-500"
        />

        <button
          onClick={handleSubmit}
          className="rounded-xl bg-cyan-500 p-4 text-white hover:bg-cyan-600"
        >
          <Send size={22} />
        </button>
      </div>
    </div>
  );
}

export default ChatInput;