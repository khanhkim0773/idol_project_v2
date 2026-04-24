import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { MC_AUDIO_DIR, DATA_DIR } from "../config/paths.js";

const MC_CONFIG_FILE = path.join(DATA_DIR, "mc.json");

// Multer storage for MC audio
const mcStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    if (!fs.existsSync(MC_AUDIO_DIR)) {
      fs.mkdirSync(MC_AUDIO_DIR, { recursive: true });
    }
    cb(null, MC_AUDIO_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_\-\u00C0-\u024F\u1E00-\u1EFF]/g, "-")
      .slice(0, 80);
    cb(null, `mc-${Date.now()}-${base}${ext}`);
  },
});

const uploadMCAudio = multer({
  storage: mcStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (file.mimetype.startsWith("audio/") || [".mp3", ".wav", ".ogg", ".aac", ".m4a"].includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only audio files are allowed (.mp3, .wav, .ogg, ...)"));
    }
  },
});

const getMCData = () => {
  try {
    if (!fs.existsSync(MC_CONFIG_FILE)) {
      const defaultData = {
        config: { enabled: false, idleTimeout: 60, volume: 0.5, interruptOnGift: true },
        audios: []
      };
      fs.writeFileSync(MC_CONFIG_FILE, JSON.stringify(defaultData, null, 2));
      return defaultData;
    }
    return JSON.parse(fs.readFileSync(MC_CONFIG_FILE, "utf-8"));
  } catch (err) {
    console.error("Error reading mc.json:", err);
    return { config: {}, audios: [] };
  }
};

const saveMCData = (data) => {
  try {
    fs.writeFileSync(MC_CONFIG_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Error saving mc.json:", err);
  }
};

export const createMCRouter = () => {
  const router = Router();

  // GET /api/mc
  router.get("/", (req, res) => {
    res.json(getMCData());
  });

  // PATCH /api/mc/config
  router.patch("/config", (req, res) => {
    const data = getMCData();
    data.config = { ...data.config, ...req.body };
    saveMCData(data);
    res.json(data.config);
  });

  // POST /api/mc/upload
  router.post("/upload", (req, res) => {
    uploadMCAudio.single("file")(req, res, (err) => {
      if (err) return res.status(400).json({ error: err.message });
      if (!req.file) return res.status(400).json({ error: "No file uploaded" });

      const data = getMCData();
      const newAudio = {
        id: Date.now(),
        name: req.body.name || req.file.originalname,
        filename: req.file.filename,
        path: `/audio/mc/${req.file.filename}`,
        active: true,
        createdAt: new Date().toISOString()
      };
      data.audios.push(newAudio);
      saveMCData(data);

      res.json(newAudio);
    });
  });

  // PATCH /api/mc/audio/:id
  router.patch("/audio/:id", (req, res) => {
    const { id } = req.params;
    const data = getMCData();
    const index = data.audios.findIndex(a => String(a.id) === String(id));
    if (index === -1) return res.status(404).json({ error: "Audio not found" });

    data.audios[index] = { ...data.audios[index], ...req.body };
    saveMCData(data);
    res.json(data.audios[index]);
  });

  // DELETE /api/mc/audio/:id
  router.delete("/audio/:id", (req, res) => {
    const { id } = req.params;
    const data = getMCData();
    const index = data.audios.findIndex(a => String(a.id) === String(id));
    if (index === -1) return res.status(404).json({ error: "Audio not found" });

    const [removed] = data.audios.splice(index, 1);
    
    // Optional: Delete physical file
    const filePath = path.join(MC_AUDIO_DIR, removed.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    saveMCData(data);
    res.json(removed);
  });

  return router;
};
