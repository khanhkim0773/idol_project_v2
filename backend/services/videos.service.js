import { createJsonStore } from "../config/json-store.js";

const store = createJsonStore("videos.json");

export const loadVideos = async () => {
  try {
    const data = store.readAll();
    return data.sort((a, b) => (a.order || 0) - (b.order || 0));
  } catch (e) {
    console.warn("[videos] Could not read videos:", e.message);
    return [];
  }
};

export const saveVideo = async (videoData) => {
  try {
    return store.insert(videoData);
  } catch (e) {
    console.error("[videos] Could not insert video:", e.message);
    return null;
  }
};

export const updateVideo = async (id, patch) => {
  try {
    return store.update("id", Number(id), patch);
  } catch (e) {
    console.error("[videos] Could not update video:", e.message);
    return null;
  }
};

export const deleteVideo = async (id) => {
  try {
    const removed = store.remove("id", Number(id));
    return removed !== null;
  } catch (e) {
    console.error("[videos] Could not delete video:", e.message);
    return false;
  }
};
