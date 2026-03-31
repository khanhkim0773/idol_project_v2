import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useVideoStore } from "../hooks/useVideoStore";
import { DANCER_VIDEOS, SOCKET_URL } from "../utils/constant";

const getMessageStyle = (msg) => {
  if (msg.startsWith("✅"))
    return { border: "#22c55e", bg: "rgba(34,197,94,0.08)" };
  if (msg.startsWith("❌"))
    return { border: "#ef4444", bg: "rgba(239,68,68,0.08)" };
  if (msg.startsWith("🌹"))
    return { border: "#ec4899", bg: "rgba(236,72,153,0.10)" };
  if (msg.startsWith("🎁"))
    return { border: "#a78bfa", bg: "rgba(167,139,250,0.08)" };
  return { border: "#ffffff30", bg: "rgba(255,255,255,0.04)" };
};

const TikTokListener = () => {
  const selectedVideo = useVideoStore((state) => state.selectedVideo);
  const [logs, setLogs] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const chatEndRef = useRef(null);

  const currentIndex = DANCER_VIDEOS.indexOf(selectedVideo);
  const actualIndex = currentIndex === -1 ? 0 : currentIndex;

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  useEffect(() => {
    const socket = io(SOCKET_URL);

    const addLog = (msg) => {
      setLogs((prev) => {
        const newLogs = [
          ...prev,
          { text: msg, id: Date.now() + Math.random() },
        ];
        if (newLogs.length > 30) newLogs.shift();
        return newLogs;
      });
      console.log("[TikTok LIVE]", msg);
    };

    socket.on("connect", () => {
      setIsConnected(true);
      addLog("Kết nối tới Server Tiktok thành công");
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
      addLog("Mất kết nối tới Server");
    });

    socket.on("tiktok_gift", (giftData) => {
      addLog(
        ` Nhận được ${giftData.amount} ${giftData.giftName} từ ${giftData.user} (${giftData.nickname})!`,
      );
      const currentVideo = useVideoStore.getState().selectedVideo;
      const cIndex = DANCER_VIDEOS.indexOf(currentVideo);
      const activeIdx = cIndex === -1 ? 0 : cIndex;
      const nextIndex =
        activeIdx + 1 >= DANCER_VIDEOS.length ? 0 : activeIdx + 1;
      useVideoStore.getState().setSelectedVideo(DANCER_VIDEOS[nextIndex]);
    });

    socket.on("tiktok_gift_other", (giftData) => {
      addLog(`${giftData.user} gửi ${giftData.giftName}`);
    });

    socket.on("tiktok_chat", (msg) => {
      const name = msg.nickname || msg.user;
      addLog(`💬 ${name}: ${msg.comment}`);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div
      style={{
        position: "absolute",
        top: "16px",
        right: "16px",
        width: "280px",
        height: "420px",
        zIndex: 20,
        display: "flex",
        flexDirection: "column",
        borderRadius: "16px",
        overflow: "hidden",
        background: "rgba(10,10,20,0.75)",
        backdropFilter: "blur(16px)",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow:
          "0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)",
        fontFamily: "'Inter', sans-serif",
        color: "white",
        pointerEvents: "auto",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "12px 14px 10px",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          background: "rgba(255,255,255,0.03)",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "6px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "16px" }}>📡</span>
            <span
              style={{
                fontWeight: 700,
                fontSize: "13px",
                color: "#f472b6",
                letterSpacing: "0.3px",
              }}
            >
              TikTok LIVE
            </span>
          </div>
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: isConnected ? "#22c55e" : "#ef4444",
              boxShadow: isConnected ? "0 0 8px #22c55e" : "0 0 8px #ef4444",
              flexShrink: 0,
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontSize: "11px",
              color: isConnected ? "#86efac" : "#f87171",
            }}
          >
            {isConnected ? "● Đang kết nối" : "● Chưa kết nối"}
          </span>
          <span style={{ fontSize: "11px", color: "#a78bfa", fontWeight: 600 }}>
            Dancer {actualIndex + 1}/{DANCER_VIDEOS.length}
          </span>
        </div>
      </div>

      {/* Chat feed */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "10px 10px 6px",
          display: "flex",
          flexDirection: "column",
          gap: "6px",
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(255,255,255,0.1) transparent",
        }}
      >
        {logs.length === 0 ? (
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "rgba(255,255,255,0.3)",
              fontSize: "12px",
              fontStyle: "italic",
              textAlign: "center",
            }}
          >
            Chưa có sự kiện nào...
            <br />
            <span
              style={{ fontSize: "20px", marginTop: "6px", display: "block" }}
            >
              💤
            </span>
          </div>
        ) : (
          logs.map((log) => {
            const style = getMessageStyle(log.text);
            return (
              <div
                key={log.id}
                style={{
                  background: style.bg,
                  borderLeft: `2.5px solid ${style.border}`,
                  borderRadius: "8px",
                  padding: "7px 10px",
                  fontSize: "11.5px",
                  lineHeight: "1.5",
                  color: "rgba(255,255,255,0.88)",
                  wordBreak: "break-word",
                  animation: "slideInChat 0.25s ease",
                }}
              >
                {log.text}
              </div>
            );
          })
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Footer */}
      <div
        style={{
          padding: "8px 12px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(255,255,255,0.02)",
          fontSize: "10px",
          color: "rgba(255,255,255,0.25)",
          textAlign: "center",
          flexShrink: 0,
        }}
      >
        Hoạt động TikTok LIVE realtime
      </div>

      <style>{`
        @keyframes slideInChat {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default TikTokListener;
