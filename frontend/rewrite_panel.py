import re

with open('/run/media/whale/Data/Fibonax/metaverse/idol_project_v2/frontend/src/components/IdolDetailPanel.jsx', 'r') as f:
    content = f.read()

# Pattern to replace TabVideos and VideoCardMini
# We search from "const TabVideos = " to "export default IdolDetailPanel;"

new_content = """const TabVideos = ({ idol, allVideos, allGifts, updateVideo }) => {
  const [pickerParam, setPickerParam] = useState(null);

  const idolVideos = allVideos
    .filter((v) => v.idolId === idol.id)
    .sort((a,b) => a.order - b.order);

  const idleVideos = idolVideos.filter(v => v.isIdle);
  const giftVideos = idolVideos.filter(v => !v.isIdle);

  // Unassigned videos available for picking
  const availableVideos = allVideos.filter(v => !v.idolId);

  const handleRemoveFromIdol = (videoId) => {
    updateVideo(videoId, { idolId: null, gift: "", isIdle: false });
  };

  return (
    <div className="flex flex-col gap-8 h-full relative">
      {/* SECTION A: IDLE VIDEOS */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center bg-[#10b981]/5 p-4 sm:p-5 rounded-2xl border border-[#10b981]/20">
          <div>
            <h3 className="text-[#10b981] font-bold text-xs sm:text-sm flex items-center gap-2">🔄 Video Chờ (Idle)</h3>
            <p className="text-gray-400 text-[9px] sm:text-[11px] mt-1">Phát xoay vòng ngẫu nhiên khi Idol rảnh rỗi (không có quà).</p>
          </div>
          <button onClick={() => setPickerParam({ isIdle: true })} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#10b981]/10 text-[#10b981] hover:bg-[#10b981]/20 font-semibold border border-[#10b981]/30 transition text-[10px] sm:text-xs shrink-0">
            <MdAdd size={18} className="sm:size-5"/>
            Thêm Video Chờ
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {idleVideos.length === 0 && (
            <div className="col-span-full py-8 text-center text-gray-500 border border-dashed border-white/10 rounded-2xl">
              Chưa có video chờ. Hãy thêm từ các video khả dụng.
            </div>
          )}
          {idleVideos.map(v => (
            <VideoCardMini key={v.id} video={v} allGifts={allGifts} updateVideo={updateVideo} handleRemove={handleRemoveFromIdol} />
          ))}
        </div>
      </div>

      {/* SECTION B: GIFT VIDEOS */}
      <div className="flex flex-col gap-4 border-t border-white/5 pt-6">
        <div className="flex justify-between items-center bg-[#fbbf24]/5 p-4 sm:p-5 rounded-2xl border border-[#fbbf24]/20">
          <div>
            <h3 className="text-[#fbbf24] font-bold text-xs sm:text-sm flex items-center gap-2">🎁 Video Quà (Gift)</h3>
            <p className="text-gray-400 text-[9px] sm:text-[11px] mt-1">Chỉ phát khi nhận đúng món quà được gán. Tránh phát ngẫu nhiên.</p>
          </div>
          <button onClick={() => setPickerParam({ isIdle: false })} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#fbbf24]/10 text-[#fbbf24] hover:bg-[#fbbf24]/20 font-semibold border border-[#fbbf24]/30 transition text-[10px] sm:text-xs shrink-0">
            <MdAdd size={18} className="sm:size-5"/>
            Thêm Video Quà
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {giftVideos.length === 0 && (
            <div className="col-span-full py-8 text-center text-gray-500 border border-dashed border-white/10 rounded-2xl">
              Chưa có video quà. Hãy thêm từ các video khả dụng.
            </div>
          )}
          {giftVideos.map(v => (
            <VideoCardMini key={v.id} video={v} allGifts={allGifts} updateVideo={updateVideo} handleRemove={handleRemoveFromIdol} />
          ))}
        </div>
      </div>

      {pickerParam && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-md rounded-2xl flex items-center justify-center z-20">
          <div className="w-[95%] max-w-4xl bg-[#1a1b26]/95 border border-white/10 rounded-3xl flex flex-col max-h-[85%] overflow-hidden shadow-2xl backdrop-blur-2xl">
            <div className="flex justify-between items-center p-4 sm:px-7 border-b border-white/5 bg-white/[0.02]">
              <div>
                <h3 className="text-white font-bold text-[11px] sm:text-xs">
                  Thư viện video {pickerParam.isIdle ? "(Thêm vào Chờ)" : "(Thêm vào Quà)"}
                </h3>
                <p className="text-gray-400 text-[9px] mt-1">Chọn để gán cho {idol.name}.</p>
              </div>
              <button onClick={()=>setPickerParam(null)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-gray-500 hover:text-white hover:bg-white/10 transition">
                <MdClose size={20}/>
              </button>
            </div>
            <div className="p-5 sm:p-7 overflow-y-auto flex-1 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 custom-scrollbar">
              {availableVideos.length === 0 && (
                <div className="col-span-full py-16 flex flex-col items-center justify-center text-gray-500 border border-dashed border-white/10 rounded-2xl">
                  <MdOndemandVideo size={48} className="mb-3 opacity-30"/>
                  Kho chung đã hết Video khả dụng.<br/>Vui lòng trở về và tải thêm lên từ Thư viện gốc.
                </div>
              )}
              {availableVideos.map(v => (
                <div key={v.id} 
                  onClick={() => {
                    updateVideo(v.id, { idolId: idol.id, isIdle: pickerParam.isIdle });
                    setPickerParam(null);
                  }}
                  className="flex flex-col group cursor-pointer relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-[#06b6d4]/5 hover:border-[#06b6d4]/40 transition-all duration-300 shadow-lg hover:shadow-[0_8px_30px_rgba(6,182,212,0.15)] hover:-translate-y-1">
                  <div className="aspect-video w-full bg-black/50 flex items-center justify-center overflow-hidden border-b border-white/5 relative">
                    {v.avatar ? 
                      <img src={v.avatar} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" /> :
                      <MdOndemandVideo size={36} className="text-gray-600 group-hover:text-[#06b6d4] transition-colors duration-300" />
                    }
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-white font-medium truncate p-2">{v.name || v.video.split('/').pop()}</p>
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
        <div className="text-xs font-bold text-gray-200 truncate max-w-[150px]" title={video.name || video.video.split("/").pop()}>
          {video.name || video.video.split("/").pop()}
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => updateVideo(video.id, { active: !video.active })} 
            className={`relative w-10 h-5 rounded-full transition-colors duration-300 border border-transparent shrink-0 ${video.active ? "bg-[#10b981]" : "bg-white/10 border-white/5"}`}
            title={video.active ? "Đang Bật" : "Đã Tắt"}
          >
            <div className={`absolute top-[2px] left-[2.5px] w-[14px] h-[14px] bg-white rounded-full transition-transform duration-300 shadow-sm ${video.active ? "translate-x-[20px]" : "translate-x-0"}`} />
          </button>
          <button onClick={() => { if(confirm("Xóa video khỏi Idol này?")) handleRemove(video.id) }} className="text-gray-400 hover:text-red-500 transition-colors" title="Bỏ Chọn Video Này">
            <MdClose size={18}/>
          </button>
        </div>
      </div>

      {!video.isIdle && (
        <div className="bg-[#fbbf24]/5 border border-[#fbbf24]/20 p-3 rounded-xl mt-auto">
          <label className="text-[9px] font-medium text-[#fbbf24]/80 mb-1.5 block flex items-center gap-1">
            <MdCardGiftcard size={12}/> Quà gán cho video này
          </label>
          <div className="relative">
            <select 
              value={video.gift || ""} 
              onChange={handleGiftSelect}
              className="w-full appearance-none bg-black/40 border border-white/10 hover:border-white/20 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-white text-[11px] sm:text-sm focus:outline-none focus:border-[#fbbf24]/50 font-semibold cursor-pointer pr-8"
            >
              <option value="" className="text-gray-500 italic">-- Random --</option>
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
      )}
    </div>
  )
}

export default IdolDetailPanel;
"""

import re
result = re.sub(r'const TabVideos = .*', new_content, content, flags=re.DOTALL)
with open('/run/media/whale/Data/Fibonax/metaverse/idol_project_v2/frontend/src/components/IdolDetailPanel.jsx', 'w') as f:
    f.write(result)
