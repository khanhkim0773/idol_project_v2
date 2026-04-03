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
    <div className="relative z-20 sm:max-w-md w-full sm:h-auto h-full bg-white/10 backdrop-blur-xl sm:border border-white/40 sm:rounded-xl p-6 text-white font-sans pointer-events-auto">
      <div className="w-full h-full flex flex-col items-center sm:mt-5 gap-4 mt-10 sm:mb-5 mb-10">
        <img src={IMAGES.ICO_TIKTOK} alt="Logo" className="w-24" />
        <h3 className="font-bold text-3xl text-center uppercase flex justify-center gap-1">
          {"Kết nối TikTok LIVE".split("").map((char, i) => (
            <span
              key={i}
              className="animate-text"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              {char}
            </span>
          ))}
        </h3>
        <p className="text-sm">Sẵn sàng để bùng nổ với phiên live của bạn</p>
        <form
          onSubmit={handleConnect}
          className="flex flex-col gap-3 w-full mt-5"
        >
          <div className="flex flex-col gap-2">
            <label className="text-primary font-bold uppercase text-sm">
              ID TikTok:
            </label>
            <div className="w-full overflow-hidden  flex items-center bg-white/10 border border-white/20 rounded-lg  text-sm text-white transition-colors placeholder:text-gray-400">
              <div className="p-2">@</div>
              <input
                type="text"
                placeholder="Nhập username TikTok..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full py-2 focus:outline-none"
                disabled={loading}
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading || !username.trim()}
            className="w-full bg-primary hover:bg-primary/70 disabled:bg-gray-600 text-white font-semibold py-3 rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
          >
            {loading && (
              <div className="relative w-3 h-3">
                <span className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-75"></span>
                <span className="relative block w-3 h-3 bg-green-400 rounded-full border-2 border-white"></span>
              </div>
            )}

            {loading ? (
              <span className="text-green-400">Đang kết nối...</span>
            ) : (
              "Kết nối"
            )}
          </button>
        </form>
        {message && (
          <p
            className={`mt-1 text-xs text-center ${error ? "text-red-400" : "text-green-400"}`}
          >
            {message}
          </p>
        )}
        <div className="bg-primary/20 p-2 rounded-full flex gap-3 mt-3">
          <MdOutlineConnectWithoutContact className="text-2xl mx-auto pl-1" />
          <p className="text-xs">
            Kết nối với tiktok để bắt đầu live stream và tương tác với người xem
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConnectForm;
