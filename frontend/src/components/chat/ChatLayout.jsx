import React, { useState } from "react";
import ChatSidebar from "./ChatSidebar";
import ChatArea from "./ChatArea";

function ChatLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#030712] text-slate-100">
      {/* Sleek Collapsible Sidebar */}
      <ChatSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      {/* Main Full-Width Chat Canvas */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <ChatArea onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} isSidebarOpen={sidebarOpen} />
      </div>
    </div>
  );
}

export default ChatLayout;
