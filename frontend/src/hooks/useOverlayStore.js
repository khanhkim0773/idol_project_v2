import { create } from "zustand";
import { SOCKET_URL } from "../utils/constant";

export const useOverlayStore = create((set, get) => ({
  overlays: [],
  loading: false,

  fetchOverlays: async () => {
    set({ loading: true });
    try {
      const res = await fetch(`${SOCKET_URL}/api/overlays`);
      const data = await res.json();
      if (Array.isArray(data)) {
        set({ overlays: data });
      }
    } catch (err) {
      console.error("Failed to fetch overlays:", err);
    } finally {
      set({ loading: false });
    }
  },

  addOverlay: async (overlayData) => {
    try {
      const res = await fetch(`${SOCKET_URL}/api/overlays`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(overlayData),
      });
      if (res.ok) {
        const newOverlay = await res.json();
        set((state) => ({ overlays: [...state.overlays, newOverlay] }));
        return { success: true, data: newOverlay };
      } else {
        const error = await res.json();
        return { success: false, error: error.error || "Failed to add overlay" };
      }
    } catch (err) {
      console.error("Error adding overlay:", err);
      return { success: false, error: "Network error" };
    }
  },

  updateOverlay: async (id, payload) => {
    try {
      const res = await fetch(`${SOCKET_URL}/api/overlays/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        set((state) => ({
          overlays: state.overlays.map((o) =>
            String(o.id) === String(id) ? { ...o, ...payload } : o
          ),
        }));
        return { success: true };
      } else {
        const error = await res.json();
        return { success: false, error: error.error };
      }
    } catch (err) {
      console.error("Error updating overlay:", err);
      return { success: false, error: "Network error" };
    }
  },

  toggleActive: async (id) => {
    const overlay = get().overlays.find((o) => String(o.id) === String(id));
    if (!overlay) return { success: false };
    return get().updateOverlay(id, { active: !overlay.active });
  },

  deleteOverlay: async (id) => {
    try {
      const res = await fetch(`${SOCKET_URL}/api/overlays/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        set((state) => ({
          overlays: state.overlays.filter((o) => String(o.id) !== String(id)),
        }));
        return { success: true };
      }
    } catch (err) {
      console.error("Error deleting overlay:", err);
    }
    return { success: false };
  },
}));
