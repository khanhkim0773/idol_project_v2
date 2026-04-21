import { createJsonStore } from "../config/json-store.js";

const store = createJsonStore("gift_logs.json");

/**
 * Log a gift transaction to gift_logs.json
 */
export const logGift = async (giftData) => {
  try {
    const newLog = {
      giftId: Number(giftData.giftId),
      giftName: giftData.giftName,
      userId: giftData.userId || giftData.uniqueId,
      nickname: giftData.nickname,
      profilePicture: giftData.profilePictureUrl || giftData.profilePicture || "",
      amount: giftData.amount || giftData.repeatCount || 1,
      diamonds: giftData.diamonds || giftData.diamondCount || 0,
      timestamp: new Date().toISOString(),
    };

    store.insert(newLog);

    console.log(
      `[stats] 📝 Logged gift: ${giftData.giftName} x${newLog.amount} from ${giftData.nickname}`
    );
  } catch (e) {
    console.error("[stats] Error logging gift:", e.message);
  }
};

export const getLeaderboard = async () => {
  try {
    const data = store.readAll();
    // Sort by timestamp descending (mới nhất trước)
    return data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  } catch (e) {
    console.error("[stats] Error reading gift logs:", e.message);
    return [];
  }
};

/**
 * Clear the leaderboard (reset for a new live session)
 */
export const clearLeaderboard = async () => {
  try {
    store.writeAll([]);
    console.log("[stats] 🧹 Leaderboard reset for new live session.");
  } catch (e) {
    console.error("[stats] Error resetting leaderboard:", e.message);
  }
};
