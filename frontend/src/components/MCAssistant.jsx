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
    timerRef.current = setTimeout(() => {
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
      timerRef.current = setTimeout(() => {
        playRandomMC();
      }, (currentConfig?.idleTimeout || 60) * 1000);
      return;
    }

    const randomAudio = activeAudios[Math.floor(Math.random() * activeAudios.length)];
    
    // Stop any existing audio
    stopAudio();

    const audio = new Audio(`${SOCKET_URL}${randomAudio.path}`);
    audio.volume = currentConfig?.volume || 0.5;
    audioRef.current = audio;
    
    audio.play().catch(err => {
      console.warn("[MC] Playback blocked by browser:", err);
      setIsPlaying(false);
      audioRef.current = null;
      // Restart the idle timer if playback failed
      const latestConfig = useMCStore.getState().config;
      timerRef.current = setTimeout(() => {
        playRandomMC();
      }, (latestConfig?.idleTimeout || 60) * 1000);
    });
    setIsPlaying(true);

    audio.onended = () => {
      if (!audioRef.current) return; // Component might have unmounted or audio stopped
      setIsPlaying(false);
      audioRef.current = null;
      // Restart the idle timer after audio ends
      const latestConfig = useMCStore.getState().config;
      timerRef.current = setTimeout(() => {
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
