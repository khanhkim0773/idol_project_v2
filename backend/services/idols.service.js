import fs from "fs";
import { IDOLS_FILE } from "../config/paths.js";

export const loadIdols = () => {
  try {
    if (!fs.existsSync(IDOLS_FILE)) return [];
    const raw = fs.readFileSync(IDOLS_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (e) {
    console.warn("[idols] Could not read idols.json:", e.message);
    return [];
  }
};

export const saveIdols = (idols) => {
  try {
    fs.writeFileSync(IDOLS_FILE, JSON.stringify(idols, null, 2), "utf-8");
  } catch (e) {
    console.error("[idols] Could not write idols.json:", e.message);
  }
};
