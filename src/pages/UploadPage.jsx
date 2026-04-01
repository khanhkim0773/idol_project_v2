import React, { useState, useRef, useEffect } from "react";
import { useVideoStore } from "../hooks/useVideoStore";
import {
  MdAdd,
  MdEdit,
  MdDelete,
  MdCardGiftcard,
  MdVideocam,
  MdClose,
  MdCheck,
  MdArrowUpward,
  MdArrowDownward,
  MdImage,
  MdCloudUpload,
} from "react-icons/md";

// Backend API base (proxied through Vite)
const API = "";

/* ─── Upload helpers ─── */
async function uploadFile(file, type) {
  // type: 'video' | 'avatar'
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API}/api/upload/${type}`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) {
    // Try to read server JSON error message, fallback to statusText
    let msg = res.statusText;
    try {
      const body = await res.json();
      if (body.error) msg = body.error;
    } catch (err) {
      console.error("Error parsing upload error:", err);
    }
    throw new Error(msg);
  }
  const data = await res.json();
  return data.path; // e.g. '/video/123-dance.mp4'
}

/* ─── helpers ─── */
const EMPTY_FORM = {
  name: "",
  description: "",
  gift: "",
  avatar: "",
  video: "",
  order: 1,
  active: true,
};

/* ─── Modal ─── */
const VideoModal = ({ initial, onSave, onClose, maxOrder }) => {
  const [form, setForm] = useState(initial ?? EMPTY_FORM);
  const [avatarPreview, setAvatarPreview] = useState(initial?.avatar ?? "");
  const [videoName, setVideoName] = useState(
    initial?.video ? initial.video.split("/").pop() : ""
  );
  const [uploading, setUploading] = useState({ video: false, avatar: false });
  const [uploadError, setUploadError] = useState("");
  const [giftOptions, setGiftOptions] = useState(["Rose"]);
  const avatarRef = useRef();
  const videoRef = useRef();

  // Fetch gift list from server
  useEffect(() => {
    fetch("/api/gifts")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          // Extract unique gift names, always keep Rose at top
          const names = data.map((g) => g.giftName).filter(Boolean);
          const unique = [...new Set(["Rose", ...names])];
          setGiftOptions(unique);
        }
      })
      .catch(() => {
        // Fallback: just keep Rose
        setGiftOptions(["Rose"]);
      });
  }, []);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleAvatarFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadError("");
    // Show local preview immediately while uploading
    const localUrl = URL.createObjectURL(file);
    setAvatarPreview(localUrl);
    setUploading((u) => ({ ...u, avatar: true }));
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
      setUploading((u) => ({ ...u, avatar: false }));
    }
  };

  const handleVideoFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadError("");
    setVideoName(file.name + " (đang upload...)");
    setUploading((u) => ({ ...u, video: true }));
    try {
      const path = await uploadFile(file, "video");
      set("video", path);
      setVideoName(path.split("/").pop());
    } catch (err) {
      setUploadError("Lỗi upload video: " + err.message);
      setVideoName("");
      set("video", "");
    } finally {
      setUploading((u) => ({ ...u, video: false }));
    }
  };

  const isUploading = uploading.video || uploading.avatar;
  const valid = form.name.trim() && form.video && !isUploading;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-lg mx-4 bg-[#1a1820] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        {/* header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">
          <h2 className="text-white font-bold text-lg">
            {initial ? "✏️ Chỉnh sửa Video" : "➕ Thêm Video Mới"}
          </h2>
          <button
            onClick={onClose}
            className="text-white/50 hover:text-white transition p-1 rounded-lg hover:bg-white/10"
          >
            <MdClose size={22} />
          </button>
        </div>

        {/* body */}
        <div className="p-6 flex flex-col gap-4 max-h-[75vh] overflow-y-auto">
          {/* upload error */}
          {uploadError && (
            <div className="bg-red-500/15 border border-red-500/30 rounded-lg px-3 py-2 text-red-400 text-xs">
              ⚠️ {uploadError}
            </div>
          )}

          {/* avatar + name row */}
          <div className="flex gap-4 items-start">
            {/* avatar */}
            <div
              className="relative shrink-0 w-20 h-20 rounded-xl border-2 border-dashed border-white/20 bg-white/5 flex items-center justify-center cursor-pointer hover:border-cyan-400 transition group overflow-hidden"
              onClick={() => !uploading.avatar && avatarRef.current?.click()}
            >
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <MdImage size={28} className="text-white/30 group-hover:text-cyan-400 transition" />
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                {uploading.avatar ? (
                  <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <MdImage size={20} className="text-white" />
                )}
              </div>
              <input
                ref={avatarRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarFile}
              />
            </div>

            {/* name */}
            <div className="flex-1">
              <label className="text-xs text-white/50 mb-1 block">Tên Video *</label>
              <input
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Vd: Bình An - Nhảy Sôi Động"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder-white/25 focus:outline-none focus:border-cyan-400 transition"
              />
            </div>
          </div>

          {/* description */}
          <div>
            <label className="text-xs text-white/50 mb-1 block">Mô tả</label>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Mô tả ngắn về video..."
              rows={2}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder-white/25 focus:outline-none focus:border-cyan-400 transition resize-none"
            />
          </div>

          {/* gift + order row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-white/50 mb-1 flex items-center gap-1">
                <MdCardGiftcard className="text-pink-400" /> Quà kích hoạt
              </label>
              <div className="relative">
                <select
                  value={form.gift}
                  onChange={(e) => set("gift", e.target.value)}
                  className="w-full appearance-none bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-pink-400 transition cursor-pointer pr-8"
                  style={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                >
                  <option
                    value=""
                    style={{ backgroundColor: "#1a1820", color: "rgba(255,255,255,0.3)" }}
                  >
                    — Chưa chọn quà —
                  </option>
                  {giftOptions.map((name) => (
                    <option
                      key={name}
                      value={name}
                      style={{ backgroundColor: "#1a1820", color: "#fff" }}
                    >
                      🎁 {name}
                    </option>
                  ))}
                </select>
                {/* Custom dropdown arrow */}
                <div className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center">
                  <svg className="w-4 h-4 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              <p className="text-[10px] text-white/30 mt-1">
                Chọn quà TikTok kích hoạt video • Không chọn = không kích hoạt
              </p>
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1 block">Thứ tự hiển thị</label>
              <input
                type="number"
                min={1}
                max={maxOrder + 1}
                value={form.order}
                onChange={(e) => set("order", parseInt(e.target.value) || 1)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-400 transition"
              />
            </div>
          </div>

          {/* video file */}
          <div>
            <label className="text-xs text-white/50 mb-1 flex items-center gap-1">
              <MdVideocam className="text-cyan-400" /> File Video *
            </label>
            <div
              className={`w-full border border-dashed rounded-lg px-4 py-4 flex flex-col items-center gap-2 transition bg-white/5 group ${uploading.video
                  ? "border-cyan-400/60 cursor-not-allowed"
                  : "border-white/20 cursor-pointer hover:border-cyan-400"
                }`}
              onClick={() => !uploading.video && videoRef.current?.click()}
            >
              {uploading.video ? (
                <>
                  <div className="w-7 h-7 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs text-cyan-400">Đang upload video...</p>
                </>
              ) : videoName ? (
                <>
                  <MdVideocam size={24} className="text-cyan-400" />
                  <p className="text-xs text-white/70 text-center break-all">{videoName}</p>
                  <p className="text-[10px] text-white/30">Click để thay video khác</p>
                </>
              ) : (
                <>
                  <MdCloudUpload size={28} className="text-white/20 group-hover:text-cyan-400 transition" />
                  <p className="text-xs text-white/30">Click để chọn video (.mp4, .webm...)</p>
                  <p className="text-[10px] text-white/20">File sẽ được lưu vào public/video/</p>
                </>
              )}
              <input
                ref={videoRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={handleVideoFile}
              />
            </div>
            {/* OR: type path manually (for public/ videos) */}
            <div className="mt-2">
              <input
                value={typeof form.video === "string" && !form.video.startsWith("blob:") ? form.video : ""}
                onChange={(e) => { set("video", e.target.value); setVideoName(e.target.value.split("/").pop()); }}
                placeholder="Hoặc nhập đường dẫn: /video/dance.mp4"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-xs placeholder-white/25 focus:outline-none focus:border-cyan-400 transition"
              />
            </div>
          </div>

          {/* active toggle */}
          <div className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3 border border-white/10">
            <div>
              <p className="text-sm text-white font-medium">Trạng thái</p>
              <p className="text-xs text-white/40 mt-0.5">Kích hoạt để hiển thị video trên live</p>
            </div>
            <button
              onClick={() => set("active", !form.active)}
              className={`relative w-12 h-6 rounded-full transition-colors ${form.active ? "bg-green-500" : "bg-white/20"}`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${form.active ? "translate-x-6" : ""}`}
              />
            </button>
          </div>
        </div>

        {/* footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/10 bg-white/5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-white/10 text-white/60 hover:text-white hover:border-white/30 text-sm transition"
          >
            Hủy
          </button>
          <button
            disabled={!valid}
            onClick={() => onSave(form)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2 ${valid
                ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:opacity-90 shadow-lg shadow-cyan-500/20"
                : "bg-white/10 text-white/30 cursor-not-allowed"
              }`}
          >
            {isUploading ? (
              <div className="w-4 h-4 border-2 border-white/40 border-t-transparent rounded-full animate-spin" />
            ) : (
              <MdCheck size={18} />
            )}
            {initial ? "Lưu thay đổi" : "Thêm Video"}
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
      <h3 className="text-white font-bold text-lg">🗑️ Xóa Video</h3>
      <p className="text-white/60 text-sm">
        Bạn có chắc muốn xóa video <span className="text-white font-semibold">"{name}"</span> không? Hành động này không thể hoàn tác.
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

/* ─── Video Card ─── */
const VideoCard = ({ video, index, total, onEdit, onDelete, onToggle, onMoveUp, onMoveDown }) => {
  return (
    <div
      className={`group relative flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200 ${video.active
          ? "bg-white/5 border-white/10 hover:border-cyan-500/40 hover:bg-white/8"
          : "bg-white/[0.02] border-white/5 opacity-60 hover:opacity-80"
        }`}
    >
      {/* order badge */}
      <div className="flex flex-col items-center gap-1 shrink-0">
        <button
          onClick={onMoveUp}
          disabled={index === 0}
          className="text-white/20 hover:text-white/60 disabled:opacity-20 disabled:cursor-not-allowed transition p-0.5"
        >
          <MdArrowUpward size={16} />
        </button>
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${video.active
              ? "bg-gradient-to-br from-cyan-500/30 to-blue-500/30 text-cyan-300 border border-cyan-500/30"
              : "bg-white/10 text-white/30"
            }`}
        >
          {video.order}
        </div>
        <button
          onClick={onMoveDown}
          disabled={index === total - 1}
          className="text-white/20 hover:text-white/60 disabled:opacity-20 disabled:cursor-not-allowed transition p-0.5"
        >
          <MdArrowDownward size={16} />
        </button>
      </div>

      {/* avatar */}
      <div className="shrink-0 w-14 h-14 rounded-xl overflow-hidden border-2 border-white/10 bg-white/5">
        {video.avatar ? (
          <img src={video.avatar} alt={video.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/20">
            <MdVideocam size={24} />
          </div>
        )}
      </div>

      {/* info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-white font-semibold text-sm truncate">{video.name}</h3>
          {/* active badge */}
          <span
            className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full font-semibold border ${video.active
                ? "bg-green-500/15 text-green-400 border-green-500/30"
                : "bg-white/5 text-white/30 border-white/10"
              }`}
          >
            {video.active ? "● Active" : "○ Inactive"}
          </span>
        </div>
        {video.description && (
          <p className="text-xs text-white/40 mt-0.5 truncate">{video.description}</p>
        )}
        <div className="flex items-center gap-3 mt-1.5">
          {/* gift badge */}
          <span className="flex items-center gap-1 text-[11px] bg-pink-500/10 text-pink-400 border border-pink-500/20 rounded-full px-2 py-0.5">
            <MdCardGiftcard size={12} />
            {video.gift || "—"}
          </span>
          {/* video path */}
          <span className="text-[10px] text-white/25 truncate max-w-[160px]">
            {video.video ? video.video.split("/").pop() : "Chưa có video"}
          </span>
        </div>
      </div>

      {/* actions */}
      <div className="flex items-center gap-2 shrink-0">
        {/* toggle */}
        <button
          onClick={onToggle}
          title={video.active ? "Tắt video" : "Bật video"}
          className={`relative w-10 h-5 rounded-full transition-colors shrink-0 ${video.active ? "bg-green-500" : "bg-white/15"
            }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${video.active ? "translate-x-5" : ""
              }`}
          />
        </button>

        <button
          onClick={onEdit}
          className="p-2 rounded-lg text-white/30 hover:text-cyan-400 hover:bg-cyan-400/10 transition"
          title="Chỉnh sửa"
        >
          <MdEdit size={18} />
        </button>
        <button
          onClick={onDelete}
          className="p-2 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-400/10 transition"
          title="Xóa"
        >
          <MdDelete size={18} />
        </button>
      </div>
    </div>
  );
};

