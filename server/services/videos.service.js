import fs from "fs";
import { VIDEOS_FILE } from "../config/paths.js";

/**
 * Load videos from videos.json
 * @returns {Array}
 */
export const loadVideos = () => {
  try {
    if (!fs.existsSync(VIDEOS_FILE)) return [];
    const raw = fs.readFileSync(VIDEOS_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (e) {
    console.warn("[videos] Could not read videos.json:", e.message);
    return [];
  }
};

/**
 * Save videos to videos.json
 * @param {Array} videos 
 */
export const saveVideos = (videos) => {
  try {
    // Ensure parent directory exists (though paths.js/server.js should handle it)
    const dir = VIDEOS_FILE.substring(0, VIDEOS_FILE.lastIndexOf("/"));
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    
    fs.writeFileSync(VIDEOS_FILE, JSON.stringify(videos, null, 2), "utf-8");
  } catch (e) {
    console.error("[videos] Could not write videos.json:", e.message);
  }
};
