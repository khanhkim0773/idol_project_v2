import { useEffect, useRef } from "react";

/**
 * Xóa nền đen khỏi video bằng Canvas 2D API (không phải WebGL/Three.js).
 * Nguyên lý: mỗi frame, duyệt từng pixel — pixel nào tối (đen) thì set alpha = 0.
 *
 * Tham số chỉnh:
 *  - THRESHOLD (0–255): pixel có độ sáng thấp hơn giá trị này sẽ bị xóa.
 *    Giá trị thấp (20–40) = chỉ xóa đen thuần.
 *    Giá trị cao hơn (50–80) = xóa cả vùng tối xung quanh nhân vật.
 */
const THRESHOLD = -10; // Điều chỉnh tại đây nếu cần

export const BlackScreenVideo = ({ videoSrc }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);

  useEffect(() => {
    if (!videoSrc) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    video.src = videoSrc;
    video.loop = true;
    video.muted = false;
    video.playsInline = true;
    video.preload = "auto";

    let running = true;

    const drawFrame = () => {
      if (!running) return;

      if (video.readyState >= video.HAVE_CURRENT_DATA && !video.paused) {
        // Resize canvas theo video khi cần
        if (
          canvas.width !== video.videoWidth ||
          canvas.height !== video.videoHeight
        ) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }

        // Vẽ frame hiện tại
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Lấy pixel data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Duyệt từng pixel (mỗi pixel = 4 bytes: R, G, B, A)
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
const brightness = 0.299 * r + 0.587 * g + 0.114 * b;

  // 🔥 detect nền đen chuẩn hơn
  const isDark = r < 70 && g < 70 && b < 70;

  if (isDark && brightness < THRESHOLD + 10) {
    // xoá mạnh
    data[i + 3] = 0;
  } else if (brightness < THRESHOLD + 60) {
    // vùng viền → làm mượt + xoá màu đen
    const alpha = (brightness - THRESHOLD) / 60;

    // 🔥 despill mạnh hơn
    data[i] = r * alpha;
    data[i + 1] = g * alpha;
    data[i + 2] = b * alpha;
    data[i + 3] = Math.round(alpha * 255);
  }
        }
        ctx.putImageData(imageData, 0, 0);
      }

      animFrameRef.current = requestAnimationFrame(drawFrame);
    };

    const handleLoaded = () => {
      video.play().catch((err) => {
        console.error("Autoplay failed:", err);
      });
      drawFrame();
    };

    video.addEventListener("loadeddata", handleLoaded);

    return () => {
      running = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      video.pause();
      video.removeAttribute("src");
      video.load();
      video.removeEventListener("loadeddata", handleLoaded);
    };
  }, [videoSrc]);

  return (
    <>
      {/* Video ẩn — chỉ dùng để lấy frame */}
      <video
        ref={videoRef}
        style={{ display: "none" }}
        crossOrigin="anonymous"
      />

      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center bottom",
          zIndex: 1,
          pointerEvents: "none",
        }}
      />
    </>
  );
};
