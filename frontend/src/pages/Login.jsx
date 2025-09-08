import { useEffect, useState } from "react";

export default function Login({ backendUrl, onLogin }) {
  const [userId, setUserId] = useState("");
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setError("");
  }, [userId]);

  const handleLogin = async () => {
    const id = (userId || "").trim();
    if (!id) {
      setError("Please enter a User ID.");
      return;
    }

    setChecking(true);
    setError("");
    try {
      // ✅ backend se sirf isi user ki rows mangwa lo
      const res = await fetch(
        `${backendUrl}/api/search?user_id=${encodeURIComponent(id)}`
      );
      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      const data = await res.json();
      const list = Array.isArray(data) ? data : data.results || [];

      // ✅ agar table me us user ki koi entry hi nahi hai
      if (!list || list.length === 0) {
        setError("User not found");
        setChecking(false);
        return;
      }

      // ✅ Success → move to dashboard
      onLogin(id);
    } catch (err) {
      console.error("login check error", err);
      setError("Something went wrong. Try again.");
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#0b1020] text-gray-200 font-inter px-4">
      <div className="max-w-md w-full bg-[#071124] p-8 rounded-2xl shadow-lg border border-[#132033]">
        <h1 className="text-3xl font-bold text-white mb-3 text-center">
          Welcome back
        </h1>
        <p className="text-gray-400 text-sm mb-6 text-center">
          Enter your User ID to access your scraped content dashboard.
        </p>

        <input
          type="text"
          placeholder="Enter your User ID"
          value={userId}
          onChange={(e) => {
            setUserId(e.target.value);
            setError("");
          }}
          className="w-full px-4 py-3 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {error && <div className="mt-3 text-sm text-red-400">{error}</div>}

        <button
          onClick={handleLogin}
          disabled={checking}
          className="mt-6 w-full bg-blue-600 hover:bg-blue-700 transition-all duration-200 text-white py-3 rounded-lg font-semibold"
        >
          {checking ? "Checking..." : "Next"}
        </button>

        <div className="mt-4 text-xs text-gray-500">
          Tip: This User ID must match the <code>user_id</code> saved by your
          Chrome extension.
        </div>
      </div>
    </div>
  );
}
