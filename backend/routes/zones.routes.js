import { Router } from "express";
import {
  loadZones,
  createZone,
  updateZone,
  deleteZone,
  addGiftToZone,
  removeGiftFromZone,
  updateGiftTitle,
} from "../services/zones.service.js";

export const createZonesRouter = () => {
  const router = Router();

  // GET /api/zones — Lấy tất cả zones
  router.get("/", (_req, res) => {
    try {
      const zones = loadZones();
      res.json(zones);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // POST /api/zones — Tạo zone mới
  router.post("/", (req, res) => {
    try {
      const zone = createZone(req.body);
      res.status(201).json(zone);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // PATCH /api/zones/:id — Cập nhật zone
  router.patch("/:id", (req, res) => {
    try {
      const updated = updateZone(req.params.id, req.body);
      if (!updated) return res.status(404).json({ error: "Zone not found" });
      res.json(updated);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // DELETE /api/zones/:id — Xóa zone
  router.delete("/:id", (req, res) => {
    try {
      const removed = deleteZone(req.params.id);
      if (!removed) return res.status(404).json({ error: "Zone not found" });
      res.json(removed);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // POST /api/zones/:id/gifts — Thêm gift vào zone
  router.post("/:id/gifts", (req, res) => {
    try {
      const { giftId, title } = req.body;
      if (!giftId) return res.status(400).json({ error: "giftId is required" });

      const zone = addGiftToZone(req.params.id, { giftId, title });
      if (!zone) return res.status(404).json({ error: "Zone not found or gift already exists" });
      res.json(zone);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // PATCH /api/zones/:id/gifts/:giftId — Cập nhật title của gift
  router.patch("/:id/gifts/:giftId", (req, res) => {
    try {
      const { title } = req.body;
      const zone = updateGiftTitle(req.params.id, req.params.giftId, title);
      if (!zone) return res.status(404).json({ error: "Zone or gift not found" });
      res.json(zone);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // DELETE /api/zones/:id/gifts/:giftId — Xóa gift khỏi zone
  router.delete("/:id/gifts/:giftId", (req, res) => {
    try {
      const zone = removeGiftFromZone(req.params.id, req.params.giftId);
      if (!zone) return res.status(404).json({ error: "Zone or gift not found" });
      res.json(zone);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  return router;
};
