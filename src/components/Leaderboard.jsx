import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { IMAGES, SOCKET_URL } from "../utils/constant";

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
      gifts.forEach((g) => {
        if (g.giftId && g.diamonds !== undefined) {
          diamondMap[g.giftId] = g.diamonds;
        }
      });

      const gifterStats = {};
      logs.forEach((log) => {
        if (!log.userId) return;

        if (!gifterStats[log.userId]) {
          gifterStats[log.userId] = {
            id: log.userId,
            nickname: log.nickname,
            profilePicture: log.profilePicture,
            totalDiamonds: 0,
          };
        }

        const diamonds = diamondMap[log.giftId] ?? log.diamonds ?? 0;
        const amount = log.amount || 1;
        gifterStats[log.userId].totalDiamonds += amount * diamonds;
      });

      const sorted = Object.values(gifterStats)
        .sort((a, b) => b.totalDiamonds - a.totalDiamonds)
        .slice(0, 10);

      setData(sorted);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  // Debounced fetch để tránh gọi API liên tục khi nhiều quà đến cùng lúc
  const debouncedFetch = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchLeaderboard();
    }, 500);
  };

  useEffect(() => {
    fetchLeaderboard();

    // Polling 30s làm backup
    const interval = setInterval(fetchLeaderboard, 30000);

    // Lắng nghe event gift từ socket → cập nhật ngay lập tức
    const socket = io(SOCKET_URL);

    socket.on("connect", () => setIsConnected(true));
    socket.on("disconnect", () => setIsConnected(false));

    socket.on("tiktok_gift", () => {
      debouncedFetch();
    });

    return () => {
      clearInterval(interval);
      socket.disconnect();
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const renderRank = (index) => {
    const rank = index + 1;
    if (rank <= 3) {
      return (
        <div className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-[14px] shadow-sm transform -rotate-6 shrink-0
          ${rank === 1 ? "bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-600 text-yellow-900 border-2 border-yellow-200 shadow-[0_0_15px_rgba(234,179,8,0.5)]" : ""}
          ${rank === 2 ? "bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500 text-gray-800 border-2 border-gray-200 shadow-[0_0_15px_rgba(156,163,175,0.4)]" : ""}
          ${rank === 3 ? "bg-gradient-to-br from-orange-300 via-orange-400 to-orange-600 text-orange-950 border-2 border-orange-200 shadow-[0_0_15px_rgba(249,115,22,0.4)]" : ""}
        `}>
          {rank}
        </div>
      );
    }
    return (
      <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-[13px] bg-white/[0.05] text-white/40 border border-white/10 shrink-0">
        {rank}
      </div>
    );
  };

  const formatTime = (date) => {
    if (!date) return null;
    return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  };

  return (
    <div className="w-full h-full flex flex-col bg-transparent relative">
      <div className="px-6 py-4 shrink-0 border-b border-white/[0.05]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-[14px]">🏆</span>
            <span className="font-extrabold text-[11px] text-[#fbbf24] tracking-[0.2em] uppercase mt-0.5">
              Top Donators
            </span>
          </div>

          <div className="flex items-center gap-3">
            {loading && (
              <svg className="w-3.5 h-3.5 animate-spin text-white/40" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            )}
            <span
              className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full tracking-wider shadow-sm uppercase ${isConnected
                  ? "bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30"
                  : "bg-red-500/15 text-red-400 border border-red-500/30"
                }`}
            >
              {isConnected ? "Live" : "Offline"}
            </span>
          </div>
        </div>
        {lastUpdated && (
          <p className="text-[9px] font-bold text-white/30 uppercase tracking-[0.15em] mt-1">
            Last Sync: {formatTime(lastUpdated)}
          </p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-5 custom-scrollbar relative z-10 flex flex-col gap-3">
        {loading && data.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-white/30 text-[10px] uppercase font-bold tracking-widest gap-3 py-10 opacity-50">
            <div className="w-6 h-6 rounded-full border border-dashed border-white/40 animate-spin-slow"></div>
            Loading Leaderboard...
          </div>
        ) : data.length > 0 ? (
          data.slice(0, 10).map((item, index) => (
            <div
              className={`flex items-center p-3 rounded-[1.25rem] transition-all duration-300 ease-in-out border group ${
                 index === 0 ? "bg-gradient-to-r from-yellow-500/10 to-transparent border-yellow-500/20 shadow-[0_0_20px_rgba(234,179,8,0.05)]" :
                 index === 1 ? "bg-gradient-to-r from-gray-500/10 to-transparent border-gray-500/20 shadow-[0_0_20px_rgba(156,163,175,0.05)]" :
                 index === 2 ? "bg-gradient-to-r from-orange-500/10 to-transparent border-orange-500/20 shadow-[0_0_20px_rgba(249,115,22,0.05)]" :
                 "bg-white/[0.02] border-transparent hover:border-white/10 hover:bg-white/[0.04]"
              }`}
              key={item.id}
            >
              <div className="shrink-0">{renderRank(index)}</div>
              <img
                src={item.profilePicture || "/images/default_avatar.png"}
                alt={item.nickname}
                className={`w-11 h-11 rounded-full object-cover ml-3.5 mr-3.5 flex-shrink-0 shadow-sm ${index <= 2 ? "ring-2 ring-white/10" : ""}`}
                onError={(e) => {
                  e.target.src = "/images/default_avatar.png";
                }}
              />
              <div className="flex flex-col gap-0.5 min-w-0">
                <p className={`text-[14px] font-bold truncate ${index <= 2 ? "text-white" : "text-white/80"}`}>{item.nickname}</p>

                <div className="flex items-center gap-1.5 opacity-90 mt-0.5">
                  <span className={`font-black text-[13px] tracking-tight ${
                    index === 0 ? "text-yellow-400" :
                    index === 1 ? "text-gray-300" :
                    index === 2 ? "text-orange-400" :
                    "text-white/60"
                  }`}>{item.totalDiamonds.toLocaleString()}</span>
                  <img src={IMAGES.ICO_COIN} alt="Coin" className="w-[14px] h-[14px] opacity-90" />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-white/30 text-[10px] uppercase font-bold tracking-widest gap-2 py-10 opacity-50">
            <span className="text-3xl grayscale mb-1">📊</span>
            <span>Chưa có dữ liệu thống kê</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
