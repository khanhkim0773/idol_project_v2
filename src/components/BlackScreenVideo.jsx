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

export const BlackScreenVideo = ({ videoSrc, onVideoEnded }) => {
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
    video.loop = false;
    video.muted = true; // 🔥 Bắt buộc muted để autoplay không bị trình duyệt chặn
    video.playsInline = true;
    video.preload = "auto";
    video.autoplay = true;

    let running = true;

    const drawFrame = () => {
      if (!running) return;

      if (video.readyState >= video.HAVE_CURRENT_DATA) {
        // Resize canvas theo video khi cần
        if (video.videoWidth > 0 && (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight)) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }

        if (canvas.width > 0 && canvas.height > 0) {
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
            
            // Tính độ sáng (brightness)
            const brightness = 0.299 * r + 0.587 * g + 0.114 * b;

            // 🔥 detect nền đen chuẩn hơn: pixel tối và các kênh R,G,B đều thấp
            const isDark = r < 70 && g < 70 && b < 70;

            if (isDark && brightness < THRESHOLD + 20) {
              // xoá mạnh vùng tối
              data[i + 3] = 0;
            } else if (brightness < THRESHOLD + 80) {
              // vùng viền → làm mượt (feathering)
              const alpha = (brightness - THRESHOLD) / 80;
              
              // Giảm bám màu đen (despill)
              data[i] = r * alpha;
              data[i + 1] = g * alpha;
              data[i + 2] = b * alpha;
              data[i + 3] = Math.round(Math.max(0, Math.min(255, alpha * 255)));
            }
          }
          ctx.putImageData(imageData, 0, 0);
        }
      }

      animFrameRef.current = requestAnimationFrame(drawFrame);
    };

    const handleLoaded = () => {
      video.play().catch((err) => {
        console.warn("Autoplay failed, trying muted...", err);
        video.muted = true;
        video.play().catch(e => console.error("Final play attempt failed:", e));
      });
      drawFrame();
    };

    video.addEventListener("loadeddata", handleLoaded);
    // Dự phòng: nếu video đã cache xong trước khi attach event
    if (video.readyState >= video.HAVE_CURRENT_DATA) {
      handleLoaded();
    }

    // Khi video kết thúc → gọi callback để phát video tiếp theo trong queue
    const handleEnded = () => {
      if (onVideoEnded) onVideoEnded();
    };
    video.addEventListener("ended", handleEnded);

    return () => {
      running = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      video.pause();
      video.src = "";
      video.load();
      video.removeEventListener("loadeddata", handleLoaded);
      video.removeEventListener("ended", handleEnded);
    };
  }, [videoSrc]);

  return (
    <>
      {/* Video ẩn — chỉ dùng để lấy frame */}
      <video
        ref={videoRef}
        style={{ display: "none" }}
        crossOrigin="anonymous"
        muted
        autoPlay
        playsInline
      />

      <canvas
        ref={canvasRef}
        className="absolute bottom-0 w-full h-[90%] object-cover object-center pointer-events-none z-[1]"
      />
    </>
  );
};

