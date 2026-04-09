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
  selectedSound: null,
  currentGiftName: null,
  videoMode: "favorite", // 'favorite' | 'queue'
  playId: 0,

  // Settings
  queuePriority: localStorage.getItem("stage_queue_priority") || "voting", // 'voting' | 'fifo'
  setQueuePriority: (priority) => {
    localStorage.setItem("stage_queue_priority", priority);
    set({ queuePriority: priority });
  },

  // ---------- video queue ----------
  // Each item: { videoPath, count, giftName, timestamp }
  videoQueue: [],

  enqueueVideo: (videoPath, giftName = "") => {
    set((state) => {
      const existingIndex = state.videoQueue.findIndex(
        (q) => q.videoPath === videoPath
      );
      let nextQueue = [...state.videoQueue];

      if (existingIndex !== -1) {
        nextQueue[existingIndex] = {
          ...nextQueue[existingIndex],
          count: nextQueue[existingIndex].count + 1,
        };
      } else {
        nextQueue.push({
          videoPath,
          giftName,
          count: 1,
          timestamp: Date.now(),
        });
      }

      return { videoQueue: nextQueue };
    });

    // If nothing is playing, start immediately
    if (!get().selectedVideo) {
      get().processNext();
    }
  },

  processNext: () => {
    const { videoQueue, queuePriority, getActiveVideos, playId } = get();

    if (videoQueue.length > 0) {
      // Sort based on priority
      let sorted = [...videoQueue];
      if (queuePriority === "voting") {
        sorted.sort((a, b) => {
          if (b.count !== a.count) return b.count - a.count;
          return a.timestamp - b.timestamp;
        });
      } else {
        sorted.sort((a, b) => a.timestamp - b.timestamp);
      }

      const nextItem = sorted[0];

      set((state) => {
        const updatedQueue = state.videoQueue
          .map((q) =>
            q.videoPath === nextItem.videoPath ? { ...q, count: q.count - 1 } : q
          )
          .filter((q) => q.count > 0);

        return {
          selectedVideo: nextItem.videoPath,
          currentGiftName: nextItem.giftName,
          videoMode: "queue",
          videoQueue: updatedQueue,
          playId: playId + 1,
        };
      });
    } else {
      // Idle mode: Pick random favorite
      const actives = getActiveVideos();
      if (actives.length > 0) {
        const randomTarget = actives[Math.floor(Math.random() * actives.length)];
        set({
          selectedVideo: randomTarget.video,
          currentGiftName: null,
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

  addGiftScore: (videoPath, delta = 1) =>
    set((state) => ({
      videoGiftScores: {
        ...state.videoGiftScores,
        [videoPath]: (state.videoGiftScores[videoPath] || 0) + delta,
      },
    })),

}));
