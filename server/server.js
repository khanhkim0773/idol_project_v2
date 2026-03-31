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
    methods: ["GET", "POST"],
  },
});

app.use(express.json());

let tiktokLiveConnection = null;

const connectToTikTok = (username, res) => {
  if (tiktokLiveConnection) {
    try {
      tiktokLiveConnection.disconnect();
    } catch (e) {
      console.log(e);
    }
  }

  console.log(`Attempting to connect to @${username}...`);
  tiktokLiveConnection = new WebcastPushConnection(username);

  tiktokLiveConnection
    .connect()
    .then((state) => {
      console.info(`Connected to roomId ${state.roomId}`);
      io.emit("tiktok_connected", username);
      if (res) res.json({ success: true, message: `Connected to ${username}` });
    })
    .catch((err) => {
      console.error("Failed to connect", err);
      if (res)
        res.status(500).json({ success: false, message: "Failed to connect" });
    });

  // Listen to Gift events
  tiktokLiveConnection.on("gift", (data) => {
    if (data.giftType === 1 && !data.repeatEnd) {
      return;
    }

    console.log(
      `${data.uniqueId} sent ${data.giftName} (qty: ${data.repeatCount})!`,
    );

    if (
      data.giftName.toLowerCase().includes("rose") ||
      data.giftName.toLowerCase().includes("hoa hồng") ||
      data.giftId === 5655
    ) {
      console.log("🌸 Rose received! Emitting to socket...");
      io.emit("tiktok_gift", {
        user: data.uniqueId,
        giftName: data.giftName,
        giftId: data.giftId,
        amount: data.repeatCount || 1,
        type: "rose",
      });
    } else {
      io.emit("tiktok_gift_other", {
        user: data.uniqueId,
        giftName: data.giftName,
        amount: data.repeatCount || 1,
      });
    }
  });

  tiktokLiveConnection.on("disconnected", () => {
    console.log("Disconnected from TikTok");
    io.emit("tiktok_disconnected");
  });
};

app.post("/api/connect", (req, res) => {
  const { username } = req.body;
  if (!username) {
    return res
      .status(400)
      .json({ success: false, message: "Username is required" });
  }
  connectToTikTok(username, res);
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
  console.log(`Waiting for frontend to connect TikTok Live via API...`);
});
