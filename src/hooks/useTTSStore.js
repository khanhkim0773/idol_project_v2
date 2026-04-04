import { create } from "zustand";

const STORAGE_KEY = "tts_settings";

const loadSettings = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    provider: "browser", // "browser" | "openai" | "elevenlabs" | "custom"
    modelName: "tts-1",
    apiKey: "",
    voice: "nova",
    elevenLabsVoiceId: "21m00Tcm4TlvDq8ikWAM",
    elevenLabsModel: "eleven_multilingual_v2",
    // Custom API settings
    customApiUrl: "https://unoverlooked-soulfully-rayna.ngrok-free.dev/tts",
    customVoice: "ref3",
    customNumStep: 16,
    customFirstChunkWords: 10,
    customMinChunkWords: 15,
    customBatchSize: 2,
    customNoWarmup: true,
    //
    enabled: false,
    volume: 1,
    rate: 1,
    template: "Cảm ơn {name} đã tặng {amount} {gift}",
  };
};

const saveSettings = (state) => {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        provider: state.provider,
        modelName: state.modelName,
        apiKey: state.apiKey,
        voice: state.voice,
        elevenLabsVoiceId: state.elevenLabsVoiceId,
        elevenLabsModel: state.elevenLabsModel,
        customApiUrl: state.customApiUrl,
        customVoice: state.customVoice,
        customNumStep: state.customNumStep,
        customFirstChunkWords: state.customFirstChunkWords,
        customMinChunkWords: state.customMinChunkWords,
        customBatchSize: state.customBatchSize,
        customNoWarmup: state.customNoWarmup,
        enabled: state.enabled,
        volume: state.volume,
        rate: state.rate,
        template: state.template,
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

    const formData = new FormData();
    formData.append("text", text);
    formData.append("voice", state.customVoice || "ref3");
    formData.append("num_step", String(state.customNumStep ?? 16));
    formData.append("first_chunk_words", String(state.customFirstChunkWords ?? 10));
    formData.append("min_chunk_words", String(state.customMinChunkWords ?? 15));
    formData.append("batch_size", String(state.customBatchSize ?? 2));
    formData.append("no_warmup", String(state.customNoWarmup ?? true));

    const response = await fetch(url, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      console.warn("[TTS] Custom API error, falling back to browser:", response.status);
      speakWithBrowser(text, state);
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
    console.warn("[TTS] Custom API fetch failed, falling back to browser:", err);
    speakWithBrowser(text, state);
  }
};

// ─── ElevenLabs TTS API ───
const speakWithElevenLabs = async (text, state) => {
  try {
    const voiceId = state.elevenLabsVoiceId || "21m00Tcm4TlvDq8ikWAM";
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": state.apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: text,
          model_id: state.elevenLabsModel || "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      }
    );

    if (!response.ok) {
      console.warn("[TTS] ElevenLabs API error, falling back to browser:", response.status);
      speakWithBrowser(text, state);
      return;
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    currentAudio = audio;
    audio.volume = state.volume;

    audio.onended = () => {
      URL.revokeObjectURL(url);
      currentAudio = null;
      isSpeaking = false;
      processQueue();
    };

    audio.onerror = () => {
      URL.revokeObjectURL(url);
      currentAudio = null;
      isSpeaking = false;
      processQueue();
    };

    audio.play();
  } catch (err) {
    console.warn("[TTS] ElevenLabs fetch failed, falling back to browser:", err);
    speakWithBrowser(text, state);
  }
};

// ─── OpenAI TTS API ───
const speakWithOpenAI = async (text, state) => {
  try {
    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${state.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: state.modelName || "tts-1",
        input: text,
        voice: state.voice || "nova",
        speed: state.rate || 1,
      }),
    });

    if (!response.ok) {
      console.warn("[TTS] OpenAI API error, falling back to browser:", response.status);
      speakWithBrowser(text, state);
      return;
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    currentAudio = audio;
    audio.volume = state.volume;

    audio.onended = () => {
      URL.revokeObjectURL(url);
      currentAudio = null;
      isSpeaking = false;
      processQueue();
    };

    audio.onerror = () => {
      URL.revokeObjectURL(url);
      currentAudio = null;
      isSpeaking = false;
      processQueue();
    };

    audio.play();
  } catch (err) {
    console.warn("[TTS] OpenAI fetch failed, falling back to browser:", err);
    speakWithBrowser(text, state);
  }
};

// ─── Browser SpeechSynthesis (fallback) ───
const speakWithBrowser = (text, state) => {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "vi-VN";
  utterance.volume = state.volume;
  utterance.rate = state.rate;

  utterance.onend = () => {
    isSpeaking = false;
    processQueue();
  };

  utterance.onerror = () => {
    isSpeaking = false;
    processQueue();
  };

  window.speechSynthesis.speak(utterance);
};

// ─── Route to correct provider ───
const routeSpeak = (text, state) => {
  if (state.provider === "custom") {
    speakWithCustomAPI(text, state);
  } else if (state.provider === "elevenlabs" && state.apiKey?.trim()) {
    speakWithElevenLabs(text, state);
  } else if (state.provider === "openai" && state.apiKey?.trim()) {
    speakWithOpenAI(text, state);
  } else {
    speakWithBrowser(text, state);
  }
};

// ─── Process queue ───
const processQueue = () => {
  if (isSpeaking || speechQueue.length === 0) return;

  isSpeaking = true;
  const text = speechQueue.shift();
  const state = useTTSStore.getState();
  routeSpeak(text, state);
};

export const useTTSStore = create((set, get) => ({
  ...loadSettings(),

  setProvider: (provider) => {
    set({ provider });
    saveSettings({ ...get(), provider });
  },

  setModelName: (modelName) => {
    set({ modelName });
    saveSettings({ ...get(), modelName });
  },

  setApiKey: (apiKey) => {
    set({ apiKey });
    saveSettings({ ...get(), apiKey });
  },

  setVoice: (voice) => {
    set({ voice });
    saveSettings({ ...get(), voice });
  },

  setElevenLabsVoiceId: (elevenLabsVoiceId) => {
    set({ elevenLabsVoiceId });
    saveSettings({ ...get(), elevenLabsVoiceId });
  },

  setElevenLabsModel: (elevenLabsModel) => {
    set({ elevenLabsModel });
    saveSettings({ ...get(), elevenLabsModel });
  },

  // Custom API setters
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

  setRate: (rate) => {
    set({ rate });
    saveSettings({ ...get(), rate });
  },

  setTemplate: (template) => {
    set({ template });
    saveSettings({ ...get(), template });
  },

  // Main speak function
  speakGift: (nickname, amount, giftName) => {
    const state = get();
    if (!state.enabled) return;

    const text = state.template
      .replace("{name}", nickname || "bạn")
      .replace("{amount}", amount || "1")
      .replace("{gift}", giftName || "quà");

    speechQueue.push(text);
    processQueue();
  },

  // Test speech
  testSpeak: (text) => {
    window.speechSynthesis.cancel();
    if (currentAudio) {
      currentAudio.pause();
      currentAudio = null;
    }
    speechQueue = [];
    isSpeaking = false;

    const state = get();
    const speakText = text || "Xin chào, đây là giọng đọc thử nghiệm";

    isSpeaking = true;
    routeSpeak(speakText, state);
  },

  stopSpeaking: () => {
    window.speechSynthesis.cancel();
    if (currentAudio) {
      currentAudio.pause();
      currentAudio = null;
    }
    speechQueue = [];
    isSpeaking = false;
  },
}));
