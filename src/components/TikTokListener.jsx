import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useVideoStore } from "../hooks/useVideoStore";
import { DANCER_VIDEOS, SOCKET_URL } from "../utils/constant";

const TikTokListener = () => {
  // const setSelectedVideo = useVideoStore((state) => state.setSelectedVideo);
  const selectedVideo = useVideoStore((state) => state.selectedVideo);

  const [logs, setLogs] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  const currentIndex = DANCER_VIDEOS.indexOf(selectedVideo);
  const actualIndex = currentIndex === -1 ? 0 : currentIndex;

  useEffect(() => {
    const socket = io(SOCKET_URL);

    const addLog = (msg) => {
      setLogs((prev) => {
        const newLogs = [msg, ...prev]; 
        if (newLogs.length > 5) newLogs.pop();
        return newLogs;
      });
      console.log("[TikTok LIVE]", msg);
    };

    socket.on("connect", () => {
      setIsConnected(true);
      addLog("✅ Tự động kết nối tới Server Tiktok thành công");
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
      addLog("❌ Mất kết nối tới Server");
    });

    socket.on("tiktok_gift", (giftData) => {
      addLog(
        `🌹 Nhận được ${giftData.amount} ${giftData.giftName} từ ${giftData.user}! -> Đang đổi Dancer...`,
      );

      const currentVideo = useVideoStore.getState().selectedVideo;
      const cIndex = DANCER_VIDEOS.indexOf(currentVideo);
      const activeIdx = cIndex === -1 ? 0 : cIndex;
      const nextIndex =
        activeIdx + 1 >= DANCER_VIDEOS.length ? 0 : activeIdx + 1;

      useVideoStore.getState().setSelectedVideo(DANCER_VIDEOS[nextIndex]);
    });

    socket.on("tiktok_gift_other", (giftData) => {
      addLog(`🎁 Token: ${giftData.user} gửi ${giftData.giftName}`);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="absolute top-4 left-4 z-20 w-[320px] bg-black/60 backdrop-blur-md border border-white/10 rounded-xl p-4 text-white font-sans pointer-events-auto">
      <div className="flex items-center justify-between mb-3 border-b border-white/20 pb-2">
        <h3 className="font-bold text-lg text-pink-500">TikTok LIVE Events</h3>
        <div
          className={`w-3 h-3 rounded-full ${isConnected ? "bg-green-500 shadow-[0_0_10px_#22c55e]" : "bg-red-500 shadow-[0_0_10px_#ef4444]"}`}
        ></div>
      </div>

      <p className="text-sm text-gray-300 mb-2">
        Trạng thái:{" "}
        {isConnected
          ? "Đang chờ người tặng Hoa Hồng (Rose) 🌹..."
          : "Chưa kết nối"}
      </p>
      <p className="text-sm font-semibold mb-3">
        Dancer Video Index: {actualIndex + 1} / {DANCER_VIDEOS.length}
      </p>

      <div className="flex flex-col gap-2 overflow-hidden max-h-[150px]">
        {logs.map((log, i) => (
          <div
            key={i}
            className="text-xs text-wrap break-words bg-black/40 p-2 rounded-lg border-l-2 border-pink-500"
          >
            {log}
          </div>
        ))}
        {logs.length === 0 && (
          <div className="text-xs text-gray-500 italic">
            Chưa có sự kiện nào...
          </div>
        )}
      </div>
    </div>
  );
};

export default TikTokListener;
