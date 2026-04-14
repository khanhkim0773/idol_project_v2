import { Router } from "express";
import { loadGifts } from "../services/gifts.service.js";
import { supabase } from "../config/supabase.js";

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
      const { data: existingGifts, error: fetchErr } = await supabase
        .from("gifts")
        .select("id")
        .eq("giftId", Number(giftId));

      if (fetchErr) throw fetchErr;
      if (existingGifts && existingGifts.length > 0) {
        return res.status(400).json({ error: "Gift ID already exists" });
      }

      const newGift = {
        giftId: Number(giftId),
        giftName,
        active: true,
        overlayId: overlayId ? Number(overlayId) : null,
      };
      const { data, error } = await supabase.from("gifts").insert([newGift]).select();
      if (error) throw error;
      res.status(201).json(data[0]);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // PATCH /api/gifts/:id - Update gift fields (name, active, etc.)
  router.patch("/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const patch = req.body;
      
      const { data, error } = await supabase
        .from("gifts")
        .update(patch)
        .eq("giftId", Number(id))
        .select();

      if (error) throw error;
      if (!data || data.length === 0) {
        return res.status(404).json({ error: "Gift not found" });
      }
      res.json(data[0]);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // DELETE /api/gifts/:id - Remove gift
  router.delete("/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { data, error } = await supabase
        .from("gifts")
        .delete()
        .eq("giftId", Number(id))
        .select();

      if (error) throw error;
      if (!data || data.length === 0) {
        return res.status(404).json({ error: "Gift not found" });
      }
      res.json(data[0]);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  return router;
};
