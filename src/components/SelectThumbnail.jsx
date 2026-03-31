import React from "react";
import { useVideoStore } from "../hooks/useVideoStore";
import { arrModels } from "../utils/data";



const SelectThumbnail = () => {
  const setSelectedVideo = useVideoStore((state) => state.setSelectedVideo);
  const selectedVideo = useVideoStore((state) => state.selectedVideo);

  return (
    <section className=" pointer-events-none">
      <div className=" bg-red-500 sm:block hidden  w-[300px] h-[400px] flex flex-col overflow-hidden rounded-2xl bg-white/10 backdrop-blur-xs">
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-center py-3 border-b border-white/10 text-white font-semibold">
          Chọn người mẫu
        </div>

        {/* Scroll area */}
        <div className="flex-1 overflow-auto flex flex-col gap-5 p-3">
          {arrModels.map((model) => {
            const isActive = selectedVideo === model.video;

            return (
              <div
                key={model.id}
                onClick={() => setSelectedVideo(model.video)}
                className={`w-full flex items-center justify-between px-3 cursor-pointer pointer-events-auto rounded-xl py-1 transition-all
        ${isActive ? "bg-white/20" : "hover:bg-white/20"}
      `}
              >
                <div className="rounded-md overflow-hidden border-2">
                  <img
                    src={model.image}
                    alt=""
                    className="w-10 h-10 object-cover"
                  />
                </div>
                <p className="text-white font-medium">{model.name}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default SelectThumbnail;
