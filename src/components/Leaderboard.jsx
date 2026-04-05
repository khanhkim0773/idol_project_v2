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
      return <div className={`rank-badge rank-${rank}`}>{rank}</div>;
    }
    return <div className="rank-badge">{rank}</div>;
  };

  const formatTime = (date) => {
    if (!date) return null;
    return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  };

  return (
    <div className="flex flex-col h-full text-white bg-black/50 backdrop-blur-md rounded-xl overflow-hidden">
      <div className="p-4 bg-black/50 border-b border-gray-600">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-base font-semibold tracking-wide">🏆 TOP ĐẠI GIA</h3>
          <div className="flex items-center gap-2">
            {loading && (
              <svg className="w-3 h-3 animate-spin text-white/50" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            )}
            <span
              className={`text-[9px] font-bold px-2 py-0.5 rounded-full tracking-widest ${isConnected
                  ? "bg-green-500/20 text-green-400 border border-green-500/40 animate-pulse"
                  : "bg-red-500/20 text-red-400 border border-red-500/40"
                }`}
            >
              {isConnected ? "● LIVE" : "○ OFFLINE"}
            </span>
          </div>
        </div>
        {lastUpdated && (
          <p className="text-[10px] text-white/30">
            Cập nhật lúc {formatTime(lastUpdated)}
          </p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {loading && data.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            Đang tải...
          </div>
        ) : data.length > 0 ? (
          data.slice(0, 5).map((item, index) => (
            <div
              className="flex items-center p-2.5 mb-2 rounded-xl hover:bg-gray-500 transition-colors duration-300 ease-in-out"
              key={item.id}
            >
              {renderRank(index)}
              <img
                src={item.profilePicture || "/images/default_avatar.png"}
                alt={item.nickname}
                className="w-10 h-10 rounded-lg object-cover mx-3 flex-shrink-0"
                onError={(e) => {
                  e.target.src = "/images/default_avatar.png";
                }}
              />
              <div className="flex flex-col gap-1">
                <p className="text-sm truncate">{item.nickname}</p>

                <div className="flex items-center gap-1">
                  <span>{item.totalDiamonds.toLocaleString()}</span>
                  <img src={IMAGES.ICO_COIN} alt="Coin" className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <span className="text-4xl mb-3">📊</span>
            <span>Chưa có dữ liệu</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
