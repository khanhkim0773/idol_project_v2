import { WebcastPushConnection } from "tiktok-live-connector";
import { registerGift } from "./gifts.service.js";
import { logGift } from "./stats.service.js";

let tiktokLiveConnection = null;

/**
 * Kết nối tới TikTok Live của `username`.
 * @param {string} username
 * @param {import("socket.io").Server} io
 * @param {object[]} knownGifts  - Mảng shared để lưu gift (mutate in-place)
 * @param {import("express").Response} [res]
 */
export const connectToTikTok = (username, io, knownGifts, res) => {
  // Ngắt kết nối cũ nếu có
  if (tiktokLiveConnection) {
    try {
      tiktokLiveConnection.disconnect();
    } catch (e) {
      console.log("[tiktok] Disconnect error:", e.message);
    }
  }

  console.log(`[tiktok] Attempting to connect to ${username}`);
  tiktokLiveConnection = new WebcastPushConnection(username);

  tiktokLiveConnection
    .connect()
    .then((state) => {
      console.info(`[tiktok] Connected to roomId ${state.roomId}`);
      io.emit("tiktok_connected", username);
      if (res) res.json({ success: true, message: `Connected to ${username}` });
    })
    .catch((err) => {
      console.error("[tiktok] Failed to connect:", err);
      if (res)
        res.status(500).json({ success: false, message: "Failed to connect" });
    });

  // ── Sự kiện Gift ──────────────────────────────────────────────
  tiktokLiveConnection.on("gift", (data) => {
    // console.log(data)
    // giftType === 1 là streak gift (có thể bắn nhiều event trong 1 streak)
    // Chỉ skip khi repeatEnd được gửi rõ ràng là false.
    // (Một số trường hợp repeatEnd có thể undefined → không nên skip nhầm)
    if (data.giftType === 1 && data.repeatEnd === false) {
      console.log(
        `[gifts] ⏭ Skipping streak gift: ${data.giftName} (repeatEnd=false)`
      );
      return;
    }

    console.log(
      `[gifts] 🎁 Nhận gift: "${data.giftName}" | giftId=${data.giftId} | từ @${data.uniqueId} | qty=${data.repeatCount}`
    );

    // console.log(data)


    registerGift(data, knownGifts);
    logGift(data); // Log for leaderboard statistics


    // Gửi event tiktok_gift cho tất cả các loại quà để frontend có thể check matching video
    io.emit("tiktok_gift", {
      user: data.uniqueId,
      giftName: data.giftName,
      giftId: data.giftId,
      nickname: data.nickname,
      profilePicture: data.profilePictureUrl,
      amount: data.repeatCount || 1,
      type: "gift",
    });
  });

  // ── Sự kiện Member (người mới vào live) ────────────────────────
  tiktokLiveConnection.on("member", (data) => {
    io.emit("tiktok_member", {
      user: data.uniqueId,
      nickname: data.nickname,
      profilePicture: data.profilePictureUrl,
    });
  });

  // ── Sự kiện Chat ──────────────────────────────────────────────
  tiktokLiveConnection.on("chat", (data) => {
    io.emit("tiktok_chat", {
      user: data.uniqueId,
      nickname: data.nickname,
      comment: data.comment,
      profilePicture: data.profilePictureUrl,
    });
  });

  // ── Sự kiện Disconnect ────────────────────────────────────────
  tiktokLiveConnection.on("disconnected", () => {
    console.log("[tiktok] Disconnected from TikTok");
    io.emit("tiktok_disconnected");
  });
};
