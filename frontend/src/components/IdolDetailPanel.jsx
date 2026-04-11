import React, { useState, useRef } from "react";
import { useIdolStore } from "../hooks/useIdolStore";
import { useVideoStore } from "../hooks/useVideoStore";
import { useGiftStore } from "../hooks/useGiftStore";
import { SOCKET_URL } from "../utils/constant";
import {
  MdClose,
  MdImage,
  MdCloudUpload,
  MdCheck,
  MdOndemandVideo,
  MdCardGiftcard,
  MdRecentActors,
  MdAdd,
  MdDelete,
  MdEdit,
} from "react-icons/md";

// Note: Re-using the same upload util
const API = SOCKET_URL;

async function uploadFile(file, type) {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API}/api/upload/${type}`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) {
    let msg = res.statusText;
    try {
      const body = await res.json();
      if (body.error) msg = body.error;
    } catch {}
    throw new Error(msg);
  }
  const data = await res.json();
  return data.path;
}

const IdolDetailPanel = ({ idolId, onClose }) => {
  const { idols, updateIdol } = useIdolStore();
  const { videos, addVideo, updateVideo, deleteVideo } = useVideoStore();
  const { gifts, updateGift } = useGiftStore();

  const idol = idols.find((i) => i.id === idolId);
  const idolVideos = videos.filter((v) => v.idolId === idolId).sort((a,b) => a.order - b.order);
  const idolGifts = gifts.filter((g) => g.idolId === idolId);

  const [activeTab, setActiveTab] = useState("info"); // info, videos, gifts

  if (!idol) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 sm:p-6">
      <div className="w-full max-w-5xl h-[90vh] bg-[#1a1b26]/90 border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col backdrop-blur-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.05] bg-white/[0.02] shrink-0">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-full overflow-hidden bg-[#252630] border-2 border-[#d946ef]/40 flex items-center justify-center">
                 {idol.avatar ? <img src={idol.avatar} className="w-full h-full object-cover" /> : <MdRecentActors size={24} className="text-gray-500"/>}
             </div>
             <div>
                <h2 className="text-white font-black text-xl tracking-tight">{idol.name}</h2>
                <p className="text-[12px] text-gray-500 font-mono tracking-wider">ID: {idol.id} • {idolVideos.length} Videos • {idolGifts.length} Gifts</p>
             </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-2 rounded-xl hover:bg-white/[0.08] transition">
            <MdClose size={24} />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex px-6 gap-6 border-b border-white/[0.05] shrink-0">
           <button onClick={() => setActiveTab("info")} className={`py-4 font-bold border-b-2 transition-colors ${activeTab === 'info' ? 'border-[#d946ef] text-[#d946ef]' : 'border-transparent text-gray-500 hover:text-white'}`}>
              Thông Tin Chung
           </button>
           <button onClick={() => setActiveTab("videos")} className={`py-4 font-bold border-b-2 transition-colors ${activeTab === 'videos' ? 'border-[#06b6d4] text-[#06b6d4]' : 'border-transparent text-gray-500 hover:text-white'}`}>
              Kho Video & Quà
           </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
           {activeTab === "info" && <TabInfo idol={idol} updateIdol={updateIdol} />}
           {activeTab === "videos" && <TabVideos idol={idol} idolVideos={idolGifts.length} allVideos={videos} allGifts={gifts} updateVideo={updateVideo} />}
        </div>
      </div>
    </div>
  );
};

// --- Tab Components ---

const TabInfo = ({ idol, updateIdol }) => {
  const [form, setForm] = useState(idol);
  const [uploading, setUploading] = useState(false);
  const avatarRef = useRef();

  const handleAvatarFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const localUrl = URL.createObjectURL(file);
    setForm(p => ({ ...p, avatar: localUrl }));
    setUploading(true);
    try {
      const path = await uploadFile(file, "avatar");
      setForm(p => ({ ...p, avatar: path }));
      updateIdol(idol.id, { avatar: path });
      URL.revokeObjectURL(localUrl);
    } catch (err) {
      alert("Lỗi upload: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSaveName = () => {
     if (form.name.trim() && form.name !== idol.name) {
       updateIdol(idol.id, { name: form.name.trim() });
     }
  };

  return (
     <div className="max-w-xl flex flex-col gap-8">
        <div className="flex items-center gap-6">
           <div
              className={`relative shrink-0 w-32 h-32 rounded-3xl border-2 border-dashed bg-[#252630] flex flex-col items-center justify-center cursor-pointer transition-colors overflow-hidden ring-4 ring-[#252630]/50 ${uploading ? "border-[#06b6d4]" : "border-[#3f404d] hover:border-[#06b6d4]"}`}
              onClick={() => !uploading && avatarRef.current?.click()}
            >
              {form.avatar ? (
                <img src={form.avatar} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                 <div className="flex flex-col items-center gap-2 text-gray-500">
                   <MdCloudUpload size={32} />
                   <span className="text-[10px] uppercase font-bold tracking-wider">Chọn Ảnh</span>
                 </div>
              )}
               <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition flex items-center justify-center">
                 {uploading ? <div className="w-8 h-8 border-3 border-[#06b6d4] border-t-transparent rounded-full animate-spin" /> : <MdImage size={28} className="text-white" />}
               </div>
               <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarFile} />
            </div>
            <div>
               <h3 className="text-lg font-bold text-white mb-1">Ảnh Đại Diện</h3>
               <p className="text-sm text-gray-500">Click vào khung ảnh để thay đổi. Ảnh này sẽ được áp dụng làm avatar chung cho mọi video của idol.</p>
            </div>
        </div>

        <div>
           <label className="text-[10px] uppercase font-black text-gray-500 tracking-wider mb-2 block">Tên Idol</label>
           <div className="flex gap-3">
              <input
                value={form.name}
                onChange={(e) => setForm({...form, name: e.target.value})}
                className="flex-1 bg-[#252630] border border-[#2e2f38] rounded-xl px-5 py-3 text-white focus:outline-none focus:border-[#d946ef]/60 transition-all font-semibold"
              />
              <button 
                onClick={handleSaveName}
                disabled={form.name === idol.name || !form.name.trim()}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#d946ef] to-[#8b5cf6] text-white font-bold disabled:opacity-30 disabled:grayscale transition"
              >
                Cập nhật
              </button>
           </div>
        </div>
     </div>
  );
};

