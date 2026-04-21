import { createJsonStore } from "../config/json-store.js";

const store = createJsonStore("overlays.json");
const giftsStore = createJsonStore("gifts.json");

// Lấy danh sách toàn bộ overlays
export const loadOverlays = async () => {
  try {
    const data = store.readAll();
    return data.sort((a, b) => (a.id || 0) - (b.id || 0));
  } catch (e) {
    console.error("[overlays] Could not read overlays:", e.message);
    return [];
  }
};

// Lấy 1 overlay theo id
export const getOverlayById = async (id) => {
  try {
    return store.findBy("id", Number(id));
  } catch (e) {
    console.error(`[overlays] Could not get overlay ${id}:`, e.message);
    return null;
  }
};

// Tạo overlay mới
export const createOverlay = async (overlayData) => {
  try {
    const inserted = store.insert(overlayData);
    return { saved: true, data: inserted };
  } catch (e) {
    console.error("[overlays] Error in createOverlay:", e.message);
    return { saved: false, error: e.message };
  }
};

// Cập nhật overlay
export const updateOverlay = async (id, patch) => {
  try {
    const updated = store.update("id", Number(id), patch);
    if (!updated) return { updated: false, error: "Not found" };
    return { updated: true, data: updated };
  } catch (e) {
    console.error("[overlays] Error in updateOverlay:", e.message);
    return { updated: false, error: e.message };
  }
};

// Xóa overlay
export const deleteOverlay = async (id) => {
  try {
    // Set overlayId = null cho các gifts liên quan
    const gifts = giftsStore.readAll();
    let giftsChanged = false;
    gifts.forEach((gift) => {
      if (gift.overlayId === Number(id)) {
        gift.overlayId = null;
        giftsChanged = true;
      }
    });
    if (giftsChanged) {
      giftsStore.writeAll(gifts);
    }

    const removed = store.remove("id", Number(id));
    if (!removed) return { deleted: false, error: "Not found" };
    return { deleted: true, data: removed };
  } catch (e) {
    console.error("[overlays] Error in deleteOverlay:", e.message);
    return { deleted: false, error: e.message };
  }
};
