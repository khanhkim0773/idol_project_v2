import fs from "fs";
import { GIFT_LOGS_FILE } from "../config/paths.js";

/**
 * Log a gift transaction to gift_logs.json
 */
export const logGift = (giftData) => {
  try {
    let logs = [];
    if (fs.existsSync(GIFT_LOGS_FILE)) {
      const raw = fs.readFileSync(GIFT_LOGS_FILE, "utf-8");
      logs = JSON.parse(raw);
    }

    const newLog = {
      giftId: giftData.giftId,
      giftName: giftData.giftName,
      userId: giftData.userId || giftData.uniqueId,
      nickname: giftData.nickname,
      profilePicture: giftData.profilePictureUrl || giftData.profilePicture,
      amount: giftData.amount || giftData.repeatCount || 1,
      diamonds: giftData.diamonds || giftData.diamondCount || 0,
      timestamp: new Date().toISOString(),
    };

    logs.push(newLog);
    fs.writeFileSync(GIFT_LOGS_FILE, JSON.stringify(logs, null, 2), "utf-8");
    console.log(
      `[stats] 📝 Logged gift: ${giftData.giftName} x${newLog.amount} from ${giftData.nickname}`,
    );
  } catch (e) {
    console.error("[stats] Error logging gift:", e.message);
  }
};

export const getLeaderboard = () => {
  try {
    if (!fs.existsSync(GIFT_LOGS_FILE)) return [];

    const raw = fs.readFileSync(GIFT_LOGS_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (e) {
    console.error("[stats] Error reading gift logs:", e.message);
    return [];
  }
};

/**
 * Clear the leaderboard (reset for a new live session)
 */
export const clearLeaderboard = () => {
  try {
    fs.writeFileSync(GIFT_LOGS_FILE, JSON.stringify([]), "utf-8");
    console.log("[stats] 🧹 Leaderboard reset for new live session.");
  } catch (e) {
    console.error("[stats] Error resetting leaderboard:", e.message);
  }
};
