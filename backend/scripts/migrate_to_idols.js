/**
 * Migration script: videos.json + gifts.json → idols.json
 *
 * Reads the current videos.json, creates Idols from unique "name" fields,
 * then rewrites videos.json (adding idolId, triggerGift; removing name/description/avatar/gift)
 * and gifts.json (adding idolId mapped by giftName match).
 *
 * Run once: node backend/scripts/migrate_to_idols.js
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, "../data");
const VIDEOS_FILE = path.join(DATA_DIR, "videos.json");
const GIFTS_FILE = path.join(DATA_DIR, "gifts.json");
const IDOLS_FILE = path.join(DATA_DIR, "idols.json");

// --- Load current data ----
const videos = JSON.parse(fs.readFileSync(VIDEOS_FILE, "utf-8"));
const gifts = JSON.parse(fs.readFileSync(GIFTS_FILE, "utf-8"));

// --- Check if already migrated ---
if (fs.existsSync(IDOLS_FILE)) {
  console.log("⚠️  idols.json already exists. Aborting to prevent overwrite.");
  console.log("   Delete idols.json first if you want to re-run this migration.");
  process.exit(0);
}

// --- Build Idols from unique video names ---
const nameToIdol = new Map();
let order = 1;

videos.forEach((v) => {
  const name = v.name?.trim();
  if (name && !nameToIdol.has(name)) {
    nameToIdol.set(name, {
      id: Date.now() + order, // unique id
      name,
      avatar: v.avatar || "",
      active: v.active !== undefined ? v.active : true,
      order: order++,
    });
  }
});

const idols = [...nameToIdol.values()];

// --- Rewrite videos.json ---
const newVideos = videos.map((v) => {
  const idol = nameToIdol.get(v.name?.trim());
  return {
    id: v.id,
    video: v.video,
    idolId: idol ? idol.id : null,
    triggerGift: v.gift || null, // keep existing gift binding as specific trigger
    active: v.active !== undefined ? v.active : true,
    order: v.order ?? 1,
  };
});

// --- Rewrite gifts.json: map giftName → idolId ---
// Build a lookup: giftName (lower) → idol
const giftNameToIdol = new Map();
videos.forEach((v) => {
  const giftName = v.gift?.trim().toLowerCase();
  const idol = nameToIdol.get(v.name?.trim());
  if (giftName && idol) {
    giftNameToIdol.set(giftName, idol);
  }
});

const newGifts = gifts.map((g) => {
  const matched = giftNameToIdol.get(g.giftName?.toLowerCase().trim());
  return {
    ...g,
    idolId: matched ? matched.id : null,
  };
});

// --- Write files ---
fs.writeFileSync(IDOLS_FILE, JSON.stringify(idols, null, 2), "utf-8");
fs.writeFileSync(VIDEOS_FILE, JSON.stringify(newVideos, null, 2), "utf-8");
fs.writeFileSync(GIFTS_FILE, JSON.stringify(newGifts, null, 2), "utf-8");

console.log("✅ Migration complete!");
console.log(`   Idols created: ${idols.length}`);
idols.forEach((i) => console.log(`     - [${i.id}] ${i.name} (order ${i.order})`));
console.log(`   Videos updated: ${newVideos.length}`);
console.log(`   Gifts updated: ${newGifts.length}`);
