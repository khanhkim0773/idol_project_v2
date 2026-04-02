import express from "express";
import { getLeaderboard } from "../services/stats.service.js";

const router = express.Router();

/**
 * GET /api/stats/leaderboard?type=gifts|gifters&period=day|week|month|year
 */
router.get("/leaderboard", (req, res) => {
  const { type = "gifts", period = "day" } = req.query;
  
  if (!["gifts", "gifters"].includes(type)) {
    return res.status(400).json({ error: "Invalid type. Use 'gifts' or 'gifters'." });
  }
  
  if (!["day", "week", "month", "year"].includes(period)) {
    return res.status(400).json({ error: "Invalid period. Use 'day', 'week', 'month' or 'year'." });
  }

  const data = getLeaderboard(type, period);
  res.json(data);
});

export default router;
