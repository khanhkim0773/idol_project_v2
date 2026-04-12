import React, { useMemo } from "react";
import { useVideoStore } from "../hooks/useVideoStore";

const rankStyles = {
 1: {
 label: "TOP 1",
 color: "text-[#fbbf24]",
 glow: "shadow-[0_0_15px_rgba(251,191,36,0.2)]",
 crown: "👑",
 },
 2: {
 label: "TOP 2",
 color: "text-[#cbd5e1]",
 glow: "shadow-[0_0_10px_rgba(203,213,225,0.15)]",
 crown: "🥈",
 },
 3: {
 label: "TOP 3",
 color: "text-[#fb923c]",
 glow: "shadow-[0_0_10px_rgba(249,146,60,0.15)]",
 crown: "🥉",
 },
};

function PodiumCell({ rank, data }) {
 const st = rankStyles[rank];
 const isTop1 = rank === 1;

 return (
 <div className={`flex flex-col items-center justify-end relative ${isTop1 ? 'z-20 scale-110' : 'z-10 scale-95 opacity-90'}`}>
 {/* Avatar with rank icon */}
 <div className="relative group">
 <div className={`relative rounded-full overflow-hidden ${isTop1 ? 'w-14 h-14' : 'w-11 h-11'} bg-black/40 backdrop-blur-md border border-white/10 ${st.glow} transition-transform duration-300`}>
 {data?.avatar ? (
 <img src={data.avatar} alt="" className="w-full h-full object-cover" />
 ) : (
 <div className="w-full h-full flex items-center justify-center text-[9px] text-white/20 font-bold">N/A</div>
 )}
 </div>
 {/* Floating Rank Icon */}
 <div className="absolute -top-1 -right-1 text-base drop-shadow-lg">
 {st.crown}
 </div>
 </div>

 <div className="mt-1.5 px-3 py-1 bg-white/[0.03] backdrop-blur-2xl border border-white/5 rounded-full flex flex-col items-center min-w-[60px]">
 <span className="text-[10px] font-semibold text-white/90 truncate max-w-[70px] leading-tight">
 {data?.name || "—"}
 </span>
 <div className="flex items-center gap-1 mt-0.5">
 <span className={`text-[9.5px] font-bold tabular-nums ${st.color}`}>
 {data?.score ?? "0"}
 </span>
 <span className="text-[6.5px] font-semibold text-white/20 ml-0.5">pts</span>
 </div>
 </div>
 </div>
 );
}

const VideoGiftPodium = () => {
 const videos = useVideoStore((state) => state.videos);
 const videoGiftScores = useVideoStore((state) => state.videoGiftScores);

 const { first, second, third } = useMemo(() => {
 const ranked = Object.entries(videoGiftScores)
 .filter(([, score]) => score > 0)
 .sort((a, b) => b[1] - a[1])
 .slice(0, 3)
 .map(([path, score]) => {
 const v = videos.find((x) => x.video === path);
 return {
 path,
 score,
 name: v?.name ?? path.split("/").pop() ?? "—",
 avatar: v?.avatar ?? "",
 };
 });
 return {
 first: ranked[0] ?? null,
 second: ranked[1] ?? null,
 third: ranked[2] ?? null,
 };
 }, [videoGiftScores, videos]);

 return (
 <div className="absolute top-4 left-0 right-0 z-[100] pointer-events-none px-2">
 <div className="flex flex-row items-end justify-center gap-4 sm:gap-6">
 <PodiumCell rank={2} data={second} />
 <PodiumCell rank={1} data={first} />
 <PodiumCell rank={3} data={third} />
 </div>
 </div>
 );
};

export default VideoGiftPodium;
