import express from "express";
import { getLeaderboard } from "../services/stats.service.js";

const router = express.Router();

/**
 * GET /api/stats/leaderboard?type=gifts|gifters&period=day|week|month|year
 */
router.get("/leaderboard", (req, res) => {
  const data = getLeaderboard();
  res.json(data);
});

export default router;
