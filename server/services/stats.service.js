import fs from "fs";
import dayjs from "dayjs";
import { GIFT_LOGS_FILE, GIFTS_FILE } from "../config/paths.js";

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
    console.log(`[stats] 📝 Logged gift: ${giftData.giftName} x${newLog.amount} from ${giftData.nickname}`);
  } catch (e) {
    console.error("[stats] Error logging gift:", e.message);
  }
};

/**
 * Get leaderboard data based on type and period
 * @param {string} type - 'gifts' or 'gifters'
 * @param {string} period - 'day', 'week', 'month', 'year'
 */
export const getLeaderboard = (type, period) => {
  try {
    if (!fs.existsSync(GIFT_LOGS_FILE)) return [];
    const raw = fs.readFileSync(GIFT_LOGS_FILE, "utf-8");
    const logs = JSON.parse(raw);

    // 1. Calculate time threshold
    const now = dayjs();
    let startTime;
    switch (period) {
      case "day": startTime = now.startOf("day"); break;
      case "week": startTime = now.startOf("week"); break;
      case "month": startTime = now.startOf("month"); break;
      case "year": startTime = now.startOf("year"); break;
      default: startTime = now.startOf("day");
    }

    // 2. Filter logs by time
    const filteredLogs = logs.filter(log => dayjs(log.timestamp).isAfter(startTime));

    // 3. Aggregate
    if (type === "gifts") {
      const giftStats = {};
      
      // Get gift metadata (images) from gifts.json
      let giftMetadata = [];
      if (fs.existsSync(GIFTS_FILE)) {
        giftMetadata = JSON.parse(fs.readFileSync(GIFTS_FILE, "utf-8"));
      }

      filteredLogs.forEach(log => {
        if (!giftStats[log.giftId]) {
          const meta = giftMetadata.find(g => Number(g.giftId) === Number(log.giftId));
          giftStats[log.giftId] = {
            id: log.giftId,
            name: log.giftName,
            image: meta?.image || log.profilePicture, // Fallback to whatever we have
            totalAmount: 0,
            totalDiamonds: 0
          };
        }
        giftStats[log.giftId].totalAmount += log.amount;
        giftStats[log.giftId].totalDiamonds += (log.amount * log.diamonds);
      });

      return Object.values(giftStats).sort((a, b) => b.totalAmount - a.totalAmount);
    } 
    else if (type === "gifters") {
      const gifterStats = {};
      filteredLogs.forEach(log => {
        if (!gifterStats[log.userId]) {
          gifterStats[log.userId] = {
            id: log.userId,
            nickname: log.nickname,
            profilePicture: log.profilePicture,
            totalDiamonds: 0
          };
        }
        gifterStats[log.userId].totalDiamonds += (log.amount * log.diamonds);
      });

      return Object.values(gifterStats).sort((a, b) => b.totalDiamonds - a.totalDiamonds);
    }

    return [];
  } catch (e) {
    console.error("[stats] Error generating leaderboard:", e.message);
    return [];
  }
};
