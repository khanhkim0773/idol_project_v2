import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import fs from "fs";

import { PUBLIC_DIR, VIDEO_DIR, AVATAR_DIR, DATA_DIR } from "./config/paths.js";
import { loadGifts } from "./services/gifts.service.js";
import { loadVideos } from "./services/videos.service.js";
import { createTiktokRouter } from "./routes/tiktok.routes.js";
import { uploadRouter } from "./routes/upload.routes.js";
import { filesRouter } from "./routes/files.routes.js";
import { createGiftsRouter } from "./routes/gifts.routes.js";
import { createVideosRouter } from "./routes/videos.routes.js";
import statsRouter from "./routes/stats.routes.js";

// Ensure directories exist
[VIDEO_DIR, AVATAR_DIR, DATA_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const knownGifts = loadGifts();
console.log(`[gifts] Loaded ${knownGifts.length} gift(s) from gifts.json`);

const initialVideos = loadVideos();
console.log(`[videos] Loaded ${initialVideos.length} video(s) from videos.json`);
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

app.use("/api", createTiktokRouter(io, knownGifts));   // POST /api/connect
app.use("/api/upload", uploadRouter);                   // POST /api/upload/video|avatar
app.use("/api/files", filesRouter);                     // DELETE /api/files
app.use("/api/gifts", createGiftsRouter(knownGifts));   // GET /api/gifts
app.use("/api/videos", createVideosRouter(initialVideos)); // NEW: GET/POST/PATCH /api/videos
app.use("/api/stats", statsRouter);                     // NEW: GET /api/stats/leaderboard 


const PORT = process.env.PORT || 3004;
httpServer.listen(PORT, () => {
  console.log(`Backend Server listening at http://localhost:${PORT}`);
  console.log(`   Waiting for frontend to connect TikTok Live via API...\n`);
});
