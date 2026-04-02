import { create } from "zustand";

export const useVideoStore = create((set, get) => ({
  // ---------- video list ----------
  videos: [],
  loading: false,

  fetchVideos: async () => {
    set({ loading: true });
    try {
      const res = await fetch("/api/videos");
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
      await fetch("/api/videos", {
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
        fetch(`/api/files?path=${encodeURIComponent(target.video)}`, {
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
  setSelectedVideo: (path) => set({ selectedVideo: path }),
  setSelected: (video, sound) =>
    set({ selectedVideo: video, selectedSound: sound }),
  selectedSound: null,
  playId: 0,

  // ---------- video queue ----------
  videoQueue: [],

  enqueueVideo: (videoPath) =>
    set((state) => {
      if (!state.selectedVideo) {
        return { selectedVideo: videoPath, playId: state.playId + 1 };
      }
      return { videoQueue: [...state.videoQueue, videoPath] };
    }),

  dequeueVideo: () =>
    set((state) => {
      if (state.videoQueue.length === 0) {
        return { selectedVideo: null };
      }
      const [next, ...remaining] = state.videoQueue;
      return {
        selectedVideo: next,
        videoQueue: remaining,
        playId: state.playId + 1,
      };
    }),

  // ---------- điểm quà (số lần video được xếp hàng từ TikTok gift) ----------
  videoGiftScores: {},

  /** Cộng điểm cho một dancer theo đường dẫn video (chỉ gift, không tính chọn tay). */
  addGiftScore: (videoPath, delta = 1) =>
    set((state) => ({
      videoGiftScores: {
        ...state.videoGiftScores,
        [videoPath]: (state.videoGiftScores[videoPath] || 0) + delta,
      },
    })),
}));
