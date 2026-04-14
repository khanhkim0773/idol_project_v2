import React, { useEffect, useState } from "react";
import { useVideoStore } from "../hooks/useVideoStore";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

/**
 * OverlayPlayer (TsParticles Edition)
 * Hiển thị hiệu ứng rơi hạt (particles) khi hệ thống nhận quà tặng TikTok.
 */
const OverlayPlayer = ({ id = "tsparticles-overlay" }) => {
  const activeOverlay = useVideoStore((s) => s.activeOverlay);
  const clearOverlay = useVideoStore((s) => s.clearOverlay);

  // Auto-clear overlay after duration
  useEffect(() => {
    if (!activeOverlay) return;
    
    const duration = activeOverlay.duration || 5;
    const timerId = setTimeout(() => {
      clearOverlay();
    }, duration * 1000);

    return () => clearTimeout(timerId);
  }, [activeOverlay, clearOverlay]);

  if (!activeOverlay) return null;

  // Build config with fullScreen disabled
  let config = { 
    ...activeOverlay.config, 
    fullScreen: { enable: false } 
  };

  // Inject image if specified
  if (config?.particles?.shape?.type === "image" && activeOverlay.image) {
    config = {
      ...config,
      particles: {
        ...config.particles,
        shape: {
          ...config.particles.shape,
          options: {
            image: {
              src: activeOverlay.image,
              width: 100,
              height: 100,
            }
          }
        }
      }
    };
  }

  return (
    <div
      className="absolute inset-0 pointer-events-none z-[80] overflow-hidden"
      style={{
        width: "100%",
        height: "100%",
        animation: "overlayFadeIn 0.3s ease-out"
      }}
    >
      <Particles
        id={id}
        options={config}
        className="w-full h-full"
        style={{
          width: "100%",
          height: "100%"
        }}
      />
    </div>
  );
};

export default OverlayPlayer;
