import React, { useState, useEffect, useRef } from "react";
import { useMCStore } from "../hooks/useMCStore";
import {
  MdRecordVoiceOver,
  MdAdd,
  MdDelete,
  MdPlayArrow,
  MdPause,
  MdCloudUpload,
  MdTune,
  MdClose,
  MdCheck,
  MdVolumeUp,
  MdTimer,
} from "react-icons/md";
import { SOCKET_URL } from "../utils/constant";

const MCPage = () => {
  const { config, audios, loading, fetchMCData, updateConfig, uploadAudio, deleteAudio, updateAudio } = useMCStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewAudio, setPreviewAudio] = useState(null); // { id, audioObj }
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchMCData();
  }, [fetchMCData]);

  const handleToggleMC = () => {
    updateConfig({ enabled: !config?.enabled });
  };

  const handleIdleTimeoutChange = (e) => {
    const val = parseInt(e.target.value) || 0;
    updateConfig({ idleTimeout: val });
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    updateConfig({ volume: val });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const success = await uploadAudio(file, file.name);
    setUploading(false);
    if (success) {
      setIsModalOpen(false);
    }
  };

  const togglePreview = (audio) => {
    if (previewAudio && previewAudio.id === audio.id) {
      previewAudio.audioObj.pause();
      setPreviewAudio(null);
    } else {
      if (previewAudio) previewAudio.audioObj.pause();
      const audioObj = new Audio(`${SOCKET_URL}${audio.path}`);
      audioObj.volume = config?.volume || 0.5;
      audioObj.play();
      audioObj.onended = () => setPreviewAudio(null);
      setPreviewAudio({ id: audio.id, audioObj });
    }
  };

  return (
    <div className="w-full text-white p-4 sm:p-6 md:p-10 font-sans flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 md:gap-6 mb-8 shrink-0">
        <div>
          <h4 className="text-[10px] font-semibold text-[#d946ef] mb-2 uppercase tracking-widest">Assistant</h4>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-3 tracking-tight flex items-center gap-3">
            <MdRecordVoiceOver className="text-[#d946ef]" /> MC Assistant
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 max-w-2xl leading-relaxed">
            Hệ thống tự động phát âm thanh khi phòng live im lặng để giữ chân người xem và kêu gọi tặng quà.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#d946ef] to-[#8b5cf6] text-white text-xs font-semibold shadow-xl hover:scale-[1.02] transition-all"
        >
          <MdAdd size={18} /> Thêm câu thoại
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        {/* Settings Card */}
        <div className="lg:col-span-1 bg-white/[0.03] border border-white/10 backdrop-blur-2xl rounded-3xl p-6 flex flex-col gap-6">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <MdTune className="text-[#d946ef] size-5" />
            <h2 className="font-bold text-sm">Cấu hình MC</h2>
          </div>

          {/* Master Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold">Kích hoạt MC</p>
              <p className="text-[10px] text-gray-500">Tự động phát khi idle</p>
            </div>
            <button
              onClick={handleToggleMC}
              className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
                config?.enabled ? "bg-[#10b981]" : "bg-white/10"
              }`}
            >
              <div
                className={`absolute top-[2px] left-[2.5px] w-[18px] h-[18px] bg-white rounded-full transition-transform duration-300 ${
                  config?.enabled ? "translate-x-[25px]" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Idle Timeout */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold flex items-center gap-1.5">
                <MdTimer size={14} className="text-gray-400" /> Thời gian chờ (giây)
              </p>
              <span className="text-[10px] font-mono text-[#d946ef] bg-[#d946ef]/10 px-2 py-0.5 rounded">
                {config?.idleTimeout || 60}s
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="300"
              step="10"
              value={config?.idleTimeout || 60}
              onChange={handleIdleTimeoutChange}
              className="w-full accent-[#d946ef] bg-white/5 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Volume */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold flex items-center gap-1.5">
                <MdVolumeUp size={14} className="text-gray-400" /> Âm lượng MC
              </p>
              <span className="text-[10px] font-mono text-[#06b6d4] bg-[#06b6d4]/10 px-2 py-0.5 rounded">
                {Math.round((config?.volume || 0.5) * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={config?.volume || 0.5}
              onChange={handleVolumeChange}
              className="w-full accent-[#06b6d4] bg-white/5 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Interrupt Option */}
          <div className="flex items-center justify-between bg-white/[0.02] border border-white/5 p-3 rounded-xl mt-2">
            <div>
              <p className="text-[11px] font-semibold">Ưu tiên quà tặng</p>
              <p className="text-[9px] text-gray-500">Ngắt MC ngay khi có quà</p>
            </div>
            <button
              onClick={() => updateConfig({ interruptOnGift: !config?.interruptOnGift })}
              className={`relative w-10 h-5 rounded-full transition-colors duration-300 ${
                config?.interruptOnGift ? "bg-[#8b5cf6]" : "bg-white/10"
              }`}
            >
              <div
                className={`absolute top-[2px] left-[2.5px] w-[14px] h-[14px] bg-white rounded-full transition-transform duration-300 ${
                  config?.interruptOnGift ? "translate-x-[20px]" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Audio List Table */}
        <div className="lg:col-span-2 bg-white/[0.03] border border-white/10 backdrop-blur-2xl rounded-3xl overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-white/5 bg-white/[0.01] flex items-center justify-between">
            <h2 className="font-bold text-sm">Danh sách câu thoại</h2>
            <span className="text-[10px] text-gray-500 font-medium">Tổng cộng: {audios.length}</span>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[500px] custom-scrollbar">
            {audios.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                <MdRecordVoiceOver size={48} className="opacity-10 mb-4" />
                <p className="text-xs">Chưa có file âm thanh nào.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[10px] text-gray-500 uppercase tracking-wider border-b border-white/5">
                    <th className="px-6 py-4 font-semibold">Trạng thái</th>
                    <th className="px-6 py-4 font-semibold">Tên câu thoại</th>
                    <th className="px-6 py-4 font-semibold text-center">Preview</th>
                    <th className="px-6 py-4 font-semibold text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {audios.map((audio) => (
                    <tr key={audio.id} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <button
                          onClick={() => updateAudio(audio.id, { active: !audio.active })}
                          className={`w-3 h-3 rounded-full border-2 transition-colors ${
                            audio.active ? "bg-[#10b981] border-[#10b981]/30" : "bg-transparent border-white/10"
                          }`}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <p className={`text-xs font-bold ${audio.active ? "text-white" : "text-gray-500"}`}>
                          {audio.name}
                        </p>
                        <p className="text-[9px] text-gray-500 font-mono mt-0.5">{audio.filename}</p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => togglePreview(audio)}
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                            previewAudio?.id === audio.id
                              ? "bg-[#d946ef] text-white shadow-[0_0_15px_rgba(217,70,239,0.4)]"
                              : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                          }`}
                        >
                          {previewAudio?.id === audio.id ? <MdPause size={18} /> : <MdPlayArrow size={18} />}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => deleteAudio(audio.id)}
                          className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500/60 hover:text-red-500 hover:bg-red-500/20 transition-all flex items-center justify-center ml-auto"
                        >
                          <MdDelete size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#1a1b26] border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden">
            <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between">
              <h2 className="font-bold text-lg flex items-center gap-2">
                <MdCloudUpload className="text-[#d946ef]" /> Upload âm thanh
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white">
                <MdClose size={24} />
              </button>
            </div>
            <div className="p-8">
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all ${
                  uploading ? "border-[#06b6d4]/50 bg-[#06b6d4]/5" : "border-white/10 hover:border-[#d946ef]/50 hover:bg-white/[0.02]"
                }`}
              >
                {uploading ? (
                  <div className="w-10 h-10 border-4 border-[#06b6d4] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-gray-500">
                      <MdRecordVoiceOver size={32} />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-white">Nhấp để chọn file</p>
                      <p className="text-[10px] text-gray-500 mt-1">MP3, WAV, OGG (Max 50MB)</p>
                    </div>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
              </div>
            </div>
            <div className="px-8 py-4 bg-white/[0.02] border-t border-white/5 flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2 rounded-xl text-xs font-bold text-gray-400 hover:text-white transition"
              >
                Hủy bỏ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MCPage;
