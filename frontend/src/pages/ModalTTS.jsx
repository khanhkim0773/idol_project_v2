import React, { useState, useEffect } from "react";
import { useTTSStore } from "../hooks/useTTSStore";
import {
  MdPlayArrow,
  MdTextFields,
  MdApi,
  MdTune,
  MdCheckCircle,
  MdRefresh,
  MdRecordVoiceOver,
} from "react-icons/md";

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
    customApiUrl,
    customVoice,
    customNumStep,
    customFirstChunkWords,
    customMinChunkWords,
    customBatchSize,
    customNoWarmup,
    enabled,
    volume,
    giftTemplate,
    welcomeTemplate,
    welcomeEnabled,
    voicesList,
    voicesLoading,
    setCustomApiUrl,
    setCustomVoice,
    setCustomNumStep,
    setCustomFirstChunkWords,
    setCustomMinChunkWords,
    setCustomBatchSize,
    setCustomNoWarmup,
    setEnabled,
    setVolume,
    setGiftTemplate,
    setWelcomeTemplate,
    setWelcomeEnabled,
    loadVoices,
    testSpeak,
  } = store;

  const [saved, setSaved] = useState(false);
  const [testText, setTestText] = useState("");

  // Load voices on mount
  useEffect(() => {
    loadVoices();
  }, []);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleTest = () => {
    const preview = giftTemplate
      .replace("{name}", "Ngọc Trinh")
      .replace("{amount}", "5")
      .replace("{gift}", "Rose");
    testSpeak(testText || preview);
  };

  const handleRefreshVoices = () => {
    loadVoices();
  };

  const getVoiceId = (v) => (typeof v === "string" ? v : v.id || v.name);
  const getVoiceLabel = (v) => (typeof v === "string" ? v : v.name || v.id);

  return (
    <div className="w-full h-full text-white overflow-y-auto p-6 md:p-10 font-sans">
      {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h4 className="text-[10px] font-bold tracking-[0.2em] text-[#d946ef] uppercase mb-3">Configuration Studio</h4>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">Voice Dynamics</h1>
          <p className="text-sm text-gray-400 max-w-2xl leading-relaxed">
            Cấu hình TTS Custom API cho luồng phát sóng của bạn. Tự động đọc khi có quà tặng và chào đón người mới vào live.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0 pb-1">
          <div className="px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider bg-[#252630] border border-[#2e2f38] text-gray-300">
            Custom API
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
        {/* Left Column */}
        <div className="md:col-span-1 lg:col-span-2 space-y-8">

          {/* API Config */}
          <div className="bg-white/[0.04] border border-white/[0.1] rounded-2xl p-7">
            <h3 className="text-white font-bold mb-6 flex items-center gap-2">
              <MdApi className="text-[#d946ef]" size={20} /> Cấu hình API
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

          {/* Voice Selection */}
          <div className="bg-white/[0.04] border border-white/[0.1] rounded-2xl p-7">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-bold flex items-center gap-2">
                <MdRecordVoiceOver className="text-[#d946ef]" size={20} /> Chọn Giọng đọc
              </h3>
              <button
                onClick={handleRefreshVoices}
                disabled={voicesLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-gray-400 hover:text-white text-[10px] font-bold uppercase tracking-wider transition-all disabled:opacity-50"
              >
                <MdRefresh size={14} className={voicesLoading ? "animate-spin" : ""} />
                {voicesLoading ? "Loading..." : "Refresh"}
              </button>
            </div>

            {voicesList.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                {voicesLoading ? "Đang tải danh sách voice..." : "Không có voice sẵn. Nhấn Refresh để tải lại."}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {voicesList.map((v) => {
                  const id = getVoiceId(v);
                  const label = getVoiceLabel(v);
                  const isActive = customVoice === id;
                  return (
                    <button
                      key={id}
                      onClick={() => setCustomVoice(id)}
                      className={`p-4 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${isActive
                        ? "bg-gradient-to-br from-[#d946ef]/15 to-[#8b5cf6]/15 border-[#d946ef]/50 text-white shadow-[0_0_15px_rgba(217,70,239,0.1)]"
                        : "bg-[#252630] border-[#2e2f38] text-gray-400 hover:border-gray-500"
                        }`}
                    >
                      <span className="font-bold text-sm tracking-wide">{label}</span>
                      {isActive && <MdCheckCircle className="text-[#d946ef]" size={16} />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="md:col-span-1 border border-white/[0.1] bg-white/[0.04] rounded-2xl p-7 h-fit relative sm:sticky top-0 shadow-lg">
          <h3 className="text-white font-bold text-[17px] mb-8">Audio Dynamics</h3>

          <div className="mt-2 text-[#d946ef]">
            <Slider
              label="VOLUME"
              value={volume}
              min={0}
              max={1}
              step={0.05}
              displayValue={`${Math.round(volume * 100)}%`}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
            />
          </div>

          <h3 className="text-gray-400 text-[10px] uppercase font-bold tracking-[0.15em] mt-12 mb-5">SYSTEM CONTROLS</h3>

          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] transition-colors border border-white/[0.08]">
              <span className="text-[13px] text-gray-300">TTS Auto-Read</span>
              <button
                onClick={() => setEnabled(!enabled)}
                className={`w-12 h-6 rounded-full relative transition-colors ${enabled ? "bg-gradient-to-r from-[#d946ef] to-[#8b5cf6]" : "bg-[#3f404d]"}`}
              >
                <div className={`absolute top-[3px] left-[3px] w-[18px] h-[18px] rounded-full bg-white transition-transform duration-300 shadow-sm ${enabled ? "translate-x-[24px]" : "translate-x-0"}`}></div>
              </button>
            </div>

            <div className="flex justify-between items-center p-4 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] transition-colors border border-white/[0.08]">
              <span className="text-[13px] text-gray-300">Chào người mới vào live</span>
              <button
                onClick={() => setWelcomeEnabled(!welcomeEnabled)}
                className={`w-12 h-6 rounded-full relative transition-colors ${welcomeEnabled ? "bg-gradient-to-r from-[#10b981] to-[#059669]" : "bg-[#3f404d]"}`}
              >
                <div className={`absolute top-[3px] left-[3px] w-[18px] h-[18px] rounded-full bg-white transition-transform duration-300 shadow-sm ${welcomeEnabled ? "translate-x-[24px]" : "translate-x-0"}`}></div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Gift Template */}
      <div className="bg-white/[0.04] border border-white/[0.1] rounded-2xl p-8 mb-8 relative">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 bg-[#252630] rounded-lg">
            <MdTextFields className="text-gray-300" size={18} />
          </div>
          <h3 className="text-white font-bold text-[17px]">Template Quà tặng</h3>
        </div>

        <textarea
          value={giftTemplate}
          onChange={(e) => setGiftTemplate(e.target.value)}
          className="w-full bg-white/[0.06] border border-white/[0.1] rounded-2xl p-6 text-gray-300 placeholder-white/30 focus:outline-none focus:border-[#d946ef]/50 transition-colors resize-none leading-relaxed relative z-10 font-medium text-[15px] mb-4"
          rows={2}
          placeholder="Cảm ơn {name} đã tặng {amount} {gift}"
        />

        <div className="flex flex-wrap items-center gap-3 px-2">
          {[
            { tag: "{name}", label: "Tên người tặng" },
            { tag: "{amount}", label: "Số lượng" },
            { tag: "{gift}", label: "Tên quà" },
          ].map((item) => (
            <span
              key={item.tag}
              onClick={() => setGiftTemplate(giftTemplate + " " + item.tag)}
              className="text-[10px] px-4 py-2 rounded-full bg-white/[0.06] border border-white/[0.1] text-gray-400 font-mono tracking-widest cursor-pointer hover:bg-white/[0.12] hover:text-[#d946ef] transition-colors"
              title={`Thêm ${item.label}`}
            >
              [{item.tag.replace("{", "").replace("}", "").toUpperCase()}]
            </span>
          ))}
        </div>
      </div>

      {/* Welcome Template */}
      <div className="bg-white/[0.04] border border-white/[0.1] rounded-2xl p-8 mb-8 relative">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 bg-[#252630] rounded-lg">
            <MdRecordVoiceOver className="text-[#10b981]" size={18} />
          </div>
          <h3 className="text-white font-bold text-[17px]">Template Chào mừng</h3>
          <span className="text-[10px] text-gray-500">Đọc khi có người mới vào live</span>
        </div>

        <textarea
          value={welcomeTemplate}
          onChange={(e) => setWelcomeTemplate(e.target.value)}
          className="w-full bg-white/[0.06] border border-white/[0.1] rounded-2xl p-6 text-gray-300 placeholder-white/30 focus:outline-none focus:border-[#10b981]/50 transition-colors resize-none leading-relaxed relative z-10 font-medium text-[15px] mb-4"
          rows={2}
          placeholder="Xin chào {name}, cho mình xin 1 follow và 1 tim nhé, cảm ơn cậu"
        />

        <div className="flex flex-wrap items-center gap-3 px-2">
          <span
            onClick={() => setWelcomeTemplate(welcomeTemplate + " {name}")}
            className="text-[10px] px-4 py-2 rounded-full bg-white/[0.06] border border-white/[0.1] text-gray-400 font-mono tracking-widest cursor-pointer hover:bg-white/[0.12] hover:text-[#10b981] transition-colors"
            title="Thêm tên người mới"
          >
            [NAME]
          </span>
        </div>
      </div>

      {/* Test & Save */}
      <div className="bg-white/[0.04] border border-white/[0.1] rounded-2xl p-8 relative">
        <div className="flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="flex-1 w-full flex items-center bg-white/[0.06] border border-white/[0.1] rounded-xl px-5 focus-within:border-[#d946ef]/60 transition-colors">
            <MdPlayArrow className="text-gray-500 shrink-0" size={20} />
            <input
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              className="w-full bg-transparent py-3.5 pl-3 text-sm text-gray-300 placeholder-[#52546e] focus:outline-none"
              placeholder="Nhập text thử nghiệm giọng đọc..."
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto shrink-0 justify-end">
            <button
              onClick={handleTest}
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.12] text-gray-300 text-sm font-semibold transition-colors flex-1 md:flex-none"
            >
              Preview Voice
            </button>
            <button
              onClick={handleSave}
              className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#d946ef] to-[#8b5cf6] text-white text-sm font-bold shadow-[0_0_20px_rgba(217,70,239,0.2)] hover:shadow-[0_0_30px_rgba(217,70,239,0.4)] transition-all flex-1 md:flex-none"
            >
              {saved ? "Saved Successfully!" : "Save Configuration"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalTTS;
