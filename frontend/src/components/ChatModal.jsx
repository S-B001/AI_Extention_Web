import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { X, Send, Loader2 } from "lucide-react";

export default function ChatModal({ article, onClose, backendUrl }) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]); // {role, text, sources?}
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    // reset when article changes
    setMessages([{ role: "assistant", text: `You are now chatting about: "${article.title || article.url}"` }]);
    setQuestion("");
  }, [article]);

  useEffect(() => {
    // scroll to bottom
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const ask = async () => {
    if (!question.trim()) return;
    const q = question.trim();
    setMessages((m) => [...m, { role: "user", text: q }]);
    setQuestion("");
    setLoading(true);

    try {
      const resp = await axios.post(`${backendUrl}/api/qa`, {
        question: q,
        top_k: 5,
        docIds: [article.id],
      }, { timeout: 120000 });

      // model answer may be in resp.data.answer; sometimes the backend returns structured object
      const answerText = resp.data?.answer ?? JSON.stringify(resp.data?.raw ?? "No response");
      const sources = resp.data?.sources ?? [];

      setMessages((m) => [...m, { role: "assistant", text: answerText, sources }]);
    } catch (err) {
      console.error("QA error:", err?.response?.data || err.message || err);
      setMessages((m) => [...m, { role: "assistant", text: "Sorry — failed to get an answer. Try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-4xl h-[80vh] bg-gradient-to-b from-[#071226] to-[#061020] border border-[#122131] rounded-2xl shadow-xl overflow-hidden flex flex-col">
        <header className="flex items-center justify-between px-6 py-4 border-b border-[#122131]">
          <div>
            <div className="text-white font-semibold">{article.title || "Untitled"}</div>
            <div className="text-xs text-gray-400">{new URL(article.url).host}</div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={onClose} className="p-2 rounded hover:bg-[#0f1724]">
              <X />
            </button>
          </div>
        </header>

        <div ref={scrollRef} className="flex-1 p-6 overflow-y-auto space-y-4 custom-scrollbar scroll-smooth">
          {messages.map((m, i) => (
            <div key={i} className={`max-w-[85%] ${m.role === "user" ? "ml-auto text-right" : ""}`}>
              <div className={`inline-block p-4 rounded-2xl ${m.role === "user" ? "bg-gradient-to-r from-[#3741c6] to-[#4f46e5] text-white" : "bg-[#071a2a] border border-[#122131] text-gray-200"}`}>
                <div dangerouslySetInnerHTML={{ __html: (m.text || "").replace(/\n/g, "<br/>") }} />
                {m.sources && m.sources.length > 0 && (
                  <div className="mt-3 text-xs text-gray-400">
                    <strong>Sources:</strong>
                    <ul className="mt-1 space-y-1">
                      {m.sources.map((s, idx) => (
                        <li key={idx}>
                          <a className="text-blue-400 hover:underline" href={s.url} target="_blank" rel="noreferrer">
                            {s.title || s.url}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <form className="p-4 border-t border-[#122131] flex gap-3 items-center" onSubmit={(e) => { e.preventDefault(); ask(); }}>
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a question about this article..."
            className="flex-1 px-4 py-3 rounded-xl bg-[#061425] border border-[#11202f] text-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />

          <button
            type="submit"
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-[#4f46e5] to-[#6366f1] hover:scale-105 transition"
            disabled={loading}
          >
            {loading ? <Loader2 className="animate-spin" /> : <Send />}
            <span className="text-sm">Ask</span>
          </button>
        </form>
      </div>
    </div>
  );
}
