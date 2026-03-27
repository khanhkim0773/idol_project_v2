import React from "react";

const arrModels = [
  {
    id: 1,
    name: "Model 1",
    image: "/images/moews.jpeg",
    video: "/video/black_1.mp4",
  },
  {
    id: 2,
    name: "Model 2",
    image: "/images/moews.jpeg",
    video: "/video/dance-2.mp4",
  },
  {
    id: 3,
    name: "Model 3",
    image: "/images/moews.jpeg",
    video: "/video/tieu_my.mp4",
  },
  {
    id: 4,
    name: "Model 4",
    image: "/images/moews.jpeg",
    video: "/video/dance-3.mp4",
  },
  {
    id: 5,
    name: "Model 5",
    image: "/images/moews.jpeg",
    video: "/video/dance-4.mp4",
  },
];

const SelectThumbnail = () => {
  return (
    <section className="fixed inset-0 z-10 flex items-center justify-center pointer-events-none">
      <div className="absolute bg-red-500 right-4 w-[300px] h-[400px] flex flex-col overflow-hidden rounded-2xl bg-white/10 backdrop-blur-xs">
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-center py-3 border-b border-white/10 text-white font-semibold">
          Chọn người mẫu
        </div>

        {/* Scroll area */}
        <div className="flex-1 overflow-auto flex flex-col gap-5 p-3">
          {arrModels.map((model) => {
            return (
              <div
                key={model.id}
                className="w-full flex items-center justify-between px-3 cursor-pointer pointer-events-auto rounded-xl py-1 transition-all"
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
