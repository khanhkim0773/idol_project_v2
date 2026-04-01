import { arrModels } from "./data.js";

export const SOCKET_URL = "http://localhost:3004";
export const DANCER_VIDEOS = arrModels.map(m => m.video);


export const IMAGES = {
    LOGO: "/images/logoMeow.png",
    ICO_TIKTOK: "/images/iconTiktok.png",
}

export const ROUTES_URL = {
    DASHBOARD: "/",
    UPLOAD: "/upload",
}
