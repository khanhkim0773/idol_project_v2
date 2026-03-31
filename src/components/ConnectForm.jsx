import React, { useState } from "react";
import { SOCKET_URL } from "../utils/constant";

const ConnectForm = () => {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);

  const handleConnect = async (e) => {
    e.preventDefault();
    if (!username.trim()) return;

    setLoading(true);
    setMessage("Connecting...");
    setError(false);

    try {
      const res = await fetch(`${SOCKET_URL}/api/connect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim() }),
      });
      const data = await res.json();

      if (data.success) {
        setMessage(`✅ Connected to @${username.trim()}`);
        setError(false);
      } else {
        setMessage(`❌ Failed: ${data.message}`);
        setError(true);
      }
    } catch (error) {
      setMessage("❌ Connection error");
      console.log(error);

      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="absolute top-4 right-[320px] mx-4 z-20 w-[300px] bg-black/60 backdrop-blur-md border sm:block hidden border-white/10 rounded-xl p-4 text-white font-sans pointer-events-auto">
      <h3 className="font-bold text-lg text-pink-500 mb-2 ">
        Kết nối TikTok LIVE
      </h3>
      <form onSubmit={handleConnect} className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="Nhập username TikTok..."
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-pink-500 transition-colors placeholder:text-gray-400"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !username.trim()}
          className="w-full bg-pink-500 hover:bg-pink-600 disabled:bg-gray-600 text-white font-semibold py-2 rounded-lg transition-colors text-sm flex items-center justify-center"
        >
          {loading ? (
            <span className="animate-spin w-4 h-4 border-2 border-white/20 border-t-white rounded-full mr-2"></span>
          ) : null}
          {loading ? "Đang kết nối..." : "Kết nối"}
        </button>
      </form>
      {message && (
        <p
          className={`mt-3 text-xs text-center ${error ? "text-red-400" : "text-green-400"}`}
        >
          {message}
        </p>
      )}
    </div>
  );
};

export default ConnectForm;
