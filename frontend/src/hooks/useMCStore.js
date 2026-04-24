import { create } from "zustand";
import { SOCKET_URL } from "../utils/constant";

export const useMCStore = create((set, get) => ({
  config: {
    enabled: false,
    idleTimeout: 60,
    volume: 0.5,
    interruptOnGift: true,
  },
  audios: [],
  loading: false,

  fetchMCData: async () => {
    set({ loading: true });
    try {
      const res = await fetch(`${SOCKET_URL}/api/mc`);
      if (!res.ok) throw new Error("Backend error");
      const data = await res.json();
      if (data && data.config) {
        set({ config: data.config, audios: data.audios || [] });
      }
    } catch (err) {
      console.error("Failed to fetch MC data:", err);
    } finally {
      set({ loading: false });
    }
  },

  updateConfig: async (patch) => {
    try {
      const res = await fetch(`${SOCKET_URL}/api/mc/config`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (res.ok) {
        const updatedConfig = await res.json();
        set({ config: updatedConfig });
        return { success: true };
      }
    } catch (err) {
      console.error("Error updating MC config:", err);
    }
    return { success: false };
  },

  uploadAudio: async (file, name) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("name", name);

      const res = await fetch(`${SOCKET_URL}/api/mc/upload`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const newAudio = await res.json();
        set((state) => ({ audios: [...state.audios, newAudio] }));
        return { success: true };
      }
    } catch (err) {
      console.error("Error uploading MC audio:", err);
    }
    return { success: false };
  },

  updateAudio: async (id, patch) => {
    try {
      const res = await fetch(`${SOCKET_URL}/api/mc/audio/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (res.ok) {
        const updated = await res.json();
        set((state) => ({
          audios: state.audios.map((a) => (String(a.id) === String(id) ? updated : a)),
        }));
        return { success: true };
      }
    } catch (err) {
      console.error("Error updating MC audio:", err);
    }
    return { success: false };
  },

  deleteAudio: async (id) => {
    try {
      const res = await fetch(`${SOCKET_URL}/api/mc/audio/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        set((state) => ({
          audios: state.audios.filter((a) => String(a.id) !== String(id)),
        }));
        return { success: true };
      }
    } catch (err) {
      console.error("Error deleting MC audio:", err);
    }
    return { success: false };
  },
}));
