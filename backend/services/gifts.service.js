import { createJsonStore } from "../config/json-store.js";

const store = createJsonStore("gifts.json");

// Lấy danh sách toàn bộ gifts (ordered theo giftId để ổn định)
export const loadGifts = async () => {
  try {
    const data = store.readAll();
    return data.sort((a, b) => (a.giftId || 0) - (b.giftId || 0));
  } catch (e) {
    console.error("[gifts] Could not read gifts:", e.message);
    return [];
  }
};

// Đăng ký/Cập nhật gift khi nhận được từ TikTok Live
export const registerGift = async (giftData) => {
  const giftId = Number(giftData.giftId);
  const newRepeatCount = giftData.repeatCount || 1;

  try {
    const existing = store.findBy("giftId", giftId);

    if (existing) {
      // Gift đã tồn tại -> Cập nhật nếu cần
      const updates = {};
      let needsUpdate = false;

      if (!existing.image && giftData.giftPictureUrl) {
        updates.image = giftData.giftPictureUrl;
        needsUpdate = true;
      }
      if ((existing.diamonds === undefined || existing.diamonds === null) && giftData.diamondCount !== undefined) {
        updates.diamonds = giftData.diamondCount;
        needsUpdate = true;
      }
      if (!existing.maxRepeatCount || newRepeatCount > existing.maxRepeatCount) {
        updates.maxRepeatCount = newRepeatCount;
        needsUpdate = true;
        console.log(`[gifts] 🏆 New record for "${giftData.giftName}": ${newRepeatCount}`);
      }

      if (needsUpdate) {
        store.update("giftId", giftId, updates);
      }
      return { saved: false };
    } else {
      // Bổ sung Gift mới vào Database
      const newGift = {
        giftId: giftId,
        giftName: giftData.giftName,
        image: giftData.giftPictureUrl,
        diamonds: giftData.diamondCount || 0,
        active: true,
        maxRepeatCount: newRepeatCount,
      };

      const inserted = store.insert(newGift);
      
      console.log(`[gifts] 💾 Đã lưu gift mới: "${giftData.giftName}" (id=${giftId}) | 💎 ${giftData.diamondCount}`);
      return { saved: true, data: inserted };
    }
  } catch (err) {
    console.error("[gifts] Error in registerGift:", err.message);
    return { saved: false };
  }
};
