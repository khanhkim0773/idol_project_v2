import { Router } from "express";
import { loadGifts } from "../services/gifts.service.js";
import { createJsonStore } from "../config/json-store.js";

const store = createJsonStore("gifts.json");

export const createGiftsRouter = () => {
  const router = Router();

  // GET /api/gifts
  router.get("/", async (_req, res) => {
    try {
      const gifts = await loadGifts();
      res.json(gifts);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // POST /api/gifts - Add new gift manually
  router.post("/", async (req, res) => {
    try {
      const { giftId, giftName, overlayId } = req.body;
      if (!giftId || !giftName) {
        return res.status(400).json({ error: "giftId and giftName are required" });
      }

      // Kiểm tra trùng lặp
      const existing = store.findBy("giftId", Number(giftId));
      if (existing) {
        return res.status(400).json({ error: "Gift ID already exists" });
      }

      const newGift = {
        giftId: Number(giftId),
        giftName,
        active: true,
        overlayId: overlayId ? Number(overlayId) : null,
      };
      const inserted = store.insert(newGift);
      res.status(201).json(inserted);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // PATCH /api/gifts/:id - Update gift fields (name, active, etc.)
  router.patch("/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const patch = req.body;
      
      const updated = store.update("giftId", Number(id), patch);
      if (!updated) {
        return res.status(404).json({ error: "Gift not found" });
      }
      res.json(updated);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // DELETE /api/gifts/:id - Remove gift
  router.delete("/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const removed = store.remove("giftId", Number(id));
      if (!removed) {
        return res.status(404).json({ error: "Gift not found" });
      }
      res.json(removed);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  return router;
};
