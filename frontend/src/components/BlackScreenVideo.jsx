import React, { useRef, useEffect, useState, useCallback } from "react";

/**
 * Ultra-Robust Cinematic Video Player.
 * Uses a 'Fixed Timer' linger effect to ensure the 3s blur is guaranteed.
 * Zero-flicker Top-Layer swap technique.
 */
export const BlackScreenVideo = ({ videoSrc, onVideoEnded, videoMode = "favorite" }) => {
 const isGiftMode = videoMode === "queue";
 const [slotA, setSlotA] = useState({ src: videoSrc, opacity: 1, zIndex: 10 });
 const [slotB, setSlotB] = useState({ src: "", opacity: 0, zIndex: 5 });
 const [activeSlot, setActiveSlot] = useState("A");

 const [isTransitioning, setIsTransitioning] = useState(false);
 const [isWarping, setIsWarping] = useState(false);

 const videoRefA = useRef(null);
 const videoRefB = useRef(null);
 const lingerTimeoutRef = useRef(null);

 const playVideo = useCallback(async (video) => {
 if (!video) return;
 try {
 await video.play();
 } catch (err) {
 video.muted = true;
 try { await video.play(); } catch (e) { }
 }
 }, []);

 // Sync initial playback
 useEffect(() => {
 const activeRef = activeSlot === "A" ? videoRefA.current : videoRefB.current;
 if (activeRef) playVideo(activeRef);
 return () => {
 if (lingerTimeoutRef.current) clearTimeout(lingerTimeoutRef.current);
 };
 }, []);

 // When parent triggers a source change
 useEffect(() => {
 const currentSrc = activeSlot === "A" ? slotA.src : slotB.src;
 if (videoSrc && videoSrc !== currentSrc) {
 const waitSlot = activeSlot === "A" ? "B" : "A";

 // Load next video behind the current one, but put it on top layer (ready to fade)
 if (waitSlot === "B") {
 setSlotB({ src: videoSrc, opacity: 0, zIndex: 50 });
 } else {
 setSlotA({ src: videoSrc, opacity: 0, zIndex: 50 });
 }
 }
 }, [videoSrc]);

 const handleCanPlayThrough = (slot) => {
 const incomingSlot = activeSlot === "A" ? "B" : "A";

 // Mount logic
 if (slot === activeSlot) {
 playVideo(isSlotA ? videoRefA.current : videoRefB.current);
 return;
 }

 if (slot !== incomingSlot || isTransitioning) return;

 const incomingRef = slot === "A" ? videoRefA.current : videoRefB.current;
 const oldRef = slot === "A" ? videoRefB.current : videoRefA.current;

 setIsTransitioning(true);

 if (!isGiftMode) {
 // ===== IDLE MODE: Instant swap, no flash =====
 if (incomingRef) incomingRef.currentTime = 0;
 playVideo(incomingRef);

 // Immediately show new video at full opacity on top
 if (slot === "B") {
 setSlotB(prev => ({ ...prev, opacity: 1 }));
 } else {
 setSlotA(prev => ({ ...prev, opacity: 1 }));
 }

 // Switch active slot on next frame to avoid race
 requestAnimationFrame(() => {
 setActiveSlot(slot);
 if (oldRef) oldRef.pause();

 // Cleanup old slot after visual swap is done
 setTimeout(() => {
 if (slot === "B") {
 setSlotA({ src: "", opacity: 0, zIndex: 5 });
 } else {
 setSlotB({ src: "", opacity: 0, zIndex: 5 });
 }
 setIsTransitioning(false);
 }, 300);
 });

 } else {
 // ===== GIFT MODE: Full cinematic swap with blur =====
 setIsWarping(true);
 playVideo(incomingRef);

 setTimeout(() => {
 if (incomingRef) incomingRef.currentTime = 0;

 if (slot === "B") {
 setSlotB(prev => ({ ...prev, opacity: 1 }));
 } else {
 setSlotA(prev => ({ ...prev, opacity: 1 }));
 }

 setTimeout(() => {
 setActiveSlot(slot);
 if (oldRef) oldRef.pause();

 if (lingerTimeoutRef.current) clearTimeout(lingerTimeoutRef.current);
 lingerTimeoutRef.current = setTimeout(() => {
 setIsWarping(false);

 if (slot === "B") {
 setSlotA({ src: "", opacity: 0, zIndex: 5 });
 } else {
 setSlotB({ src: "", opacity: 0, zIndex: 5 });
 }
 }, 3000);

 setIsTransitioning(false);
 }, 1000);
 }, 500);
 }
 };

 const handleTimeUpdate = (e) => {
 const video = e.target;
 // Only apply pre-end warp for gift videos
 if (isGiftMode && !isTransitioning && !isWarping && video.duration > 0 && video.currentTime > video.duration - 1.2) {
 setIsWarping(true);
 }
 };

 const isSlotA = activeSlot === "A";

 return (
 <div className="absolute inset-0 z-[10] bg-black overflow-hidden pointer-events-none">

 {/* Slot A */}
 <video
 ref={videoRefA}
 src={slotA.src || undefined}
 muted={false}
 playsInline
 className={`absolute inset-0 w-full h-full object-cover transition-all duration-[1500ms] ease-in-out
 ${(isGiftMode && isWarping) ? 'blur-[12px] scale-105 contrast-[1.1]' : 'blur-0 scale-100 contrast-[1.0]'}
 `}
 style={{
 opacity: slotA.opacity,
 zIndex: slotA.zIndex
 }}
 onCanPlayThrough={() => handleCanPlayThrough("A")}
 onTimeUpdate={activeSlot === "A" ? handleTimeUpdate : undefined}
 onEnded={() => activeSlot === "A" && onVideoEnded()}
 onError={() => activeSlot === "A" && onVideoEnded()}
 />

 {/* Slot B */}
 <video
 ref={videoRefB}
 src={slotB.src || undefined}
 muted
 playsInline
 className={`absolute inset-0 w-full h-full object-cover transition-all duration-[1500ms] ease-in-out
 ${(isGiftMode && isWarping) ? 'blur-[12px] scale-105 contrast-[1.1]' : 'blur-0 scale-100 contrast-[1.0]'}
 `}
 style={{
 opacity: slotB.opacity,
 zIndex: slotB.zIndex
 }}
 onCanPlayThrough={() => handleCanPlayThrough("B")}
 onTimeUpdate={activeSlot === "B" ? handleTimeUpdate : undefined}
 onEnded={() => activeSlot === "B" && onVideoEnded()}
 onError={() => activeSlot === "B" && onVideoEnded()}
 />

 {/* 
 OVERLAY MASK (Permanent during state)
 */}
 <div
 className={`absolute inset-0 z-[100] transition-all duration-700 pointer-events-none
 ${(isGiftMode && isWarping) ? 'opacity-100 bg-black/20' : 'opacity-0 bg-transparent'}
 `}
 />

 </div>
 );
};

export default BlackScreenVideo;
