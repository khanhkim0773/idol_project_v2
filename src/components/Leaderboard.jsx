import React, { useState, useEffect } from "react";
import "./Leaderboard.css";
import { IMAGES, SOCKET_URL } from "../utils/constant";

const Leaderboard = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

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
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 300); // Auto refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const renderRank = (index) => {
    const rank = index + 1;
    if (rank <= 3) {
      return <div className={`rank-badge rank-${rank}`}>{rank}</div>;
    }
    return <div className="rank-badge">{rank}</div>;
  };

  return (
    <div className="flex flex-col h-full text-white bg-black/50 backdrop-blur-md rounded-xl overflow-hidden">
      <div className="p-4 bg-black/50 border-b border-gray-600">
        <h3 className=" mb-2.5 text-base font-semibold tracking-wide">
          🏆 TOP ĐẠI GIA
        </h3>
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
