import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { WebcastPushConnection } from "tiktok-live-connector";
import cors from "cors";

const app = express();
app.use(cors());

// HTTP server for Socket.io
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", // allow anywhere for testing
    methods: ["GET", "POST"]
  }
});

// TikTok Username to connect to
const TIKTOK_USERNAME = "ledoankimkhanh"; // <--- Đổi thành username TikTok LIVE thật ở đây

// Create connection to TikTok Live
const tiktokLiveConnection = new WebcastPushConnection(TIKTOK_USERNAME);

// Connect
tiktokLiveConnection.connect().then(state => {
  console.info(`Connected to roomId ${state.roomId}`);
}).catch(err => {
  console.error('Failed to connect', err);
});

// Listen to Gift events
tiktokLiveConnection.on('gift', data => {
  // Option: filter for "Rose" only or handle others
  // "Rose" is usually giftId: 5655 or giftName: "Rose" / "Hoa hồng"
  if (data.giftType === 1 && !data.repeatEnd) {
    // Only process when a gift strike is complete (for strike gifts like roses)
    // Actually, to get every single Rose, we can just process them as they come.
    // Or just look at data.giftName.
  }

  // To be safe and log every gift:
  console.log(`${data.uniqueId} sent ${data.giftName} (qty: ${data.repeatCount})!`);

  if (
    data.giftName.toLowerCase().includes("rose") || 
    data.giftName.toLowerCase().includes("hoa hồng") ||
    data.giftId === 5655
  ) {
    console.log("🌸 Rose received! Emitting to socket...");
    io.emit('tiktok_gift', {
      user: data.uniqueId,
      giftName: data.giftName,
      giftId: data.giftId,
      amount: data.repeatCount || 1,
      type: 'rose'
    });
  } else {
    // Emit other gifts if desired
    io.emit('tiktok_gift_other', {
      user: data.uniqueId,
      giftName: data.giftName,
      amount: data.repeatCount || 1
    });
  }
});

// Socket client connection
io.on("connection", (socket) => {
  console.log("Client connected via socket:", socket.id);
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

const PORT = 3004;
httpServer.listen(PORT, () => {
  console.log(`Backend Server listening at http://localhost:${PORT}`);
  console.log(`Watching TikTok Live for: @${TIKTOK_USERNAME}`);
});
