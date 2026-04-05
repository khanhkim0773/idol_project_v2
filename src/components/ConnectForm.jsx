import React, { useState } from "react";
import { IMAGES, SOCKET_URL } from "../utils/constant";
import { MdOutlineConnectWithoutContact } from "react-icons/md";

const ConnectForm = ({ onConnectSuccess }) => {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);

  const handleConnect = async (e) => {
    e.preventDefault();
    if (!username.trim()) return;
    setLoading(true);
    setMessage("Đang kết nối đến Tiktok Live, vui lòng đợi...");
    setError(false);
    try {
      const res = await fetch(`${SOCKET_URL}/api/connect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim() }),
      });
      const data = await res.json();

      if (data.success) {
        setMessage(`Connected to @${username.trim()}`);
        setError(false);
        if (onConnectSuccess) {
          setTimeout(() => onConnectSuccess(username.trim()), 800);
        }
      } else {
        // setMessage(`Failed: ${data.message}`);
        setMessage(`Kết nối thất bại, vui lòng kiểm tra lại`);
        setError(true);
      }
    } catch (error) {
      setMessage("Connection error");
      console.log(error);

      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative z-20 sm:max-w-md w-full sm:h-auto h-full bg-secondary/80 backdrop-blur-2xl sm:border border-white/10 sm:rounded-[2rem] p-8 text-white font-sans pointer-events-auto shadow-[0_30px_60px_rgba(0,0,0,0.6)]">
      {/* Decorative Glow */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-luminous-cyan/10 blur-[80px] pointer-events-none" />

      <div className="w-full h-full flex flex-col items-center gap-6 relative z-10">
        <div className="p-4 bg-white/5 rounded-3xl border border-white/5 shadow-inner">
          <img src={IMAGES.ICO_TIKTOK} alt="Logo" className="w-20 grayscale brightness-150 opacity-80" />
        </div>

        <div className="text-center">
          <h3 className="font-black text-3xl uppercase tracking-tighter luminous-text-gradient mb-2">
            TikTok LIVE
          </h3>
          <p className="text-[11px] text-luminous-gray font-bold tracking-[0.2em] uppercase opacity-60">
            CONNECT TO STREAM
          </p>
        </div>

        <form
          onSubmit={handleConnect}
          className="flex flex-col gap-5 w-full mt-4"
        >
          <div className="flex flex-col gap-2.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-luminous-cyan opacity-80 ml-1">
              Username ID
            </label>
            <div className="w-full flex items-center bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-sm text-white transition-all duration-300 focus-within:border-luminous-cyan/40 focus-within:bg-white/[0.06] group">
              <span className="text-luminous-gray/40 font-bold mr-2">@</span>
              <input
                type="text"
                placeholder="sky_monster__018"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-transparent focus:outline-none font-bold placeholder:text-white/10"
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !username.trim()}
            className="w-full h-14 bg-white text-black font-black py-3 rounded-2xl transition-all duration-300 text-sm flex items-center justify-center gap-3 hover:bg-luminous-cyan hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:grayscale disabled:scale-100 shadow-xl"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                <span>CONNECTING...</span>
              </div>
            ) : (
              <>
                <MdOutlineConnectWithoutContact className="text-xl" />
                <span>ESTABLISH LINK</span>
              </>
            )}
          </button>
        </form>

        {message && (
          <div className={`w-full py-3 px-4 rounded-xl text-[10px] font-bold text-center uppercase tracking-wider ${error ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-green-500/10 text-green-400 border border-green-500/20"}`}>
            {message}
          </div>
        )}

        <div className="flex items-center gap-3 mt-2 px-4 py-3 bg-white/[0.02] rounded-2xl border border-white/5">
          <div className="w-8 h-8 rounded-full bg-luminous-cyan/10 flex items-center justify-center shrink-0">
            <span className="text-xs">💡</span>
          </div>
          <p className="text-[10px] text-luminous-gray/60 leading-relaxed font-medium">
            Enter your TikTok username to sync real-time gifts and interactions with the dashboard.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConnectForm;
