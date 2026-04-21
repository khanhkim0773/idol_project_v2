import fs from "fs";
import path from "path";
import { DATA_DIR } from "./paths.js";

/**
 * Tạo một JSON store đơn giản cho 1 file JSON.
 * Mỗi file lưu một mảng các object.
 *
 * @param {string} filename - Tên file JSON (vd: "idols.json")
 * @returns {{ readAll, writeAll, findBy, insert, update, remove }}
 */
export const createJsonStore = (filename) => {
  const filePath = path.join(DATA_DIR, filename);

  /** Đọc toàn bộ mảng từ file */
  const readAll = () => {
    try {
      if (!fs.existsSync(filePath)) return [];
      const raw = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(raw);
    } catch (e) {
      console.error(`[json-store] Error reading ${filename}:`, e.message);
      return [];
    }
  };

  /** Ghi toàn bộ mảng ra file */
  const writeAll = (data) => {
    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
    } catch (e) {
      console.error(`[json-store] Error writing ${filename}:`, e.message);
    }
  };

  /**
   * Tìm 1 record theo field và value
   * @param {string} field - Tên field (vd: "id", "giftId")
   * @param {*} value - Giá trị cần tìm
   */
  const findBy = (field, value) => {
    const data = readAll();
    return data.find((item) => item[field] === value) || null;
  };

  /**
   * Thêm record mới. Tự tạo `id` nếu chưa có.
   * @param {object} record
   * @returns {object} Record đã được thêm
   */
  const insert = (record) => {
    const data = readAll();
    if (!record.id) {
      record.id = Date.now();
    }
    data.push(record);
    writeAll(data);
    return record;
  };

  /**
   * Cập nhật record theo field.
   * @param {string} field - Field để tìm (vd: "id", "giftId")
   * @param {*} value - Giá trị field
   * @param {object} patch - Các field cần cập nhật
   * @returns {object|null} Record đã cập nhật hoặc null nếu không tìm thấy
   */
  const update = (field, value, patch) => {
    const data = readAll();
    const index = data.findIndex((item) => item[field] === value);
    if (index === -1) return null;
    data[index] = { ...data[index], ...patch };
    writeAll(data);
    return data[index];
  };

  /**
   * Xóa record theo field.
   * @param {string} field - Field để tìm
   * @param {*} value - Giá trị field
   * @returns {object|null} Record đã xóa hoặc null
   */
  const remove = (field, value) => {
    const data = readAll();
    const index = data.findIndex((item) => item[field] === value);
    if (index === -1) return null;
    const [removed] = data.splice(index, 1);
    writeAll(data);
    return removed;
  };

  return { readAll, writeAll, findBy, insert, update, remove };
};