/* ─── Main Page ─── */
const UploadPage = () => {
  const { videos, addVideo, updateVideo, deleteVideo, toggleActive } =
    useVideoStore();

  const [modal, setModal] = useState(null); // null | { mode: 'add' | 'edit', data?: video }
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [filter, setFilter] = useState("all"); // all | active | inactive

  // Sort by order
  const sorted = [...videos].sort((a, b) => a.order - b.order);
  const filtered =
    filter === "all"
      ? sorted
      : filter === "active"
        ? sorted.filter((v) => v.active)
        : sorted.filter((v) => !v.active);

  const activeCount = videos.filter((v) => v.active).length;

  const handleSave = (form) => {
    if (modal.mode === "add") {
      addVideo(form);
    } else {
      updateVideo(modal.data.id, form);
    }
    setModal(null);
  };

  const handleMoveUp = (id, order) => {
    const target = sorted.filter((v) => v.order < order).at(-1);
    if (!target) return;
    updateVideo(id, { order: target.order });
    updateVideo(target.id, { order: order });
  };

  const handleMoveDown = (id, order) => {
    const arr = sorted.filter((v) => v.order > order);
    const target = arr[0];
    if (!target) return;
    const targetOrder = target.order;
    updateVideo(id, { order: targetOrder });
    updateVideo(target.id, { order: order });
  };

  return (
    <div className="w-full h-full overflow-hidden flex flex-col text-white">
      {/* ── Header ── */}
      <div className="shrink-0 flex items-center justify-between px-6 py-5 border-b border-white/10">
        <div>
          <h1 className="text-2xl font-bold text-white">🎬 Quản lý Video Nhảy</h1>
          <p className="text-sm text-white/40 mt-0.5">
            {activeCount} / {videos.length} video đang hoạt động
          </p>
        </div>
        <button
          onClick={() => setModal({ mode: "add" })}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold text-sm shadow-lg shadow-cyan-500/25 hover:opacity-90 transition"
        >
          <MdAdd size={20} />
          Thêm Video
        </button>
      </div>

      {/* ── Stats row ── */}
      <div className="shrink-0 px-6 py-3 flex items-center gap-4 border-b border-white/5">
        <div className="flex gap-2">
          {["all", "active", "inactive"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${filter === f
                  ? "bg-white/15 text-white"
                  : "text-white/30 hover:text-white/60 hover:bg-white/5"
                }`}
            >
              {f === "all" ? `Tất cả (${videos.length})` : f === "active" ? `Active (${activeCount})` : `Inactive (${videos.length - activeCount})`}
            </button>
          ))}
        </div>

        {/* legend */}
        <div className="ml-auto flex items-center gap-2 text-[11px] text-white/30">
          <MdCardGiftcard className="text-pink-400" size={14} />
          <span>Quà kích hoạt video khi được tặng trên TikTok Live</span>
        </div>
      </div>

      {/* ── List ── */}
      <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-3">
        {filtered.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-white/20 py-20">
            <MdVideocam size={48} />
            <p className="text-sm">
              {filter === "all"
                ? "Chưa có video nào. Nhấn  thêm video để bắt đầu!"
                : "Không có video nào trong danh mục này."}
            </p>
          </div>
        ) : (
          filtered.map((video, idx) => (
            <VideoCard
              key={video.id}
              video={video}
              index={idx}
              total={filtered.length}
              onEdit={() => setModal({ mode: "edit", data: video })}
              onDelete={() => setDeleteTarget(video)}
              onToggle={() => toggleActive(video.id)}
              onMoveUp={() => handleMoveUp(video.id, video.order)}
              onMoveDown={() => handleMoveDown(video.id, video.order)}
            />
          ))
        )}
      </div>

      {/* ── Info footer ── */}
      <div className="shrink-0 px-6 py-3 border-t border-white/5 text-[11px] text-white/20">
        💡 Video có thứ tự nhỏ hơn sẽ ưu tiên hiển thị trước. Chỉ video <span className="text-green-400">Active</span> mới xuất hiện trong màn hình Live.
      </div>

      {/* ── Modals ── */}
      {modal && (
        <VideoModal
          initial={modal.data}
          maxOrder={videos.length}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
      {deleteTarget && (
        <DeleteConfirm
          name={deleteTarget.name}
          onConfirm={() => {
            deleteVideo(deleteTarget.id);
            setDeleteTarget(null);
          }}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};

export default UploadPage;