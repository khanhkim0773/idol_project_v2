import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useVideoStore } from "../hooks/useVideoStore";
import { useIdolStore } from "../hooks/useIdolStore";
import { useTTSStore } from "../hooks/useTTSStore";
import { SOCKET_URL } from "../utils/constant";
import { MESSAGE_TYPE } from "../utils/type";

const getMessageStyle = (type) => {
 if (type === "gift") return "text-[#d946ef]";
 if (type === "member") return "text-[#3b82f6]";
 if (type === "warning") return "text-[#fbbf24]";
 if (type === "connect") return "text-[#10b981]";
 if (type === "disconnect") return "text-red-400";
 return "text-white/90";
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
 const newLogs = [...prev, { ...data, id: Date.now() + Math.random() }];
 if (newLogs.length > 50) newLogs.shift();
 return newLogs;
 });
 };

 socket.on("connect", () => {
 setIsConnected(true);
 addLog({ type: "connect", text: MESSAGE_TYPE.CONNECT });
 });

 socket.on("disconnect", () => {
 setIsConnected(false);
 addLog({ type: "disconnect", text: MESSAGE_TYPE.DISCONNECT });
 });

 socket.on("tiktok_gift", (giftData) => {
 const giftName = giftData.giftName ?? "";
 addLog({
 type: "gift",
 name: giftData.nickname,
 text: `vừa tặng ${giftData.amount} ${giftName} 🎁`,
 avatar: giftData.profilePicture,
 });

 useTTSStore.getState().speakGift(giftData.nickname, giftData.amount, giftName);

 const activeVideos = useVideoStore.getState().getActiveVideos();
 if (activeVideos.length === 0) return;

 const giftNameLower = giftName.toLowerCase().trim();
 const n = Math.min(Number(giftData.amount ?? 1), 50);

 // --- 2-TIER TRIGGER SYSTEM ---
 // Tier 1: Is there a video that explicitly asks for this gift?
 let matchedVideos = activeVideos.filter(
 (v) => v.gift && v.gift.toLowerCase().trim() === giftNameLower
 );

 // Tier 2: Global fallback (Random among any active idol)
 if (matchedVideos.length === 0) {
 matchedVideos = activeVideos;
 }

 if (matchedVideos.length === 0) return;

 const state = useVideoStore.getState();
 const lastQueued = state.videoQueue[state.videoQueue.length - 1] ?? state.selectedVideo;
 const curIdx = matchedVideos.findIndex((v) => v.video === lastQueued);
 const scoreByPath = new Map();

 for (let i = 0; i < n; i++) {
 // Rotary mode pick
 const idx = ((curIdx === -1 ? 0 : curIdx) + 1 + i) % matchedVideos.length;
 const path = matchedVideos[idx].video;
 useVideoStore.getState().enqueueVideo(path, giftName);
 scoreByPath.set(path, (scoreByPath.get(path) || 0) + 1);
 }
 scoreByPath.forEach((delta, path) => useVideoStore.getState().addGiftScore(path, delta));
 });

 socket.on("tiktok_member", (data) => {
 const name = data.nickname || data.user;
 addLog({ type: "member", name, text: "vừa tham gia", avatar: data.profilePicture });
 useTTSStore.getState().speakWelcome(name);
 });

 socket.on("tiktok_chat", (msg) => {
 addLog({ type: "chat", name: msg.nickname || msg.user, text: msg.comment, avatar: msg.profilePicture });
 });

 return () => socket.disconnect();
 }, []);

 return (
 <div className="w-full h-full flex flex-col bg-transparent">
 {/* Header compact */}
 <div className="shrink-0 px-4 py-2 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
 <div className="flex items-center gap-2">
 <div className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${isConnected ? "bg-[#10b981] animate-pulse" : "bg-red-500"}`} />
 <span className="text-[8px] sm:text-[9px] font-semibold text-white/40">
 {isConnected ? "Live Stream" : "Disconnected"}
 </span>
 </div>
 <span className="text-[8px] sm:text-[9px] font-semibold text-white/30 tracking-tight">
 IDOL <span className="text-white/55">{actualIndex + 1}/{activeVideos.length}</span>
 </span>
 </div>

 {/* Messages */}
 <div className="flex-1 overflow-y-auto px-1.5 py-1 flex flex-col gap-0.5 custom-scrollbar">
 {logs.length === 0 ? (
 <div className="flex-1 flex items-center justify-center text-white/10 text-[9px] font-bold tracking-[0.2em] py-10">
 Awaiting Activity...
 </div>
 ) : (
 logs.map((log) => (
 <div key={log.id} className="flex items-start gap-1.5 sm:gap-2.5 px-2 sm:px-2.5 py-1 sm:py-1.5 hover:bg-white/[0.03] rounded-lg transition-colors group">
 {log.avatar ? (
 <img src={log.avatar} alt="" className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover shrink-0 border border-white/5" />
 ) : (
 <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white/5 shrink-0" />
 )}
 <div className="flex-1 min-w-0 leading-tight">
 {log.name && (
 <span className="text-[9.5px] sm:text-[10.5px] font-semibold text-white/50 mr-1 group-hover:text-white/80 transition-colors">
 {log.name}
 </span>
 )}
 <span className={`text-[9.5px] sm:text-[10.5px] font-normal break-words leading-tight sm:leading-snug ${getMessageStyle(log.type)}`}>
 {log.text}
 </span>
 </div>
 </div>
 ))
 )}
 <div ref={chatEndRef} />
 </div>
 </div>
 );
};

export default TikTokListener;