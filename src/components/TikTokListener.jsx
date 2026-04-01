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
    <div className="sm:block hidden">
      <div className="w-80 h-full overflow-hidden bg-black/20 backdrop-blur-sm border border-white/30 rounded-xl flex flex-col">
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
              {isConnected ? "● Đã kết nối" : "● Chưa kết nối"}
            </span>
            <span className="text-xs text-purple-1 font-semibold">
              Dancer {actualIndex + 1}/{activeVideos.length}
              {videoQueue.length > 0 && (
                <span className="ml-2 bg-pink-500/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  +{videoQueue.length}
                </span>
              )}
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
                  className={`${style.bg} text-white border-l-2 ${style.border} rounded-lg text-xs p-3 wrap-break-word slideInChat duration-300 ease-in-out`}
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
    </div>
  );
};

export default TikTokListener;
