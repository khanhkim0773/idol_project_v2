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
    <div className="w-96 h-full overflow-hidden bg-black/20 backdrop-blur-sm border border-white/30 rounded-xl flex flex-col">
      <div className="p-3.5 bg-black/30 shrink-0 border-b border-b-gray-500">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <span>📡</span>
            <span className="font-semibold text-sm text-purple tracking-wider">
              TikTok LIVE
            </span>
          </div>
          <div
            className={`w-3 h-3 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"} ${isConnected ? "shadow-green-500/50" : "shadow-red-500/50"} shrink-0`}
          />
        </div>
        <div className="flex justify-between items-center">
          <span
            className={` text-xs ${isConnected ? "text-thirdary" : "text-fivethary"}`}
          >
            {isConnected ? "● Đang kết nối" : "● Chưa kết nối"}
          </span>
          <span className="text-xs text-purple-1 font-semibold">
            Dancer {actualIndex + 1}/{DANCER_VIDEOS.length}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-3 flex flex-col gap-2">
        {logs.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-xs italic text-center">
            Chưa có sự kiện nào...
            <br />
            <span className="text-lg mt-2 block">💤</span>
          </div>
        ) : (
          logs.map((log) => {
            const style = getMessageStyle(log.text);
            return (
              <div
                key={log.id}
                className={`${style.bg} border-l-2 border-l-${style.border} rounded-lg text-xs p-3 wrap-break-word slideInChat duration-300 ease-in-out`}
              >
                {log.text}
              </div>
            );
          })
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="shrink-0 px-3 py-4 border-t border-t-gray-500 text-center text-white/70 text-xs">
        Hoạt động TikTok LIVE realtime
      </div>
    </div>
  );
};

export default TikTokListener;
