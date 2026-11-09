import React from "react";
import ChatWindow from "./ChatWindow";

function ChatArea({ onToggleSidebar, isSidebarOpen }) {
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#030712]">
      <ChatWindow onToggleSidebar={onToggleSidebar} isSidebarOpen={isSidebarOpen} />
    </div>
  );
}

export default ChatArea;
