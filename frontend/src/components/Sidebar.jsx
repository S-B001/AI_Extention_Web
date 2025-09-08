import React from "react";
import { LayoutDashboard, Bookmark, LogOut } from "lucide-react";
import SbIcon from "../../public/sb-icon.png"; 

export default function Sidebar({ active, setActive, onLogout }) {
  const itemClass = (key) =>
    `flex items-center gap-3 px-3 py-2 rounded-lg w-full transition ${
      active === key
        ? "bg-gradient-to-r from-[#2a2f47] to-[#1b1f33] text-white shadow"
        : "text-gray-400 hover:text-white hover:bg-[#0f1724]"
    }`;

  return (
    <aside className="w-64 bg-[#071027] border-r border-[#111827] p-6 flex flex-col">
      <div className="mb-8 flex items-center gap-3">
          {/* Left icon */}
          <img src="/sb-icon.png" alt="ScraperPro AI" className="w-10 h-10" />

          {/* Right text */}
          <div>
            <div className="text-2xl font-bold text-white">ScrapeAI</div>
            <div className="text-xs text-gray-400 mt-1">Your AI-powered workspacee</div>
          </div>
        </div>


      <nav className="flex-1 space-y-2">
        <button className={itemClass("dashboard")} onClick={() => setActive("dashboard")}>
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </button>

        <button className={itemClass("saved")} onClick={() => setActive("saved")}>
          <Bookmark size={18} />
          <span>Saved Content</span>
        </button>
      </nav>

      <div className="mt-auto">
        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg w-full text-gray-500 hover:text-white hover:bg-[#0f1724]"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
