import React, { useEffect, useRef, useState } from "react";
import { useMCStore } from "../hooks/useMCStore";
import { useVideoStore } from "../hooks/useVideoStore";
import { SOCKET_URL } from "../utils/constant";

const MCAssistant = () => {
  const { config, audios, fetchMCData } = useMCStore();
  const lastActivity = useVideoStore((state) => state.lastActivity);
  const videoMode = useVideoStore((state) => state.videoMode);
  const interruptSignal = useVideoStore((state) => state.interruptSignal);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  const timerRef = useRef(null);
  const shuffleBagRef = useRef([]); // Túi chứa các audio chưa được phát trong vòng hiện tại

  // Reset túi khi danh sách audio thay đổi (bật/tắt, thêm/xóa)
  useEffect(() => {
    shuffleBagRef.current = [];
  }, [audios]);

  // -- NEW: Refs for unmount safety --
  const isMountedRef = useRef(true);
  const allTimersRef = useRef(new Set());

  const scheduleTimer = (fn, delay) => {
    const id = setTimeout(() => {
      allTimersRef.current.delete(id);
      fn();
    }, delay);
    allTimersRef.current.add(id);
    return id;
  };

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      allTimersRef.current.forEach(id => clearTimeout(id));
      allTimersRef.current.clear();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.onended = null;
        audioRef.current = null;
      }
    };
  }, []);
  // ----------------------------------

  // Fetch initial data
  useEffect(() => {
    fetchMCData();
  }, [fetchMCData]);

  // Handle Interrupt Signal
  useEffect(() => {
    if (interruptSignal === 0) return;
    stopAudio();
    if (timerRef.current) clearTimeout(timerRef.current);
  }, [interruptSignal]);

  // Handle Playback Logic
  useEffect(() => {
    if (!config.enabled) {
      stopAudio();
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    // If a gift arrives (lastActivity changes), stop current MC
    if (config?.interruptOnGift) {
        stopAudio();
    }

    // Clear existing timer
    if (timerRef.current) clearTimeout(timerRef.current);

    // If we are currently in a gift queue, don't start the idle timer yet
    if (videoMode === "queue") {
        return;
    }

    // Set new idle timer
    timerRef.current = scheduleTimer(() => {
      playRandomMC();
    }, (config?.idleTimeout || 60) * 1000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [lastActivity, config.enabled, config.idleTimeout, videoMode]);

  const playRandomMC = () => {
    const state = useMCStore.getState();
    const currentAudios = state.audios;
    const currentConfig = state.config;

    const activeAudios = currentAudios.filter(a => a.active);
    if (activeAudios.length === 0) {
      // Keep the loop alive even if no active audios are present yet
      timerRef.current = scheduleTimer(() => {
        playRandomMC();
      }, (currentConfig?.idleTimeout || 60) * 1000);
      return;
    }

    // -- Shuffle Bag Logic --
    // Nếu túi rỗng, làm mới túi bằng cách copy và xáo trộn (shuffle) danh sách active
    if (shuffleBagRef.current.length === 0) {
      const newBag = [...activeAudios];
      for (let i = newBag.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newBag[i], newBag[j]] = [newBag[j], newBag[i]];
      }
      shuffleBagRef.current = newBag;
    }

    // Lấy audio đầu tiên ra khỏi túi
    const nextAudio = shuffleBagRef.current.shift();

    // Fallback an toàn
    if (!nextAudio) {
      timerRef.current = scheduleTimer(() => {
        playRandomMC();
      }, (currentConfig?.idleTimeout || 60) * 1000);
      return;
    }
    
    // Stop any existing audio
    stopAudio();

    const audio = new Audio(`${SOCKET_URL}${nextAudio.path}`);
    audio.volume = currentConfig?.volume || 0.5;
    audioRef.current = audio;
    
    audio.play().catch(err => {
      console.warn("[MC] Playback blocked by browser:", err);
      setIsPlaying(false);
      audioRef.current = null;
      // Restart the idle timer if playback failed
      const latestConfig = useMCStore.getState().config;
      timerRef.current = scheduleTimer(() => {
        playRandomMC();
      }, (latestConfig?.idleTimeout || 60) * 1000);
    });
    setIsPlaying(true);

    audio.onended = () => {
      if (!audioRef.current || !isMountedRef.current) return; // Component might have unmounted or audio stopped
      setIsPlaying(false);
      audioRef.current = null;
      // Restart the idle timer after audio ends
      const latestConfig = useMCStore.getState().config;
      timerRef.current = scheduleTimer(() => {
        playRandomMC();
      }, (latestConfig?.idleTimeout || 60) * 1000);
    };
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsPlaying(false);
    }
  };

  // We don't render anything, it's a logic-only component
  return null;
};

export default MCAssistant;
