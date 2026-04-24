import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const SERVER_DIR = path.resolve(__dirname, "..");
export const PROJECT_ROOT = path.resolve(__dirname, "../..");
export const PUBLIC_DIR = path.join(PROJECT_ROOT, "frontend", "public");
export const VIDEO_DIR = path.join(PUBLIC_DIR, "video");
export const AVATAR_DIR = path.join(PUBLIC_DIR, "avatar");
export const OVERLAY_DIR = path.join(PUBLIC_DIR, "overlay");

export const DATA_DIR = path.join(SERVER_DIR, "data");
export const MC_AUDIO_DIR = path.join(PUBLIC_DIR, "audio", "mc");
