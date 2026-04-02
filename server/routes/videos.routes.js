import { Router } from "express";
import { loadVideos, saveVideos } from "../services/videos.service.js";

/**
 * @param {object[]} initialVideos 
 */
export const createVideosRouter = (initialVideos) => {
  const router = Router();
  let currentVideos = loadVideos();

  // If file is empty, use initialVideos passed from server.js
  if (currentVideos.length === 0 && initialVideos && initialVideos.length > 0) {
    currentVideos = initialVideos;
    saveVideos(currentVideos);
  }

  // GET /api/videos
  router.get("/", (_req, res) => {
    res.json(currentVideos);
  });

  // POST /api/videos - Replace the whole list
  router.post("/", (req, res) => {
    const newVideos = req.body;
    if (Array.isArray(newVideos)) {
      currentVideos = newVideos;
      saveVideos(currentVideos);
      res.json({ success: true, count: currentVideos.length });
    } else {
      res.status(400).json({ error: "Invalid data format. Expected an array." });
    }
  });

  // Single update: PATCH /api/videos/:id
  router.patch("/:id", (req, res) => {
    const { id } = req.params;
    const patch = req.body;
    const idx = currentVideos.findIndex(v => String(v.id) === String(id));
    if (idx !== -1) {
      currentVideos[idx] = { ...currentVideos[idx], ...patch };
      saveVideos(currentVideos);
      res.json(currentVideos[idx]);
    } else {
      res.status(404).json({ error: "Video not found" });
    }
  });

  return router;
};
