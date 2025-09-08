import React, { useEffect, useState } from "react";
import Card from "../components/Card";

export default function SavedPage({ onOpenChat, backendUrl, search, userId }) {
  const [saved, setSaved] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;
    const fetchUserSaved = async () => {
      setLoading(true);
      try {
        const resp = await fetch(`${backendUrl}/api/search?user_id=${encodeURIComponent(userId)}`);
        const data = await resp.json();
        const list = data.results || [];

        // filter only logged-in user's rows
        // const userRows = list.filter((row) => row.user_id === userId);

        // sort latest first
        list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        setSaved(list);
        setFiltered(list);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserSaved();
  }, [backendUrl, userId]);

  // ====== Unified Functions ======
  const handleDelete = async (id) => {
    try {
      await fetch(`${backendUrl}/api/article/${id}`, { method: "DELETE" });
      setSaved(prev => prev.filter(item => item.id !== id));
      setFiltered(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const handleToggleBookmark = async (id, newStatus) => {
    try {
      await fetch(`${backendUrl}/api/bookmark/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_bookmarked: newStatus }),
      });
      setSaved(prev => prev.map(item => item.id === id ? { ...item, is_bookmarked: newStatus } : item));
      setFiltered(prev => prev.map(item => item.id === id ? { ...item, is_bookmarked: newStatus } : item));
    } catch (err) {
      console.error("Bookmark toggle failed", err);
    }
  };



  useEffect(() => {
    if (!search) {
      setFiltered(saved);
    } else {
      const q = search.toLowerCase();
      setFiltered(
        saved.filter((article) => (article.title || "").toLowerCase().includes(q))
      );
    }
  }, [search, saved]);

  return (
    <main className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-semibold text-white">Saved</h1>
          <p className="text-sm text-gray-400 mt-1">
            All your scraped and saved content.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-gray-400">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="text-gray-400">
          {search ? "No results found." : "No saved content yet."}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((a) => (
            <Card
              key={a.id}
              article={a}
              onOpen={() => onOpenChat(a)}
              onDelete={handleDelete}          
              onToggleBookmark={handleToggleBookmark} 
            />
          ))}
        </div>
      )}
    </main>
  );
}
