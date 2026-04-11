import React, { useState, useRef } from "react";
import { useIdolStore } from "../hooks/useIdolStore";
import IdolDetailPanel from "../components/IdolDetailPanel";
import {
  MdAdd,
  MdEdit,
  MdDelete,
  MdImage,
  MdClose,
  MdCheck,
  MdArrowUpward,
  MdArrowDownward,
  MdCloudUpload,
  MdRecentActors
} from "react-icons/md";
import { SOCKET_URL } from "../utils/constant";

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

const EMPTY_FORM = {
  name: "",
  avatar: "",
  order: 1,
  active: true,
};

/* ─── Add Idol Modal ─── */
const IdolModal = ({ onSave, onClose }) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const avatarRef = useRef();

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleAvatarFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadError("");
    const localUrl = URL.createObjectURL(file);
    setAvatarPreview(localUrl);
    setUploading(true);
    try {
      const path = await uploadFile(file, "avatar");
      set("avatar", path);
      setAvatarPreview(path);
      URL.revokeObjectURL(localUrl);
    } catch (err) {
      setUploadError("Lỗi upload ảnh: " + err.message);
      setAvatarPreview("");
      set("avatar", "");
    } finally {
      setUploading(false);
    }
  };

  const valid = form.name.trim() && !uploading;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md bg-white/[0.03] border border-white/10 backdrop-blur-2xl rounded-[1.5rem] shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.05] bg-white/[0.02]">
          <h2 className="text-white font-black text-lg tracking-tight flex items-center gap-2">
              <span className="flex items-center gap-2 text-[#06b6d4]">
                 <MdAdd size={22} /> Thêm Idol Mới
              </span>
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-2 rounded-xl hover:bg-white/[0.08] transition">
            <MdClose size={22} />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-6">
          {uploadError && (
             <div className="text-red-400 text-[13px] bg-red-400/10 border border-red-400/20 px-4 py-3 rounded-xl font-medium">
               ⚠️ {uploadError}
             </div>
          )}

          <div className="flex justify-center">
            <div
              className={`relative shrink-0 w-32 h-32 rounded-3xl border-2 border-dashed bg-[#252630] flex flex-col items-center justify-center cursor-pointer transition-colors overflow-hidden ring-4 ring-[#252630]/50 ${uploading ? "border-[#06b6d4]" : "border-[#3f404d] hover:border-[#06b6d4]"}`}
              onClick={() => !uploading && avatarRef.current?.click()}
            >
              {avatarPreview ? (
                <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                 <div className="flex flex-col items-center gap-2 text-gray-500">
                   <MdCloudUpload size={32} className="group-hover:text-[#06b6d4] transition" />
                   <span className="text-[10px] uppercase font-bold tracking-wider">Ảnh đại diện</span>
                 </div>
              )}
               <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition flex items-center justify-center">
                 {uploading ? (
                   <div className="w-8 h-8 border-3 border-[#06b6d4] border-t-transparent rounded-full animate-spin" />
                 ) : (
                   <MdImage size={28} className="text-white" />
                 )}
               </div>
               <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarFile} />
            </div>
          </div>

          <div>
             <label className="text-[10px] uppercase font-black text-gray-500 tracking-wider mb-2 block">
               Tên Idol *
             </label>
             <input
               value={form.name}
               onChange={(e) => set("name", e.target.value)}
               placeholder="Vd: Bình An"
               className="w-full bg-[#252630] border border-[#2e2f38] rounded-xl px-5 py-3.5 text-white text-[14px] placeholder-[#52546e] focus:outline-none focus:border-[#d946ef]/60 transition-all font-semibold"
             />
          </div>

          <div className="flex items-center justify-between border-t border-white/[0.05] pt-5">
            <div>
              <p className="text-[14px] text-white font-black tracking-tight uppercase">Trạng thái Hoạt động</p>
            </div>
            <button
               onClick={() => set("active", !form.active)}
               className={`relative w-12 h-6 rounded-full transition-colors duration-300 border border-transparent ${form.active ? "bg-[#10b981]" : "bg-white/10 border-white/5"}`}
             >
               <div className={`absolute top-[2px] left-[2.5px] w-[18px] h-[18px] bg-white rounded-full transition-transform duration-300 shadow-sm ${form.active ? "translate-x-[25px]" : "translate-x-0"}`} />
             </button>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/[0.05] bg-white/[0.02]">
           <button onClick={onClose} className="px-6 py-2.5 rounded-xl border border-white/[0.1] text-gray-500 hover:text-white hover:bg-white/[0.06] text-sm font-semibold transition">
             Hủy
           </button>
           <button
             disabled={!valid}
             onClick={() => onSave(form)}
             className={`px-7 py-2.5 rounded-xl text-sm font-black transition-all flex items-center gap-2 shadow-xl ${valid ? "bg-gradient-to-r from-[#d946ef] to-[#8b5cf6] text-white hover:brightness-110 active:scale-95" : "bg-white/[0.06] text-gray-600 cursor-not-allowed"}`}
           >
             {uploading ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <MdCheck size={18} />}
             Quản Lý Idol Này
           </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Delete Confirm ─── */
