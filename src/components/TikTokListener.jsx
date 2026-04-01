import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useVideoStore } from "../hooks/useVideoStore";
import { SOCKET_URL } from "../utils/constant";
import { MESSAGE_TYPE } from "../utils/type";

const getMessageStyle = (msg) => {
  if (msg === MESSAGE_TYPE.CONNECT)
    return { border: "border-l-[#00FF00]", bg: "bg-[#00FF0014]" };
  if (msg === MESSAGE_TYPE.DISCONNECT)
    return { border: "border-l-[#FF0000]", bg: "bg-[#EF444434]" };
  if (msg.startsWith("🌹"))
    return { border: "border-l-[#ec4899]", bg: "bg-[#EC489914]" };
  if (msg.startsWith("🎁"))
    return { border: "border-l-[#a78bfa]", bg: "bg-[#A78BFA14]" };
  return { border: "border-l-[#ffffff30]", bg: "bg-[#FFFFFF0A]" };
};

const TikTokListener = () => {
  const selectedVideo = useVideoStore((state) => state.selectedVideo);
  const videoQueue = useVideoStore((state) => state.videoQueue);
  const getActiveVideos = useVideoStore((state) => state.getActiveVideos);

  const [logs, setLogs] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const chatEndRef = useRef(null);

  // Get active videos sorted by order
  const activeVideos = getActiveVideos();
  const currentIndex = activeVideos.findIndex((v) => v.video === selectedVideo);
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
      addLog(`${MESSAGE_TYPE.CONNECT}`);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
      addLog(`${MESSAGE_TYPE.DISCONNECT}`);
    });

    socket.on("tiktok_gift", (giftData) => {
      const giftName = giftData.giftName ?? "";
      addLog(
        `🎁 Nhận được ${giftData.amount} ${giftName} từ ${giftData.user} (${giftData.nickname})!`
      );

      // Lấy danh sách active videos
      const active = useVideoStore.getState().getActiveVideos();
      if (active.length === 0) return;

      const giftNameLower = giftName.toLowerCase().trim();

      // Chỉ lấy video có gift field khớp chính xác với tên quà nhận được
      // (case-insensitive, exact match)
      const matched = active.filter(
        (v) => v.gift && v.gift.toLowerCase().trim() === giftNameLower
      );

      // Nếu không có video nào khớp với quà này → KHÔNG phát gì cả
      if (matched.length === 0) {
        addLog(`⚠️ Không có dancer nào được gán quà "${giftName}", bỏ qua.`);
        return;
      }

      // Cycle qua các video khớp (vòng tròn)
      const state = useVideoStore.getState();
      const lastQueued = state.videoQueue[state.videoQueue.length - 1] ?? state.selectedVideo;
      const curIdx = matched.findIndex((v) => v.video === lastQueued);
      const nextIdx = curIdx + 1 >= matched.length ? 0 : curIdx + 1;

      // Đẩy vào queue
      useVideoStore.getState().enqueueVideo(matched[nextIdx].video);
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
    <div className="w-full h-full flex flex-col bg-transparent">
      <div className="p-3.5 bg-white/5 shrink-0 border-b border-white/10">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">📡</span>
            <span className="font-bold text-[11px] text-white/80 tracking-[0.2em] uppercase">
              TikTok LIVE
            </span>
          </div>
          <div
            className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"} shrink-0 animate-pulse`}
          />
        </div>
        <div className="flex justify-between items-center">
          <span
            className={`text-[10px] font-medium ${isConnected ? "text-green-400" : "text-red-400"}`}
          >
            {isConnected ? "CONNECTED" : "DISCONNECTED"}
          </span>
          <span className="text-[10px] text-white/40 font-bold">
            DANCER {actualIndex + 1}/{activeVideos.length}
            {videoQueue.length > 0 && (
              <span className="ml-2 bg-pink-500 text-white text-[9px] px-1.5 py-0.5 rounded-full">
                +{videoQueue.length}
              </span>
            )}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-3 flex flex-col gap-2 custom-scrollbar">
        {logs.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-white/20 text-[10px] uppercase tracking-widest gap-2">
            <span className="text-2xl opacity-20">📡</span>
            Waiting for events...
          </div>
        ) : (
          logs.map((log) => {
            const style = getMessageStyle(log.text);
            return (
              <div
                key={log.id}
                className={`${style.bg} text-[11px] text-white/90 border-l-2 ${style.border} rounded-lg p-2.5 break-words slideInChat`}
              >
                {log.text}
              </div>
            );
          })
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="shrink-0 px-3 py-3 border-t border-white/5 text-center text-[9px] text-white/30 uppercase tracking-[0.1em] font-medium">
        TikTok LIVE Real-time Feed
      </div>
    </div>
  );
};

export default TikTokListener;