const TabVideos = ({ idol, allVideos, allGifts, updateVideo }) => {
   const [isPickerOpen, setIsPickerOpen] = useState(false);

   const idolVideos = allVideos
       .filter((v) => v.idolId === idol.id)
       .sort((a,b) => a.order - b.order);

   // Unassigned videos available for picking
   const availableVideos = allVideos.filter(v => !v.idolId);

   const handleRemoveFromIdol = (videoId) => {
       updateVideo(videoId, { idolId: null, gift: "" });
   };

   return (
       <div className="flex flex-col gap-6 h-full relative">
          <div className="flex justify-between items-center bg-white/[0.02] p-5 rounded-2xl border border-white/5">
              <div>
                  <h3 className="text-white font-bold text-lg">Danh sách Video của {idol.name}</h3>
                  <p className="text-gray-400 text-sm mt-1">Các video đã được lấy từ Thư Viện Gốc đưa vào nhân vật này. Gán Quà (Tầng 1) cho từng video ở đây.</p>
              </div>
              <button onClick={() => setIsPickerOpen(true)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#06b6d4]/10 text-[#06b6d4] hover:bg-[#06b6d4]/20 font-bold border border-[#06b6d4]/30 transition">
                 <MdAdd size={20}/>
                 Chọn Video Có Sẵn
              </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             {idolVideos.length === 0 && (
                <div className="col-span-full py-10 text-center text-gray-500 border border-dashed border-white/10 rounded-2xl">
                   Chưa có video nào. Hãy chọn từ kho tư liệu.
                </div>
             )}
             {idolVideos.map(v => (
                 <VideoCardMini key={v.id} video={v} allGifts={allGifts} updateVideo={updateVideo} handleRemove={handleRemoveFromIdol} />
             ))}
          </div>

          {isPickerOpen && (
             <div className="absolute inset-0 bg-black/60 backdrop-blur-md rounded-2xl flex items-center justify-center z-20">
                 <div className="w-[95%] max-w-4xl bg-[#1a1b26]/95 border border-white/10 rounded-3xl flex flex-col max-h-[85%] overflow-hidden shadow-2xl backdrop-blur-2xl">
                    <div className="flex justify-between items-center p-5 sm:px-7 border-b border-white/5 bg-white/[0.02]">
                       <div>
                          <h3 className="text-white font-bold text-lg">Kho Tư Liệu Trống</h3>
                          <p className="text-gray-400 text-xs mt-1">Chọn các video đưa vào kho cho {idol.name}.</p>
                       </div>
                       <button onClick={()=>setIsPickerOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-gray-500 hover:text-white hover:bg-white/10 transition">
                          <MdClose size={20}/>
                       </button>
                    </div>
                    <div className="p-5 sm:p-7 overflow-y-auto flex-1 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 custom-scrollbar">
                       {availableVideos.length === 0 && (
                          <div className="col-span-full py-16 flex flex-col items-center justify-center text-gray-500 border border-dashed border-white/10 rounded-2xl">
                             <MdOndemandVideo size={48} className="mb-3 opacity-30"/>
                             Kho chung đã hết Video khả dụng.<br/>Vui lòng trở về Tab Videos để tải thêm lên.
                          </div>
                       )}
                       {availableVideos.map(v => (
                          <div key={v.id} 
                               onClick={() => {
                                  updateVideo(v.id, { idolId: idol.id });
                               }}
                               className="flex flex-col group cursor-pointer relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-[#06b6d4]/5 hover:border-[#06b6d4]/40 transition-all duration-300 shadow-lg hover:shadow-[0_8px_30px_rgba(6,182,212,0.15)] hover:-translate-y-1">
                             <div className="aspect-video w-full bg-black/50 flex items-center justify-center overflow-hidden border-b border-white/5 relative">
                                 {v.avatar ? 
                                    <img src={v.avatar} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" /> :
                                    <MdOndemandVideo size={36} className="text-gray-600 group-hover:text-[#06b6d4] transition-colors duration-300" />
                                 }
                                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                             </div>
                             <div className="p-4 z-10 bg-gradient-to-b from-transparent to-black/30">
                                <p className="text-[13px] text-white font-black truncate tracking-wide">{v.name || v.video.split('/').pop()}</p>
                                <p className="text-[10px] text-[#06b6d4] font-bold mt-1.5 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-1 group-hover:translate-y-0">Nhấn để Gán ✨</p>
                             </div>
                             <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 border border-white/10 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                                 <MdAdd className="text-[#06b6d4]" size={20} />
                             </div>
                          </div>
                       ))}
                    </div>
                 </div>
             </div>
          )}
       </div>
   );
};

const VideoCardMini = ({ video, allGifts, updateVideo, handleRemove }) => {
   const handleGiftSelect = (e) => {
      updateVideo(video.id, { gift: e.target.value });
   };

   return (
      <div className={`p-4 rounded-2xl border ${video.active ? 'bg-white/[0.03] border-white/10' : 'bg-black/20 border-white/5 grayscale opacity-60'} transition-all flex flex-col`}>
         <div className="flex justify-between items-start mb-3">
             <div className="text-xs font-mono text-gray-500 truncate max-w-[150px]">{video.video.split("/").pop()}</div>
             <div className="flex gap-2">
                <button onClick={() => updateVideo(video.id, { active: !video.active })} className="text-gray-400 hover:text-white transition-colors" title={video.active ? "Đang Bật" : "Đã Tắt"}>
                   <MdCheck className={video.active ? "text-[#10b981]" : ""} size={18}/>
                </button>
                <button onClick={() => { if(confirm("Xóa video khỏi Idol này?")) handleRemove(video.id) }} className="text-gray-400 hover:text-red-500 transition-colors" title="Bỏ Chọn Video Này">
                   <MdClose size={18}/>
                </button>
             </div>
         </div>

         {/* Dedicated Gift Specific Trigger Dropdown */}
         <div className="bg-[#fbbf24]/5 border border-[#fbbf24]/20 p-3 rounded-xl mt-auto">
             <label className="text-[10px] uppercase font-black text-[#fbbf24]/80 mb-2 block flex flex-wrap items-center gap-1">
                <MdCardGiftcard size={12}/> Quà Chỉ Định 
                <span className="text-white/40 text-[9px] font-normal lowercase">(trigger video này)</span>
             </label>
             <div className="relative">
                <select 
                   value={video.gift || ""} 
                   onChange={handleGiftSelect}
                   className="w-full appearance-none bg-black/40 border border-white/10 hover:border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#fbbf24]/50 font-semibold cursor-pointer pr-8"
                >
                   <option value="" className="text-gray-500 italic">-- Không có (Phát random) --</option>
                   {allGifts.map(g => (
                      <option key={g.giftId} value={g.giftName} className="text-white font-medium">
                         {g.giftName}
                      </option>
                   ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                   <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                   </svg>
                </div>
             </div>
         </div>
      </div>
   )
}



export default IdolDetailPanel;
