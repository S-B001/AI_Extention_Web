import React from "react";
import { Star, StarOff, Trash2, ExternalLink } from "lucide-react";

function formatTsToIST(ts) {
  if (!ts) return "";
  try {
    // Convert UTC timestamp to IST (+5:30)
    const date = new Date(ts);
    const istOffset = 5.5 * 60; // 5 hours 30 minutes in minutes
    const istDate = new Date(date.getTime() + istOffset * 60 * 1000);
    return istDate.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch (e) {
    return ts;
  }
}

export default function Card({ article, onOpen, onDelete, onToggleBookmark }) {
  const title =
    article.title ||
    (article.content ? article.content.slice(0, 80) + "..." : "Untitled");
  const excerpt = (article.content || "").slice(0, 160);

  return (
    <div
      className="relative bg-[#071124] border border-[#132033] rounded-2xl p-5 cursor-pointer hover:shadow-lg transition"
      onClick={onOpen}
    >
      <div className="flex justify-between items-start">
        {/* LEFT: Title, content, timestamp */}
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-white truncate">{title}</h3>
          <p className="text-gray-300 mt-2 text-sm line-clamp-3">{excerpt}</p>
          <div className="mt-3 text-xs text-gray-500">
            {formatTsToIST(article.created_at)}
          </div>
        </div>

        {/* RIGHT: Actions */}
        <div className="flex flex-col items-end gap-3 ml-3">
          <div className="flex items-center gap-2">
            {/* Bookmark toggle */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleBookmark && onToggleBookmark(article.id, !article.is_bookmarked);
                }}
                title={article.is_bookmarked ? "Remove bookmark" : "Bookmark"}
                className="p-1 rounded"
              >
                {article.is_bookmarked ? (
                  <Star size={18} className="text-yellow-400" />
                ) : (
                  <StarOff size={18} className="text-gray-500" />
                )}
              </button>

              {/* View source icon*/}
              {article.url && (
                <a
                  onClick={(e) => e.stopPropagation()}
                  className="text-gray-400 hover:text-white"
                  href={article.url}
                  target="_blank"
                  rel="noreferrer"
                  title="Open source"
                >
                  <ExternalLink size={18} />
                </a>
              )}
          </div>
          
          {/* Delete button */}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete && onDelete(article.id);
              }}
              title="Delete"
              className="absolute bottom-4 right-4 p-1 rounded text-gray-400 hover:text-red-400"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
