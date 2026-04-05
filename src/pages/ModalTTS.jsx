import React, { useState } from "react";
import { useTTSStore } from "../hooks/useTTSStore";
import {
  MdVolumeUp,
  MdVolumeOff,
  MdPlayArrow,
  MdStop,
  MdSave,
  MdKey,
  MdRecordVoiceOver,
  MdSpeed,
  MdTextFields,
  MdApi,
  MdTune,
} from "react-icons/md";
import { LuSpeech } from "react-icons/lu";

const PROVIDERS = [
  { id: "browser", icon: "🌐", label: "Browser", desc: "Miễn phí" },
  { id: "custom", icon: "⚡", label: "Custom API", desc: "API tự host" },
  { id: "elevenlabs", icon: "🎙️", label: "ElevenLabs", desc: "AI cao cấp" },
  { id: "openai", icon: "🤖", label: "OpenAI", desc: "GPT TTS" },
];

const OPENAI_VOICES = [
  { id: "alloy", label: "Alloy", desc: "Trung tính" },
  { id: "echo", label: "Echo", desc: "Nam trầm" },
  { id: "fable", label: "Fable", desc: "Kể chuyện" },
  { id: "onyx", label: "Onyx", desc: "Nam sâu" },
  { id: "nova", label: "Nova", desc: "Nữ tự nhiên" },
  { id: "shimmer", label: "Shimmer", desc: "Nữ ấm" },
];

const ELEVENLABS_VOICES = [
  { id: "21m00Tcm4TlvDq8ikWAM", label: "Rachel", desc: "Nữ, trầm ấm" },
  { id: "AZnzlk1XvdvUeBnXmlld", label: "Domi", desc: "Nữ, mạnh mẽ" },
  { id: "EXAVITQu4vr4xnSDxMaL", label: "Bella", desc: "Nữ, dịu dàng" },
  { id: "ErXwobaYiN019PkySvjV", label: "Antoni", desc: "Nam, ấm áp" },
  { id: "TxGEqnHWrfWFTfGW9XjX", label: "Josh", desc: "Nam, trẻ trung" },
  { id: "VR6AewLTigWG4xSOukaG", label: "Arnold", desc: "Nam, trầm" },
  { id: "pNInz6obpgDQGcFmaJgB", label: "Adam", desc: "Nam, sâu" },
  { id: "yoZ06aMxZJJ28mfd3POQ", label: "Sam", desc: "Nam, tự nhiên" },
];

const ELEVENLABS_MODELS = [
  { id: "eleven_multilingual_v2", label: "Multilingual v2", desc: "Đa ngôn ngữ" },
  { id: "eleven_flash_v2_5", label: "Flash v2.5", desc: "Nhanh" },
  { id: "eleven_turbo_v2_5", label: "Turbo v2.5", desc: "Cân bằng" },
];

