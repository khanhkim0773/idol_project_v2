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
 <div className="mb-4 sm:mb-6">
 <div className="flex justify-between text-[9px] sm:text-[10px] font-bold mb-2.5">
 <span className="text-gray-500 tracking-[0.2em]">{label}</span>
 <span className="text-white font-mono">{displayValue}</span>
 </div>
 <div className="relative h-1 bg-white/[0.05] rounded-full flex items-center cursor-pointer">
 <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#d946ef] to-[#8b5cf6] rounded-full shadow-[0_0_10px_rgba(217,70,239,0.4)]" style={{ width: `${percentage}%` }}></div>
 <input type="range" min={min} max={max} step={step} value={value} onChange={onChange}
 className="w-full h-full opacity-0 cursor-pointer relative z-10"
 />
 <div className="absolute w-2.5 h-2.5 bg-white rounded-full shadow-[0_0_12px_rgba(217,70,239,0.8)] pointer-events-none transition-all duration-200" style={{ left: `calc(${percentage}% - 5px)` }}></div>
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
 <div className="w-full text-white p-4 sm:p-6 md:p-10 font-sans">
 {/* Header */}
 <div className="mb-6 md:mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 sm:gap-6 shrink-0">
 <div>
 <h4 className="text-[8px] sm:text-[9px] font-bold tracking-[0.25em] text-[#d946ef] mb-1.5 sm:mb-2 text-center sm:text-left">Configuration Studio</h4>
 <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-white mb-1.5 sm:mb-3 text-center sm:text-left">Voice Dynamics</h1>
 <p className="text-[11px] sm:text-sm text-gray-500 max-w-2xl leading-relaxed text-center sm:text-left">
 Cấu hình TTS Custom API cho luồng phát sóng của bạn. Tự động đọc khi có quà tặng và chào đón người mới vào live.
 </p>
 </div>
 <div className="flex items-center gap-3 shrink-0 pb-1">
 <div className="px-5 py-2.5 rounded-full text-[10px] font-bold bg-white/[0.03] border border-white/10 text-white/40 shadow-xl">
 CONNECTED API
 </div>
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 mb-6 md:mb-8">
 {/* Left Column */}
 <div className="md:col-span-1 lg:col-span-2 space-y-8">

 {/* API Config */}
 <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/5 rounded-[2rem] p-4 sm:p-7 shadow-2xl">
 <h3 className="text-white font-bold mb-6 flex items-center gap-3 text-sm sm:text-base">
 <span className="p-2 sm:p-2.5 bg-white/[0.03] rounded-xl sm:rounded-2xl border border-white/5"><MdApi className="text-[#d946ef] w-[18px] h-[18px] sm:w-[20px] sm:h-[20px]" /></span>
 Cấu hình API
 </h3>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
 <div className="sm:col-span-2">
 <label className="text-[9px] sm:text-[10px] font-bold text-gray-500 mb-2 block">API URL</label>
 <input
 value={customApiUrl}
 onChange={(e) => setCustomApiUrl(e.target.value)}
 className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 sm:px-5 sm:py-3.5 text-white text-[13px] sm:text-sm focus:outline-none focus:border-[#d946ef]/60 transition-all font-mono"
 placeholder="https://your-api.ngrok-free.dev/tts"
 />
 </div>
 <div>
 <label className="text-[9px] sm:text-[10px] font-bold text-gray-500 mb-2 block">Num Step</label>
 <input
 type="number"
 value={customNumStep}
 onChange={(e) => setCustomNumStep(Number(e.target.value))}
 className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 sm:px-5 sm:py-3.5 text-white text-[13px] sm:text-sm focus:outline-none focus:border-[#d946ef]/60 transition-all"
 />
 </div>
 <div>
 <label className="text-[9px] sm:text-[10px] font-bold text-gray-500 mb-2 block">First Chunk Words</label>
 <input
 type="number"
 value={customFirstChunkWords}
 onChange={(e) => setCustomFirstChunkWords(Number(e.target.value))}
 className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 sm:px-5 sm:py-3.5 text-white text-[13px] sm:text-sm focus:outline-none focus:border-[#d946ef]/60 transition-all"
 />
 </div>
 <div>
 <label className="text-[9px] sm:text-[10px] font-bold text-gray-500 mb-2 block">Min Chunk Words</label>
 <input
 type="number"
 value={customMinChunkWords}
 onChange={(e) => setCustomMinChunkWords(Number(e.target.value))}
 className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 sm:px-5 sm:py-3.5 text-white text-[13px] sm:text-sm focus:outline-none focus:border-[#d946ef]/60 transition-all"
 />
 </div>
 <div>
 <label className="text-[9px] sm:text-[10px] font-bold text-gray-500 mb-2 block">Batch Size</label>
 <input
 type="number"
 value={customBatchSize}
 onChange={(e) => setCustomBatchSize(Number(e.target.value))}
 className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 sm:px-5 sm:py-3.5 text-white text-[13px] sm:text-sm focus:outline-none focus:border-[#d946ef]/60 transition-all"
 />
 </div>
 <div>
 <label className="text-[9px] sm:text-[10px] font-bold text-gray-500 mb-2 block">No Warmup</label>
 <button
 onClick={() => setCustomNoWarmup(!customNoWarmup)}
 className={`w-full h-[40px] sm:h-[50px] rounded-xl border text-[11px] sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${customNoWarmup
 ? "bg-[#d946ef]/15 border-[#d946ef]/40 text-[#d946ef]"
 : "bg-white/[0.04] border-white/10 text-gray-500 hover:bg-white/[0.08]"
 }`}
 >
 {customNoWarmup ? <><MdCheckCircle className="w-4 h-4 sm:w-[18px] sm:h-[18px]" /> Enabled</> : "Disabled"}
 </button>
 </div>
 </div>
 </div>

 {/* Voice Selection */}
 <div className="bg-white/[0.03] border border-white/[0.08] rounded-[2rem] p-4 sm:p-7 shadow-2xl">
 <div className="flex items-center justify-between mb-5 sm:mb-6">
 <h3 className="text-white font-bold flex items-center gap-2 text-sm sm:text-base">
 <MdRecordVoiceOver className="text-[#d946ef] w-[18px] h-[18px] sm:w-[20px] sm:h-[20px]" /> Chọn Giọng đọc
 </h3>
 <button
 onClick={handleRefreshVoices}
 disabled={voicesLoading}
 className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-gray-500 hover:text-white text-[9px] font-bold transition-all disabled:opacity-50"
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
 <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3">
 {voicesList.map((v) => {
 const id = getVoiceId(v);
 const label = getVoiceLabel(v);
 const isActive = customVoice === id;
 return (
 <button
 key={id}
 onClick={() => setCustomVoice(id)}
 className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border flex flex-col items-center gap-1.5 sm:gap-2 transition-all backdrop-blur-xl ${isActive
 ? "bg-white/[0.08] border-[#d946ef]/40 text-white shadow-[0_0_20px_rgba(217,70,239,0.1)]"
 : "bg-white/[0.02] border-white/5 text-white/30 hover:border-white/10"
 }`}
 >
 <span className="font-bold text-[11px] sm:text-[13px] tracking-wide truncate w-full">{label}</span>
 {isActive && <MdCheckCircle className="text-[#d946ef] w-[14px] h-[14px] sm:w-4 sm:h-4" />}
 </button>
 );
 })}
 </div>
 )}
 </div>
 </div>

 {/* Right Column */}
 <div className="md:col-span-1 border border-white/5 bg-white/[0.03] backdrop-blur-3xl rounded-[2rem] p-4 sm:p-7 h-fit top-0 shadow-2xl relative overflow-hidden">
 <div className="absolute top-0 right-0 w-64 h-64 bg-[#d946ef]/5 blur-[100px] -mr-32 -mt-32 pointer-events-none" />
 <h3 className="text-white font-bold text-sm sm:text-base mb-7 sm:mb-8">Audio Dynamics</h3>

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

 <h3 className="text-gray-500 text-[9px] sm:text-[10px] font-bold tracking-[0.2em] mt-8 sm:mt-12 mb-4 sm:mb-5 text-center sm:text-left">SYSTEM CONTROLS</h3>
 <div className="space-y-3 sm:space-y-4">
 <div className="flex justify-between items-center p-3 sm:p-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] transition-colors border border-white/[0.06]">
 <span className="text-[12px] sm:text-[13px] text-gray-400 font-bold ">TTS Auto-Read</span>
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
 <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/5 rounded-[2.5rem] p-4 md:p-10 mb-8 relative shadow-2xl">
 <div className="flex items-center gap-4 mb-6">
 <div className="p-3 bg-white/[0.03] rounded-2xl border border-white/5 shadow-2xl">
 <MdTextFields className="text-[#d946ef]" size={20} />
 </div>
 <h3 className="text-white font-bold text-[19px] tracking-tight">Template Quà tặng</h3>
 </div>

 <textarea
 value={giftTemplate}
 onChange={(e) => setGiftTemplate(e.target.value)}
 className="w-full bg-white/[0.03] border border-white/[0.05] rounded-[2rem] p-8 text-white/70 placeholder-white/10 focus:outline-none focus:border-[#d946ef]/30 transition-all backdrop-blur-xl resize-none leading-relaxed relative z-10 font-bold text-[16px] mb-5 shadow-inner"
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
 className="text-[10px] px-4 py-2 rounded-full bg-white/[0.06] border border-white/[0.1] text-gray-400 font-mono cursor-pointer hover:bg-white/[0.12] hover:text-[#d946ef] transition-colors"
 title={`Thêm ${item.label}`}
 >
 [{item.tag.replace("{", "").replace("}", "").toUpperCase()}]
 </span>
 ))}
 </div>
 </div>

 {/* Welcome Template */}
 <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/5 rounded-[2.5rem] p-4 md:p-10 mb-8 relative shadow-2xl">
 <div className="flex items-center gap-4 mb-6">
 <div className="p-3 bg-white/[0.03] rounded-2xl border border-white/5 shadow-2xl">
 <MdRecordVoiceOver className="text-[#10b981]" size={20} />
 </div>
 <h3 className="text-white font-bold text-[19px] tracking-tight">Template Chào mừng</h3>
 <span className="text-[11px] font-bold text-white/20 ml-2">Người mới vào live</span>
 </div>

 <textarea
 value={welcomeTemplate}
 onChange={(e) => setWelcomeTemplate(e.target.value)}
 className="w-full bg-white/[0.03] border border-white/[0.05] rounded-[2rem] p-8 text-white/70 placeholder-white/10 focus:outline-none focus:border-[#10b981]/30 transition-all backdrop-blur-xl resize-none leading-relaxed relative z-10 font-bold text-[16px] mb-5 shadow-inner"
 rows={2}
 placeholder="Xin chào {name}, cho mình xin 1 follow và 1 tim nhé, cảm ơn cậu"
 />

 <div className="flex flex-wrap items-center gap-3 px-2">
 <span
 onClick={() => setWelcomeTemplate(welcomeTemplate + " {name}")}
 className="text-[10px] px-4 py-2 rounded-full bg-white/[0.06] border border-white/[0.1] text-gray-400 font-mono cursor-pointer hover:bg-white/[0.12] hover:text-[#10b981] transition-colors"
 title="Thêm tên người mới"
 >
 [NAME]
 </span>
 </div>
 </div>

 {/* Test & Save */}
 <div className="bg-white/[0.04] border border-white/[0.1] rounded-2xl p-4 md:p-8 relative">
 <div className="flex flex-col md:flex-row items-center justify-between gap-5">
 <div className="flex-1 w-full flex items-center bg-white/[0.03] border border-white/5 rounded-2xl px-6 focus-within:border-[#d946ef]/40 transition-all backdrop-blur-xl">
 <MdPlayArrow className="text-white/20 shrink-0" size={24} />
 <input
 value={testText}
 onChange={(e) => setTestText(e.target.value)}
 className="w-full bg-transparent py-4.5 pl-4 text-sm text-white font-bold placeholder-white/10 focus:outline-none"
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
