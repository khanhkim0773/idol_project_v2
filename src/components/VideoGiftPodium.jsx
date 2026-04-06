import React, { useMemo } from "react";
import { useVideoStore } from "../hooks/useVideoStore";

const rankStyles = {
  1: {
    label: "TOP 1",
    size: "w-[68px] h-[68px] sm:w-[76px] sm:h-[76px]",
    ring: "ring-2 ring-[#fbbf24] ring-offset-2 ring-offset-black shadow-[0_0_30px_rgba(251,191,36,0.6)]",
    labelClass: "text-[#fbbf24] drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]",
    scoreClass: "text-[#fbbf24] drop-shadow-[0_0_12px_rgba(251,191,36,0.5)]",
    badgeBg: "bg-gradient-to-r from-[#fbbf24]/30 to-[#f59e0b]/30 border border-[#fbbf24]/80",
  },
  2: {
    label: "TOP 2",
    size: "w-[56px] h-[56px] sm:w-[60px] sm:h-[60px]",
    ring: "ring-2 ring-[#06b6d4] ring-offset-2 ring-offset-black shadow-[0_0_20px_rgba(6,182,212,0.6)]",
    labelClass: "text-[#06b6d4] drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]",
    scoreClass: "text-[#06b6d4] drop-shadow-[0_0_12px_rgba(6,182,212,0.5)]",
    badgeBg: "bg-gradient-to-r from-[#06b6d4]/30 to-[#0ea5e9]/30 border border-[#06b6d4]/80",
  },
  3: {
    label: "TOP 3",
    size: "w-[56px] h-[56px] sm:w-[60px] sm:h-[60px]",
    ring: "ring-2 ring-[#d946ef] ring-offset-2 ring-offset-black shadow-[0_0_20px_rgba(217,70,239,0.6)]",
    labelClass: "text-[#d946ef] drop-shadow-[0_0_8px_rgba(217,70,239,0.8)]",
    scoreClass: "text-[#d946ef] drop-shadow-[0_0_12px_rgba(217,70,239,0.5)]",
    badgeBg: "bg-gradient-to-r from-[#d946ef]/30 to-[#a855f7]/30 border border-[#d946ef]/80",
  },
};

function PodiumCell({ rank, data }) {
  const st = rankStyles[rank];
  return (
    <div className={`w-full max-w-[100px] sm:max-w-[120px] flex flex-col items-center justify-end relative ${rank === 1 ? 'z-20' : 'z-10'}`}>
      
      {/* Avatar Container */}
      <div className="relative flex flex-col items-center justify-center mb-1">
        <div
          className={`relative rounded-full overflow-hidden ${st.size} ${st.ring} bg-[#111] flex items-center justify-center shrink-0 transition-transform hover:scale-105 duration-300`}
        >
          {data?.avatar ? (
            <img
              src={data?.avatar}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/50 text-[12px] bg-white/5 font-black uppercase">
              N/A
            </div>
          )}
        </div>

        {/* Rank Badge */}
        <div className={`absolute -bottom-3 px-3 py-1 rounded-full ${st.badgeBg} backdrop-blur-md z-10 shadow-xl flex items-center justify-center`}>
          <span className={`text-[10px] sm:text-[11px] font-black uppercase tracking-[0.1em] text-center whitespace-nowrap ${st.labelClass} leading-none mb-[1px]`}>
            {st.label}
          </span>
        </div>
      </div>

      {/* Info Container */}
      <div className="flex flex-col items-center justify-center w-full px-1 pt-6 pb-2 bg-gradient-to-t from-black/70 via-black/30 to-transparent rounded-2xl mt-1">
        <p className="text-[11px] sm:text-[12px] font-extrabold text-white truncate max-w-full px-2 text-center w-full drop-shadow-md">
          {data?.name || "—"}
        </p>
        <p className={`text-[18px] sm:text-[20px] font-black tabular-nums leading-none mt-1.5 ${st.scoreClass}`}>
          {data?.score ?? "0"}
        </p>
        <p className="text-[8px] text-white/60 uppercase tracking-[0.3em] mt-1.5 font-bold">Điểm</p>
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
    <div className="absolute sm:top-10 top-6 left-0 right-0 z-[15] pointer-events-none px-2 sm:px-4 pt-2">
      <div className="mx-auto max-w-[380px]">
        <div className="flex flex-row items-end justify-center gap-2 sm:gap-4 px-2 pb-2 pt-1">
          <div className="flex-1 flex justify-center translate-y-3 sm:translate-y-4">
            <PodiumCell rank={2} data={second} />
          </div>
          <div className="flex-1 flex justify-center -translate-y-2 sm:-translate-y-3 scale-105 sm:scale-110 origin-bottom">
            <PodiumCell rank={1} data={first} />
          </div>
          <div className="flex-1 flex justify-center translate-y-3 sm:translate-y-4">
            <PodiumCell rank={3} data={third} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoGiftPodium;
