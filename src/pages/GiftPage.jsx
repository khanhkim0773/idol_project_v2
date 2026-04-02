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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-md mx-4 bg-[#1a1820] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">
          <h2 className="text-white font-bold text-lg">
            {initial ? "✏️ Sửa Quà Tặng" : "🎁 Thêm Quà Mới"}
          </h2>
          <button
            onClick={onClose}
            className="text-white/50 hover:text-white transition p-1 rounded-lg hover:bg-white/10"
          >
            <MdClose size={22} />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          {error && (
            <div className="text-red-400 text-xs bg-red-400/10 border border-red-400/20 px-3 py-2 rounded-lg">
              ⚠️ {error}
            </div>
          )}

          <div>
            <label className="text-xs text-white/50 mb-1 block">
              Gift ID (Số) *
            </label>
            <input
              type="number"
              value={giftId}
              disabled={!!initial}
              onChange={(e) => setGiftId(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder-white/25 focus:outline-none focus:border-pink-400 transition"
              placeholder="VD: 5655"
            />
          </div>

          <div>
            <label className="text-xs text-white/50 mb-1 block">
              Tên Quà *
            </label>
            <input
              value={giftName}
              onChange={(e) => setGiftName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder-white/25 focus:outline-none focus:border-pink-400 transition"
              placeholder="VD: Rose"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/10 bg-white/5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-white/10 text-white/60 hover:text-white text-sm transition"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-lg bg-pink-500 hover:bg-pink-600 text-white text-sm font-semibold transition flex items-center gap-2"
          >
            <MdCheck size={18} />
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Delete Confirm ─── */
const DeleteConfirm = ({ name, onConfirm, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
    <div className="w-full max-w-sm mx-4 bg-[#1a1820] border border-red-500/30 rounded-2xl shadow-2xl p-6 flex flex-col gap-4">
      <h3 className="text-white font-bold text-lg">🗑️ Xóa Quà</h3>
      <p className="text-white/60 text-sm">
        Bạn có chắc muốn xóa quà{" "}
        <span className="text-white font-semibold">"{name}"</span> không?
      </p>
      <div className="flex gap-3 justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-lg border border-white/10 text-white/60 hover:text-white text-sm transition"
        >
          Hủy
        </button>
        <button
          onClick={onConfirm}
          className="px-5 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition"
        >
          Xóa
        </button>
      </div>
    </div>
  </div>
);

const GiftPage = () => {
  const { gifts, fetchGifts, addGift, updateGift, deleteGift, loading } =
    useGiftStore();
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
    <div className="w-full h-full overflow-hidden flex flex-col text-white">
      {/* Header */}
      <div className="shrink-0 flex sm:flex-row flex-col items-center justify-between px-6 py-5 border-b border-white/10">
        <div>
          <h1 className="text-2xl font-bold text-neon sm:text-left text-center">
            {" "}
            Quản lý Quà tặng
          </h1>
          <p className="text-xs text-white/40 mt-0.5 sm:text-left text-center">
            {usedGiftNames.size} / {gifts.length} quà đang được sử dụng
          </p>
        </div>
        <div className="sm:block hidden">
          <button
            onClick={() => setModal({ mode: "add" })}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neon text-white font-semibold text-sm hover:bg-neon/80 transition"
          >
            <MdAdd size={20} /> Thêm Quà
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="shrink-0 px-6 py-4 flex items-center gap-4">
        <div className="relative flex-1 sm:max-w-md">
          <MdSearch
            size={20}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm theo tên hoặc ID..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-pink-500 transition"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-neon border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-white/20 py-20">
            <MdCardGiftcard size={48} />
            <p className="mt-4 text-sm">Không tìm thấy món quà nào</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((gift) => {
              const isUsed = usedGiftNames.has(gift.giftName);
              const isActive = gift.active !== false;

              return (
                <div
                  key={gift.giftId}
                  className={`group relative flex flex-col p-5 rounded-2xl border transition-all duration-300 ${
                    isActive
                      ? "bg-white/5 border-white/10 hover:border-neon hover:bg-white/8 shadow-lg shadow-black/20"
                      : "bg-white/[0.02] border-white/5 opacity-60 grayscale-[0.5]"
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-colors ${
                          isActive
                            ? "bg-neon/10 border-neon/80 text-neon"
                            : "bg-white/5 border-white/10 text-white/30"
                        }`}
                      >
                        {gift.image ? (
                          <img
                            src={gift.image}
                            alt={gift.giftName}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <MdCardGiftcard size={28} />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-bold text-white">
                            {gift.giftName}
                          </h3>
                          {isUsed && (
                            <span className="px-2 py-0.5 rounded-full bg-green-500/20 border border-green-500/30 text-[8px] text-green-400 font-black uppercase tracking-tighter">
                              Used
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <p className="text-[11px] text-white/30 font-mono italic">
                            ID: {gift.giftId}
                          </p>
                          {gift.diamonds > 0 && (
                            <span className="text-[11px] text-yellow-400 font-bold flex items-center gap-1">
                              💎 {gift.diamonds}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Toggle Switch */}
                    <button
                      onClick={() =>
                        useGiftStore.getState().toggleActive(gift.giftId)
                      }
                      className={`relative w-10 h-5 rounded-full transition-colors duration-300 ${isActive ? "bg-green-500" : "bg-white/10"}`}
                    >
                      <div
                        className={`absolute top-[3px] w-3.5 h-3.5 bg-white rounded-full transition-all duration-300 ${isActive ? "left-6" : "left-1"}`}
                      />
                    </button>
                  </div>

                  <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {gift.maxRepeatCount > 1 && (
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400">
                          <span className="text-[10px]">🏆</span>
                          <span className="text-[11px] font-bold">
                            Record: {gift.maxRepeatCount}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                      <button
                        onClick={() => setModal({ mode: "edit", data: gift })}
                        className="p-2 text-white/30 hover:text-cyan-400 hover:bg-cyan-400/10 rounded-lg transition"
                      >
                        <MdEdit size={18} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(gift)}
                        className="p-2 text-white/30 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition"
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

      <div className="sm:hidden block">
        <div className="fixed bottom-16 right-4">
          <button
            onClick={() => setModal({ mode: "add" })}
            className="flex items-center justify-center w-14 h-14 rounded-full bg-pink-500 text-white font-semibold text-sm shadow-lg shadow-pink-500/25 hover:bg-pink-600 transition"
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
