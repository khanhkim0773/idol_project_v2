import { Router } from "express";
import fs from "fs";
import path from "path";
import { PUBLIC_DIR } from "../config/paths.js";

export const filesRouter = Router();

// DELETE
filesRouter.delete("/", (req, res) => {
  const filePath = req.query.path;
  if (!filePath) return res.status(400).json({ error: "Missing path" });
  
  const allowed = ["/video/", "/avatar/"];
  if (!allowed.some((prefix) => filePath.startsWith(prefix))) {
    return res.status(403).json({ error: "Forbidden path" });
  }

  const abs = path.join(PUBLIC_DIR, filePath);
  if (!fs.existsSync(abs)) {
    return res.json({ ok: true, message: "File not found (already deleted)" });
  }

  fs.unlink(abs, (err) => {
    if (err) {
      console.error("[files] Delete error:", err);
      return res.status(500).json({ error: "Failed to delete file" });
    }
    console.log("[files] Deleted:", abs);
    res.json({ ok: true });
  });
});
