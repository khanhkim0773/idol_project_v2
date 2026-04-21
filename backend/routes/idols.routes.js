import { Router } from "express";
import { loadIdols, saveIdol, updateIdol, deleteIdol } from "../services/idols.service.js";
import { createJsonStore } from "../config/json-store.js";

const store = createJsonStore("idols.json");

export const createIdolsRouter = () => {
  const router = Router();

  // GET /api/idols
  router.get("/", async (_req, res) => {
    try {
      const idols = await loadIdols();
      res.json(idols);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // POST /api/idols — Create new idol
  router.post("/", async (req, res) => {
    try {
      const { name, avatar = "", active = true } = req.body;
      if (!name || !name.trim()) {
        return res.status(400).json({ error: "Tên idol là bắt buộc" });
      }

      // Get max order
      const allIdols = store.readAll();
      const maxOrder = allIdols.reduce((max, idol) => Math.max(max, idol.order || 0), 0);

      const newIdol = {
        name: name.trim(),
        avatar,
        active,
        order: maxOrder + 1,
      };

      const result = await saveIdol(newIdol);
      if (!result) return res.status(500).json({ error: "Failed to save idol" });
      
      res.status(201).json(result);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // PATCH /api/idols/:id — Update idol fields
  router.patch("/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const patch = req.body;
      
      const result = await updateIdol(id, patch);
      if (!result) return res.status(404).json({ error: "Không tìm thấy idol" });
      res.json(result);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // DELETE /api/idols/:id
  router.delete("/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await deleteIdol(id);
      if (!success) {
        return res.status(404).json({ error: "Không tìm thấy idol" });
      }
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // POST /api/idols/replace — Replace entire list (bulk sync)
  router.post("/replace", async (req, res) => {
    try {
      const newList = req.body;
      if (!Array.isArray(newList)) {
        return res.status(400).json({ error: "Expected array" });
      }
      store.writeAll(newList);
      res.json({ success: true, count: newList.length });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  return router;
};
