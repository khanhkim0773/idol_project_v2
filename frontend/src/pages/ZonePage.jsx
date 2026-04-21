import React, { useState, useEffect, useRef } from "react";
import { useZoneStore } from "../hooks/useZoneStore";
import { useGiftStore } from "../hooks/useGiftStore";
import {
  MdAdd,
  MdEdit,
  MdDelete,
  MdClose,
  MdCheck,
  MdSearch,
  MdCardGiftcard,
  MdDragIndicator,
  MdColorLens,
  MdOpenWith,
} from "react-icons/md";

/* ─────────────── Color Palette ─────────────── */
const ZONE_COLORS = [
  "#ff6b9d", "#d946ef", "#a855f7", "#8b5cf6",
  "#06b6d4", "#10b981", "#eab308", "#f97316",
  "#ef4444", "#ec4899", "#6366f1", "#14b8a6",
];

/* ─────────────── Gift Picker Modal ─────────────── */
const GiftPickerModal = ({ zone, onAdd, onClose }) => {
  const gifts = useGiftStore((s) => s.gifts);
  const [search, setSearch] = useState("");
  const [selectedGift, setSelectedGift] = useState(null);
  const [title, setTitle] = useState("");

  const existingGiftIds = new Set(zone.gifts.map((g) => g.giftId));

  const filtered = gifts.filter((g) => {
    if (existingGiftIds.has(g.giftId)) return false;
    if (!g.image) return false;
    const q = search.toLowerCase();
    return (
      g.giftName.toLowerCase().includes(q) ||
      String(g.giftId).includes(q)
    );
  });

  const handleAdd = async () => {
    if (!selectedGift) return;
    await onAdd(zone.id, selectedGift.giftId, title || selectedGift.giftName);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg bg-[#12121f]/95 border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl backdrop-blur-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.05] bg-white/[0.02] shrink-0">
          <h2 className="text-white font-bold text-lg flex items-center gap-2">
            <MdCardGiftcard className="text-[#d946ef]" />
            Thêm Gift vào
            <span style={{ color: zone.color }}>{zone.name}</span>
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition p-2 rounded-xl hover:bg-white/[0.08]"
          >
            <MdClose size={22} />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 py-3 border-b border-white/[0.05] shrink-0">
          <div className="relative">
            <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm gift..."
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-11 pr-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#d946ef]/50 transition-all"
            />
          </div>
        </div>

        {/* Selected gift preview */}
        {selectedGift && (
          <div className="px-6 py-3 border-b border-white/[0.05] bg-white/[0.02] shrink-0">
            <div className="flex items-center gap-3 mb-3">
              <img src={selectedGift.image} alt="" className="w-10 h-10 object-contain" />
              <div>
                <p className="text-white font-bold text-sm">{selectedGift.giftName}</p>
                <p className="text-gray-500 text-xs">💎 {selectedGift.diamonds || 0}</p>
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-white/30 block mb-1.5">
                Title hiển thị trên overlay
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={selectedGift.giftName}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#d946ef]/50 transition-all"
              />
            </div>
          </div>
        )}

        {/* Gift grid */}
        <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar min-h-0">
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
            {filtered.map((gift) => (
              <button
                key={gift.giftId}
                onClick={() => {
                  setSelectedGift(gift);
                  setTitle(gift.giftName);
                }}
                className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border transition-all ${
                  selectedGift?.giftId === gift.giftId
                    ? "bg-[#d946ef]/15 border-[#d946ef]/50 shadow-[0_0_15px_rgba(217,70,239,0.2)]"
                    : "bg-white/[0.03] border-white/[0.05] hover:border-white/[0.15] hover:bg-white/[0.06]"
                }`}
              >
                <img src={gift.image} alt="" className="w-8 h-8 object-contain" />
                <span className="text-[9px] text-white/60 font-medium text-center truncate w-full leading-tight">
                  {gift.giftName}
                </span>
              </button>
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="text-center text-gray-500 py-12 text-sm">
              Không tìm thấy gift nào
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-white/[0.05] bg-white/[0.02] shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-white/[0.1] text-gray-500 hover:text-white hover:bg-white/[0.06] text-sm font-semibold transition"
          >
            Hủy
          </button>
          <button
            onClick={handleAdd}
            disabled={!selectedGift}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#d946ef] to-[#8b5cf6] text-white text-sm font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            <MdAdd size={18} /> Thêm
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─────────────── Edit Title Inline ─────────────── */
const EditableTitle = ({ value, onSave }) => {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(value);
  const inputRef = useRef(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const save = () => {
    setEditing(false);
    if (text !== value) onSave(text);
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={save}
        onKeyDown={(e) => e.key === "Enter" && save()}
        className="bg-white/[0.06] border border-white/[0.1] rounded-lg px-2 py-0.5 text-xs text-white focus:outline-none focus:border-[#d946ef]/50 w-full min-w-[80px]"
      />
    );
  }

  return (
    <span
      onClick={() => { setText(value); setEditing(true); }}
      className="text-xs text-white/70 cursor-pointer hover:text-white transition truncate"
      title="Nhấp để sửa title"
    >
      {value || "—"}
    </span>
  );
};

/* ─────────────── Zone Card ─────────────── */
const ZoneCard = ({
  zone,
  gifts,
  onAddGift,
  onRemoveGift,
  onUpdateTitle,
  onUpdateZone,
  onDeleteZone,
}) => {
  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState(zone.name);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const nameInputRef = useRef(null);

  useEffect(() => {
    if (editingName) nameInputRef.current?.focus();
  }, [editingName]);

  const saveName = () => {
    setEditingName(false);
    if (name !== zone.name) {
      onUpdateZone(zone.id, { name });
    }
  };

  const giftDetails = zone.gifts.map((zg) => {
    const full = gifts.find((g) => g.giftId === zg.giftId);
    return { ...zg, ...full };
  });

  return (
    <div className="relative flex flex-col bg-white/[0.03] backdrop-blur-2xl rounded-2xl border border-white/[0.06] overflow-hidden transition-all hover:border-white/[0.12] shadow-lg group">
      {/* Zone Header */}
      <div
        className="shrink-0 px-5 py-3.5 flex items-center gap-3 border-b border-white/[0.05]"
        style={{
          background: `linear-gradient(135deg, ${zone.color}15, transparent)`,
        }}
      >
        {/* Color dot */}
        <div className="relative">
          <button
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="w-8 h-8 rounded-full border-2 border-white/20 transition-all hover:scale-110 hover:border-white/40 shadow-lg"
            style={{ backgroundColor: zone.color }}
          />
          {showColorPicker && (
            <div className="absolute top-10 left-0 z-50 bg-[#1a1b2e] border border-white/10 rounded-xl p-2 shadow-2xl grid grid-cols-4 gap-1.5 min-w-[140px]">
              {ZONE_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    onUpdateZone(zone.id, { color: c });
                    setShowColorPicker(false);
                  }}
                  className={`w-7 h-7 rounded-full border-2 transition-all hover:scale-110 ${
                    c === zone.color ? "border-white scale-110" : "border-transparent"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Name */}
        <div className="flex-1 min-w-0">
          {editingName ? (
            <input
              ref={nameInputRef}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={saveName}
              onKeyDown={(e) => e.key === "Enter" && saveName()}
              className="bg-white/[0.06] border border-white/[0.1] rounded-lg px-3 py-1 text-sm text-white font-bold focus:outline-none focus:border-[#d946ef]/50 w-full"
            />
          ) : (
            <h3
              onClick={() => { setName(zone.name); setEditingName(true); }}
              className="text-sm font-bold text-white truncate cursor-pointer hover:text-[#d946ef] transition"
              title="Nhấp để đổi tên"
            >
              {zone.name}
            </h3>
          )}
          <p className="text-[10px] text-white/30 mt-0.5">
            {zone.gifts.length} gift{zone.gifts.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onAddGift(zone)}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/[0.06] text-gray-400 hover:text-[#10b981] hover:bg-[#10b981]/10 border border-white/[0.1] hover:border-[#10b981]/40 transition-all"
            title="Thêm gift"
          >
            <MdAdd size={16} />
          </button>
          <button
            onClick={() => onDeleteZone(zone.id)}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/[0.06] text-gray-400 hover:text-red-400 hover:bg-red-400/10 border border-white/[0.1] hover:border-red-400/40 transition-all"
            title="Xóa khu"
          >
            <MdDelete size={16} />
          </button>
        </div>
      </div>

      {/* Gift List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {giftDetails.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-gray-600">
            <MdCardGiftcard size={32} className="mb-2 opacity-30" />
            <p className="text-xs font-medium">Chưa có gift</p>
            <p className="text-[10px] text-gray-600/60">Nhấn + để thêm gift</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {giftDetails.map((gift, index) => (
              <div
                key={gift.giftId}
                className="flex items-center gap-3 px-4 py-2.5 border-b border-white/[0.03] hover:bg-white/[0.03] transition-colors group/item"
              >
                {/* Gift image */}
                <div className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center shrink-0 overflow-hidden">
                  {gift.image ? (
                    <img src={gift.image} alt="" className="w-6 h-6 object-contain" />
                  ) : (
                    <MdCardGiftcard size={16} className="text-gray-500" />
                  )}
                </div>

                {/* Gift info */}
                <div className="flex-1 min-w-0">
                  <EditableTitle
                    value={gift.title}
                    onSave={(newTitle) => onUpdateTitle(zone.id, gift.giftId, newTitle)}
                  />
                  <p className="text-[10px] text-white/25 mt-0.5 leading-none">
                    {gift.giftName || `ID: ${gift.giftId}`}
                    {gift.diamonds ? ` · 💎 ${gift.diamonds}` : ""}
                  </p>
                </div>

                {/* Remove */}
                <button
                  onClick={() => onRemoveGift(zone.id, gift.giftId)}
                  className="opacity-0 group-hover/item:opacity-100 w-7 h-7 flex items-center justify-center rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-all shrink-0"
                >
                  <MdClose size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* ─────────────── Zone Page ─────────────── */
const ZonePage = () => {
  const {
    zones,
    fetchZones,
    createZone,
    updateZone,
    deleteZone,
    addGiftToZone,
    removeGiftFromZone,
    updateGiftTitle,
    loading,
  } = useZoneStore();
  const { gifts, fetchGifts } = useGiftStore();

  const [pickerZone, setPickerZone] = useState(null);

  useEffect(() => {
    fetchZones();
    fetchGifts();
  }, [fetchZones, fetchGifts]);

  const handleAddZone = async () => {
    await createZone({
      name: `Khu mới ${zones.length + 1}`,
      color: ZONE_COLORS[zones.length % ZONE_COLORS.length],
    });
  };

  const handleDeleteZone = async (id) => {
    if (!confirm("Bạn có chắc muốn xóa khu này?")) return;
    await deleteZone(id);
  };

  return (
    <div className="w-full h-full text-white overflow-y-auto p-4 sm:p-6 md:p-10 font-sans flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 md:gap-6 mb-6 md:mb-8 shrink-0">
        <div>
          <h4 className="text-[9px] font-medium text-[#06b6d4] mb-2 leading-none">
            Gift Zones
          </h4>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-3 tracking-tight">
            Quản lý Khu vực Gift
          </h1>
          <p className="text-sm text-gray-400 max-w-2xl leading-relaxed">
            Tạo và quản lý các khu vực hiển thị gift trên livestream overlay. Mỗi khu có thể chứa nhiều gift với title tùy chỉnh, kéo thả tự do trên overlay.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 pb-1">
          <button
            onClick={handleAddZone}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#06b6d4] to-[#8b5cf6] text-white text-xs font-semibold shadow-xl hover:scale-[1.02] transition-all"
          >
            <MdAdd size={18} /> Tạo khu mới
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 pb-20">
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center min-h-[400px]">
            <div className="w-12 h-12 border-4 border-[#06b6d4] border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(6,182,212,0.5)]"></div>
          </div>
        ) : zones.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-500 py-32 rounded-3xl border border-dashed border-white/[0.08] bg-white/[0.02]">
            <div className="w-24 h-24 mb-6 rounded-full bg-white/[0.05] border border-white/[0.1] flex items-center justify-center shadow-inner">
              <MdOpenWith size={40} className="text-[#3f404d]" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Chưa có Khu nào</h3>
            <p className="text-sm mb-6">Nhấn nút "Tạo khu mới" để bắt đầu.</p>
            <button
              onClick={handleAddZone}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#06b6d4] to-[#8b5cf6] text-white text-sm font-bold shadow-xl hover:scale-[1.02] transition-all flex items-center gap-2"
            >
              <MdAdd size={18} /> Tạo khu đầu tiên
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
            {zones.map((zone) => (
              <ZoneCard
                key={zone.id}
                zone={zone}
                gifts={gifts}
                onAddGift={(z) => setPickerZone(z)}
                onRemoveGift={removeGiftFromZone}
                onUpdateTitle={updateGiftTitle}
                onUpdateZone={updateZone}
                onDeleteZone={handleDeleteZone}
              />
            ))}
          </div>
        )}
      </div>

      {/* Gift Picker Modal */}
      {pickerZone && (
        <GiftPickerModal
          zone={pickerZone}
          onAdd={addGiftToZone}
          onClose={() => setPickerZone(null)}
        />
      )}
    </div>
  );
};

export default ZonePage;
