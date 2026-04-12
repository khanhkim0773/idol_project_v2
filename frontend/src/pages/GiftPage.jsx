import React, { useState, useEffect } from "react";
import { useGiftStore } from "../hooks/useGiftStore";
import { useVideoStore } from "../hooks/useVideoStore";
import { useIdolStore } from "../hooks/useIdolStore";
import {
 MdAdd,
 MdEdit,
 MdDelete,
 MdClose,
 MdCheck,
 MdSearch,
 MdCardGiftcard,
} from "react-icons/md";

/* ─── Modal ─── */
const GiftModal = ({ initial, onSave, onClose }) => {
 const [giftId, setGiftId] = useState(initial?.giftId || "");
 const [giftName, setGiftName] = useState(initial?.giftName || "");
 const [error, setError] = useState("");

 const handleSave = async () => {
 if (!giftId || !giftName) {
 setError("Vui lòng nhập đầy đủ thông tin");
 return;
 }
 const res = await onSave({ giftId, giftName });
 if (!res.success) {
 setError(res.error);
 }
 };

 return (
 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
 <div className="relative w-full max-w-md bg-white/[0.03] border border-white/10 rounded-[1.5rem] sm:rounded-[2.5rem] overflow-hidden shadow-2xl backdrop-blur-2xl">
 <div className="flex items-center justify-between px-4 py-2.5 sm:px-7 sm:py-4 border-b border-white/[0.05] bg-white/[0.02]">
 <h2 className="text-white font-bold text-[15px] sm:text-lg tracking-tight flex items-center gap-2">
 {initial ? (
 <span className="flex items-center gap-2 text-[#d946ef]">
 <MdEdit className="w-[18px] h-[18px] sm:w-[22px] sm:h-[22px]" /> Sửa Quà Tặng
 </span>
 ) : (
 <span className="flex items-center gap-2 text-[#06b6d4]">
 <MdAdd className="w-5 h-5 sm:w-6 sm:h-6" /> Thêm Quà Mới
 </span>
 )}
 </h2>
 <button
 onClick={onClose}
 className="text-gray-400 hover:text-white transition p-2 rounded-xl hover:bg-white/[0.08]"
 >
 <MdClose size={22} />
 </button>
 </div>

 <div className="p-4 sm:p-7 flex flex-col gap-3.5 sm:gap-6">
 {error && (
 <div className="text-red-400 text-[11px] sm:text-[13px] bg-red-400/10 border border-red-400/20 px-3 py-2 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl font-medium">
 ⚠️ {error}
 </div>
 )}

 <div>
 <label className="text-[9px] sm:text-[10px] font-bold text-gray-500 mb-2 block">
 Gift ID (Số) *
 </label>
 <input
 type="number"
 value={giftId}
 disabled={!!initial}
 onChange={(e) => setGiftId(e.target.value)}
 className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 sm:px-5 sm:py-3.5 text-white text-[13px] sm:text-sm placeholder-white/20 focus:outline-none focus:border-[#d946ef]/60 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-mono"
 placeholder="VD: 5655"
 />
 </div>

 <div>
 <label className="text-[9px] sm:text-[10px] font-bold text-white/30 mb-2 block">
 Tên quà tặng
 </label>
 <input
 value={giftName}
 onChange={(e) => setGiftName(e.target.value)}
 className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 sm:px-5 sm:py-3.5 text-white text-[13px] placeholder-white/20 focus:outline-none focus:border-[#d946ef]/50 transition-all font-medium"
 placeholder="Ví dụ: Rose, Galaxy..."
 />
 </div>
 </div>

 <div className="flex items-center justify-end gap-2.5 px-4 py-3 sm:px-7 sm:py-5 border-t border-white/[0.05] bg-white/[0.02]">
 <button
 onClick={onClose}
 className="px-4 py-2 sm:px-6 sm:py-3 rounded-xl border border-white/[0.1] text-gray-500 hover:text-white hover:bg-white/[0.06] text-xs sm:text-sm font-semibold transition"
 >
 Hủy
 </button>
 <button
 onClick={handleSave}
 className="px-5 py-2 sm:px-7 sm:py-3 rounded-xl bg-gradient-to-r from-[#d946ef] to-[#8b5cf6] text-white text-xs sm:text-sm font-bold shadow-[0_0_15px_rgba(217,70,239,0.3)] hover:shadow-[0_0_25px_rgba(217,70,239,0.5)] transition-all flex items-center gap-1.5"
 >
 <MdCheck className="w-4 h-4 sm:w-5 sm:h-5" />
 Lưu
 </button>
 </div>
 </div>
 </div>
 );
};

/* ─── Delete Confirm ─── */
const DeleteConfirm = ({ name, onConfirm, onClose }) => (
 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
 <div className="w-full max-w-[320px] sm:max-w-sm mx-4 bg-[#1a1b26]/80 backdrop-blur-3xl rounded-[2rem] border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-4 sm:p-7 flex flex-col gap-3.5 sm:gap-5 text-center items-center">
 <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 mb-1">
 <MdDelete className="text-red-500 w-5 h-5 sm:w-8 sm:h-8" />
 </div>
 <h3 className="text-white font-bold text-[17px] sm:text-xl">Xóa Quà Tặng</h3>
 <p className="text-gray-400 text-[13px] sm:text-[15px] leading-relaxed">
 Bạn có chắc muốn xóa quà{" "}
 <span className="text-white font-bold px-1.5 py-0.5 rounded-md bg-white/[0.06] border border-white/[0.1]">"{name}"</span> không?
 </p>
 <div className="flex w-full gap-2.5 mt-2">
 <button
 onClick={onClose}
 className="flex-1 py-2.5 sm:py-3.5 rounded-xl border border-white/[0.1] text-gray-500 hover:text-white hover:bg-white/[0.06] text-xs sm:text-sm font-semibold transition"
 >
 Hủy
 </button>
 <button
 onClick={onConfirm}
 className="flex-1 py-2.5 sm:py-3.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-500 text-xs sm:text-sm font-bold transition"
 >
 Xóa
 </button>
 </div>
 </div>
 </div>
);

const GiftPage = () => {
 const { gifts, fetchGifts, addGift, updateGift, deleteGift, loading } = useGiftStore();
 const { videos } = useVideoStore();
 const { idols } = useIdolStore();
 const [modal, setModal] = useState(null);
 const [deleteTarget, setDeleteTarget] = useState(null);
 const [search, setSearch] = useState("");

 useEffect(() => {
 fetchGifts();
 }, [fetchGifts]);

 // Create a set of gift names currently in use by videos
 const usedGiftNames = new Set(videos.map((v) => v.gift).filter(Boolean));

 const filtered = gifts
 .filter(
 (g) =>
 g.giftName.toLowerCase().includes(search.toLowerCase()) ||
 String(g.giftId).includes(search),
 )
 .sort((a, b) => a.giftName.localeCompare(b.giftName));

 return (
 <div className="w-full h-full text-white overflow-y-auto p-4 sm:p-6 md:p-10 font-sans flex flex-col">
 {/* Header section */}
 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 md:gap-6 mb-6 md:mb-8 shrink-0">
 <div>
 <h4 className="text-[9px] font-medium text-[#d946ef] mb-2 leading-none">Thư viện quà</h4>
 <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-3 tracking-tight">Quản lý quà tặng</h1>
 <p className="text-sm text-gray-400 max-w-2xl leading-relaxed">
 Từ điển cấu hình các loại Quà Tặng (ID và Tên) trên hệ thống TikTok. Để cài đặt "Quà này phát video nào", hãy làm việc trong tab <b>Idols</b>.
 </p>
 </div>

 <div className="hidden sm:flex items-center gap-3 shrink-0 pb-1">
 <button
 onClick={() => setModal({ mode: "add" })}
 className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#d946ef] to-[#8b5cf6] text-white text-xs font-semibold shadow-xl hover:scale-[1.02] transition-all"
 >
 <MdAdd size={18} /> Thêm quà mới
 </button>
 </div>
 </div>

 <div className="mb-6 md:mb-8 shrink-0 flex items-center w-full sm:max-w-md relative group">
 <MdSearch className="absolute left-3.5 sm:left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#d946ef]/60 transition-colors" size={18} />
 <input
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 placeholder="Tìm kiếm..."
 className="w-full bg-white/[0.03] border border-white/5 hover:border-white/10 rounded-xl sm:rounded-2xl pl-10 sm:pl-12 pr-4 sm:pr-5 py-2 sm:py-4 text-[13px] sm:text-[15px] text-gray-200 placeholder-white/20 focus:outline-none focus:border-[#d946ef]/40 focus:bg-white/[0.05] transition-all backdrop-blur-md"
 />
 </div>

 {/* Content */}
 <div className="flex-1 pb-20">
 {loading ? (
 <div className="h-full flex flex-col items-center justify-center min-h-[400px]">
 <div className="w-12 h-12 border-4 border-[#d946ef] border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(217,70,239,0.5)]"></div>
 </div>
 ) : filtered.length === 0 ? (
 <div className="h-full flex flex-col items-center justify-center text-gray-500 py-32 rounded-3xl border border-dashed border-white/[0.08] bg-white/[0.02]">
 <div className="w-24 h-24 mb-6 rounded-full bg-white/[0.05] border border-white/[0.1] flex items-center justify-center shadow-inner">
 <MdCardGiftcard size={40} className="text-[#3f404d]" />
 </div>
 <h3 className="text-xl font-bold text-white mb-2">Chưa có Gift nào</h3>
 <p className="text-sm">Không tìm thấy món quà nào. Vui lòng thử lại với từ khóa khác.</p>
 </div>
 ) : (
 <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-6">
 {filtered.map((gift) => {
 const isActive = gift.active !== false;

 return (
 <div
 key={gift.giftId}
 className={`group relative flex flex-col p-4 sm:p-6 rounded-2xl sm:rounded-3xl border transition-all duration-300 backdrop-blur-xl ${isActive
 ? "bg-white/[0.03] border-white/5 hover:border-[#d946ef]/30 hover:shadow-[0_8px_30px_rgba(217,70,239,0.08)] hover:-translate-y-1 hover:bg-white/[0.06]"
 : "bg-white/[0.01] border-white/[0.03] opacity-[0.55] grayscale"
 }`}
 >
 <div className="flex items-start justify-between mb-3 sm:mb-5">
 <div
 className={`relative w-11 h-11 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center border transition-all duration-300 shadow-2xl ${isActive
 ? "bg-white/[0.02] border-white/5 text-[#d946ef] group-hover:scale-[1.05]"
 : "bg-black/20 border-white/5 text-gray-500"
 }`}
 >
 {gift.image ? (
 <img
 src={gift.image}
 alt={gift.giftName}
 className="w-7 h-7 sm:w-10 sm:h-10 object-contain drop-shadow-md"
 />
 ) : (
 <MdCardGiftcard className="w-[22px] h-[22px] sm:w-8 sm:h-8" />
 )}

 {/* Hit Overlay (Mobile Only) */}
 {gift.maxRepeatCount > 1 && (
 <div className="sm:hidden absolute -top-1.5 -left-1.5 px-1.5 py-0.5 rounded-md bg-white/[0.08] backdrop-blur-md border border-white/10 text-[7px] font-bold text-[#fbbf24] shadow-xl z-10 whitespace-nowrap">
 H:{gift.maxRepeatCount}
 </div>
 )}
 </div>

 {/* Toggle Switch */}
 <button
 onClick={() => useGiftStore.getState().toggleActive(gift.giftId)}
 className={`w-8 h-4 sm:w-12 sm:h-6 rounded-full relative transition-colors duration-300 border border-transparent ${isActive ? "bg-gradient-to-r from-[#d946ef] to-[#8b5cf6]" : "bg-[#252630] border-[#3f404d]"
 }`}
 >
 <div
 className={`absolute top-[1.5px] sm:top-[2px] left-[1.5px] sm:left-[2.5px] w-[12px] h-[12px] sm:w-[18px] sm:h-[18px] bg-white rounded-full transition-transform duration-300 shadow-sm ${isActive ? "translate-x-[16px] sm:translate-x-[25px]" : "translate-x-0"
 }`}
 />
 </button>
 </div>

 <div className="mb-3">
 <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap mb-1.5">
 <h3 className={`text-[13px] sm:text-[17px] font-bold sm:font-bold tracking-tight truncate leading-tight ${isActive ? "text-white" : "text-gray-300"}`}>
 {gift.giftName}
 </h3>
 </div>
 <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
 <p className="text-[10px] sm:text-[12px] text-gray-500 font-mono leading-none">
 ID: <span className="text-gray-400 font-bold">{gift.giftId}</span>
 </p>
 {gift.diamonds > 0 && (
 <span className="w-fit text-[10px] sm:text-[11px] font-bold flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-[6px] bg-[#fbbf24]/10 text-[#fbbf24] border border-[#fbbf24]/20 mt-1 sm:mt-0">
 💎 {gift.diamonds}
 </span>
 )}
 </div>
 </div>

 <div className="mt-auto pt-3 sm:pt-5 border-t border-white/[0.08] flex items-center justify-between min-h-[38px] sm:min-h-[46px]">
 <div className="hidden sm:flex items-center opacity-100">
 {gift.maxRepeatCount > 1 && (
 <div className="flex items-center px-1 sm:px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg bg-white/[0.05] border border-white/[0.1] shadow-sm">
 <span className="text-[10px] sm:text-xs mr-1">🏆</span>
 <span className="text-[7px] sm:text-[10px] sm: font-bold text-gray-400">
 H:{gift.maxRepeatCount}
 </span>
 </div>
 )}
 </div>
 <div className="flex flex-1 sm:flex-none items-center justify-end gap-2 sm:gap-2">
 <button
 onClick={() => setModal({ mode: "edit", data: gift })}
 className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg sm:rounded-xl bg-white/[0.06] text-gray-400 hover:text-[#06b6d4] hover:bg-[#06b6d4]/10 border border-white/[0.1] hover:border-[#06b6d4]/40 transition-all shadow-sm"
 >
 <MdEdit className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
 </button>
 <button
 onClick={() => setDeleteTarget(gift)}
 className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg sm:rounded-xl bg-white/[0.06] text-gray-400 hover:text-red-500 hover:bg-red-500/10 border border-white/[0.1] hover:border-red-500/40 transition-all shadow-sm"
 >
 <MdDelete className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
 </button>
 </div>
 </div>
 </div>
 );
 })}
 </div>
 )}
 </div>

 {/* FAB for Mobile */}
 <div className="sm:hidden block">
 <div className="fixed bottom-6 right-5 z-40">
 <button
 onClick={() => setModal({ mode: "add" })}
 className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-[#d946ef] to-[#8b5cf6] text-white shadow-[0_8px_20px_rgba(217,70,239,0.3)] transition-all"
 >
 <MdAdd size={24} />
 </button>
 </div>
 </div>

 {/* Modals */}
 {modal && (
 <GiftModal
 initial={modal.data}
 onSave={async (data) => {
 const res =
 modal.mode === "add"
 ? await addGift(data)
 : await updateGift(data.giftId, { giftName: data.giftName });
 if (res.success) setModal(null);
 return res;
 }}
 onClose={() => setModal(null)}
 />
 )}
 {deleteTarget && (
 <DeleteConfirm
 name={deleteTarget.giftName}
 onConfirm={async () => {
 await deleteGift(deleteTarget.giftId);
 setDeleteTarget(null);
 }}
 onClose={() => setDeleteTarget(null)}
 />
 )}
 </div>
 );
};

export default GiftPage;
