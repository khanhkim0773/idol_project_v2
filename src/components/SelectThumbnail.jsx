import React from "react";
import { useVideoStore } from "../hooks/useVideoStore";

const SelectThumbnail = () => {
  const setSelectedVideo = useVideoStore((state) => state.setSelectedVideo);
  const selectedVideo = useVideoStore((state) => state.selectedVideo);
  const getActiveVideos = useVideoStore((state) => state.getActiveVideos);

  const activeVideos = getActiveVideos();

  return (
    <section className=" pointer-events-none sm:block hidden ">
      <div className="  w-[300px] h-[400px] min-h-0 flex flex-col overflow-hidden rounded-2xl  backdrop-blur-xs">
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between py-3 text-white font-semibold">
          <p>Chọn người mẫu</p>
          <div className="bg-white/10 text-sm px-2 py-1 rounded-md">
            {activeVideos.length} Active
          </div>
        </div>

        <div className="flex-1 overflow-auto flex flex-col gap-5 mt-3">
          {activeVideos.length === 0 ? (
            <div className="text-white/30 text-xs text-center py-8 italic">
              Không có video nào đang active.
              <br />
            </div>
          ) : (
            activeVideos.map((model) => {
              const isActive = selectedVideo === model.video;

              return (
                <div
                  key={model.id}
                  onClick={() => setSelectedVideo(model.video)}
                  className={`w-full flex items-center gap-4 px-3 cursor-pointer pointer-events-auto rounded-xl py-1 transition-all
                    ${isActive ? "bg-white/20" : "hover:bg-white/20 opacity-35"}
                  `}
                >
                  {/* order badge */}
                  <div className="shrink-0 w-5 h-5 rounded-full bg-white/10 text-white/50 text-[10px] flex items-center justify-center font-bold">
                    {model.order}
                  </div>
                  <div className="rounded-md overflow-hidden border-2">
                    <img
                      src={model.avatar}
                      alt=""
                      className="w-12 h-12 object-contain"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">
                      {model.name}
                    </p>
                    <p className="text-xs font-semibold italic mt-1 text-neon/80 truncate">
                      {model.description}
                    </p>
                  </div>
                  {isActive && (
                    <div className="ml-auto text-xs bg-green-600 px-2 py-1 rounded-md text-white shrink-0">
                      Đang chọn
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
};

export default SelectThumbnail;
