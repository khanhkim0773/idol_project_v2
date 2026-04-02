import React, { useState, useEffect } from "react";
import "./Leaderboard.css";
import { SOCKET_URL } from "../utils/constant";

const Leaderboard = () => {
  const [type, setType] = useState("gifts"); // gifts | gifters
  const [period, setPeriod] = useState("day"); // day | week | month | year
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${SOCKET_URL}/api/stats/leaderboard?type=${type}&period=${period}`);
      if (res.ok) {
        const result = await res.json();
        setData(result);
      }
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 30000); // Auto refresh every 30s
    return () => clearInterval(interval);
  }, [type, period]);

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
        <div className="leaderboard-tabs">
          <button 
            className={`tab-btn ${type === "gifts" ? "active" : ""}`}
            onClick={() => setType("gifts")}
          >
            QUÀ TẶNG
          </button>
          <button 
            className={`tab-btn ${type === "gifters" ? "active" : ""}`}
            onClick={() => setType("gifters")}
          >
            ĐẠI GIA
          </button>
        </div>

        <div className="period-tabs">
          {["day", "week", "month", "year"].map((p) => (
            <button
              key={p}
              className={`period-btn ${period === p ? "active" : ""}`}
              onClick={() => setPeriod(p)}
            >
              {p === "day" ? "Ngày" : p === "week" ? "Tuần" : p === "month" ? "Tháng" : "Năm"}
            </button>
          ))}
        </div>
      </div>

      <div className="leaderboard-list">
        {loading && data.length === 0 ? (
          <div className="empty-state">Đang tải...</div>
        ) : data.length > 0 ? (
          data.map((item, index) => (
            <div className="leaderboard-item" key={item.id}>
              {renderRank(index)}
              <img 
                src={type === "gifts" ? item.image : (item.profilePicture || "/images/default_avatar.png")} 
                alt={item.name || item.nickname} 
                className="item-avatar"
                onError={(e) => { e.target.src = "/images/default_avatar.png" }}
              />
              <div className="item-info">
                <div className="item-name">{type === "gifts" ? item.name : item.nickname}</div>
                <div className="item-stats">
                  {type === "gifts" && <span>x{item.totalAmount} lần</span>}
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
