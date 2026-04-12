import React from "react";
import { useVideoStore } from "../hooks/useVideoStore";
import { useIdolStore } from "../hooks/useIdolStore";
import { useGiftStore } from "../hooks/useGiftStore";

const SelectThumbnail = () => {
  const setSelectedVideo = useVideoStore((state) => state.setSelectedVideo);
  const selectedVideoPath = useVideoStore((state) => state.selectedVideo);
  const videoQueue = useVideoStore((state) => state.videoQueue);
  const videos = useVideoStore((state) => state.videos);
  const gifts = useGiftStore((state) => state.gifts);
  const idols = useIdolStore((state) => state.idols);

  const activeIdols = idols
    .filter((i) => i.active)
    .sort((a, b) => a.order - b.order);

  // Find the idol that owns the currently selected video
  const selectedVideoModel = videos.find(v => v.video === selectedVideoPath);
  const currentIdolId = selectedVideoModel ? selectedVideoModel.idolId : null;

  return (
    <div className="w-full h-full flex flex-col bg-transparent">
      {/* Queue row (compact) - Shows who is up next */}
      {videoQueue.length > 0 && (
        <div className="shrink-0 px-3 py-2 border-b border-white/[0.04] bg-white/[0.01]">
          <div className="flex gap-2.5 overflow-x-auto pb-1 custom-scrollbar">
            {videoQueue.map((q, index) => {
              const videoModel = videos.find((v) => v.video === q.videoPath);
              const idolModel = videoModel ? idols.find(i => i.id === videoModel.idolId) : null;
              if (!videoModel) return null;
              return (
                <div key={`${index}-${q.videoPath}`} className="relative shrink-0">
                  <div className="w-6 sm:w-8 h-6 sm:h-8 rounded-xl overflow-hidden border border-[#d946ef]/30 shadow-[0_0_10px_rgba(217,70,239,0.2)]">
                    <img
                      src={idolModel?.avatar || videoModel.avatar}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {q.count > 1 && (
                    <div className="absolute -top-1 -right-1 bg-[#d946ef] text-white text-[8px] font-black px-1 rounded-full min-w-[14px] text-center shadow-lg border border-white/20">
                      {q.count}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Dancer list - TikTok Style Idol Grouping */}
      <div className="flex-1 overflow-y-auto px-2 py-2 flex flex-col gap-1.5 custom-scrollbar">
        {activeIdols.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-white/10 text-[10px] font-bold py-10">
            Trống thành viên
          </div>
        ) : (
          activeIdols.map((idol) => {
            const isIdolSelected = currentIdolId === idol.id;
            
            // Collect gift icons for this idol's active videos
            const idolVideos = videos.filter(v => v.idolId === idol.id && v.active);
            const giftNames = [...new Set(idolVideos.map(v => v.gift).filter(Boolean))];
            const giftIcons = giftNames.map(name => gifts.find(g => g.giftName === name)?.image).filter(Boolean);

            const handleIdolClick = () => {
                if (idolVideos.length > 0) {
                    // Try to pick a new video or just the first one if not already playing
                    setSelectedVideo(idolVideos[0].video);
                }
            };

            return (
              <div
                key={idol.id}
                onClick={handleIdolClick}
                className={`flex items-center gap-3 px-2 py-2 rounded-2xl cursor-pointer transition-all duration-300 relative group ${
                  isIdolSelected 
                    ? "bg-white/[0.08] shadow-[inset_0_0_20px_rgba(255,255,255,0.02)] border border-white/10" 
                    : "hover:bg-white/[0.04] opacity-70 hover:opacity-100 border border-transparent"
                }`}
              >
                {/* Avatar */}
                <div className={`shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 transition-all duration-500 shadow-2xl ${
                    isIdolSelected ? 'border-[#d946ef] scale-105 p-0.5' : 'border-white/10 grayscale-[30%] group-hover:grayscale-0'
                }`}>
                  <div className="w-full h-full rounded-full overflow-hidden bg-white/5">
                    {idol.avatar ? (
                        <img src={idol.avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/20 text-[10px]">?</div>
                    )}
                  </div>
                </div>

                {/* Name & Gifts Row */}
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <p className={`text-[10px] sm:text-[11px] font-black uppercase tracking-wider truncate leading-none mb-1.5 ${
                      isIdolSelected ? "text-[#eab308]" : "text-white/60 group-hover:text-white"
                  }`}>
                    {idol.name}
                  </p>
                  
                  {/* Gift Icons Row */}
                  <div className="flex items-center gap-1 overflow-x-hidden">
                      {giftIcons.length > 0 ? (
                          giftIcons.slice(0, 5).map((icon, idx) => (
                              <div key={idx} className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-md bg-black/40 p-0.5 border border-white/5 shrink-0 shadow-inner">
                                  <img src={icon} alt="" className="w-full h-full object-contain" />
                              </div>
                          ))
                      ) : (
                          <span className="text-[8px] text-white/20 font-bold uppercase tracking-tighter">No Action</span>
                      )}
                      {giftIcons.length > 5 && <span className="text-[8px] text-white/30 font-black">+{giftIcons.length-5}</span>}
                  </div>
                </div>

                {/* Live Status Dot */}
                {isIdolSelected && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#06b6d4] shadow-[0_0_10px_rgba(6,182,212,1)] animate-pulse" />
                      <span className="text-[6px] font-black text-[#06b6d4] uppercase tracking-tighter">Live</span>
                  </div>
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
