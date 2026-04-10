import { create } from "zustand";
import { SOCKET_URL } from "../utils/constant";

const STORAGE_KEY = "tts_settings";

const DEFAULTS = {
  customApiUrl: "https://unoverlooked-soulfully-rayna.ngrok-free.dev/tts",
  customVoice: "",
  customNumStep: 16,
  customFirstChunkWords: 10,
  customMinChunkWords: 15,
  customBatchSize: 2,
  customNoWarmup: true,
  enabled: false,
  volume: 1,
  giftTemplate: "Cảm ơn {name} đã tặng {amount} {gift}",
  welcomeTemplate: "Xin chào {name}, cho mình xin 1 follow và 1 tim nhé, cảm ơn cậu",
  welcomeEnabled: true,
  voicesList: [],
  voicesLoading: false,
};

const loadSettings = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      // Migrate old "template" → "giftTemplate"
      if (saved.template && !saved.giftTemplate) {
        saved.giftTemplate = saved.template;
      }
      return { ...DEFAULTS, ...saved };
    }
  } catch {}
  return { ...DEFAULTS };
};

const saveSettings = (state) => {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        customApiUrl: state.customApiUrl,
        customVoice: state.customVoice,
        customNumStep: state.customNumStep,
        customFirstChunkWords: state.customFirstChunkWords,
        customMinChunkWords: state.customMinChunkWords,
        customBatchSize: state.customBatchSize,
        customNoWarmup: state.customNoWarmup,
        enabled: state.enabled,
        volume: state.volume,
        giftTemplate: state.giftTemplate,
        welcomeTemplate: state.welcomeTemplate,
        welcomeEnabled: state.welcomeEnabled,
      })
    );
  } catch {}
};

// Queue system
let speechQueue = [];
let isSpeaking = false;
let currentAudio = null;

// ─── Custom API TTS ───
const speakWithCustomAPI = async (text, state) => {
  try {
    const url = state.customApiUrl || "https://unoverlooked-soulfully-rayna.ngrok-free.dev/tts";

    const payload = {
      text,
      voice: state.customVoice || "",
      num_step: state.customNumStep ?? 16,
      first_chunk_words: state.customFirstChunkWords ?? 10,
      min_chunk_words: state.customMinChunkWords ?? 15,
      batch_size: state.customBatchSize ?? 2,
      no_warmup: state.customNoWarmup ?? true,
    };

    console.log("[TTS] Custom API request:", url, payload);

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.warn("[TTS] Custom API error:", response.status);
      isSpeaking = false;
      processQueue();
      return;
    }

    const blob = await response.blob();
    const audioUrl = URL.createObjectURL(blob);
    const audio = new Audio(audioUrl);
    currentAudio = audio;
    audio.volume = state.volume;

    audio.onended = () => {
      URL.revokeObjectURL(audioUrl);
      currentAudio = null;
      isSpeaking = false;
      processQueue();
    };

    audio.onerror = () => {
      URL.revokeObjectURL(audioUrl);
      currentAudio = null;
      isSpeaking = false;
      processQueue();
    };

    audio.play();
  } catch (err) {
    console.warn("[TTS] Custom API fetch failed:", err);
    isSpeaking = false;
    processQueue();
  }
};

// ─── Process queue ───
const processQueue = () => {
  if (isSpeaking || speechQueue.length === 0) return;

  isSpeaking = true;
  const text = speechQueue.shift();
  const state = useTTSStore.getState();
  speakWithCustomAPI(text, state);
};

