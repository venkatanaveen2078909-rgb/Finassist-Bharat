import React from "react";
import VoiceAssistant from "./VoiceAssistant.jsx";

function ChatWindow({ onToggleSidebar, isSidebarOpen }) {
  return (
    <main className="flex-1 flex flex-col h-full w-full overflow-hidden bg-[#030712] relative">
      <VoiceAssistant onToggleSidebar={onToggleSidebar} isSidebarOpen={isSidebarOpen} />
    </main>
  );
}

export default ChatWindow;
