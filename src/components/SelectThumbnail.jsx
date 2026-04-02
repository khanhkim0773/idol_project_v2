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
    <div className="w-full h-full flex flex-col p-4 bg-transparent backdrop-blur-none">
      <div className="flex-shrink-0 flex items-center justify-between mb-2 text-white font-semibold">
        <p className="text-sm tracking-tight">Cấu hình Dancer</p>
        <div className="bg-white/10 text-[10px] px-2 py-0.5 rounded-full border border-white/5 uppercase">
          {activeVideos.length} Active
        </div>
      </div>

      {videoQueue.length > 0 && (
        <div className="shrink-0 mb-3 pb-3 border-b border-white/10">
          <div className="text-[10px] text-white/50 uppercase tracking-widest mb-2 flex items-center justify-between">
            <span>Hàng chờ kế tiếp</span>
            <span className="bg-pink-500/20 text-pink-400 px-1.5 py-0.5 rounded-full">{videoQueue.length}</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar pt-3">
            {videoQueue.map((videoPath, index) => {
              const model = videos.find((v) => v.video === videoPath);
              if (!model) return null;
              return (
                <div key={`${index}-${videoPath}`} className="relative shrink-0 select-none">
                  <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/20 shadow-sm relative group">
                    <img
                      src={model.avatar}
                      alt={model.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[8px] text-pink-400 font-medium px-0.5 text-center truncate w-full">
                        {model.gift || 'Auto'}
                      </span>
                    </div>
                  </div>
                  <div className="absolute -top-1.5 -right-1.5 bg-pink-500 text-white text-[9px] font-bold min-w-[16px] h-4 flex items-center justify-center rounded-full shadow-[0_0_5px_rgba(236,72,153,0.5)] px-1">
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
          <div className="text-white/30 text-[11px] text-center py-12 italic">
            Không có video nào đang active.
          </div>
        ) : (
          activeVideos.map((model) => {
            const isActive = selectedVideo === model.video;

            return (
              <div
                key={model.id}
                onClick={() => setSelectedVideo(model.video)}
                className={`w-full flex items-center gap-3 px-3 cursor-pointer rounded-xl py-2 transition-all duration-300
                  ${isActive ? "bg-white/10 border border-white/20" : "hover:bg-white/5 opacity-40 hover:opacity-80"}
                `}
              >
                <div className={`shrink-0 w-4 h-4 rounded-full ${isActive ? "bg-green-500" : "bg-white/5"} text-white text-[9px] flex items-center justify-center font-bold`}>
                  {model.order}
                </div>
                <div className="rounded-lg overflow-hidden border border-white/10 shadow-sm shrink-0">
                  <img
                    src={model.avatar}
                    alt={model.name}
                    className="w-10 h-10 object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-white font-medium truncate">
                    {model.name}
                  </p>
                  <p className="text-[10px] italic text-cyan-400 opacity-70 truncate">
                    {model.description}
                  </p>
                </div>
                {isActive && (
                  <div className="ml-2 w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
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
