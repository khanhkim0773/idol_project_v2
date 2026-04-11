import { create } from "zustand";
import { SOCKET_URL } from "../utils/constant";

export const useIdolStore = create((set, get) => ({
  idols: [],
  loading: false,

  fetchIdols: async () => {
    set({ loading: true });
    try {
      const res = await fetch(`${SOCKET_URL}/api/idols`);
      const data = await res.json();
      if (Array.isArray(data)) {
        set({ idols: data });
      }
    } catch (err) {
      console.error("Failed to fetch idols:", err);
    } finally {
      set({ loading: false });
    }
  },

  addIdol: async (idolData) => {
    try {
      const res = await fetch(`${SOCKET_URL}/api/idols`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(idolData),
      });
      if (res.ok) {
        const newIdol = await res.json();
        set((state) => ({ idols: [...state.idols, newIdol] }));
        return { success: true };
      } else {
        const error = await res.json();
        return { success: false, error: error.error || "Failed to add idol" };
      }
    } catch (err) {
      console.error("Error adding idol:", err);
      return { success: false, error: "Network error" };
    }
  },

  updateIdol: async (id, payload) => {
    try {
      const res = await fetch(`${SOCKET_URL}/api/idols/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
         set((state) => ({
          idols: state.idols.map((i) =>
            String(i.id) === String(id) ? { ...i, ...payload } : i
          ),
        }));
        return { success: true };
      }
    } catch (err) {
      console.error("Error updating idol:", err);
    }
    return { success: false, error: "Network error" };
  },

  deleteIdol: async (id) => {
    const target = get().idols.find(i => String(i.id) === String(id));
     try {
       const res = await fetch(`${SOCKET_URL}/api/idols/${id}`, { method: "DELETE" });
       if (res.ok) {
        // Also try to delete avatar if it's uploaded
         if (target && typeof target.avatar === "string" && target.avatar.startsWith("/avatar/") && /\/\d{10,}-/.test(target.avatar)) {
           fetch(`${SOCKET_URL}/api/files?path=${encodeURIComponent(target.avatar)}`, {
             method: "DELETE",
           }).catch((e) => console.warn("Could not delete idol avatar file:", e));
         }

         set((state) => ({ idols: state.idols.filter(i => String(i.id) !== String(id)) }));
         return { success: true };
       }
     } catch (err) {
       console.error("Error deleting idol", err);
     }
     return { success: false, error: "Network error" }
  },

   toggleActive: async (id) => {
    const idol = get().idols.find((i) => String(i.id) === String(id));
    if (!idol) return { success: false };
    return get().updateIdol(id, { active: !idol.active });
  },

   reorderIdol: async (id, newOrder) => {
    return get().updateIdol(id, { order: newOrder });
  },

  getActiveIdols: () => {
    return [...get().idols].filter(i => i.active).sort((a,b) => a.order - b.order);
  }
}));
