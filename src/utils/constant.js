import { arrModels } from "./data.js";

export const SOCKET_URL = "http://localhost:3004";
export const DANCER_VIDEOS = arrModels.map(m => m.video);
export const TIKTOK_USERNAME = import.meta.env.VITE_TIKTOK_USERNAME
