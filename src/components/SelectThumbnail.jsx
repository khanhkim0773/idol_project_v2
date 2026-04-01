import React from "react";
import { useVideoStore } from "../hooks/useVideoStore";
import { arrModels } from "../utils/data";



const SelectThumbnail = () => {
  const setSelectedVideo = useVideoStore((state) => state.setSelectedVideo);
  const selectedVideo = useVideoStore((state) => state.selectedVideo);

  return (
    <section className=" pointer-events-none">
      <div className=" sm:block hidden  w-[300px] h-[400px] flex flex-col overflow-hidden rounded-2xl  backdrop-blur-xs">
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between py-3 text-white font-semibold">
          <p>Chọn người mẫu</p>
          <div className="bg-white/10 text-sm px-2 py-1 rounded-md">Active</div>
        </div>

        {/* Scroll area */}
        <div className="flex-1 overflow-auto flex flex-col gap-5 mt-3">
          {arrModels.map((model) => {
            const isActive = selectedVideo === model.video;

            return (
              <div
                key={model.id}
                onClick={() => setSelectedVideo(model.video)}
                className={`w-full flex items-center gap-4 px-3 cursor-pointer pointer-events-auto rounded-xl py-1 transition-all
        ${isActive ? "bg-white/20" : "hover:bg-white/20 opacity-35"}
      `}
              >
                <div className="rounded-md overflow-hidden border-2">
                  <img
                    src={model.image}
                    alt=""
                    className="w-12 h-12 object-contain"
                  />
                </div>
                <div>
                  <p className="text-white font-medium">{model.name}</p>
                  <p className="text-xs font-semibold italic mt-1 text-neon/80">{model.description}</p>
                </div>
                {isActive && (
                  <div className="ml-auto text-xs bg-green-600 px-2 py-1 rounded-md text-white">
                    Đang chọn
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default SelectThumbnail;
