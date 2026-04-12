import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { IMAGES, SOCKET_URL } from "../utils/constant";

// Crown icons in grayscale style for a premium feel
const RankBadge = ({ rank }) => {
 if (rank === 1) return <span className="text-base">👑</span>;
 if (rank === 2) return <span className="text-sm grayscale opacity-70">🥈</span>;
 if (rank === 3) return <span className="text-sm grayscale opacity-50">🥉</span>;
 return (
 <span className="w-5 h-5 flex items-center justify-center text-[9px] font-bold text-white/10">
 {rank}
 </span>
 );
};

const Leaderboard = () => {
 const [data, setData] = useState([]);
 const [loading, setLoading] = useState(false);
 const [lastUpdated, setLastUpdated] = useState(null);
 const [isConnected, setIsConnected] = useState(false);
 const debounceRef = useRef(null);

 const fetchLeaderboard = async () => {
 try {
 setLoading(true);
 const [logsRes, giftsRes] = await Promise.all([
 fetch(`${SOCKET_URL}/api/stats/leaderboard`),
 fetch(`${SOCKET_URL}/api/gifts`),
 ]);
 if (!logsRes.ok || !giftsRes.ok) return;
 const logs = await logsRes.json();
 const gifts = await giftsRes.json();
 const diamondMap = {};
 gifts.forEach((g) => { if (g.giftId && g.diamonds !== undefined) diamondMap[g.giftId] = g.diamonds; });
 const gifterStats = {};
 logs.forEach((log) => {
 if (!log.userId) return;
 if (!gifterStats[log.userId]) {
 gifterStats[log.userId] = {
 id: log.userId, nickname: log.nickname, profilePicture: log.profilePicture, totalDiamonds: 0,
 };
 }
 const diamonds = diamondMap[log.giftId] ?? log.diamonds ?? 0;
 const amount = log.amount || 1;
 gifterStats[log.userId].totalDiamonds += amount * diamonds;
 });
 const sorted = Object.values(gifterStats).sort((a, b) => b.totalDiamonds - a.totalDiamonds).slice(0, 10);
 setData(sorted);
 setLastUpdated(new Date());
 } catch (error) { console.error(error); } finally { setLoading(false); }
 };

 const debouncedFetch = () => {
 if (debounceRef.current) clearTimeout(debounceRef.current);
 debounceRef.current = setTimeout(() => fetchLeaderboard(), 500);
 };

 useEffect(() => {
 fetchLeaderboard();
 const interval = setInterval(fetchLeaderboard, 30000);
 const socket = io(SOCKET_URL);
 socket.on("connect", () => setIsConnected(true));
 socket.on("disconnect", () => setIsConnected(false));
 socket.on("tiktok_gift", () => debouncedFetch());
 return () => { clearInterval(interval); socket.disconnect(); if (debounceRef.current) clearTimeout(debounceRef.current); };
 }, []);

 return (
 <div className="w-full h-full flex flex-col bg-transparent">
 {/* List */}
 <div className="flex-1 overflow-y-auto px-1.5 py-1 flex flex-col gap-0.5 custom-scrollbar">
 {data.length > 0 ? (
 data.map((item, index) => (
 <div
 key={item.id}
 className="flex items-center gap-2 sm:gap-3 px-1.5 sm:px-2.5 py-1 sm:py-1.5 rounded-lg hover:bg-white/[0.03] transition-colors group"
 >
 {/* Rank Badge */}
 <div className="w-4 sm:w-5 h-4 sm:h-5 flex items-center justify-center shrink-0">
 <RankBadge rank={index + 1} />
 </div>

 {/* Avatar - Compact */}
 <img
 src={item.profilePicture || "/images/default_avatar.png"}
 alt=""
 className="w-5 h-5 sm:w-7 sm:h-7 rounded-full object-cover shrink-0 opacity-90 group-hover:opacity-100 transition-opacity border border-white/5"
 onError={(e) => { e.target.src = "/images/default_avatar.png"; }}
 />

 {/* Info - Style "FENGMI / 105" */}
 <div className="flex-1 min-w-0">
 <p className="text-[7.5px] sm:text-[8.5px] font-semibold text-white/90 truncate leading-tight">
 {item.nickname}
 </p>
 <p className="text-[7.5px] sm:text-[8.5px] font-medium text-[#eab308] leading-tight flex items-center gap-0.5">
 <span className="opacity-90 tabular-nums">{item.totalDiamonds.toLocaleString()}</span>
 <span className="text-[5.5px] sm:text-[6.5px] opacity-60 ml-0.5 font-normal">pts</span>
 </p>
 </div>
 </div>
 ))
 ) : (
 <div className="py-10 text-center text-white/10 text-[9px]">
 Đang tải dữ liệu...
 </div>
 )}
 </div>
 </div>
 );
};

export default Leaderboard;