const ModalTTS = () => {
  const store = useTTSStore();
  const {
    provider,
    modelName,
    apiKey,
    voice,
    elevenLabsVoiceId,
    elevenLabsModel,
    customApiUrl,
    customVoice,
    customNumStep,
    customFirstChunkWords,
    customMinChunkWords,
    customBatchSize,
    customNoWarmup,
    enabled,
    volume,
    rate,
    template,
    setProvider,
    setModelName,
    setApiKey,
    setVoice,
    setElevenLabsVoiceId,
    setElevenLabsModel,
    setCustomApiUrl,
    setCustomVoice,
    setCustomNumStep,
    setCustomFirstChunkWords,
    setCustomMinChunkWords,
    setCustomBatchSize,
    setCustomNoWarmup,
    setEnabled,
    setVolume,
    setRate,
    setTemplate,
    testSpeak,
    stopSpeaking,
  } = store;

  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testText, setTestText] = useState("");

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleTest = () => {
    const preview = template
      .replace("{name}", "Ngọc Trinh")
      .replace("{amount}", "5")
      .replace("{gift}", "Rose");
    testSpeak(testText || preview);
  };

  const getBadgeInfo = () => {
    if (provider === "custom") return { color: "orange", text: "Custom API" };
    if (provider === "elevenlabs") return { color: "purple", text: "ElevenLabs" };
    if (provider === "openai") return { color: "blue", text: `OpenAI ${modelName}` };
    return { color: "yellow", text: "Browser" };
  };

  const badge = getBadgeInfo();
  const badgeColorClass =
    badge.color === "orange" ? "bg-orange-500/15 border-orange-500/30 text-orange-400" :
      badge.color === "purple" ? "bg-purple-500/15 border-purple-500/30 text-purple-400" :
        badge.color === "blue" ? "bg-blue-500/15 border-blue-500/30 text-blue-400" :
          "bg-yellow-500/15 border-yellow-500/30 text-yellow-400";

  return (
    <div className="w-full h-full overflow-hidden flex flex-col text-white">
      {/* Header */}
      <div className="shrink-0 flex sm:flex-row flex-col items-center justify-between px-6 py-5 border-b border-white/10">
        <div>
          <h1 className="text-2xl font-bold text-neon sm:text-left text-center flex items-center gap-3">
            <LuSpeech className="text-3xl" />
            Text to Speech
          </h1>
          <p className="text-xs text-white/40 mt-0.5 sm:text-left text-center">
            Cấu hình giọng đọc tự động khi nhận quà tặng
          </p>
        </div>

        <div className="flex items-center gap-3 sm:mt-0 mt-4">
          <div className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${badgeColorClass}`}>
            {badge.text}
          </div>
          <button
            onClick={() => setEnabled(!enabled)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 ${enabled
                ? "bg-green-500/20 border border-green-500/40 text-green-400 hover:bg-green-500/30"
                : "bg-white/5 border border-white/10 text-white/50 hover:text-white hover:border-white/30"
              }`}
          >
            {enabled ? <MdVolumeUp size={20} /> : <MdVolumeOff size={20} />}
            {enabled ? "Đang bật" : "Đã tắt"}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-2xl mx-auto flex flex-col gap-6">
          {/* Status */}
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-500 ${enabled ? "bg-green-500/10 border-green-500/20" : "bg-red-500/10 border-red-500/20"
              }`}
          >
            <div className={`w-3 h-3 rounded-full animate-pulse ${enabled ? "bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.5)]" : "bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.5)]"}`} />
            <span className={`text-sm font-medium ${enabled ? "text-green-400" : "text-red-400"}`}>
              {enabled ? `TTS đang hoạt động qua ${badge.text}` : "TTS đã tắt — bật để đọc quà tặng"}
            </span>
          </div>

          {/* ─── Provider Selector ─── */}
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/10 bg-white/[0.03]">
              <MdRecordVoiceOver size={18} className="text-neon" />
              <span className="text-sm font-bold tracking-wide uppercase text-white/70">
                Chọn nhà cung cấp TTS
              </span>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {PROVIDERS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setProvider(p.id)}
                    className={`flex flex-col items-center gap-2 px-3 py-4 rounded-xl border text-sm transition-all duration-300 ${provider === p.id
                        ? "bg-neon/15 border-neon/40 text-neon shadow-[0_0_20px_rgba(7,242,231,0.1)]"
                        : "bg-white/5 border-white/10 text-white/60 hover:border-white/20 hover:text-white/80"
                      }`}
                  >
                    <span className="text-2xl">{p.icon}</span>
                    <span className="font-bold text-xs">{p.label}</span>
                    <span className="text-[9px] opacity-50">{p.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ─── Custom API Settings ─── */}
          {provider === "custom" && (
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/10 bg-white/[0.03]">
                <MdApi size={18} className="text-orange-400" />
                <span className="text-sm font-bold tracking-wide uppercase text-white/70">
                  Cấu hình Custom API
                </span>
              </div>
              <div className="p-5 flex flex-col gap-4">
                {/* API URL */}
                <div>
                  <label className="text-xs text-white/50 mb-1.5 flex items-center gap-1.5">
                    <MdApi size={14} />
                    API URL
                  </label>
                  <input
                    value={customApiUrl}
                    onChange={(e) => setCustomApiUrl(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/25 focus:outline-none focus:border-orange-400/60 focus:shadow-[0_0_20px_rgba(251,146,60,0.1)] transition-all duration-300 font-mono text-[12px]"
                    placeholder="https://your-api.ngrok-free.dev/tts"
                  />
                </div>

                {/* Voice + Num Step */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-white/50 mb-1.5 block">Voice</label>
                    <input
                      value={customVoice}
                      onChange={(e) => setCustomVoice(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/25 focus:outline-none focus:border-orange-400/60 transition-all duration-300"
                      placeholder="ref3"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-white/50 mb-1.5 block">Num Step</label>
                    <input
                      type="number"
                      value={customNumStep}
                      onChange={(e) => setCustomNumStep(Number(e.target.value))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/25 focus:outline-none focus:border-orange-400/60 transition-all duration-300"
                      placeholder="16"
                    />
                  </div>
                </div>

                {/* First Chunk Words + Min Chunk Words */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-white/50 mb-1.5 block">First Chunk Words</label>
                    <input
                      type="number"
                      value={customFirstChunkWords}
                      onChange={(e) => setCustomFirstChunkWords(Number(e.target.value))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/25 focus:outline-none focus:border-orange-400/60 transition-all duration-300"
                      placeholder="10"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-white/50 mb-1.5 block">Min Chunk Words</label>
                    <input
                      type="number"
                      value={customMinChunkWords}
                      onChange={(e) => setCustomMinChunkWords(Number(e.target.value))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/25 focus:outline-none focus:border-orange-400/60 transition-all duration-300"
                      placeholder="15"
                    />
                  </div>
                </div>

                {/* Batch Size + No Warmup */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-white/50 mb-1.5 block">Batch Size</label>
                    <input
                      type="number"
                      value={customBatchSize}
                      onChange={(e) => setCustomBatchSize(Number(e.target.value))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/25 focus:outline-none focus:border-orange-400/60 transition-all duration-300"
                      placeholder="2"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-white/50 mb-1.5 block">No Warmup</label>
                    <button
                      onClick={() => setCustomNoWarmup(!customNoWarmup)}
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-300 ${customNoWarmup
                          ? "bg-green-500/15 border-green-500/30 text-green-400"
                          : "bg-white/5 border-white/10 text-white/50"
                        }`}
                    >
                      {customNoWarmup ? "✅ True" : "❌ False"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── API Key (elevenlabs/openai) ─── */}
          {(provider === "openai" || provider === "elevenlabs") && (
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/10 bg-white/[0.03]">
                <MdKey size={18} className="text-neon" />
                <span className="text-sm font-bold tracking-wide uppercase text-white/70">
                  Xác thực API
                </span>
              </div>
              <div className="p-5 flex flex-col gap-5">
                <div>
                  <label className="text-xs text-white/50 mb-1.5 flex items-center gap-1.5">
                    <MdKey size={14} />
                    {provider === "elevenlabs" ? "ElevenLabs API Key" : "OpenAI API Key"}
                  </label>
                  <div className="relative">
                    <input
                      type={showKey ? "text" : "password"}
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-20 text-white text-sm placeholder-white/25 focus:outline-none focus:border-neon/60 transition-all duration-300 font-mono"
                      placeholder={provider === "elevenlabs" ? "xi-xxxxxxxx" : "sk-xxxxxxxx"}
                    />
                    <button
                      onClick={() => setShowKey(!showKey)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white/40 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition"
                    >
                      {showKey ? "Ẩn" : "Hiện"}
                    </button>
                  </div>
                </div>

                {provider === "openai" && (
                  <div>
                    <label className="text-xs text-white/50 mb-1.5 block">Model</label>
                    <select
                      value={modelName}
                      onChange={(e) => setModelName(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-neon/60 transition-all duration-300 appearance-none cursor-pointer"
                    >
                      <option value="tts-1" className="bg-[#1a1820]">tts-1 (Nhanh)</option>
                      <option value="tts-1-hd" className="bg-[#1a1820]">tts-1-hd (HD)</option>
                    </select>
                  </div>
                )}

                {provider === "elevenlabs" && (
                  <div>
                    <label className="text-xs text-white/50 mb-1.5 block">Model ElevenLabs</label>
                    <select
                      value={elevenLabsModel}
                      onChange={(e) => setElevenLabsModel(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-neon/60 transition-all duration-300 appearance-none cursor-pointer"
                    >
                      {ELEVENLABS_MODELS.map((m) => (
                        <option key={m.id} value={m.id} className="bg-[#1a1820]">{m.label} — {m.desc}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ─── Voice Selection (openai/elevenlabs) ─── */}
          {(provider === "openai" || provider === "elevenlabs") && (
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/10 bg-white/[0.03]">
                <MdRecordVoiceOver size={18} className="text-neon" />
                <span className="text-sm font-bold tracking-wide uppercase text-white/70">
                  Giọng đọc {provider === "elevenlabs" ? "ElevenLabs" : "OpenAI"}
                </span>
              </div>
              <div className="p-5">
                {provider === "openai" && (
                  <div className="grid grid-cols-3 gap-2">
                    {OPENAI_VOICES.map((v) => (
                      <button
                        key={v.id}
                        onClick={() => setVoice(v.id)}
                        className={`flex flex-col items-center gap-1 px-3 py-2.5 rounded-xl border text-sm transition-all duration-300 ${voice === v.id
                            ? "bg-neon/15 border-neon/40 text-neon"
                            : "bg-white/5 border-white/10 text-white/60 hover:border-white/20"
                          }`}
                      >
                        <span className="font-bold text-xs">{v.label}</span>
                        <span className="text-[9px] opacity-60">{v.desc}</span>
                      </button>
                    ))}
                  </div>
                )}
                {provider === "elevenlabs" && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {ELEVENLABS_VOICES.map((v) => (
                      <button
                        key={v.id}
                        onClick={() => setElevenLabsVoiceId(v.id)}
                        className={`flex flex-col items-center gap-1 px-3 py-3 rounded-xl border text-sm transition-all duration-300 ${elevenLabsVoiceId === v.id
                            ? "bg-purple-500/15 border-purple-500/40 text-purple-400"
                            : "bg-white/5 border-white/10 text-white/60 hover:border-white/20"
                          }`}
                      >
                        <span className="font-bold text-xs">{v.label}</span>
                        <span className="text-[9px] opacity-60">{v.desc}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ─── Voice Settings ─── */}
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/10 bg-white/[0.03]">
              <MdTune size={18} className="text-neon" />
              <span className="text-sm font-bold tracking-wide uppercase text-white/70">
                Tùy chỉnh
              </span>
            </div>
            <div className="p-5 flex flex-col gap-5">
              {/* Volume */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-white/50 flex items-center gap-1.5">
                    <MdVolumeUp size={14} /> Âm lượng
                  </label>
                  <span className="text-xs font-bold text-neon tabular-nums">{Math.round(volume * 100)}%</span>
                </div>
                <input type="range" min="0" max="1" step="0.05" value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-[#07f2e7]"
                />
              </div>

              {/* Rate */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-white/50 flex items-center gap-1.5">
                    <MdSpeed size={14} /> Tốc độ đọc
                  </label>
                  <span className="text-xs font-bold text-neon tabular-nums">{rate.toFixed(1)}x</span>
                </div>
                <input type="range" min="0.5" max="2" step="0.1" value={rate}
                  onChange={(e) => setRate(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-[#07f2e7]"
                />
              </div>

              {/* Template */}
              <div>
                <label className="text-xs text-white/50 mb-1.5 flex items-center gap-1.5">
                  <MdTextFields size={14} /> Mẫu câu đọc
                </label>
                <textarea
                  value={template}
                  onChange={(e) => setTemplate(e.target.value)}
                  rows={2}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/25 focus:outline-none focus:border-neon/60 transition-all duration-300 resize-none"
                  placeholder="Cảm ơn {name} đã tặng {amount} {gift}"
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {[
                    { tag: "{name}", label: "Tên người" },
                    { tag: "{amount}", label: "Số lượng" },
                    { tag: "{gift}", label: "Tên quà" },
                  ].map((item) => (
                    <span key={item.tag}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-neon/10 border border-neon/20 text-[10px] text-neon font-mono"
                    >
                      {item.tag}
                      <span className="text-white/40 font-sans">= {item.label}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ─── Test ─── */}
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/10 bg-white/[0.03]">
              <MdPlayArrow size={18} className="text-neon" />
              <span className="text-sm font-bold tracking-wide uppercase text-white/70">Thử giọng đọc</span>
            </div>
            <div className="p-5 flex flex-col gap-4">
              <div className="flex items-center gap-2 px-4 py-3 bg-pink-500/10 border border-pink-500/20 rounded-xl text-sm text-pink-300">
                <span>🎁</span>
                <span className="font-semibold text-white">Ngọc Trinh</span>
                <span>tặng 5 Rose</span>
              </div>

              <div className="flex items-center gap-2 px-4 py-3 bg-neon/5 border border-neon/15 rounded-xl text-sm text-neon/80">
                <MdVolumeUp size={16} />
                <span className="italic">
                  "{template.replace("{name}", "Ngọc Trinh").replace("{amount}", "5").replace("{gift}", "Rose")}"
                </span>
              </div>

              <div className={`text-center text-[10px] py-1.5 rounded-lg font-medium ${provider === "custom" ? "bg-orange-500/10 text-orange-400" :
                  provider === "elevenlabs" ? "bg-purple-500/10 text-purple-400" :
                    provider === "openai" ? "bg-blue-500/10 text-blue-400" :
                      "bg-yellow-500/10 text-yellow-400"
                }`}>
                Sẽ đọc bằng {badge.text}
                {provider === "custom" && ` → ${customApiUrl}`}
              </div>

              <input
                value={testText}
                onChange={(e) => setTestText(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/25 focus:outline-none focus:border-neon/60 transition-all duration-300"
                placeholder="Hoặc nhập văn bản tùy ý để thử..."
              />

              <div className="flex items-center gap-3">
                <button onClick={handleTest}
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-neon/20 border border-neon/30 text-neon font-semibold text-sm hover:bg-neon/30 hover:shadow-[0_0_25px_rgba(7,242,231,0.15)] transition-all duration-300"
                >
                  <MdPlayArrow size={20} /> Phát thử
                </button>
                <button onClick={stopSpeaking}
                  className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 font-semibold text-sm hover:bg-red-500/30 transition-all duration-300"
                >
                  <MdStop size={20} /> Dừng
                </button>
              </div>
            </div>
          </div>

          {/* Save */}
          <button onClick={handleSave}
            className={`w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 ${saved
                ? "bg-green-500 text-white shadow-[0_0_30px_rgba(34,197,94,0.3)]"
                : "bg-neon text-white hover:bg-neon/80 hover:shadow-[0_0_30px_rgba(7,242,231,0.2)]"
              }`}
          >
            <MdSave size={20} />
            {saved ? "✓ Đã lưu thành công!" : "Lưu cấu hình"}
          </button>

          <div className="text-center text-[10px] text-white/20 pb-4">
            Cấu hình được tự động lưu vào trình duyệt (localStorage)
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalTTS;