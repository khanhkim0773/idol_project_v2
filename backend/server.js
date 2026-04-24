import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import fs from "fs";

import { PUBLIC_DIR, VIDEO_DIR, AVATAR_DIR, OVERLAY_DIR, DATA_DIR, MC_AUDIO_DIR } from "./config/paths.js";
import { createTiktokRouter } from "./routes/tiktok.routes.js";
import { uploadRouter } from "./routes/upload.routes.js";
import { filesRouter } from "./routes/files.routes.js";
import { createGiftsRouter } from "./routes/gifts.routes.js";
import { createVideosRouter } from "./routes/videos.routes.js";
import statsRouter from "./routes/stats.routes.js";
import { createIdolsRouter } from "./routes/idols.routes.js";
import { createOverlaysRouter } from "./routes/overlays.routes.js";
import { createZonesRouter } from "./routes/zones.routes.js";
import { createMCRouter } from "./routes/mc.routes.js";

// Đảm bảo các thư mục vật lý tồn tại
[VIDEO_DIR, AVATAR_DIR, OVERLAY_DIR, DATA_DIR, MC_AUDIO_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const app = express();
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "*";

app.use(cors({ origin: ALLOWED_ORIGIN }));
app.use(express.json());
app.use(express.static(PUBLIC_DIR));

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: { origin: ALLOWED_ORIGIN, methods: ["GET", "POST"] },
});

io.on("connection", (socket) => {
  console.log("[socket] Client connected:", socket.id);
  socket.on("disconnect", () => {
    console.log("[socket] Client disconnected:", socket.id);
  });
});

// Các Routes mới, không còn dependency in-memory
app.use("/api", createTiktokRouter(io));                // POST /api/connect
app.use("/api/upload", uploadRouter);                   // POST /api/upload/video|avatar
app.use("/api/files", filesRouter);                     // DELETE /api/files
app.use("/api/gifts", createGiftsRouter());             // GET/POST/PATCH /api/gifts
app.use("/api/videos", createVideosRouter());           // GET/POST/PATCH /api/videos
app.use("/api/idols", createIdolsRouter());             // GET/POST/PATCH/DELETE /api/idols
app.use("/api/overlays", createOverlaysRouter());       // GET/POST/PATCH/DELETE /api/overlays
app.use("/api/zones", createZonesRouter());             // GET/POST/PATCH/DELETE /api/zones
app.use("/api/mc", createMCRouter());                   // GET/PATCH/POST/DELETE /api/mc
app.use("/api/stats", statsRouter);                     // GET /api/stats/leaderboard

// Proxy TTS voices-list (bypass CORS from ngrok)
app.get("/api/tts/voices-list", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: "Missing url param" });
  try {
    const response = await fetch(url, {
      headers: { "ngrok-skip-browser-warning": "true" },
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("[proxy] voices-list error:", err.message);
    res.status(502).json({ error: "Failed to fetch voices list" });
  }
});

// Proxy TTS speak (bypass CORS from ngrok)
app.post("/api/tts/speak", async (req, res) => {
  const { url, ...body } = req.body;
  if (!url) return res.status(400).json({ error: "Missing url in body" });
  try {
    console.log("[proxy] TTS speak →", url, body);

    // Send as FormData (TTS API expects multipart form, not JSON)
    const formData = new URLSearchParams();
    for (const [key, value] of Object.entries(body)) {
      formData.append(key, String(value));
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
      body: formData,
    });
    if (!response.ok) {
      console.error("[proxy] TTS speak error:", response.status);
      return res.status(response.status).json({ error: "TTS API error" });
    }
    // Pipe audio binary response back to client
    const contentType = response.headers.get("content-type") || "audio/wav";
    res.set("Content-Type", contentType);
    const buffer = Buffer.from(await response.arrayBuffer());
    res.send(buffer);
  } catch (err) {
    console.error("[proxy] TTS speak error:", err.message);
    res.status(502).json({ error: "Failed to call TTS API" });
  }
});


const PORT = process.env.PORT || 3004;
httpServer.listen(PORT, () => {
  console.log(`Backend Server listening at http://localhost:${PORT}`);
  console.log(`📡 Dữ liệu đang được lưu ở local JSON files (backend/data/)`);
});
