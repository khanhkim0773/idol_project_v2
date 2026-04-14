import { Router } from "express";
import { 
  loadOverlays, 
  getOverlayById, 
  createOverlay, 
  updateOverlay, 
  deleteOverlay 
} from "../services/overlays.service.js";

export const createOverlaysRouter = () => {
  const router = Router();

  // GET /api/overlays
  router.get("/", async (_req, res) => {
    try {
      const overlays = await loadOverlays();
      res.json(overlays);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // GET /api/overlays/:id
  router.get("/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const overlay = await getOverlayById(id);
      if (!overlay) return res.status(404).json({ error: "Not found" });
      res.json(overlay);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // POST /api/overlays
  router.post("/", async (req, res) => {
    try {
      const overlayData = req.body;
      if (!overlayData.name) {
        return res.status(400).json({ error: "Name is required" });
      }

      const result = await createOverlay(overlayData);
      if (!result.saved) {
        return res.status(500).json({ error: result.error || "Failed to create" });
      }
      res.status(201).json(result.data);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // PATCH /api/overlays/:id
  router.patch("/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const patch = req.body;
      
      const result = await updateOverlay(id, patch);
      if (!result.updated) {
        return res.status(404).json({ error: result.error || "Not found" });
      }
      res.json(result.data);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // DELETE /api/overlays/:id
  router.delete("/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const result = await deleteOverlay(id);
      
      if (!result.deleted) {
        return res.status(404).json({ error: result.error || "Not found" });
      }
      res.json(result.data);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  return router;
};
