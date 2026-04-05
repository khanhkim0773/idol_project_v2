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
    <div className="w-full h-full flex flex-col bg-transparent relative">
      <div className="px-6 py-4 shrink-0 border-b border-white/[0.05]">
        <div className="flex justify-between items-center px-1">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-[#06b6d4] shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#06b6d4]">
              Configuration
            </span>
          </div>

          <span className="text-[10px] text-white/40 font-bold tracking-[0.2em] uppercase">
            Active <span className="text-white/80 ml-1">{activeVideos.length}</span>
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-5 flex flex-col gap-4 custom-scrollbar relative z-10">
        {videoQueue.length > 0 && (
          <div className="shrink-0 mb-2 pb-5 border-b border-white/[0.05]">
            <div className="text-[9px] font-bold text-white/30 uppercase tracking-[0.2em] mb-4 flex items-center justify-between">
              <span>Up Next</span>
              <span className="bg-gradient-to-r from-[#d946ef] to-[#8b5cf6] text-white px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(217,70,239,0.4)]">
                {videoQueue.length}
              </span>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar mask-image-fade-edges">
              {videoQueue.map((videoPath, index) => {
                const model = videos.find((v) => v.video === videoPath);
                if (!model) return null;
                return (
                  <div key={`${index}-${videoPath}`} className="relative shrink-0 select-none">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden border border-white/10 shadow-sm relative group">
                      <img
                        src={model.avatar}
                        alt={model.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-md">
                        <span className="text-[9px] text-[#06b6d4] font-bold px-1 text-center truncate w-full">
                          {model.gift || 'Auto'}
                        </span>
                      </div>
                    </div>
                    <div className="absolute -top-2 -right-2 bg-[#d946ef] text-white text-[10px] font-black min-w-[20px] h-5 flex items-center justify-center rounded-full shadow-[0_0_10px_rgba(217,70,239,0.6)] px-1">
                      {index + 1}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex-1 overflow-auto flex flex-col gap-3 custom-scrollbar">
          {activeVideos.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-white/20 text-[10px] uppercase font-bold tracking-[0.2em] gap-3 opacity-50 py-10">
              <span className="text-2xl">🔌</span>
              No active Dancers
            </div>
          ) : (
            activeVideos.map((model) => {
              const isActive = selectedVideo === model.video;

              return (
                <div
                  key={model.id}
                  onClick={() => setSelectedVideo(model.video)}
                  className={`w-full flex items-center gap-4 px-4 py-3.5 cursor-pointer rounded-[1.25rem] transition-all duration-300
                    ${isActive ? "bg-white/[0.06] border border-white/20 shadow-[0_10px_20px_rgba(0,0,0,0.2)]" : "bg-transparent border border-transparent hover:bg-white/[0.02] opacity-50 hover:opacity-100"}
                  `}
                >
                  <div className={`shrink-0 w-6 h-6 rounded-full text-[10px] flex items-center justify-center font-black ${isActive ? "bg-[#06b6d4]/20 text-[#06b6d4] shadow-inner" : "bg-white/5 text-gray-500"}`}>
                    {model.order}
                  </div>
                  <div className={`rounded-xl overflow-hidden shadow-sm shrink-0 ${isActive ? "border border-[#06b6d4]/50 ring-2 ring-[#06b6d4]/20" : "border border-white/10"}`}>
                    <img
                      src={model.avatar}
                      alt={model.name}
                      className="w-11 h-11 object-cover opacity-90 hover:opacity-100 transition-opacity"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-[14px] font-bold truncate ${isActive ? "text-white" : "text-gray-400"}`}>
                      {model.name}
                    </p>
                    <p className={`text-[11px] font-medium truncate mt-0.5 ${isActive ? "text-[#d946ef]" : "text-gray-600"}`}>
                      {model.description || "Dancer Profile"}
                    </p>
                  </div>
                  {isActive && (
                    <div className="w-2.5 h-2.5 rounded-full bg-[#10b981] animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.7)] shrink-0" />
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default SelectThumbnail;