const DeleteConfirm = ({ name, onConfirm, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
    <div className="w-full max-w-sm bg-[#1a1b26]/80 backdrop-blur-3xl rounded-[2rem] border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-7 flex flex-col gap-5 text-center items-center">
      <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 mb-1">
        <MdDelete className="text-red-500 w-8 h-8" />
      </div>
      <h3 className="text-white font-black text-xl">Xóa Idol</h3>
      <p className="text-gray-400 text-[15px] leading-relaxed">
        Bạn có chắc muốn xóa idol <span className="text-white font-bold px-1.5 py-0.5 rounded-md bg-white/[0.06] border border-white/[0.1]">"{name}"</span> không?<br/>
        <span className="text-red-400 text-[12px] mt-2 block">Lưu ý: Các video và quà tặng liên kết với idol này sẽ không bị xóa, nhưng sẽ bị mất liên kết.</span>
      </p>
      <div className="flex w-full gap-2.5 mt-2">
        <button onClick={onClose} className="flex-1 py-3.5 rounded-xl border border-white/[0.1] text-gray-500 hover:text-white hover:bg-white/[0.06] text-sm font-semibold transition">
          Hủy
        </button>
        <button onClick={onConfirm} className="flex-1 py-3.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-500 text-sm font-black transition">
          Xóa
        </button>
      </div>
    </div>
  </div>
);

const IdolPage = () => {
  const { idols, addIdol, updateIdol, deleteIdol, toggleActive, reorderIdol } = useIdolStore();
  const [modal, setModal] = useState(null); // 'add' or null
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [selectedIdolId, setSelectedIdolId] = useState(null);

  const sorted = [...idols].sort((a,b) => a.order - b.order);
  const activeCount = idols.filter(i => i.active).length;

  const handleMoveUp = (id, order) => {
    const target = sorted.filter((v) => v.order < order).at(-1);
    if (!target) return;
    reorderIdol(id, target.order);
    reorderIdol(target.id, order);
  };

  const handleMoveDown = (id, order) => {
    const arr = sorted.filter((v) => v.order > order);
    const target = arr[0];
    if (!target) return;
    reorderIdol(id, target.order);
    reorderIdol(target.id, order);
  };

  return (
    <div className="w-full text-white font-sans flex flex-col h-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 md:gap-6 mb-8 shrink-0">
        <div>
          <h4 className="text-[10px] font-bold tracking-[0.2em] text-[#d946ef] uppercase mb-3">Model Engine</h4>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">Quản lý Idol</h1>
          <p className="text-sm text-gray-400 max-w-2xl leading-relaxed">
            Danh sách nhân vật hoạt động trong phiên live. Quà tặng và Video sẽ được liên kết trực tiếp với các Idol. Đang có <span className="text-white font-semibold">{activeCount} / {idols.length}</span> Idol hoạt động.
          </p>
        </div>
        <button
           onClick={() => setModal({ mode: "add" })}
           className="shrink-0 flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#d946ef] to-[#8b5cf6] text-white text-sm font-bold shadow-[0_0_20px_rgba(217,70,239,0.2)] hover:shadow-[0_0_30px_rgba(217,70,239,0.4)] hover:scale-[1.02] transition-all"
         >
           <MdAdd size={20} /> Thêm Idol Mới
         </button>
      </div>

      <div className="flex-1 pb-20 flex flex-col gap-5 overflow-y-auto">
        {sorted.length === 0 ? (
           <div className="flex-1 flex flex-col items-center justify-center gap-4 text-gray-500 py-32 rounded-3xl border border-dashed border-white/[0.08] bg-white/[0.02]">
             <div className="w-24 h-24 mb-2 rounded-full bg-[#1a1b23] border border-[#2e2f38] flex items-center justify-center shadow-inner">
               <MdRecentActors size={40} className="text-[#3f404d]" />
             </div>
             <h3 className="text-xl font-bold text-white mb-1">Chưa có Idol</h3>
             <p className="text-sm">Hãy thêm Idol đầu tiên để bắt đầu liên kết Video và Quà.</p>
           </div>
        ) : (
           sorted.map((idol, idx) => (
             <div 
                key={idol.id} 
                onClick={(e) => {
                  // Prevent triggering panel if clicking buttons
                  const isButton = e.target.closest('button');
                  if (!isButton) setSelectedIdolId(idol.id);
                }}
                className={`group flex flex-col md:flex-row items-center gap-5 p-5 rounded-3xl border transition-all duration-300 backdrop-blur-xl cursor-pointer ${idol.active ? "bg-white/[0.03] border-white/5 hover:border-[#d946ef]/50 hover:bg-white/[0.06] hover:shadow-[0_10px_30px_rgba(217,70,239,0.1)]" : "bg-white/[0.01] border-white/[0.03] opacity-[0.55] grayscale hover:opacity-80"}`}
             >
               <div className="flex md:flex-col flex-row w-full md:w-auto justify-between md:justify-center items-center gap-2 shrink-0">
                  <button onClick={() => handleMoveUp(idol.id, idol.order)} disabled={idx === 0} className="text-gray-500 hover:text-white p-1.5 rounded-lg disabled:opacity-20 hover:bg-[#252630] transition"><MdArrowUpward size={20} /></button>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-[15px] font-black ${idol.active ? "bg-[#252630] text-[#d946ef] border border-[#3f404d]" : "bg-[#1a1b23] text-gray-500"}`}>{idol.order}</div>
                  <button onClick={() => handleMoveDown(idol.id, idol.order)} disabled={idx === sorted.length - 1} className="text-gray-500 hover:text-white p-1.5 rounded-lg disabled:opacity-20 hover:bg-[#252630] transition"><MdArrowDownward size={20} /></button>
               </div>
               
               <div className={`shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 transition-all shadow-inner ${idol.active ? "border-[#d946ef]/40 p-1" : "border-white/[0.06]"}`}>
                 <div className="w-full h-full rounded-full overflow-hidden bg-[#252630] flex items-center justify-center">
                    {idol.avatar ? <img src={idol.avatar} className="w-full h-full object-cover" /> : <MdRecentActors className="w-8 h-8 text-gray-500" />}
                 </div>
               </div>

               <div className="flex-1 min-w-0 w-full text-center md:text-left flex flex-col justify-center">
                  <div className="flex flex-col md:flex-row items-center gap-3 mb-2">
                     <h3 className={`text-[20px] font-extrabold tracking-tight ${idol.active ? "text-white" : "text-gray-400"}`}>{idol.name}</h3>
                     <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-widest border ${idol.active ? "bg-[#10b981]/15 text-[#10b981] border-[#10b981]/30" : "bg-[#252630] text-gray-500 border-[#3f404d]"}`}>{idol.active ? "Active" : "Inactive"}</span>
                  </div>
                  <p className="text-[12px] text-gray-500 font-mono tracking-wider">ID: {idol.id}</p>
               </div>

               <div className="flex items-center justify-end gap-3 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-white/[0.08]">
                 <button onClick={() => toggleActive(idol.id)} className={`relative w-12 h-6 mx-2 rounded-full transition-colors border border-transparent ${idol.active ? "bg-gradient-to-r from-[#d946ef] to-[#8b5cf6]" : "bg-[#252630] border-[#3f404d]"}`}>
                    <span className={`absolute top-[2px] left-[2.5px] w-[18px] h-[18px] bg-white rounded-full transition-transform ${idol.active ? "translate-x-[25px]" : "translate-x-0"}`} />
                 </button>
                 <button onClick={() => setSelectedIdolId(idol.id)} className="px-4 h-10 flex items-center justify-center gap-1.5 rounded-xl bg-[#06b6d4]/10 text-[#06b6d4] hover:bg-[#06b6d4]/20 transition-colors border border-[#06b6d4]/20 font-bold text-sm"><MdEdit size={18} /> Cấu hình</button>
                 <button onClick={() => setDeleteTarget(idol)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/[0.06] text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-colors border border-white/[0.1]"><MdDelete size={18} /></button>
               </div>

             </div>
           ))
         )}
      </div>

      {modal === 'add' && (
        <IdolModal 
          onSave={async (f) => {
            const res = await addIdol(f);
            if (res.success) {
               setModal(null);
            }
          }} 
          onClose={() => setModal(null)} 
        />
      )}
      {selectedIdolId && (
        <IdolDetailPanel idolId={selectedIdolId} onClose={() => setSelectedIdolId(null)} />
      )}
      {deleteTarget && (
        <DeleteConfirm 
          name={deleteTarget.name} 
          onConfirm={async () => {
            await deleteIdol(deleteTarget.id);
            setDeleteTarget(null);
          }} 
          onClose={() => setDeleteTarget(null)} 
        />
      )}
    </div>
  );
};

export default IdolPage;
