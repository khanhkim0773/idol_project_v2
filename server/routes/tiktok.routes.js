import { Router } from "express";
import { connectToTikTok } from "../services/tiktok.service.js";

/**
 * @param {import("socket.io").Server} io
 * @param {object[]} knownGifts
 */
export const createTiktokRouter = (io, knownGifts) => {
  const router = Router();

  // POST /api/connect
  router.post("/connect", (req, res) => {
    const { username } = req.body;
    if (!username) {
      return res
        .status(400)
        .json({ success: false, message: "Username is required" });
    }
    connectToTikTok(username, io, knownGifts, res);
  });

  return router;
};
