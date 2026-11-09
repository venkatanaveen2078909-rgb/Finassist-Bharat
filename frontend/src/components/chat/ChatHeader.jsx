import { Bell, UserCircle } from "lucide-react";

function ChatHeader() {
  return (
    <header className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-6 py-4">
      <div>
        <h1 className="text-2xl font-bold text-white">
          💬 FinAssist AI
        </h1>
        <p className="text-sm text-green-400">
          ● AI Online
        </p>
      </div>

      <div className="flex items-center gap-4">
        <Bell className="text-white" />
        <UserCircle className="text-white" size={32} />
      </div>
    </header>
  );
}

export default ChatHeader;