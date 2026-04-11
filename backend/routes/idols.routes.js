import { Router } from "express";
import { loadIdols, saveIdols } from "../services/idols.service.js";

export const createIdolsRouter = () => {
  const router = Router();
  let idols = loadIdols();

  // GET /api/idols
  router.get("/", (_req, res) => {
    res.json(idols);
  });

  // POST /api/idols — Create new idol
  router.post("/", (req, res) => {
    const { name, avatar = "", active = true } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Tên idol là bắt buộc" });
    }
    const maxOrder = idols.reduce((m, v) => Math.max(m, v.order ?? 0), 0);
    const newIdol = {
      id: Date.now(),
      name: name.trim(),
      avatar,
      active,
      order: maxOrder + 1,
    };
    idols.push(newIdol);
    saveIdols(idols);
    console.log(`[idols] ➕ Created idol: "${newIdol.name}" (id=${newIdol.id})`);
    res.status(201).json(newIdol);
  });

  // PATCH /api/idols/:id — Update idol fields
  router.patch("/:id", (req, res) => {
    const { id } = req.params;
    const idx = idols.findIndex((i) => String(i.id) === String(id));
    if (idx === -1) return res.status(404).json({ error: "Không tìm thấy idol" });
    idols[idx] = { ...idols[idx], ...req.body };
    saveIdols(idols);
    res.json(idols[idx]);
  });

  // DELETE /api/idols/:id
  router.delete("/:id", (req, res) => {
    const { id } = req.params;
    const before = idols.length;
    idols = idols.filter((i) => String(i.id) !== String(id));
    if (idols.length === before) {
      return res.status(404).json({ error: "Không tìm thấy idol" });
    }
    saveIdols(idols);
    console.log(`[idols] 🗑 Deleted idol id=${id}`);
    res.json({ success: true });
  });

  // POST /api/idols/replace — Replace entire list (bulk sync)
  router.post("/replace", (req, res) => {
    const newList = req.body;
    if (!Array.isArray(newList)) {
      return res.status(400).json({ error: "Expected array" });
    }
    idols = newList;
    saveIdols(idols);
    res.json({ success: true, count: idols.length });
  });

  return router;
};
