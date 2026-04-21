import { Router } from "express";
import { loadVideos, saveVideo, updateVideo, deleteVideo } from "../services/videos.service.js";
import { createJsonStore } from "../config/json-store.js";

const store = createJsonStore("videos.json");

export const createVideosRouter = () => {
  const router = Router();

  // GET /api/videos
  router.get("/", async (_req, res) => {
    try {
      const videos = await loadVideos();
      res.json(videos);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // POST /api/videos - Replace the whole list (bulk sync)
  router.post("/", async (req, res) => {
    try {
      const newVideos = req.body;
      if (Array.isArray(newVideos)) {
        store.writeAll(newVideos);
        res.json({ success: true, count: newVideos.length });
      } else {
        res.status(400).json({ error: "Invalid data format. Expected an array." });
      }
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // Single update: PATCH /api/videos/:id
  router.patch("/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const patch = req.body;
      const result = await updateVideo(id, patch);
      if (result) {
        res.json(result);
      } else {
        res.status(404).json({ error: "Video not found" });
      }
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  return router;
};
