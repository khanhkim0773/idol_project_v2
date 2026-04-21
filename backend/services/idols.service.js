import { createJsonStore } from "../config/json-store.js";

const store = createJsonStore("idols.json");

export const loadIdols = async () => {
  try {
    const data = store.readAll();
    // Sort theo order ascending
    return data.sort((a, b) => (a.order || 0) - (b.order || 0));
  } catch (e) {
    console.error("[idols] Could not read idols:", e.message);
    return [];
  }
};

export const saveIdol = async (idolData) => {
  try {
    return store.insert(idolData);
  } catch (e) {
    console.error("[idols] Could not insert idol:", e.message);
    return null;
  }
};

export const updateIdol = async (id, patch) => {
  try {
    return store.update("id", Number(id), patch);
  } catch (e) {
    console.error("[idols] Could not update idol:", e.message);
    return null;
  }
};

export const deleteIdol = async (id) => {
  try {
    const removed = store.remove("id", Number(id));
    return removed !== null;
  } catch (e) {
    console.error("[idols] Could not delete idol:", e.message);
    return false;
  }
};
