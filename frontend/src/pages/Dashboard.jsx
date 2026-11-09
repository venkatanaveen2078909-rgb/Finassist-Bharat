import React from "react";
import Sidebar from "../components/dashboard/Sidebar";
import WelcomeCard from "../components/dashboard/WelcomeCard";
import DynamicDashboard from "../components/dashboard/DynamicDashboard";

function Dashboard() {
  return (
    <div className="flex min-h-screen bg-[#030712] text-slate-100 font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      <Sidebar />

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-8">
        <WelcomeCard />
        <DynamicDashboard />
      </main>
    </div>
  );
}

export default Dashboard;
