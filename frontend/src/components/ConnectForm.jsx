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
 <div className="relative z-20 sm:max-w-md w-full sm:h-auto h-full bg-white/[0.12] backdrop-blur-[40px] border border-white/20 sm:rounded-[3rem] p-10 text-white font-sans pointer-events-auto shadow-[0_50px_100px_rgba(0,0,0,0.4)] overflow-hidden">
 {/* Decorative Glow */}
 <div className="absolute -top-10 -right-10 w-40 h-40 bg-luminous-cyan/10 blur-[80px] pointer-events-none" />

 <div className="w-full h-full flex flex-col items-center gap-6 relative z-10">
 <div className="p-4 bg-white/5 rounded-3xl border border-white/5 shadow-inner">
 <img src={IMAGES.ICO_TIKTOK} alt="Logo" className="w-20 grayscale brightness-150 opacity-80" />
 </div>

 <div className="text-center">
 <h3 className="font-bold text-2xl luminous-text-gradient mb-1">
 TikTok Live
 </h3>
 <p className="text-[10px] text-luminous-gray font-medium opacity-60">
 Kết nối với phòng live của bạn
 </p>
 </div>

 <form
 onSubmit={handleConnect}
 className="flex flex-col gap-4 w-full mt-2"
 >
 <div className="flex flex-col gap-2">
 <label className="text-[9px] font-semibold text-luminous-cyan opacity-80 ml-1">
 Username ID
 </label>
 <div className="w-full flex items-center bg-white/[0.08] border border-white/20 rounded-2xl px-5 py-3.5 text-sm text-white transition-all duration-300 focus-within:border-white/50 focus-within:bg-white/[0.15] group shadow-inner">
 <span className="text-luminous-gray/40 font-bold mr-2">@</span>
 <input
 type="text"
 placeholder="example_user"
 value={username}
 onChange={(e) => setUsername(e.target.value)}
 className="w-full bg-transparent focus:outline-none font-medium placeholder:text-white/10"
 disabled={loading}
 />
 </div>
 </div>

 <button
 type="submit"
 disabled={loading || !username.trim()}
 className="w-full h-12 bg-white text-black font-semibold py-3 rounded-xl transition-all duration-300 text-[13px] flex items-center justify-center gap-3 hover:bg-luminous-cyan hover:scale-[1.02] active:scale-[0.98] disabled:opacity-30 disabled:scale-100 shadow-[0_10px_30px_rgba(255,255,255,0.1)]"
 >
 {loading ? (
 <div className="flex items-center gap-2">
 <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
 <span>Đang kết nối...</span>
 </div>
 ) : (
 <>
 <MdOutlineConnectWithoutContact className="text-lg" />
 <span>Tiếp tục</span>
 </>
 )}
 </button>
 </form>

 {message && (
 <div className={`w-full py-3 px-4 rounded-xl text-[10px] font-bold text-center ${error ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-green-500/10 text-green-400 border border-green-500/20"}`}>
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
