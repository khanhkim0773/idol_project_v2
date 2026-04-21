import { createJsonStore } from "../config/json-store.js";

const store = createJsonStore("zones.json");

/**
 * Lấy tất cả zones
 */
export const loadZones = () => {
  try {
    return store.readAll();
  } catch (e) {
    console.error("[zones] Could not read zones:", e.message);
    return [];
  }
};

/**
 * Tạo zone mới
 */
export const createZone = (zoneData) => {
  const newZone = {
    id: Date.now(),
    name: zoneData.name || "Khu mới",
    nameEn: zoneData.nameEn || "New Zone",
    icon: zoneData.icon || "default",
    color: zoneData.color || "#a855f7",
    position: zoneData.position || { x: 10, y: 10 },
    size: zoneData.size || { w: 40, h: 35 },
    gifts: [],
  };
  return store.insert(newZone);
};

/**
 * Cập nhật zone (tên, vị trí, kích thước, danh sách gifts, ...)
 */
export const updateZone = (id, patch) => {
  return store.update("id", Number(id), patch);
};

/**
 * Xóa zone
 */
export const deleteZone = (id) => {
  return store.remove("id", Number(id));
};

/**
 * Thêm gift vào zone
 */
export const addGiftToZone = (zoneId, giftData) => {
  const zones = store.readAll();
  const zone = zones.find((z) => z.id === Number(zoneId));
  if (!zone) return null;

  // Kiểm tra trùng lặp
  const exists = zone.gifts.find(
    (g) => Number(g.giftId) === Number(giftData.giftId)
  );
  if (exists) return null;

  zone.gifts.push({
    giftId: Number(giftData.giftId),
    title: giftData.title || "",
  });
  store.writeAll(zones);
  return zone;
};

/**
 * Xóa gift khỏi zone
 */
export const removeGiftFromZone = (zoneId, giftId) => {
  const zones = store.readAll();
  const zone = zones.find((z) => z.id === Number(zoneId));
  if (!zone) return null;

  const initialLength = zone.gifts.length;
  zone.gifts = zone.gifts.filter(
    (g) => Number(g.giftId) !== Number(giftId)
  );
  if (zone.gifts.length === initialLength) return null;

  store.writeAll(zones);
  return zone;
};

/**
 * Cập nhật title của gift trong zone
 */
export const updateGiftTitle = (zoneId, giftId, title) => {
  const zones = store.readAll();
  const zone = zones.find((z) => z.id === Number(zoneId));
  if (!zone) return null;

  const gift = zone.gifts.find(
    (g) => Number(g.giftId) === Number(giftId)
  );
  if (!gift) return null;

  gift.title = title;
  store.writeAll(zones);
  return zone;
};
