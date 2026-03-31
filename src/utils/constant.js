import { arrModels } from "./data";

export const SOCKET_URL = "http://localhost:3004";
export const DANCER_VIDEOS = arrModels.map(m => m.video);
export const API_URL = import.meta.env.VITE_API_URL;
export const TIKTOK_USERNAME = import.meta.env.VITE_TIKTOK_USERNAME
