import { Router } from "express";
import multer from "multer";
import path from "path";
import { VIDEO_DIR, AVATAR_DIR } from "../config/paths.js";

const videoStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, VIDEO_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_\-\u00C0-\u024F\u1E00-\u1EFF]/g, "-")
      .slice(0, 80);
    cb(null, `${Date.now()}-${base}${ext}`);
  },
});

const avatarStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, AVATAR_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-avatar${ext}`);
  },
});

const VIDEO_EXTS = new Set([".mp4", ".webm", ".mov", ".avi", ".mkv", ".ogg"]);
const IMAGE_EXTS = new Set([".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif"]);

const uploadVideo = multer({
  storage: videoStorage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500 MB
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (file.mimetype.startsWith("video/") || VIDEO_EXTS.has(ext))
      cb(null, true);
    else
      cb(new Error("Only video files are allowed (.mp4, .webm, .mov, ...)"));
  },
});

const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (file.mimetype.startsWith("image/") || IMAGE_EXTS.has(ext))
      cb(null, true);
    else
      cb(new Error("Only image files are allowed (.jpg, .png, .webp, ...)"));
  },
});

export const uploadRouter = Router();

// POST /api/upload/video → saves to public/video/
uploadRouter.post("/video", (req, res) => {
  uploadVideo.single("file")(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    console.log("[upload] Video saved:", req.file.filename);
    res.json({ path: `/video/${req.file.filename}` });
  });
});

// POST /api/upload/avatar → saves to public/avatar/
uploadRouter.post("/avatar", (req, res) => {
  uploadAvatar.single("file")(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    console.log("[upload] Avatar saved:", req.file.filename);
    res.json({ path: `/avatar/${req.file.filename}` });
  });
});
