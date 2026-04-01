import { Router } from "express";

/**
 * @param {object[]} knownGifts 
 */
export const createGiftsRouter = (knownGifts) => {
  const router = Router();

  // GET /api/gifts
  router.get("/", (_req, res) => {
    res.json(knownGifts);
  });

  return router;
};
