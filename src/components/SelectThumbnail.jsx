import React from "react";
import { useVideoStore } from "../hooks/useVideoStore";

const SelectThumbnail = () => {
  const setSelectedVideo = useVideoStore((state) => state.setSelectedVideo);
  const selectedVideo = useVideoStore((state) => state.selectedVideo);
  const getActiveVideos = useVideoStore((state) => state.getActiveVideos);

  const activeVideos = getActiveVideos();

  return (
    <div className="w-full h-full flex flex-col p-4 bg-transparent backdrop-blur-none">
      {/* Header Info (Optionally kept or moved to ResizableDraggable) */}
      <div className="flex-shrink-0 flex items-center justify-between mb-4 text-white font-semibold">
        <p className="text-sm tracking-tight">Cấu hình Dancer</p>
        <div className="bg-white/10 text-[10px] px-2 py-0.5 rounded-full border border-white/5 uppercase">
          {activeVideos.length} Active
        </div>
      </div>

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
                  ${isActive ? "bg-white/10 ring-1 ring-white/20" : "hover:bg-white/5 opacity-40 hover:opacity-80"}
                `}
              >
                <div className="shrink-0 w-4 h-4 rounded-full bg-white/5 text-white/50 text-[9px] flex items-center justify-center font-bold">
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
