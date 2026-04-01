import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import fs from "fs";

import { PUBLIC_DIR, VIDEO_DIR, AVATAR_DIR } from "./config/paths.js";
import { loadGifts } from "./services/gifts.service.js";
import { createTiktokRouter } from "./routes/tiktok.routes.js";
import { uploadRouter } from "./routes/upload.routes.js";
import { filesRouter } from "./routes/files.routes.js";
import { createGiftsRouter } from "./routes/gifts.routes.js";

[VIDEO_DIR, AVATAR_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const knownGifts = loadGifts();
console.log(`[gifts] Loaded ${knownGifts.length} gift(s) from gifts.json`);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(PUBLIC_DIR));

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: { origin: "*", methods: ["GET", "POST"] },
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

const PORT = 3004;
httpServer.listen(PORT, () => {
  console.log(`Backend Server listening at http://localhost:${PORT}`);
  console.log(`   Waiting for frontend to connect TikTok Live via API...\n`);
});
