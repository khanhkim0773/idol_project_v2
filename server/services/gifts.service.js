import fs from "fs";
import { GIFTS_FILE } from "../config/paths.js";

export const loadGifts = () => {
  try {
    if (!fs.existsSync(GIFTS_FILE)) return [];
    const raw = fs.readFileSync(GIFTS_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (e) {
    console.warn("[gifts] Could not read gifts.json:", e.message);
    return [];
  }
};

export const saveGifts = (gifts) => {
  try {
    fs.writeFileSync(GIFTS_FILE, JSON.stringify(gifts, null, 2), "utf-8");
  } catch (e) {
    console.error("[gifts] Could not write gifts.json:", e.message);
  }
};


export const registerGift = (giftData, knownGifts) => {
  const alreadyKnown = knownGifts.some((g) => g.giftId === giftData.giftId);
  if (alreadyKnown) {
    console.log(
      `[gifts] ✅ Gift "${giftData.giftName}" (id=${giftData.giftId}) đã có trong danh sách, bỏ qua.`
    );
    return { saved: false, total: knownGifts.length };
  }

  const newGift = { giftId: giftData.giftId, giftName: giftData.giftName };
  knownGifts.push(newGift);
  saveGifts(knownGifts);
  console.log(
    `[gifts] 💾 Đã lưu gift mới: "${giftData.giftName}" (id=${giftData.giftId}) → tổng ${knownGifts.length} gift(s)`
  );
  return { saved: true, total: knownGifts.length };
};
