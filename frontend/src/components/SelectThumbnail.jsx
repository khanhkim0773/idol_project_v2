import React from "react";
import { useVideoStore } from "../hooks/useVideoStore";
import { useIdolStore } from "../hooks/useIdolStore";
import { useGiftStore } from "../hooks/useGiftStore";

const SelectThumbnail = ({ isCompact = false }) => {
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
 src={idolModel?.avatar || videoModel?.avatar || "/images/default_avatar.png"}
 alt=""
 className="w-full h-full object-cover" onError={(e) => { e.target.src = "/images/default_avatar.png"; }}
 />
 </div>
 </div>
 );
 })}
 </div>
 </div>
 )}

 {/* Dancer list - TikTok Style Idol Grouping */}
 <div className={`flex-1 overflow-y-auto flex flex-col custom-scrollbar ${isCompact ? 'px-1 py-1 gap-1' : 'px-2 py-2 gap-1.5'}`}>
 {activeIdols.length === 0 ? (
 <div className={`flex-1 flex flex-col items-center justify-center text-white/10 font-medium ${isCompact ? 'text-[8px] py-4' : 'text-[10px] py-10'}`}>
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
 className={`flex items-center gap-2 sm:gap-3 rounded-xl sm:rounded-2xl cursor-pointer transition-all duration-300 relative group ${
 isIdolSelected 
 ? "bg-white/[0.08] shadow-[inset_0_0_20px_rgba(255,255,255,0.02)] border border-white/10" 
 : "hover:bg-white/[0.04] opacity-70 hover:opacity-100 border border-transparent"
 } ${isCompact ? 'px-1 py-1' : 'px-2 py-2'}`}
 >
 {/* Avatar */}
 <div className={`shrink-0 rounded-full overflow-hidden border-2 transition-all duration-500 shadow-2xl ${
 isIdolSelected ? 'border-[#d946ef] scale-105 p-0.5' : 'border-white/10 grayscale-[30%] group-hover:grayscale-0'
 } ${isCompact ? 'w-6 h-6 sm:w-8 sm:h-8' : 'w-8 h-8 sm:w-10 sm:h-10'}`}>
 <div className="w-full h-full rounded-full overflow-hidden bg-white/5">
 {idol.avatar ? (
 <img src={idol.avatar} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.src = "/images/default_avatar.png"; }} />
 ) : (
 <div className="w-full h-full flex items-center justify-center text-white/20 text-[10px]">?</div>
 )}
 </div>
 </div>

 {/* Name & Gifts Row */}
 <div className="flex-1 min-w-0 flex flex-col justify-center">
 <p className={`font-medium truncate leading-none ${
 isIdolSelected ? "text-[#eab308]" : "text-white/60 group-hover:text-white"
 } ${isCompact ? 'text-[7px] sm:text-[9px] mb-1' : 'text-[9.5px] sm:text-[10.5px] mb-1.5'}`}>
 {idol.name}
 </p>
 
 {/* Gift Icons Row */}
 <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-hidden">
 {giftIcons.length > 0 ? (
 giftIcons.slice(0, 5).map((icon, idx) => (
 <div key={idx} className={`rounded-md bg-black/40 p-0.5 border border-white/5 shrink-0 shadow-inner ${
 isCompact ? 'w-4 h-4 sm:w-5 sm:h-5' : 'w-5 h-5 sm:w-6 sm:h-6'
 }`}>
 <img src={icon} alt="" className="w-full h-full object-contain" />
 </div>
 ))
 ) : (
 <span className={`${isCompact ? 'text-[6px]' : 'text-[8px]'} text-white/20 font-medium tracking-tight`}>No Action</span>
 )}
 {giftIcons.length > 5 && <span className={`${isCompact ? 'text-[6px]' : 'text-[8px]'} text-white/30 font-medium`}>+{giftIcons.length-5}</span>}
 </div>
 </div>

 {/* Live Status Dot (Icon only, removed text) */}
 {isIdolSelected && (
 <div className={`absolute right-1 sm:right-3 top-1/2 -translate-y-1/2 leading-none flex items-center`}>
 <div className={`${isCompact ? 'w-1 h-1' : 'w-1.5 h-1.5'} rounded-full bg-[#06b6d4] shadow-[0_0_10px_rgba(6,182,212,1)] animate-pulse`} />
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
