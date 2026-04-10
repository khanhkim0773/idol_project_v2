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
  MdTune,
} from "react-icons/md";
import { SOCKET_URL } from "../utils/constant";

// Backend API base
const API = SOCKET_URL;

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
    initial?.video ? initial.video.split("/").pop() : "",
  );
  const [uploading, setUploading] = useState({ video: false, avatar: false });
  const [uploadError, setUploadError] = useState("");
  const [giftOptions, setGiftOptions] = useState(["Rose"]);
  const avatarRef = useRef();
  const videoRef = useRef();

  useEffect(() => {
    fetch(`${API}/api/gifts`)
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-xl bg-white/[0.03] border border-white/10 backdrop-blur-2xl rounded-[1.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden">
        {/* header */}
        <div className="flex items-center justify-between px-5 py-3 sm:px-7 sm:py-5 border-b border-white/[0.05] bg-white/[0.02]">
          <h2 className="text-white font-extrabold text-lg sm:text-xl tracking-tight flex items-center gap-2">
            {initial ? (
              <span className="flex items-center gap-2 text-[#d946ef]">
                <MdEdit size={22} /> Sửa Video
              </span>
            ) : (
              <span className="flex items-center gap-2 text-[#06b6d4]">
                <MdAdd size={24} /> Thêm Video Mới
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

        {/* body */}
        <div className="p-4 sm:p-7 flex flex-col gap-3.5 sm:gap-6 max-h-[70vh] sm:max-h-[65vh] overflow-y-auto custom-scrollbar">
          {/* upload error */}
          {uploadError && (
            <div className="text-red-400 text-[13px] bg-red-400/10 border border-red-400/20 px-4 py-3 rounded-xl font-medium">
              ⚠️ {uploadError}
            </div>
          )}

          {/* avatar + name row */}
          <div className="flex gap-4 sm:gap-5 items-start">
            {/* avatar */}
            <div
              className={`relative shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-xl sm:rounded-2xl border-2 border-dashed bg-white/[0.02] flex items-center justify-center cursor-pointer transition-colors group overflow-hidden shadow-2xl ${uploading.avatar ? "border-[#06b6d4]" : "border-white/10 hover:border-[#06b6d4]"
                }`}
              onClick={() => !uploading.avatar && avatarRef.current?.click()}
            >
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <MdImage
                  size={32}
                  className="text-gray-500 group-hover:text-[#06b6d4] transition"
                />
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                {uploading.avatar ? (
                  <div className="w-6 h-6 border-2 border-[#06b6d4] border-t-transparent rounded-full animate-spin shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
                ) : (
                  <MdImage size={24} className="text-white" />
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
            <div className="flex-1 flex flex-col gap-2 relative top-1">
              <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                Tên Video *
              </label>
              <input
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Vd: Bình An - Nhảy Sôi Động"
                className="w-full bg-[#252630] border border-[#2e2f38] rounded-xl px-5 py-3.5 text-white text-[15px] placeholder-[#52546e] focus:outline-none focus:border-[#d946ef]/60 transition-all font-semibold"
              />
            </div>
          </div>

          {/* description */}
          <div>
            <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2.5 block">Mô tả</label>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Mô tả ngắn về nội dung video..."
              rows={2}
              className="w-full bg-[#252630] border border-[#2e2f38] rounded-xl px-5 py-3.5 text-white text-[13px] placeholder-[#52546e] focus:outline-none focus:border-[#d946ef]/60 transition-all resize-none font-medium leading-relaxed"
            />
          </div>

          {/* gift + order row */}
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2.5 flex items-center gap-1.5">
                <MdCardGiftcard className="text-[#fbbf24]" size={14} /> Quà kích hoạt
              </label>
              <div className="relative">
                <select
                  value={form.gift}
                  onChange={(e) => set("gift", e.target.value)}
                  className="w-full appearance-none bg-[#252630] border border-[#2e2f38] rounded-xl px-5 py-3.5 text-white text-[13px] font-semibold focus:outline-none focus:border-[#d946ef]/60 transition-all cursor-pointer pr-10"
                >
                  <option value="" className="bg-[#1a1b23] text-gray-500 font-medium">
                    — Chưa chọn quà —
                  </option>
                  {giftOptions.map((name) => (
                    <option key={name} value={name} className="bg-[#1a1b23] text-white font-medium">
                      🎁 {name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              <p className="text-[10px] text-gray-500 mt-2 font-medium">
                TikTok Live Gift • Trống = không kích hoạt
              </p>
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2.5 block">
                Thứ tự hiển thị
              </label>
              <input
                type="number"
                min={1}
                max={maxOrder + 1}
                value={form.order}
                onChange={(e) => set("order", parseInt(e.target.value) || 1)}
                className="w-full bg-[#252630] border border-[#2e2f38] rounded-xl px-5 py-3.5 text-white text-[14px] font-mono focus:outline-none focus:border-[#d946ef]/60 transition-all"
              />
            </div>
          </div>

          {/* video file */}
          <div>
            <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2.5 flex items-center gap-1.5">
              <MdVideocam className="text-[#06b6d4]" size={14} /> File Video *
            </label>
            <div
              className={`w-full border-2 border-dashed rounded-2xl px-5 py-6 flex flex-col items-center justify-center gap-3 transition-colors bg-[#252630] shadow-inner group ${uploading.video
                  ? "border-[#06b6d4]/60 cursor-not-allowed"
                  : "border-[#3f404d] cursor-pointer hover:border-[#06b6d4]"
                }`}
              onClick={() => !uploading.video && videoRef.current?.click()}
            >
              {uploading.video ? (
                <>
                  <div className="w-8 h-8 border-4 border-[#06b6d4] border-t-transparent rounded-full animate-spin shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
                  <p className="text-[13px] text-[#06b6d4] font-bold mt-2">Đang upload video...</p>
                </>
              ) : videoName ? (
                <>
                  <div className="w-12 h-12 rounded-full bg-[#06b6d4]/10 text-[#06b6d4] flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                    <MdVideocam size={24} />
                  </div>
                  <p className="text-[14px] font-bold text-white/90 text-center break-all">
                    {videoName}
                  </p>
                  <p className="text-[11px] text-gray-500 font-medium tracking-wide">
                    Click để thay video khác
                  </p>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-white/5 text-gray-400 flex items-center justify-center mb-1 group-hover:text-[#06b6d4] group-hover:bg-[#06b6d4]/10 transition-all">
                    <MdCloudUpload size={28} />
                  </div>
                  <p className="text-[14px] font-bold text-gray-300">
                    Click để chọn video (.mp4, .webm...)
                  </p>
                  <p className="text-[11px] text-gray-500 font-medium tracking-wide">
                    File sẽ được lưu vào public/video/
                  </p>
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

            <div className="mt-3 relative">
              <input
                value={
                  typeof form.video === "string" && !form.video.startsWith("blob:")
                    ? form.video
                    : ""
                }
                onChange={(e) => {
                  set("video", e.target.value);
                  setVideoName(e.target.value.split("/").pop());
                }}
                placeholder="Hoặc nhập đường dẫn cố định: /video/dance.mp4"
                className="w-full bg-[#1a1b23] border border-[#2e2f38] rounded-xl px-5 py-3.5 text-white text-[13px] placeholder-[#52546e] focus:outline-none focus:border-[#06b6d4]/60 transition-all font-mono"
              />
            </div>
          </div>

          {/* active toggle */}
          <div className="flex items-center justify-between bg-[#1a1b23] rounded-xl px-5 py-4 border border-[#2e2f38] shadow-inner mt-2">
            <div>
              <p className="text-[15px] text-white font-bold tracking-tight">Trạng thái Video</p>
              <p className="text-[12px] text-gray-400 mt-0.5">
                Kích hoạt để hiển thị video trên live
              </p>
            </div>
            <button
              onClick={() => set("active", !form.active)}
              className={`relative w-12 h-6 rounded-full transition-colors duration-300 border border-transparent ${form.active ? "bg-gradient-to-r from-[#d946ef] to-[#8b5cf6]" : "bg-[#252630] border-[#3f404d]"
                }`}
            >
              <span
                className={`absolute top-[2px] left-[2.5px] w-[18px] h-[18px] bg-white rounded-full transition-transform duration-300 shadow-sm ${form.active ? "translate-x-[25px]" : "translate-x-0"
                  }`}
              />
            </button>
          </div>
        </div>

        {/* footer */}
        <div className="flex items-center justify-end gap-3 px-7 py-5 border-t border-white/[0.05] bg-white/[0.02]">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/[0.08] text-[14px] font-semibold transition"
          >
            Hủy
          </button>
          <button
            disabled={!valid}
            onClick={() => onSave(form)}
            className={`px-7 py-3 rounded-xl text-[14px] font-bold transition-all flex items-center gap-2 ${valid
                ? "bg-gradient-to-r from-[#d946ef] to-[#8b5cf6] text-white shadow-[0_0_15px_rgba(217,70,239,0.3)] hover:shadow-[0_0_25px_rgba(217,70,239,0.5)]"
                : "bg-white/[0.05] text-gray-600 cursor-not-allowed border border-white/5"
              }`}
          >
            {isUploading ? (
              <div className="w-5 h-5 border-2 border-white/40 border-t-transparent rounded-full animate-spin" />
            ) : (
              <MdCheck size={20} />
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
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
    <div className="w-full max-w-sm bg-white/[0.06] border border-red-500/30 backdrop-blur-[40px] rounded-[1.5rem] sm:rounded-3xl shadow-[0_0_60px_rgba(0,0,0,0.5)] p-5 sm:p-7 flex flex-col gap-4 sm:gap-5 text-center items-center">
      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 mb-1 sm:mb-2">
        <MdDelete size={24} className="text-red-500 sm:size-[32px]" />
      </div>
      <h3 className="text-white font-extrabold text-lg sm:text-xl">Xóa Video</h3>
      <p className="text-gray-400 text-[14px] sm:text-[15px] leading-relaxed">
        Bạn có chắc muốn xóa video{" "}
        <span className="text-white font-bold px-2 py-0.5 rounded-md bg-white/[0.06] border border-white/[0.1] whitespace-nowrap">"{name}"</span><br />không?
      </p>
      <div className="flex w-full gap-3 mt-2 sm:mt-4">
        <button
          onClick={onClose}
          className="flex-1 py-3.5 rounded-xl border border-[#3f404d] text-gray-400 hover:text-white hover:bg-[#252630] text-sm font-semibold transition"
        >
          Hủy
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 py-3.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 hover:text-red-300 text-sm font-bold transition shadow-[0_0_15px_rgba(239,68,68,0.2)]"
        >
          Xóa
        </button>
      </div>
    </div>
  </div>
);

/* ─── Video Card ─── */
const VideoCard = ({
  video,
  index,
  total,
  onEdit,
  onDelete,
  onToggle,
  onMoveUp,
  onMoveDown,
}) => {
  return (
    <div
      className={`group relative flex flex-col md:flex-row items-center gap-5 p-5 rounded-3xl border transition-all duration-300 backdrop-blur-xl ${video.active
          ? "bg-white/[0.03] border-white/5 hover:border-[#d946ef]/30 hover:shadow-[0_8px_30px_rgba(217,70,239,0.08)] hover:bg-white/[0.06]"
          : "bg-white/[0.01] border-white/[0.03] opacity-[0.55] grayscale"
        }`}
    >
      {/* order badge */}
      <div className="flex md:flex-col flex-row w-full md:w-auto justify-between md:justify-center items-center gap-2 shrink-0">
        <button
          onClick={onMoveUp}
          disabled={index === 0}
          className="text-gray-500 hover:text-white hover:bg-[#252630] rounded-lg disabled:opacity-20 disabled:cursor-not-allowed transition p-1.5"
        >
          <MdArrowUpward size={20} />
        </button>
        <div
          className={`w-8 sm:w-10 h-8 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center text-[13px] sm:text-[15px] font-black ${video.active
              ? "bg-[#252630] text-[#d946ef] border border-[#3f404d] shadow-inner"
              : "bg-[#1a1b23] text-gray-500 border border-[#2e2f38]"
            }`}
        >
          {video.order}
        </div>
        <button
          onClick={onMoveDown}
          disabled={index === total - 1}
          className="text-gray-500 hover:text-white hover:bg-[#252630] rounded-lg disabled:opacity-20 disabled:cursor-not-allowed transition p-1.5"
        >
          <MdArrowDownward size={20} />
        </button>
      </div>

      {/* avatar */}
      <div className={`shrink-0 w-16 h-16 sm:w-24 sm:h-24 rounded-xl sm:rounded-2xl overflow-hidden border-2 transition-all shadow-inner ${video.active ? "border-white/[0.12]" : "border-white/[0.06]"}`}>
        {video.avatar ? (
          <img
            src={video.avatar}
            alt={video.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#252630] text-gray-500">
            <MdVideocam size={24} className="sm:size-[32px]" />
          </div>
        )}
      </div>

      {/* info */}
      <div className="flex-1 min-w-0 w-full flex flex-col justify-center text-center md:text-left">
        <div className="flex flex-col md:flex-row items-center gap-2 sm:gap-3 flex-wrap mb-1">
          <h3 className={`text-[16px] sm:text-[19px] font-extrabold tracking-tight truncate w-full md:w-auto ${video.active ? "text-white" : "text-gray-400"}`}>
            {video.name}
          </h3>
          <span
            className={`shrink-0 text-[9px] sm:text-[10px] px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full font-bold uppercase tracking-widest border shadow-sm ${video.active
                ? "bg-[#10b981]/15 text-[#10b981] border-[#10b981]/30 shadow-[0_0_10px_rgba(16,185,129,0.1)]"
                : "bg-[#252630] text-gray-500 border-[#3f404d]"
              }`}
          >
            {video.active ? "Active" : "Inactive"}
          </span>
        </div>
        {video.description ? (
          <p className="text-[11px] sm:text-[13px] text-gray-400 mt-0.5 sm:mt-1 mb-2 sm:mb-3 line-clamp-1 sm:line-clamp-2 leading-relaxed">
            {video.description}
          </p>
        ) : (
          <p className="text-[11px] sm:text-[13px] text-gray-600 italic mt-0.5 sm:mt-1 mb-2 sm:mb-3">Không có mô tả</p>
        )}
        <div className="flex items-center justify-center md:justify-start gap-2 sm:gap-3 flex-wrap">
          {/* gift badge */}
          <span className="flex items-center truncate gap-1 text-[9px] sm:text-[11px] font-bold bg-[#fbbf24]/10 text-[#fbbf24] border border-[#fbbf24]/20 rounded-lg px-2 py-0.5 sm:px-2.5 sm:py-1 shadow-sm">
            <MdCardGiftcard size={12} className="sm:size-[14px]" />
            {video.gift || "Không gắn quà"}
          </span>
          {/* video path */}
          <span className="text-[9px] sm:text-[11px] text-gray-400 font-mono truncate max-w-[150px] sm:max-w-[200px] flex items-center gap-1 bg-white/[0.06] px-2 py-0.5 sm:px-3 sm:py-1 rounded-lg border border-white/[0.1] shadow-inner">
            <MdVideocam size={12} className="text-gray-400 shrink-0 sm:size-[14px]" />
            {video.video ? video.video.split("/").pop() : "Chưa upload"}
          </span>
        </div>
      </div>

      {/* actions */}
      <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-white/[0.08] w-full md:w-auto">
        {/* toggle */}
        <button
          onClick={onToggle}
          title={video.active ? "Tắt video" : "Bật video"}
          className={`relative w-12 h-6 mx-2 rounded-full transition-colors duration-300 border border-transparent shrink-0 ${video.active ? "bg-gradient-to-r from-[#d946ef] to-[#8b5cf6]" : "bg-[#252630] border-[#3f404d]"
            }`}
        >
          <span
            className={`absolute top-[2px] left-[2.5px] w-[18px] h-[18px] bg-white rounded-full transition-transform duration-300 shadow-sm ${video.active ? "translate-x-[25px]" : "translate-x-0"
              }`}
          />
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={onEdit}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/[0.06] text-gray-400 hover:text-[#06b6d4] hover:bg-[#06b6d4]/10 border border-white/[0.1] hover:border-[#06b6d4]/40 transition-all shadow-sm"
            title="Chỉnh sửa"
          >
            <MdEdit size={18} />
          </button>
          <button
            onClick={onDelete}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/[0.06] text-gray-400 hover:text-red-500 hover:bg-red-500/10 border border-white/[0.1] hover:border-red-500/40 transition-all shadow-sm"
            title="Xóa"
          >
            <MdDelete size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Main Page ─── */
const UploadPage = () => {
  const { videos, addVideo, updateVideo, deleteVideo, toggleActive, queuePriority, setQueuePriority } =
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
    <div className="w-full text-white p-4 sm:p-6 md:p-10 font-sans flex flex-col">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 md:gap-6 mb-6 md:mb-8 shrink-0">
        <div>
          <h4 className="text-[10px] font-bold tracking-[0.2em] text-[#d946ef] uppercase mb-3">Cinema Studio</h4>
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-white mb-3 md:mb-4 tracking-tight">Quản lý Video</h1>
          <p className="text-sm text-gray-400 max-w-2xl leading-relaxed">
            Upload và liên kết các video với các món quà trên TikTok Live. Hiện đang có {" "}
            <span className="text-white font-semibold">{activeCount} / {videos.length}</span> {" "}
            video được cấu hình kích hoạt.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-3 shrink-0 pb-1">
          <button
            onClick={() => setModal({ mode: "add" })}
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#d946ef] to-[#8b5cf6] text-white text-sm font-bold shadow-[0_0_20px_rgba(217,70,239,0.2)] hover:shadow-[0_0_30px_rgba(217,70,239,0.4)] hover:scale-[1.02] transition-all"
          >
            <MdAdd size={20} /> Thêm Video Mới
          </button>
        </div>
      </div>

      {/* ── Stats row / Filters ── */}
      <div className="mb-6 md:mb-8 shrink-0 flex items-center gap-2 sm:gap-3 flex-wrap">
        {["all", "active", "inactive"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 sm:px-5 py-2.5 rounded-xl text-[11px] font-extrabold uppercase tracking-[0.1em] transition-all duration-300 min-h-[40px] ${filter === f
                ? "bg-gradient-to-r from-[#d946ef] to-[#8b5cf6] text-white shadow-[0_0_15px_rgba(217,70,239,0.3)] border border-transparent hover:brightness-110"
                : "bg-white/[0.05] border border-white/[0.1] text-gray-400 hover:text-white hover:border-[#d946ef]/40 hover:bg-white/[0.1]"
              }`}
          >
            {f === "all"
              ? `Tất cả (${videos.length})`
              : f === "active"
                ? `Active (${activeCount})`
                : `Inactive (${videos.length - activeCount})`}
          </button>
        ))}
      </div>

      {/* ── Queue Priority Settings ── */}
      <div className="mb-10 py-7 px-5 sm:px-8 md:p-10 rounded-[2.5rem] bg-white/[0.03] border border-white/5 backdrop-blur-2xl flex flex-col items-start md:flex-row md:items-center justify-between gap-6 shadow-2xl relative overflow-hidden group shrink-0">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#d946ef]/5 blur-[100px] -mr-32 -mt-32 pointer-events-none" />
        
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-white/[0.02] flex items-center justify-center text-[#d946ef] border border-white/10 shadow-lg group-hover:scale-110 transition-transform duration-500 shrink-0">
            <MdTune size={28} />
          </div>
          <div className="max-w-md">
            <h3 className="text-xl font-black text-white tracking-tight leading-tight">Chế độ Ưu tiên Hàng đợi</h3>
            <p className="text-[12px] text-gray-400 mt-2 leading-relaxed font-medium">
              Cách hệ thống chọn video tiếp theo khi có nhiều quà tặng cùng lúc. 
              <span className="text-[#d946ef]/60 ml-1 font-bold">Bình chọn (Voting)</span> giúp tăng tương tác hơn.
            </p>
          </div>
        </div>

        <div className="flex bg-white/[0.02] p-1.5 rounded-[1.25rem] border border-white/5 shadow-2xl relative z-10 self-stretch sm:self-auto w-full md:w-auto">
          <button
            onClick={() => setQueuePriority("voting")}
            className={`flex-1 md:flex-none px-6 sm:px-8 py-3.5 rounded-[1rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 min-h-[46px] flex items-center justify-center ${
              queuePriority === "voting"
                ? "bg-gradient-to-r from-[#d946ef] to-[#8b5cf6] text-white shadow-[0_0_25px_rgba(217,70,239,0.3)] scale-[1.02]"
                : "text-white/30 hover:text-white hover:bg-white/[0.03]"
            }`}
          >
            Bình chọn (Voting)
          </button>
          <button
            onClick={() => setQueuePriority("fifo")}
            className={`flex-1 md:flex-none px-6 sm:px-8 py-3.5 rounded-[1rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 min-h-[46px] flex items-center justify-center ${
              queuePriority === "fifo"
                ? "bg-gradient-to-r from-[#d946ef] to-[#8b5cf6] text-white shadow-[0_0_25px_rgba(217,70,239,0.3)] scale-[1.02]"
                : "text-white/30 hover:text-white hover:bg-white/[0.03]"
            }`}
          >
            Thời gian (FIFO)
          </button>
        </div>
      </div>

      {/* ── List ── */}
      <div className="flex-1 pb-20 flex flex-col gap-5">
        {filtered.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-gray-500 py-32 rounded-3xl border border-dashed border-white/[0.08] bg-white/[0.02]">
            <div className="w-24 h-24 mb-2 rounded-full bg-[#1a1b23] border border-[#2e2f38] flex items-center justify-center shadow-inner">
              <MdVideocam size={40} className="text-[#3f404d]" />
            </div>
            <h3 className="text-xl font-bold text-white mb-1">Trống Dữ Liệu</h3>
            <p className="text-sm">
              {filter === "all"
                ? "Chưa có video nào trong thư viện. Thêm video để bắt đầu!"
                : "Không tìm thấy video nào theo bộ lọc này."}
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

      {/* FAB for mobile */}
      <div className="sm:hidden block">
        <div className="fixed bottom-8 right-5 z-40">
          <button
            onClick={() => setModal({ mode: "add" })}
            className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r from-[#d946ef] to-[#8b5cf6] text-white hover:scale-110 shadow-[0_10px_25px_rgba(217,70,239,0.4)] transition-all"
          >
            <MdAdd size={28} />
          </button>
        </div>
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