// ─── Fetch voices list (proxy through backend to bypass CORS) ───
const fetchVoicesList = async (apiUrl) => {
  try {
    const baseUrl = apiUrl.replace(/\/tts\/?$/, "");
    const voicesUrl = `${baseUrl}/voices-list`;
    const proxyUrl = `${SOCKET_URL}/api/tts/voices-list?url=${encodeURIComponent(voicesUrl)}`;
    console.log("[TTS] Fetching voices list via proxy:", proxyUrl);

    const response = await fetch(proxyUrl);
    if (!response.ok) {
      console.warn("[TTS] Voices list error:", response.status);
      return [];
    }
    const data = await response.json();
    return Array.isArray(data) ? data : (data.voices || []);
  } catch (err) {
    console.warn("[TTS] Voices list fetch failed:", err);
    return [];
  }
};

export const useTTSStore = create((set, get) => ({
  ...loadSettings(),

  setCustomApiUrl: (customApiUrl) => {
    set({ customApiUrl });
    saveSettings({ ...get(), customApiUrl });
  },

  setCustomVoice: (customVoice) => {
    set({ customVoice });
    saveSettings({ ...get(), customVoice });
  },

  setCustomNumStep: (customNumStep) => {
    set({ customNumStep });
    saveSettings({ ...get(), customNumStep });
  },

  setCustomFirstChunkWords: (customFirstChunkWords) => {
    set({ customFirstChunkWords });
    saveSettings({ ...get(), customFirstChunkWords });
  },

  setCustomMinChunkWords: (customMinChunkWords) => {
    set({ customMinChunkWords });
    saveSettings({ ...get(), customMinChunkWords });
  },

  setCustomBatchSize: (customBatchSize) => {
    set({ customBatchSize });
    saveSettings({ ...get(), customBatchSize });
  },

  setCustomNoWarmup: (customNoWarmup) => {
    set({ customNoWarmup });
    saveSettings({ ...get(), customNoWarmup });
  },

  setEnabled: (enabled) => {
    set({ enabled });
    saveSettings({ ...get(), enabled });
  },

  setVolume: (volume) => {
    set({ volume });
    saveSettings({ ...get(), volume });
  },

  setGiftTemplate: (giftTemplate) => {
    set({ giftTemplate });
    saveSettings({ ...get(), giftTemplate });
  },

  setWelcomeTemplate: (welcomeTemplate) => {
    set({ welcomeTemplate });
    saveSettings({ ...get(), welcomeTemplate });
  },

  setWelcomeEnabled: (welcomeEnabled) => {
    set({ welcomeEnabled });
    saveSettings({ ...get(), welcomeEnabled });
  },

  // Fetch voices from API
  loadVoices: async () => {
    const state = get();
    set({ voicesLoading: true });
    const voices = await fetchVoicesList(state.customApiUrl);
    set({ voicesList: voices, voicesLoading: false });
    // Auto-select first voice if none selected
    if (!state.customVoice && voices.length > 0) {
      const firstVoice = typeof voices[0] === "string" ? voices[0] : voices[0].id || voices[0].name;
      set({ customVoice: firstVoice });
      saveSettings({ ...get(), customVoice: firstVoice });
    }
  },

  // Gift TTS
  speakGift: (nickname, amount, giftName) => {
    const state = get();
    if (!state.enabled) return;

    const text = state.giftTemplate
      .replace("{name}", nickname || "bạn")
      .replace("{amount}", amount || "1")
      .replace("{gift}", giftName || "quà");

    speechQueue.push(text);
    processQueue();
  },

  // Welcome TTS
  speakWelcome: (nickname) => {
    const state = get();
    if (!state.enabled || !state.welcomeEnabled) return;

    const text = state.welcomeTemplate
      .replace("{name}", nickname || "bạn");

    speechQueue.push(text);
    processQueue();
  },

  // Test speech
  testSpeak: (text) => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio = null;
    }
    speechQueue = [];
    isSpeaking = false;

    const state = get();
    const speakText = text || "Xin chào, đây là giọng đọc thử nghiệm";

    isSpeaking = true;
    speakWithCustomAPI(speakText, state);
  },

  stopSpeaking: () => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio = null;
    }
    speechQueue = [];
    isSpeaking = false;
  },
}));
