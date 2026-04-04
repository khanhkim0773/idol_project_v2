import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useVideoStore } from "../hooks/useVideoStore";
import { useTTSStore } from "../hooks/useTTSStore";
import { SOCKET_URL } from "../utils/constant";
import { MESSAGE_TYPE } from "../utils/type";

const getMessageStyle = (type) => {
  if (type === "connect")
    return { border: "border-l-[#00FF00]", bg: "bg-[#00FF0014]" };
  if (type === "disconnect")
    return { border: "border-l-red-400", bg: "bg-red-400/10" };
  if (type === "warning")
    return { border: "border-l-yellow-400", bg: "bg-yellow-400/10" };
  if (type === "gift")
    return { border: "border-l-pink-400", bg: "bg-pink-400/10" };
  return { border: "border-l-[#ffffff30]", bg: "bg-[#FFFFFF0A]" };
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
        text: `tặng ${giftData.amount} ${giftName}`,
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
          text: `Không có dancer nào cho quà "${giftName}"`,
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

        useVideoStore.getState().enqueueVideo(path);
        scoreByPath.set(path, (scoreByPath.get(path) || 0) + 1);
      }

      scoreByPath.forEach((delta, path) => {
        useVideoStore.getState().addGiftScore(path, delta);
      });

      if (amount > MAX_PER_EVENT) {
        addLog({
          type: "warning",
          text: `⚠️ Quà x${amount}, chỉ lấy ${MAX_PER_EVENT}`,
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
            className={`w-2 h-2 rounded-full ${isConnected
                ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"
                : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"
              } animate-pulse`}
          />
        </div>

        <div className="flex justify-between items-center">
          <span
            className={`text-[10px] font-medium ${isConnected ? "text-green-400" : "text-red-400"
              }`}
          >
            {isConnected ? "Đã kết nối" : "Ngắt kết nối"}
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
          <div className="flex-1 flex items-center justify-center text-white/20 text-[10px] uppercase">
            Waiting for events...
          </div>
        ) : (
          logs.map((log) => {
            const style = getMessageStyle(log.type);

            return (
              <div
                key={log.id}
                className={`${style.bg} border-l-2 ${style.border} rounded-lg p-2.5 flex items-start gap-2 text-[11px] text-white/90`}
              >
                {log.avatar && (
                  <img
                    src={log.avatar}
                    alt=""
                    className="w-6 h-6 rounded-full object-cover shrink-0"
                  />
                )}

                <div className="break-words">
                  {log.name && (
                    <span className="font-semibold text-white">
                      {log.name}:{" "}
                    </span>
                  )}
                  {log.text}
                </div>
              </div>
            );
          })
        )}

        <div ref={chatEndRef} />
      </div>
      <div className="shrink-0 px-3 py-3 border-t border-white/5 text-center text-[9px] text-white/30 uppercase">
        TikTok LIVE Real-time Feed
      </div>
    </div>
  );
};

export default TikTokListener;