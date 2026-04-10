import React from "react";
import { useVideoStore } from "../hooks/useVideoStore";

const SelectThumbnail = () => {
  const setSelectedVideo = useVideoStore((state) => state.setSelectedVideo);
  const selectedVideo = useVideoStore((state) => state.selectedVideo);
  const getActiveVideos = useVideoStore((state) => state.getActiveVideos);
  const videoQueue = useVideoStore((state) => state.videoQueue);
  const videos = useVideoStore((state) => state.videos);

  const activeVideos = getActiveVideos();

  return (
    <div className="w-full h-full flex flex-col bg-transparent">

      {/* Queue row (compact) */}
      {videoQueue.length > 0 && (
        <div className="shrink-0 px-3 py-1.5 border-b border-white/[0.04]">
          <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
            {videoQueue.map((videoPath, index) => {
              const model = videos.find((v) => v.video === videoPath);
              if (!model) return null;
              return (
                <div key={`${index}-${videoPath}`} className="relative shrink-0">
                  <div className="w-5 sm:w-7 h-5 sm:h-7 rounded-lg overflow-hidden border border-white/5">
                    <img src={model.avatar} alt="" className="w-full h-full object-cover opacity-60" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Dancer list - TikTok Style */}
      <div className="flex-1 overflow-y-auto px-1.5 py-1 flex flex-col gap-0.5 custom-scrollbar">
        {activeVideos.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-white/10 text-[9px] font-bold py-6">
            No active
          </div>
        ) : (
          activeVideos.map((model) => {
            const isActive = selectedVideo === model.video;
            return (
              <div
                key={model.id}
                onClick={() => setSelectedVideo(model.video)}
                className={`flex items-center gap-2 sm:gap-3 px-1.5 sm:px-2 py-1 sm:py-1.5 rounded-lg cursor-pointer transition-all duration-200 ${
                  isActive ? "bg-white/[0.08]" : "hover:bg-white/[0.03] opacity-80 hover:opacity-100"
                }`}
              >
                {/* Icon / Avatar - Cleaner look */}
                <div className="shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-lg overflow-hidden group">
                  {model.avatar ? (
                    <img src={model.avatar} alt="" className={`w-full h-full object-cover transition-transform duration-500 ${isActive ? 'scale-110 shadow-lg' : 'grayscale-[40%]'}`} />
                  ) : (
                    <div className="w-full h-full bg-white/5 flex items-center justify-center text-white/20 text-[10px]">?</div>
                  )}
                </div>

                {/* Name in Yellow/White - TikTok Style */}
                <div className="flex-1 min-w-0">
                  <p className={`text-[10px] sm:text-[12px] font-black uppercase tracking-wider truncate leading-tight ${isActive ? "text-[#fbbf24]" : "text-[#fbbf24]/80 group-hover:text-[#fbbf24]"}`}>
                    {model.name}
                  </p>
                </div>

                {/* Status Dot */}
                {isActive && (
                  <div className="w-1.5 h-1.5 rounded-full bg-[#06b6d4] shadow-[0_0_8px_rgba(6,182,212,1)] shrink-0" />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default SelectThumbnail;
