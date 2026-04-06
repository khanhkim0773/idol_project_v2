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
  MdCheckCircle,
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

const Slider = ({ label, value, min, max, step, displayValue, onChange }) => {
  const percentage = ((value - min) / (max - min)) * 100;
  return (
    <div className="mb-8">
      <div className="flex justify-between text-[10px] font-bold mb-3">
        <span className="text-gray-400 uppercase tracking-[0.15em]">{label}</span>
        <span className="text-white font-mono">{displayValue}</span>
      </div>
      <div className="relative h-1.5 bg-[#252630] rounded-full flex items-center cursor-pointer">
        <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#d946ef] to-[#8b5cf6] rounded-full" style={{ width: `${percentage}%` }}></div>
        <input type="range" min={min} max={max} step={step} value={value} onChange={onChange}
          className="w-full h-full opacity-0 cursor-pointer relative z-10"
        />
        <div className="absolute w-3 h-3 bg-white rounded-full shadow-[0_0_12px_rgba(217,70,239,0.8)] pointer-events-none" style={{ left: `calc(${percentage}% - 6px)` }}></div>
      </div>
    </div>
  );
};

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

  return (
    <div className="w-full h-full text-white overflow-y-auto p-6 md:p-10 font-sans">
      {/* Header section */}
      <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h4 className="text-[10px] font-bold tracking-[0.2em] text-[#d946ef] uppercase mb-3">Configuration Studio</h4>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">Voice Dynamics</h1>
          <p className="text-sm text-gray-400 max-w-2xl leading-relaxed">
            Customize your stream's auditory identity. Đồng bộ hóa trí thông minh nhân tạo với luồng phát sóng của bạn thông qua các nhà cung cấp TTS hàng đầu.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 pb-1">
          <div className="px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider bg-[#252630] border border-[#2e2f38] text-gray-300">
            {badge.text}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">

        {/* Left Column */}
        <div className="md:col-span-1 lg:col-span-2 space-y-8">

          {/* Provider Selection */}
          <div>
            <h2 className="text-white font-bold flex items-center gap-3 mb-5 text-sm uppercase tracking-wider">
              <span className="w-4 h-4 rounded-full bg-gradient-to-tr from-[#d946ef] to-[#8b5cf6] inline-flex items-center justify-center text-[10px]">
                <span className="w-2 h-2 rounded-full bg-[#111115]"></span>
              </span>
              Voice Provider Selection
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {PROVIDERS.map((p) => {
                const isActive = provider === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => setProvider(p.id)}
                    className={`relative p-6 rounded-2xl border cursor-pointer transition-all duration-300 group ${isActive
                      ? "bg-white/[0.08] border-[#d946ef] shadow-[0_4px_25px_rgba(217,70,239,0.15)]"
                      : "bg-white/[0.04] border-white/[0.1] hover:border-white/20 hover:bg-white/[0.06]"
                      }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-colors ${isActive ? 'bg-[#d946ef]/20 text-[#d946ef]' : 'bg-white/[0.06] text-gray-400 group-hover:bg-white/[0.1]'}`}>
                      <span className="text-2xl">{p.icon}</span>
                    </div>
                    <h3 className="text-white font-bold text-[15px] mb-1.5">{p.label}</h3>
                    <p className="text-gray-400 text-xs">{p.desc}</p>

                    {isActive && (
                      <div className="absolute top-5 right-5 text-[9px] font-extrabold tracking-[0.1em] text-white bg-[#d946ef] px-2.5 py-1 rounded-full shadow-[0_0_10px_rgba(217,70,239,0.5)]">
                        ACTIVE
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dynamic Provider Settings */}
          {provider === "custom" && (
            <div className="bg-white/[0.04] border border-white/[0.1] rounded-2xl p-7">
              <h3 className="text-white font-bold mb-6 flex items-center gap-2">
                <MdApi className="text-orange-400" size={20} /> Cấu hình Custom API
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="sm:col-span-2">
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2.5 block">API URL</label>
                  <input
                    value={customApiUrl}
                    onChange={(e) => setCustomApiUrl(e.target.value)}
                    className="w-full bg-white/[0.06] border border-white/[0.1] rounded-xl px-5 py-3.5 text-white text-sm focus:outline-none focus:border-[#d946ef]/60 transition-all font-mono"
                    placeholder="https://your-api.ngrok-free.dev/tts"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2.5 block">Voice (Reference ID)</label>
                  <input
                    value={customVoice}
                    onChange={(e) => setCustomVoice(e.target.value)}
                    className="w-full bg-white/[0.06] border border-white/[0.1] rounded-xl px-5 py-3.5 text-white text-sm focus:outline-none focus:border-[#d946ef]/60 transition-all font-mono"
                    placeholder="ref3"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2.5 block">Num Step</label>
                  <input
                    type="number"
                    value={customNumStep}
                    onChange={(e) => setCustomNumStep(Number(e.target.value))}
                    className="w-full bg-white/[0.06] border border-white/[0.1] rounded-xl px-5 py-3.5 text-white text-sm focus:outline-none focus:border-[#d946ef]/60 transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2.5 block">First Chunk Words</label>
                  <input
                    type="number"
                    value={customFirstChunkWords}
                    onChange={(e) => setCustomFirstChunkWords(Number(e.target.value))}
                    className="w-full bg-white/[0.06] border border-white/[0.1] rounded-xl px-5 py-3.5 text-white text-sm focus:outline-none focus:border-[#d946ef]/60 transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2.5 block">Min Chunk Words</label>
                  <input
                    type="number"
                    value={customMinChunkWords}
                    onChange={(e) => setCustomMinChunkWords(Number(e.target.value))}
                    className="w-full bg-white/[0.06] border border-white/[0.1] rounded-xl px-5 py-3.5 text-white text-sm focus:outline-none focus:border-[#d946ef]/60 transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2.5 block">Batch Size</label>
                  <input
                    type="number"
                    value={customBatchSize}
                    onChange={(e) => setCustomBatchSize(Number(e.target.value))}
                    className="w-full bg-white/[0.06] border border-white/[0.1] rounded-xl px-5 py-3.5 text-white text-sm focus:outline-none focus:border-[#d946ef]/60 transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2.5 block">No Warmup</label>
                  <button
                    onClick={() => setCustomNoWarmup(!customNoWarmup)}
                    className={`w-full h-[50px] rounded-xl border text-sm font-semibold transition-all flex items-center justify-center gap-2 ${customNoWarmup
                      ? "bg-[#d946ef]/20 border-[#d946ef]/40 text-[#d946ef]"
                      : "bg-[#252630] border-[#2e2f38] text-gray-400 hover:bg-[#2a2c36]"
                      }`}
                  >
                    {customNoWarmup ? <><MdCheckCircle size={18} /> Enabled (True)</> : "Disabled (False)"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {(provider === "openai" || provider === "elevenlabs") && (
            <div className="space-y-8">
              {/* API Key */}
              <div className="bg-white/[0.04] border border-white/[0.1] rounded-2xl p-7">
                <h3 className="text-white font-bold mb-6 flex items-center gap-2 text-[15px]">
                  <MdKey className="text-[#d946ef]" size={20} /> Xác thực Kết nối
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className={provider === "openai" || provider === "elevenlabs" ? "sm:col-span-1" : "sm:col-span-2"}>
                    <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2.5 block">
                      {provider === "elevenlabs" ? "ElevenLabs API Key" : "OpenAI API Key"}
                    </label>
                    <div className="relative">
                      <input
                        type={showKey ? "text" : "password"}
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        className="w-full bg-[#252630] border border-[#2e2f38] rounded-xl px-5 py-3.5 pr-16 text-white text-sm focus:outline-none focus:border-[#d946ef]/60 transition-all font-mono placeholder-[#52546e]"
                        placeholder={provider === "elevenlabs" ? "xi-xxxxxxxx" : "sk-xxxxxxxx"}
                      />
                      <button
                        onClick={() => setShowKey(!showKey)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400 hover:text-white uppercase tracking-wider"
                      >
                        {showKey ? "Ẩn" : "Hiện"}
                      </button>
                    </div>
                  </div>
                  {provider === "openai" && (
                    <div>
                      <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2.5 block">Model</label>
                      <select
                        value={modelName}
                        onChange={(e) => setModelName(e.target.value)}
                        className="w-full bg-[#252630] border border-[#2e2f38] rounded-xl px-5 py-3.5 text-white text-sm focus:outline-none focus:border-[#d946ef]/60 transition-all appearance-none cursor-pointer"
                      >
                        <option value="tts-1">tts-1 (Nhanh)</option>
                        <option value="tts-1-hd">tts-1-hd (Chất lượng cao)</option>
                      </select>
                    </div>
                  )}
                  {provider === "elevenlabs" && (
                    <div>
                      <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2.5 block">Model ElevenLabs</label>
                      <select
                        value={elevenLabsModel}
                        onChange={(e) => setElevenLabsModel(e.target.value)}
                        className="w-full bg-[#252630] border border-[#2e2f38] rounded-xl px-5 py-3.5 text-white text-sm focus:outline-none focus:border-[#d946ef]/60 transition-all appearance-none cursor-pointer"
                      >
                        {ELEVENLABS_MODELS.map(m => (
                          <option key={m.id} value={m.id}>{m.label} &mdash; {m.desc}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* Voice Selection */}
              <div className="bg-white/[0.04] border border-white/[0.1] rounded-2xl p-7">
                <h3 className="text-white font-bold mb-6 flex items-center gap-2 text-[15px]">
                  <MdRecordVoiceOver className="text-[#d946ef]" size={20} />
                  Danh sách Giọng đọc {provider === "elevenlabs" ? "ElevenLabs" : "OpenAI"}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {provider === "openai" && OPENAI_VOICES.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setVoice(v.id)}
                      className={`p-4 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${voice === v.id
                        ? 'bg-gradient-to-br from-[#d946ef]/15 to-[#8b5cf6]/15 border-[#d946ef]/50 text-white shadow-[0_0_15px_rgba(217,70,239,0.1)]'
                        : 'bg-[#252630] border-[#2e2f38] text-gray-400 hover:border-gray-500'
                        }`}
                    >
                      <span className="font-bold text-sm tracking-wide">{v.label}</span>
                      <span className="text-[10px] opacity-70">{v.desc}</span>
                    </button>
                  ))}
                  {provider === "elevenlabs" && ELEVENLABS_VOICES.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setElevenLabsVoiceId(v.id)}
                      className={`p-4 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${elevenLabsVoiceId === v.id
                        ? 'bg-gradient-to-br from-[#d946ef]/15 to-[#8b5cf6]/15 border-[#d946ef]/50 text-white shadow-[0_0_15px_rgba(217,70,239,0.1)]'
                        : 'bg-[#252630] border-[#2e2f38] text-gray-400 hover:border-gray-500'
                        }`}
                    >
                      <span className="font-bold text-sm tracking-wide">{v.label}</span>
                      <span className="text-[10px] opacity-70">{v.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right Column */}
        <div className="md:col-span-1 border border-white/[0.1] bg-white/[0.04] rounded-2xl p-7 h-fit relative sm:sticky top-0 shadow-lg">
          <h3 className="text-white font-bold text-[17px] mb-8">Audio Dynamics</h3>

          <div className="mt-2 text-[#d946ef]">
            <Slider
              label="VOICE PITCH"
              value={volume}
              min={0}
              max={1}
              step={0.05}
              displayValue={`+${Math.round(volume * 100)}%`}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
            />
          </div>

          <div className="mt-8">
            <Slider
              label="READING SPEED"
              value={rate}
              min={0.5}
              max={2}
              step={0.1}
              displayValue={`${rate.toFixed(1)}X`}
              onChange={(e) => setRate(parseFloat(e.target.value))}
            />
          </div>

          <h3 className="text-gray-400 text-[10px] uppercase font-bold tracking-[0.15em] mt-12 mb-5">SYSTEM CONTROLS</h3>

          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] transition-colors border border-white/[0.08]">
              <span className="text-[13px] text-gray-300">Text To Speech Auto-Read</span>
              <button
                onClick={() => setEnabled(!enabled)}
                className={`w-12 h-6 rounded-full relative transition-colors ${enabled ? 'bg-gradient-to-r from-[#d946ef] to-[#8b5cf6]' : 'bg-[#3f404d]'
                  }`}
              >
                <div className={`absolute top-[3px] left-[3px] w-[18px] h-[18px] rounded-full bg-white transition-transform duration-300 shadow-sm ${enabled ? 'translate-x-[24px]' : 'translate-x-0'
                  }`}></div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="bg-white/[0.04] border border-white/[0.1] rounded-2xl p-8 relative">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 bg-[#252630] rounded-lg">
            <MdTextFields className="text-gray-300" size={18} />
          </div>
          <h3 className="text-white font-bold text-[17px]">Announcement Template</h3>
        </div>

        <div className="relative mb-6">
          <div className="absolute top-2 right-6 text-9xl text-white/[0.02] font-serif leading-none rotate-180 hidden md:block pointer-events-none select-none">"</div>
          <div className="absolute bottom-2 left-6 text-9xl text-white/[0.02] font-serif leading-none hidden md:block pointer-events-none select-none">"</div>
          <textarea
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
            className="w-full bg-white/[0.06] border border-white/[0.1] rounded-2xl p-6 text-gray-300 placeholder-white/30 focus:outline-none focus:border-[#d946ef]/50 transition-colors resize-none leading-relaxed relative z-10 font-medium text-[15px]"
            rows={3}
            placeholder="Hey everyone! {name} just subscribed with {amount} {gift}! Let's get some hype in the chat for the legend!"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-8 px-2">
          {[
            { tag: "{name}", label: "Tên người tặng" },
            { tag: "{amount}", label: "Số lượng" },
            { tag: "{gift}", label: "Tên quà" },
          ].map((item) => (
            <span
              key={item.tag}
              onClick={() => setTemplate(template + " " + item.tag)}
              className="text-[10px] px-4 py-2 rounded-full bg-white/[0.06] border border-white/[0.1] text-gray-400 font-mono tracking-widest cursor-pointer hover:bg-white/[0.12] hover:text-[#d946ef] transition-colors"
              title={`Thêm ${item.label}`}
            >
              [{item.tag.replace('{', '').replace('}', '').toUpperCase()}]
            </span>
          ))}
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-5 pt-7 border-t border-[#2e2f38]">
          <div className="flex-1 w-full flex items-center bg-white/[0.06] border border-white/[0.1] rounded-xl px-5 focus-within:border-[#d946ef]/60 transition-colors">
            <MdPlayArrow className="text-gray-500 shrink-0" size={20} />
            <input
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              className="w-full bg-transparent py-3.5 pl-3 text-sm text-gray-300 placeholder-[#52546e] focus:outline-none"
              placeholder="Enter custom text here to preview the voice..."
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto shrink-0 justify-end">
            <button
              onClick={handleTest}
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.12] text-gray-300 text-sm font-semibold transition-colors flex-1 md:flex-none"
            >
              Preview Voice
            </button>
            {/* <button
                 onClick={stopSpeaking}
                 className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 text-sm font-semibold transition-colors"
                 title="Stop Speaking"
               >
                 <MdStop size={20} />
               </button> */}
            <button
              onClick={handleSave}
              className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#d946ef] to-[#8b5cf6] text-white text-sm font-bold shadow-[0_0_20px_rgba(217,70,239,0.2)] hover:shadow-[0_0_30px_rgba(217,70,239,0.4)] transition-all flex-1 md:flex-none"
            >
              {saved ? 'Saved Successfully!' : 'Save Configuration'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalTTS;