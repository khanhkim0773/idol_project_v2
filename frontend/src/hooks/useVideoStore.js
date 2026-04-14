import { create } from "zustand";
import { useIdolStore } from "./useIdolStore";
import { SOCKET_URL } from "../utils/constant";

export const useVideoStore = create((set, get) => ({
  // ---------- video list ----------
  videos: [],
  loading: false,

  fetchVideos: async () => {
    set({ loading: true });
    try {
      const res = await fetch(`${SOCKET_URL}/api/videos`);
      const data = await res.json();
      if (Array.isArray(data)) {
        set({ videos: data });
      }
    } catch (err) {
      console.error("Failed to fetch videos:", err);
    } finally {
      set({ loading: false });
    }
  },

  syncVideos: async (newVideos) => {
    try {
      await fetch(`${SOCKET_URL}/api/videos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newVideos),
      });
    } catch (err) {
      console.error("Failed to sync videos to server:", err);
    }
  },

  addVideo: async (videoData) => {
    const { videos, syncVideos } = get();
    const maxOrder = videos.reduce((m, v) => Math.max(m, v.order), 0);
    const newVideo = {
      ...videoData,
      id: Date.now(),
      order: maxOrder + 1,
      active: true,
    };
    const nextVideos = [...videos, newVideo];
    set({ videos: nextVideos });
    await syncVideos(nextVideos);
  },

  updateVideo: async (id, patch) => {
    const { videos, syncVideos } = get();
    const nextVideos = videos.map((v) => (v.id === id ? { ...v, ...patch } : v));
    set({ videos: nextVideos });
    await syncVideos(nextVideos);
  },

  deleteVideo: async (id) => {
    const { videos, syncVideos } = get();
    const target = videos.find((v) => v.id === id);

    if (target) {
      const isUploaded = (p) =>
        typeof p === "string" &&
        (p.startsWith("/video/") || p.startsWith("/avatar/")) &&
        /\/\d{10,}-/.test(p);

      if (isUploaded(target.video)) {
        fetch(`${SOCKET_URL}/api/files?path=${encodeURIComponent(target.video)}`, {
          method: "DELETE",
        }).catch((e) => console.warn("Could not delete video file:", e));
      }
      if (isUploaded(target.avatar)) {
        fetch(`/api/files?path=${encodeURIComponent(target.avatar)}`, {
          method: "DELETE",
        }).catch((e) => console.warn("Could not delete avatar file:", e));
      }
    }

    const nextVideos = videos.filter((v) => v.id !== id);
    set((state) => ({
      videos: nextVideos,
      selectedVideo:
        state.selectedVideo === target?.video ? null : state.selectedVideo,
    }));
    await syncVideos(nextVideos);
  },

  toggleActive: async (id) => {
    const { videos, syncVideos } = get();
    const nextVideos = videos.map((v) =>
      v.id === id ? { ...v, active: !v.active } : v
    );
    set({ videos: nextVideos });
    await syncVideos(nextVideos);
  },

  reorderVideo: async (id, newOrder) => {
    const { videos, syncVideos } = get();
    const nextVideos = videos.map((v) =>
      v.id === id ? { ...v, order: newOrder } : v
    );
    set({ videos: nextVideos });
    await syncVideos(nextVideos);
  },

  // ---------- active videos (sorted) ----------
  getActiveVideos: () => {
    const { videos } = get();
    return [...videos]
      .filter((v) => v.active)
      .sort((a, b) => a.order - b.order);
  },

  // ---------- currently selected video ----------
  selectedVideo: null,
  selectedSound: null,
  currentGiftName: null,
  currentGiftSender: null,
  videoMode: "favorite", // 'favorite' | 'queue'
  playId: 0,

  // ---------- video queue ----------
  // Each item: { id, videoPath, giftName, nickname, timestamp }
  videoQueue: [],

  enqueueVideo: (videoPath, giftName = "", nickname = "") => {
    set((state) => {
      const nextQueue = [
        ...state.videoQueue,
        {
          id: Date.now() + Math.random().toString(36).substring(2),
          videoPath,
          giftName,
          nickname,
          timestamp: Date.now(),
        },
      ];
      return { videoQueue: nextQueue };
    });

    // If nothing is playing, start immediately
    if (!get().selectedVideo) {
      get().processNext();
    }
  },

  processNext: () => {
    const { videoQueue, getActiveVideos, playId } = get();

    if (videoQueue.length > 0) {
      // Pure FIFO based on insertion
      const nextItem = videoQueue[0];

      set((state) => {
        // Remove the first item from the queue
        const updatedQueue = state.videoQueue.slice(1);

        return {
          selectedVideo: nextItem.videoPath,
          currentGiftName: nextItem.giftName,
          currentGiftSender: nextItem.nickname,
          videoMode: "queue",
          videoQueue: updatedQueue,
          playId: playId + 1,
        };
      });
    } else {
      // Idle mode: Pick random active Idol -> Pick random video from that Idol
      const activeIdols = useIdolStore.getState().getActiveIdols();
      let randomTarget = null;

      if (activeIdols.length > 0) {
        // Pick random Idol
        const randomIdol = activeIdols[Math.floor(Math.random() * activeIdols.length)];
        // Get their active videos
        const idolVideos = getActiveVideos().filter(v => v.idolId === randomIdol.id);

        if (idolVideos.length > 0) {
           randomTarget = idolVideos[Math.floor(Math.random() * idolVideos.length)];
        }
      }

      // Fallback if idol has no videos or no idols active: pick random from any active video
      if (!randomTarget) {
         const actives = getActiveVideos();
         if (actives.length > 0) {
           randomTarget = actives[Math.floor(Math.random() * actives.length)];
         }
      }

      if (randomTarget) {
        set({
          selectedVideo: randomTarget.video,
          currentGiftName: null,
          currentGiftSender: null,
          videoMode: "favorite",
          playId: playId + 1,
        });
      } else {
        set({
          selectedVideo: null,
          currentGiftName: null,
          videoMode: "favorite",
          playId: playId + 1,
        });
      }
    }
  },

  dequeueVideo: () => get().processNext(),

  setSelectedVideo: (videoPath) => {
    set((state) => ({
      selectedVideo: videoPath,
      currentGiftName: null,
      videoMode: "favorite",
      playId: state.playId + 1,
    }));
  },

  // ---------- điểm quà ----------
  videoGiftScores: {},
  idolGiftScores: {}, // { idolId: totalDiamonds }
  idolGiftHistory: {}, // { idolId: [giftImage1, giftImage2, ...] }

  addGiftScore: (videoPath, delta = 1) =>
    set((state) => ({
      videoGiftScores: {
        ...state.videoGiftScores,
        [videoPath]: (state.videoGiftScores[videoPath] || 0) + delta,
      },
    })),

  addIdolGift: (idolId, diamonds = 0, giftImage = null) =>
    set((state) => {
      const prevScore = state.idolGiftScores[idolId] || 0;
      const prevHistory = state.idolGiftHistory[idolId] || [];

      const nextHistory =
        giftImage && !prevHistory.includes(giftImage)
          ? [...prevHistory, giftImage].slice(-8) // Keep last 8 unique gifts
          : prevHistory;

      return {
        idolGiftScores: {
          ...state.idolGiftScores,
          [idolId]: prevScore + diamonds,
        },
        idolGiftHistory: {
          ...state.idolGiftHistory,
          [idolId]: nextHistory,
        },
      };
    }),

  // ---------- transition overlay ----------
  // Cấu hình (Object) của overlay đang được hiển thị; null = không có
  activeOverlay: null,

  triggerOverlay: (overlayConfig) => set({ activeOverlay: overlayConfig }),
  clearOverlay: ()      => set({ activeOverlay: null }),

}));
