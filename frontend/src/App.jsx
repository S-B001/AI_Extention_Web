import React, { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import DashboardPage from "./pages/Dashboard";
import SavedPage from "./pages/Saved";
import ChatModal from "./components/ChatModal";
import Login from "./pages/Login";

export default function App() {
  const [search, setSearch] = useState("");
  const [view, setView] = useState("dashboard");
  const [activeArticle, setActiveArticle] = useState(null);
  const [userId, setUserId] = useState(() => localStorage.getItem("scraper_userId") || "");

  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

  // keep localStorage synced
  useEffect(() => {
    if (userId) localStorage.setItem("scraper_userId", userId);
    else localStorage.removeItem("scraper_userId");
  }, [userId]);

  // logout handler (passed to Sidebar)
  const handleLogout = () => {
    setUserId("");
    setView("dashboard");
    setSearch("");
    setActiveArticle(null);
    // localStorage cleared by effect
  };

  // show login if no userId
  if (!userId) {
    return <Login backendUrl={backendUrl} onLogin={(id) => setUserId(id)} />;
  }

  return (
    <div className="flex h-screen bg-[#0b1020] text-gray-200 font-inter">
      <Sidebar active={view} setActive={setView} onLogout={handleLogout} />

      <div className="flex-1 flex flex-col">
        <Topbar search={search} setSearch={setSearch} onSearchClick={() => {}} />
        <div className="flex-1 overflow-auto">
          {view === "dashboard" && (
            <DashboardPage
              onOpenChat={(a) => setActiveArticle(a)}
              backendUrl={backendUrl}
              search={search}
              userId={userId}
            />
          )}
          {view === "saved" && (
            <SavedPage
              onOpenChat={(a) => setActiveArticle(a)}
              backendUrl={backendUrl}
              search={search}
              userId={userId}
            />
          )}
        </div>
      </div>

      {activeArticle && (
        <ChatModal
          article={activeArticle}
          onClose={() => setActiveArticle(null)}
          backendUrl={backendUrl}
        />
      )}
    </div>
  );
}
