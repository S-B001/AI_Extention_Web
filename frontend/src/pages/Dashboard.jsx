import React, { useEffect, useState } from "react";
import Card from "../components/Card";

export default function DashboardPage({ onOpenChat, backendUrl, search, userId }) {
  const [recent, setRecent] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;
    const fetchUserRows = async () => {
      setLoading(true);
      try {
        const resp = await fetch(`${backendUrl}/api/search?user_id=${encodeURIComponent(userId)}`);
        const data = await resp.json();
        const list = data.results || [];

        // filter only logged-in user's rows
        // const userRows = list.filter((row) => row.user_id === userId);

        // sort by created_at desc
        list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        // take latest 6
        const latest6 = list.slice(0, 6);

        setRecent(latest6);
        setFiltered(latest6);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRows();
  }, [backendUrl, userId]);

  useEffect(() => {
    if (!search) {
      setFiltered(recent);
    } else {
      const q = search.toLowerCase();
      setFiltered(
        recent.filter((article) => (article.title || "").toLowerCase().includes(q))
      );
    }
  }, [search, recent]);

  return (
    <main className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-semibold text-white">Dashboard</h1>
          <p className="text-sm text-gray-400 mt-1">
            Welcome back — here are your recent scrapes.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-gray-400">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="text-gray-400">
          {search ? "No results found." : "No scraped content yet."}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((a) => (
            <Card key={a.id} article={a} onOpen={() => onOpenChat(a)} />
          ))}
        </div>
      )}
    </main>
  );
}
