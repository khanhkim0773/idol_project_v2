import React, { useState, useEffect } from "react";
import "./Leaderboard.css";
import { SOCKET_URL } from "../utils/constant";

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
    <div className="leaderboard-container">
      <div className="leaderboard-header">
        <h3 className="leaderboard-title">🏆 TOP ĐẠI GIA</h3>
      </div>

      <div className="leaderboard-list">
        {loading && data.length === 0 ? (
          <div className="empty-state">Đang tải...</div>
        ) : data.length > 0 ? (
          data.slice(0, 5).map((item, index) => (
            <div className="leaderboard-item" key={item.id}>
              {renderRank(index)}
              <img
                src={item.profilePicture || "/images/default_avatar.png"}
                alt={item.nickname}
                className="item-avatar"
                onError={(e) => { e.target.src = "/images/default_avatar.png"; }}
              />
              <div className="item-info">
                <div className="item-name">{item.nickname}</div>
                <div className="item-stats">
                  <div className="diamond-count">
                    <span>{item.totalDiamonds.toLocaleString()}</span>
                    <span className="diamond-icon">💎</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <span className="empty-icon">📊</span>
            <span>Chưa có dữ liệu</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
