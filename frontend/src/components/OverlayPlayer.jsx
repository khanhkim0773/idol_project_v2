import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { useVideoStore } from "../hooks/useVideoStore";
import ParticleOverlayRenderer from "./overlay/ParticleOverlayRenderer";
import VideoOverlayRenderer from "./overlay/VideoOverlayRenderer";

/**
 * OverlayPlayer (Overlay Router)
 * Hiển thị hiệu ứng khi hệ thống nhận quà tặng TikTok.
 * Dựa vào type của bản ghi để gọi Renderer tương ứng.
 */
const OverlayPlayer = ({ isPreview = false, previewData = null, onClosePreview = null }) => {
  const activeOverlay = useVideoStore((s) => s.activeOverlay);
  const clearOverlay = useVideoStore((s) => s.clearOverlay);

  const overlay = isPreview ? previewData : activeOverlay;

  // Auto-clear overlay after duration (Chỉ áp dụng cho particles hoặc fallback)
  useEffect(() => {
    if (!overlay) return;

    // Video tự clear khi onEnded, nên nếu là video thì skip timeout (trừ khi có lỗi thì dùng safety timeout trong renderer)
    if (overlay.type === 'video') return;

    const duration = overlay.duration || 5;
    const timerId = setTimeout(() => {
      if (isPreview && onClosePreview) {
        onClosePreview();
      } else {
        clearOverlay();
      }
    }, duration * 1000);

    return () => clearTimeout(timerId);
  }, [overlay, clearOverlay, isPreview, onClosePreview]);

  if (!overlay) return null;

  const content = (
    <div
      className={`${isPreview ? 'fixed' : 'absolute'} inset-0 z-[99999] pointer-events-none overflow-hidden ${isPreview ? 'bg-black/80' : ''}`}
      style={{
        width: "100%",
        height: "100%",
        animation: "overlayFadeIn 0.3s ease-out"
      }}
    >
      {overlay.type === 'video' ? (
        <VideoOverlayRenderer overlay={overlay} />
      ) : (
        <ParticleOverlayRenderer overlay={overlay} />
      )}

      {isPreview && (
        <div className="absolute top-10 left-1/2 -translate-x-1/2 pointer-events-auto z-[100000]">
          <button onClick={onClosePreview} className="px-6 py-2 bg-red-500/80 hover:bg-red-500 rounded-full text-white font-bold shadow-lg">
            Đóng Preview
          </button>
        </div>
      )}
    </div>
  );

  // Nếu là preview, đưa hẳn ra ngoài document.body để không bị chặn bởi bất kì layout scroll hay overflow hidden nào
  if (isPreview) {
    return createPortal(content, document.body);
  }

  return content;
};

export default OverlayPlayer;
