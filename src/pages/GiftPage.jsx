import React, { useState, useEffect } from "react";
import { useGiftStore } from "../hooks/useGiftStore";
import { useVideoStore } from "../hooks/useVideoStore";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
      <div className="relative w-full max-w-md mx-4 bg-white/[0.06] border border-white/[0.12] rounded-3xl overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-[40px]">
        <div className="flex items-center justify-between px-7 py-5 border-b border-[#2e2f38] bg-[#252630]/50">
          <h2 className="text-white font-extrabold text-xl tracking-tight flex items-center gap-2">
            {initial ? (
              <span className="flex items-center gap-2 text-[#d946ef]">
                <MdEdit size={22} /> Sửa Quà Tặng
              </span>
            ) : (
              <span className="flex items-center gap-2 text-[#06b6d4]">
                <MdAdd size={24} /> Thêm Quà Mới
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

        <div className="p-7 flex flex-col gap-6">
          {error && (
            <div className="text-red-400 text-[13px] bg-red-400/10 border border-red-400/20 px-4 py-3 rounded-xl font-medium">
              ⚠️ {error}
            </div>
          )}

          <div>
            <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2.5 block">
              Gift ID (Số) *
            </label>
            <input
              type="number"
              value={giftId}
              disabled={!!initial}
              onChange={(e) => setGiftId(e.target.value)}
              className="w-full bg-white/[0.06] border border-white/[0.1] rounded-xl px-5 py-3.5 text-white text-sm placeholder-white/30 focus:outline-none focus:border-[#d946ef]/60 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-mono"
              placeholder="VD: 5655"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2.5 block">
              Tên Quà *
            </label>
            <input
              value={giftName}
              onChange={(e) => setGiftName(e.target.value)}
              className="w-full bg-white/[0.06] border border-white/[0.1] rounded-xl px-5 py-3.5 text-white text-sm placeholder-white/30 focus:outline-none focus:border-[#d946ef]/60 transition-all font-medium"
              placeholder="VD: Rose"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-7 py-5 border-t border-[#2e2f38] bg-[#15161c]">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-xl border border-white/[0.12] text-gray-400 hover:text-white hover:bg-white/[0.08] text-sm font-semibold transition"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            className="px-7 py-3 rounded-xl bg-gradient-to-r from-[#d946ef] to-[#8b5cf6] text-white text-sm font-bold shadow-[0_0_15px_rgba(217,70,239,0.3)] hover:shadow-[0_0_25px_rgba(217,70,239,0.5)] transition-all flex items-center gap-2"
          >
            <MdCheck size={20} />
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
    <div className="w-full max-w-sm mx-4 bg-white/[0.06] border border-red-500/30 backdrop-blur-[40px] rounded-3xl shadow-[0_0_60px_rgba(0,0,0,0.5)] p-7 flex flex-col gap-5 text-center items-center">
      <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 mb-2">
        <MdDelete size={32} className="text-red-500" />
      </div>
      <h3 className="text-white font-extrabold text-xl">Xóa Quà Tặng</h3>
      <p className="text-gray-400 text-[15px] leading-relaxed">
        Bạn có chắc muốn xóa quà{" "}
        <span className="text-white font-bold px-2 py-0.5 rounded-md bg-white/[0.06] border border-white/[0.1] whitespace-nowrap">"{name}"</span><br />không?
      </p>
      <div className="flex w-full gap-3 mt-4">
        <button
          onClick={onClose}
          className="flex-1 py-3.5 rounded-xl border border-white/[0.12] text-gray-400 hover:text-white hover:bg-white/[0.08] text-sm font-semibold transition"
        >
          Hủy
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 py-3.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/40 text-red-400 hover:text-red-300 text-sm font-bold transition shadow-[0_0_15px_rgba(239,68,68,0.2)]"
        >
          Xóa Ngay
        </button>
      </div>
    </div>
  </div>
);

const GiftPage = () => {
  const { gifts, fetchGifts, addGift, updateGift, deleteGift, loading } = useGiftStore();
  const { videos } = useVideoStore();
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
    <div className="w-full h-full text-white overflow-y-auto p-6 md:p-10 font-sans flex flex-col">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 shrink-0">
        <div>
          <h4 className="text-[10px] font-bold tracking-[0.2em] text-[#d946ef] uppercase mb-3">Asset Studio</h4>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">Quản lý Quà tặng</h1>
          <p className="text-sm text-gray-400 max-w-2xl leading-relaxed">
            Quản lý phần thưởng và quà tặng phân bổ trong phiên phát sóng. Hiện đang có{" "}
            <span className="text-white font-semibold">{usedGiftNames.size} / {gifts.length}</span>{" "}
            quà đang được sử dụng.
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-3 shrink-0 pb-1">
          <button
            onClick={() => setModal({ mode: "add" })}
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#d946ef] to-[#8b5cf6] text-white text-sm font-bold shadow-[0_0_20px_rgba(217,70,239,0.2)] hover:shadow-[0_0_30px_rgba(217,70,239,0.4)] hover:scale-[1.02] transition-all"
          >
            <MdAdd size={20} /> Thêm Quà Mới
          </button>
        </div>
      </div>

      {/* Toolbar / Search */}
      <div className="mb-8 shrink-0 flex items-center w-full max-w-md relative">
        <MdSearch className="absolute left-5 text-gray-500" size={22} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm kiếm theo tên hoặc ID..."
          className="w-full bg-white/[0.06] border border-white/[0.1] hover:border-white/20 rounded-2xl pl-12 pr-5 py-4 text-[15px] text-gray-200 placeholder-white/30 focus:outline-none focus:border-[#d946ef]/60 focus:bg-white/[0.08] transition-colors shadow-inner"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((gift) => {
              const isUsed = usedGiftNames.has(gift.giftName);
              const isActive = gift.active !== false;

              return (
                <div
                  key={gift.giftId}
                  className={`group relative flex flex-col p-6 rounded-3xl border transition-all duration-300 ${isActive
                    ? "bg-white/[0.05] border-white/[0.1] hover:border-[#d946ef]/50 hover:shadow-[0_8px_30px_rgba(217,70,239,0.12)] hover:-translate-y-1 hover:bg-white/[0.08]"
                    : "bg-white/[0.02] border-white/[0.06] opacity-[0.65] grayscale-[0.8]"
                    }`}
                >
                  <div className="flex items-start justify-between mb-5">
                    <div
                      className={`w-16 h-16 rounded-2xl flex items-center justify-center border transition-all duration-300 shadow-inner ${isActive
                        ? "bg-[#252630] border-[#3f404d] text-[#d946ef] group-hover:scale-[1.05]"
                        : "bg-[#1a1b23] border-[#2e2f38] text-gray-500"
                        }`}
                    >
                      {gift.image ? (
                        <img
                          src={gift.image}
                          alt={gift.giftName}
                          className="w-10 h-10 object-contain drop-shadow-md"
                        />
                      ) : (
                        <MdCardGiftcard size={32} />
                      )}
                    </div>

                    {/* Toggle Switch */}
                    <button
                      onClick={() => useGiftStore.getState().toggleActive(gift.giftId)}
                      className={`w-12 h-6 rounded-full relative transition-colors duration-300 border border-transparent ${isActive ? "bg-gradient-to-r from-[#d946ef] to-[#8b5cf6]" : "bg-[#252630] border-[#3f404d]"
                        }`}
                    >
                      <div
                        className={`absolute top-[2px] left-[2.5px] w-[18px] h-[18px] bg-white rounded-full transition-transform duration-300 shadow-sm ${isActive ? "translate-x-[25px]" : "translate-x-0"
                          }`}
                      />
                    </button>
                  </div>

                  <div className="mb-3">
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <h3 className={`text-[17px] font-extrabold tracking-tight ${isActive ? "text-white" : "text-gray-300"}`}>
                        {gift.giftName}
                      </h3>
                      {isUsed && (
                        <span className="px-2.5 py-1 rounded-full bg-[#10b981]/15 border border-[#10b981]/30 text-[9px] text-[#10b981] font-bold uppercase tracking-widest shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                          Used
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-[12px] text-gray-500 font-mono">
                        ID: <span className="text-gray-400">{gift.giftId}</span>
                      </p>
                      {gift.diamonds > 0 && (
                        <span className="text-[11px] font-bold flex items-center gap-1.5 px-2 py-0.5 rounded-[6px] bg-[#fbbf24]/10 text-[#fbbf24] border border-[#fbbf24]/20">
                          💎 {gift.diamonds}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-auto pt-5 border-t border-white/[0.08] flex items-center justify-between">
                    <div className="flex items-center gap-2 opacity-100 min-h-[36px]">
                      {gift.maxRepeatCount > 1 && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.05] border border-white/[0.1] shadow-sm">
                          <span className="text-xs">🏆</span>
                          <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400">
                            Hit: <span className="text-white">{gift.maxRepeatCount}</span>
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300">
                      <button
                        onClick={() => setModal({ mode: "edit", data: gift })}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/[0.06] text-gray-400 hover:text-[#06b6d4] hover:bg-[#06b6d4]/10 border border-white/[0.1] hover:border-[#06b6d4]/40 transition-all shadow-sm"
                      >
                        <MdEdit size={18} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(gift)}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/[0.06] text-gray-400 hover:text-red-500 hover:bg-red-500/10 border border-white/[0.1] hover:border-red-500/40 transition-all shadow-sm"
                      >
                        <MdDelete size={18} />
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
        <div className="fixed bottom-8 right-6 z-40">
          <button
            onClick={() => setModal({ mode: "add" })}
            className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r from-[#d946ef] to-[#8b5cf6] text-white hover:scale-110 shadow-[0_10px_25px_rgba(217,70,239,0.4)] transition-all"
          >
            <MdAdd size={28} />
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
