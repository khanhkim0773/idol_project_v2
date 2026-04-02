import React, { useMemo } from "react";
import { useVideoStore } from "../hooks/useVideoStore";

const rankStyles = {
  1: {
    label: "TOP 1",
    size: "w-14 h-14 sm:w-18 sm:h-18",
    // bar: "h-[52px] sm:h-[60px] bg-gradient-to-b from-amber-400/90 to-amber-600/80 ring-2 ring-amber-300/60",
    ring: "ring-2 ring-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.35)]",
    labelClass: "text-amber-300",
  },
  2: {
    label: "TOP 2",
    size: "w-12 h-12 sm:w-14 sm:h-14",
    // bar: "h-[38px] sm:h-[44px] bg-gradient-to-b from-slate-300/90 to-slate-500/80 ring-1 ring-slate-200/50",
    ring: "ring-2 ring-slate-300/70",
    labelClass: "text-slate-300",
  },
  3: {
    label: "TOP 3",
    size: "w-12 h-12 sm:w-14 sm:h-14",
    // bar: "h-[30px] sm:h-[36px] bg-gradient-to-b from-orange-400/85 to-amber-800/75 ring-1 ring-orange-300/40",
    ring: "ring-2 ring-orange-500/60",
    labelClass: "text-orange-300",
  },
};

function PodiumCell({ rank, data }) {
  const st = rankStyles[rank];
  return (
    <div className="w-full max-w-[100px] sm:max-w-[120px] flex flex-col items-center justify-end min-h-[120px] sm:min-h-[140px] relative">
      <div
        className={`relative rounded-full overflow-hidden ${st.size} ${st.ring} bg-black/40`}
      >
        {data?.avatar ? (
          <img
            src={data?.avatar}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/40 text-xs">
            ?
          </div>
        )}
      </div>

      <p
        className={`text-[9px] sm:text-[10px] font-bold mt-1.5 uppercase tracking-wide ${st.labelClass}`}
      >
        {st.label}
      </p>
      <p className="text-[10px] sm:text-[11px] text-white font-semibold truncate max-w-full px-0.5 text-center leading-tight mt-0.5">
        {data?.name}
      </p>
      
      {/* <p className="text-lg sm:text-xl font-black text-white tabular-nums leading-none mt-1">
        {data?.score ?? "0"}
      </p>
      <p className="text-[8px] text-white/45 uppercase mt-0.5">điểm</p> */}
      {/* <div className={`w-full mt-1.5 rounded-t-md ${st.bar}`} /> */}
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
    <div className="absolute sm:top-0 -top-3 left-0 right-0 z-[15] pointer-events-none px-1 sm:px-2 pt-1 sm:pt-2">
      <div className="mx-auto max-w-[340px]">
        <div className="flex flex-row items-end justify-center gap-1 sm:gap-3 px-2 pb-2 pt-1">
          <div className="flex-1 flex justify-center">
            <PodiumCell rank={2} data={second} />
          </div>
          <div className="flex-1 flex justify-center -translate-y-1 sm:-translate-y-3 scale-105 sm:scale-110 origin-bottom">
            <PodiumCell rank={1} data={first} />
          </div>
          <div className="flex-1 flex justify-center">
            <PodiumCell rank={3} data={third} />
          </div>
        </div>
      </div>
    </div>
  );
};
export default VideoGiftPodium;
