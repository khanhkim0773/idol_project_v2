import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useVideoStore } from "../hooks/useVideoStore";
import { useTTSStore } from "../hooks/useTTSStore";
import { SOCKET_URL } from "../utils/constant";
import { MESSAGE_TYPE } from "../utils/type";

const getMessageStyle = (type) => {
  if (type === "connect")
    return {
      border: "border-l-[#10b981]",
      bg: "bg-gradient-to-r from-[#10b981]/10 to-transparent",
      text: "text-[#10b981]"
    };
  if (type === "disconnect")
    return {
      border: "border-l-red-500",
      bg: "bg-gradient-to-r from-red-500/10 to-transparent",
      text: "text-red-400"
    };
  if (type === "warning")
    return {
      border: "border-l-[#fbbf24]",
      bg: "bg-gradient-to-r from-[#fbbf24]/10 to-transparent",
      text: "text-[#fbbf24]"
    };
  if (type === "gift")
    return {
      border: "border-l-[#d946ef]",
      bg: "bg-gradient-to-r from-[#d946ef]/15 to-transparent",
      text: "text-white"
    };
  return {
    border: "border-l-white/20",
    bg: "bg-white/[0.02]",
    text: "text-gray-300"
  };
};

const TikTokListener = () => {
  const selectedVideo = useVideoStore((state) => state.selectedVideo);
  const videoQueue = useVideoStore((state) => state.videoQueue);
  const getActiveVideos = useVideoStore((state) => state.getActiveVideos);

  const [logs, setLogs] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const chatEndRef = useRef(null);

  const activeVideos = getActiveVideos();
  const currentIndex = activeVideos.findIndex((v) => v.video === selectedVideo);
  const actualIndex = currentIndex === -1 ? 0 : currentIndex;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  useEffect(() => {
    const socket = io(SOCKET_URL);

    const addLog = (data) => {
      setLogs((prev) => {
        const newLogs = [
          ...prev,
          { ...data, id: Date.now() + Math.random() },
        ];
        if (newLogs.length > 30) newLogs.shift();
        return newLogs;
      });
    };

    socket.on("connect", () => {
      setIsConnected(true);
      addLog({
        type: "connect",
        text: `${MESSAGE_TYPE.CONNECT}`,
      });
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
      addLog({
        type: "disconnect",
        text: `${MESSAGE_TYPE.DISCONNECT}`,
      });
    });

    socket.on("tiktok_gift", (giftData) => {
      const giftName = giftData.giftName ?? "";

      addLog({
        type: "gift",
        name: giftData.nickname,
        text: `vừa tặng ${giftData.amount} ${giftName} 🎁`,
        avatar: giftData.profilePicture,
      });

      // TTS: đọc quà tặng
      useTTSStore.getState().speakGift(
        giftData.nickname,
        giftData.amount,
        giftName
      );

      const active = useVideoStore.getState().getActiveVideos();
      if (active.length === 0) return;

      const giftNameLower = giftName.toLowerCase().trim();

      const matched = active.filter(
        (v) => v.gift && v.gift.toLowerCase().trim() === giftNameLower
      );

      if (matched.length === 0) {
        addLog({
          type: "warning",
          text: `Không có Dancer nào nhận quà "${giftName}"`,
        });
        return;
      }

      const MAX_PER_EVENT = 50;
      const rawAmount = Number(giftData.amount ?? 1);
      const amount = Number.isFinite(rawAmount) ? Math.max(1, rawAmount) : 1;
      const n = Math.min(amount, MAX_PER_EVENT);

      const state = useVideoStore.getState();
      const lastQueued =
        state.videoQueue[state.videoQueue.length - 1] ??
        state.selectedVideo;

      const curIdx = matched.findIndex((v) => v.video === lastQueued);

      const scoreByPath = new Map();

      for (let i = 0; i < n; i++) {
        const idx = ((curIdx === -1 ? 0 : curIdx) + 1 + i) % matched.length;
        const path = matched[idx].video;

        useVideoStore.getState().enqueueVideo(path, giftName);
        scoreByPath.set(path, (scoreByPath.get(path) || 0) + 1);
      }

      scoreByPath.forEach((delta, path) => {
        useVideoStore.getState().addGiftScore(path, delta);
      });

      if (amount > MAX_PER_EVENT) {
        addLog({
          type: "warning",
          text: `⚠️ Số lượng quà vượt mức x${amount}, hệ thống chỉ xử lý ${MAX_PER_EVENT}`,
        });
      }
    });

    socket.on("tiktok_chat", (msg) => {
      const name = msg.nickname || msg.user;

      addLog({
        type: "chat",
        name,
        text: msg.comment,
        avatar: msg.profilePicture,
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="w-full h-full flex flex-col bg-transparent relative">
      <div className="px-6 py-4 shrink-0 border-b border-white/[0.05]">
        <div className="flex justify-between items-center px-1">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-2 h-2 rounded-full ${isConnected
                ? "bg-[#10b981] shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-pulse"
                : "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-pulse"
                }`}
            />
            <span
              className={`text-[10px] font-bold uppercase tracking-widest ${isConnected ? "text-[#10b981]" : "text-red-400"
                }`}
            >
              {isConnected ? "Connected" : "Disconnected"}
            </span>
          </div>

          <span className="text-[10px] text-white/40 font-bold tracking-[0.2em] uppercase">
            Model <span className="text-white/80 ml-1">{actualIndex + 1}/{activeVideos.length}</span>
            {videoQueue.length > 0 && (
              <span className="ml-2 bg-[#d946ef]/20 text-[#d946ef] border border-[#d946ef]/50 text-[9px] px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(217,70,239,0.2)]">
                +{videoQueue.length}
              </span>
            )}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-5 flex flex-col gap-3 custom-scrollbar relative z-10">
        {logs.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-white/20 text-[10px] uppercase font-bold tracking-[0.2em] gap-3 opacity-50">
            <div className="w-6 h-6 rounded-full border border-dashed border-white/30 animate-spin-slow"></div>
            Awaiting Activity
          </div>
        ) : (
          logs.map((log) => {
            const style = getMessageStyle(log.type);

            return (
              <div
                key={log.id}
                className={`${style.bg} border-l-[3px] ${style.border} rounded-r-xl p-3.5 flex items-start gap-4 transition-all hover:bg-white/[0.04]`}
              >
                {log.avatar && (
                  <img
                    src={log.avatar}
                    alt=""
                    className="w-8 h-8 rounded-full object-cover shrink-0 border border-white/10 shadow-sm"
                  />
                )}

                <div className={`break-words leading-relaxed text-[13px] ${style.text}`}>
                  {log.name && (
                    <span className="font-bold text-white mr-2">
                      {log.name}:
                    </span>
                  )}
                  <span className="opacity-90 leading-snug">{log.text}</span>
                </div>
              </div>
            );
          })
        )}

        <div ref={chatEndRef} />
      </div>
    </div>
  );
};

export default TikTokListener;