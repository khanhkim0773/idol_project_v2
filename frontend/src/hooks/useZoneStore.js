import { create } from "zustand";
import { SOCKET_URL } from "../utils/constant";

export const useZoneStore = create((set, get) => ({
  zones: [],
  loading: false,

  fetchZones: async () => {
    set({ loading: true });
    try {
      const res = await fetch(`${SOCKET_URL}/api/zones`);
      const data = await res.json();
      if (Array.isArray(data)) {
        set({ zones: data });
      }
    } catch (err) {
      console.error("Failed to fetch zones:", err);
    } finally {
      set({ loading: false });
    }
  },

  createZone: async (zoneData) => {
    try {
      const res = await fetch(`${SOCKET_URL}/api/zones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(zoneData),
      });
      if (res.ok) {
        const newZone = await res.json();
        set((state) => ({ zones: [...state.zones, newZone] }));
        return { success: true, data: newZone };
      }
    } catch (err) {
      console.error("Error creating zone:", err);
    }
    return { success: false };
  },

  updateZone: async (id, patch) => {
    try {
      const res = await fetch(`${SOCKET_URL}/api/zones/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (res.ok) {
        const updated = await res.json();
        set((state) => ({
          zones: state.zones.map((z) =>
            z.id === Number(id) ? { ...z, ...updated } : z
          ),
        }));
        return { success: true };
      }
    } catch (err) {
      console.error("Error updating zone:", err);
    }
    return { success: false };
  },

  deleteZone: async (id) => {
    try {
      const res = await fetch(`${SOCKET_URL}/api/zones/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        set((state) => ({
          zones: state.zones.filter((z) => z.id !== Number(id)),
        }));
        return { success: true };
      }
    } catch (err) {
      console.error("Error deleting zone:", err);
    }
    return { success: false };
  },

  addGiftToZone: async (zoneId, giftId, title) => {
    try {
      const res = await fetch(`${SOCKET_URL}/api/zones/${zoneId}/gifts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ giftId, title }),
      });
      if (res.ok) {
        const updatedZone = await res.json();
        set((state) => ({
          zones: state.zones.map((z) =>
            z.id === Number(zoneId) ? updatedZone : z
          ),
        }));
        return { success: true };
      }
    } catch (err) {
      console.error("Error adding gift to zone:", err);
    }
    return { success: false };
  },

  removeGiftFromZone: async (zoneId, giftId) => {
    try {
      const res = await fetch(
        `${SOCKET_URL}/api/zones/${zoneId}/gifts/${giftId}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        const updatedZone = await res.json();
        set((state) => ({
          zones: state.zones.map((z) =>
            z.id === Number(zoneId) ? updatedZone : z
          ),
        }));
        return { success: true };
      }
    } catch (err) {
      console.error("Error removing gift from zone:", err);
    }
    return { success: false };
  },

  updateGiftTitle: async (zoneId, giftId, title) => {
    try {
      const res = await fetch(
        `${SOCKET_URL}/api/zones/${zoneId}/gifts/${giftId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title }),
        }
      );
      if (res.ok) {
        const updatedZone = await res.json();
        set((state) => ({
          zones: state.zones.map((z) =>
            z.id === Number(zoneId) ? updatedZone : z
          ),
        }));
        return { success: true };
      }
    } catch (err) {
      console.error("Error updating gift title:", err);
    }
    return { success: false };
  },
}));
