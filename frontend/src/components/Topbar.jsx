import React from "react";
import { LucideSearch } from "lucide-react";

export default function Topbar({ search, setSearch, onSearchClick }) {
  return (
    <header className="h-16 bg-transparent border-b border-[#111827] px-6 flex items-center justify-between">
      <div className="flex items-center gap-3 w-full max-w-3xl relative">
        <LucideSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input
          type="text"
          className="w-full bg-[#0b1220] border border-[#1e2a44] px-10 py-2 rounded-xl text-gray-200 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Search articles..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSearchClick()}
        />
      </div>

      <div className="flex items-center gap-3">
        <div className="text-sm text-gray-400">Hello, user</div>
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#334155] to-[#0f1724] flex items-center justify-center text-white">
          U
        </div>
      </div>
    </header>
  );
}