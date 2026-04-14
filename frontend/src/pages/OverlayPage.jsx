import React, { useState, useEffect } from "react";
import { useOverlayStore } from "../hooks/useOverlayStore";
import {
  MdAdd,
  MdEdit,
  MdDelete,
  MdClose,
  MdCheck,
  MdSearch,
  MdAutoAwesome,
  MdPlayCircleOutline
} from "react-icons/md";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

// --- PRESETS ---
const PRESETS = [
  {
    id: "rose",
    name: "Hoa hong roi",
    color: "#e11d48",
    image: "/images/rose.png",
    config: {
      particles: {
        number: { value: 30 },
        shape: { type: "image", options: { image: { src: "/images/rose.png", width: 100, height: 100 } } },
        opacity: { value: 0.9 },
        size: { value: 25, random: true },
        move: { enable: true, speed: 4, direction: "bottom", random: false, straight: false, outModes: { default: "out" } },
        rotate: { value: 0, random: true, direction: "clockwise", animation: { enable: true, speed: 5 } }
      }
    }
  },
  {
    id: "confetti",
    name: "Confetti",
    color: "#f59e0b",
    config: {
      particles: {
        number: { value: 100 },
        color: { value: ["#1abc9c", "#3498db", "#9b59b6", "#f1c40f", "#e74c3c"] },
        shape: { type: ["circle", "square"] },
        opacity: { value: 1 },
        size: { value: 5, random: true },
        move: { enable: true, speed: 6, direction: "top", outModes: { default: "out" } }
      },
      emitters: {
        direction: "top",
        life: { count: 0, duration: 0.1, delay: 0.1 },
        rate: { delay: 0.1, quantity: 15 },
        size: { width: 100, height: 0 },
        position: { x: 50, y: 100 }
      }
    }
  },
  {
    id: "snow",
    name: "Tuyet roi",
    color: "#93c5fd",
    config: {
      particles: {
        number: { value: 150 },
        color: { value: "#ffffff" },
        shape: { type: "circle" },
        opacity: { value: { min: 0.3, max: 0.8 } },
        size: { value: { min: 1, max: 4 } },
        move: { enable: true, speed: 2, direction: "bottom", straight: false, outModes: "out" }
      }
    }
  },
  {
    id: "fireworks",
    name: "Phao hoa",
    color: "#a855f7",
    config: {
      particles: {
        number: { value: 0 },
        color: { value: ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff", "#00ffff"] },
        shape: { type: "circle" },
        opacity: { value: { min: 0.1, max: 1 }, animation: { enable: true, speed: 1, sync: false, destroy: "min" } },
        size: { value: 3 },
        move: { enable: true, speed: 10, direction: "none", outModes: "destroy" }
      },
      emitters: {
        direction: "top",
        rate: { quantity: 50, delay: 0.5 },
        size: { width: 100, height: 100 },
        position: { x: 50, y: 50 },
        life: { duration: 0.1, count: 0, delay: 0.4 }
      }
    }
  }
];

/* --- OverlayModal --- */
const OverlayModal = ({ initial, onSave, onClose }) => {
  const [name, setName] = useState(initial?.name || "");
  const [duration, setDuration] = useState(initial?.duration ?? 5);
  const [selectedPreset, setSelectedPreset] = useState("rose");
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!name) {
      setError("Vui long nhap ten hieu ung");
      return;
    }
    const preset = PRESETS.find(p => p.id === selectedPreset);

    const overlayData = {
      name,
      type: "particles",
      duration: Number(duration) || 5,
      preview_color: preset?.color || "#d946ef",
      config: preset?.config || {},
      image: preset?.image || null
    };

    const res = await onSave(overlayData);
    if (!res.success) {
      setError(res.error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white/[0.03] border border-white/10 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.05] bg-white/[0.02]">
          <h2 className="text-white font-bold text-lg flex items-center gap-2">
            <MdAutoAwesome className="text-[#06b6d4] w-6 h-6" />
            {initial ? "Sua Overlay" : "Them Overlay Moi"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-2">
            <MdClose size={22} />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
          {error && <div className="text-red-400 bg-red-400/10 px-4 py-3 rounded-xl">{error}</div>}

          <div>
            <label className="text-[10px] font-bold text-white/30 mb-2 block">Ten hieu ung</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#d946ef]/60"
              placeholder="Vi du: Mua hoa vang..."
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-white/30 mb-2 block">Thoi gian hien thi (giay)</label>
            <input
              type="number"
              min={1} max={30}
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#d946ef]/60"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-white/30 mb-2 block">Mau (Preset)</label>
            <div className="flex flex-col gap-2">
              {PRESETS.map((p) => (
                <div
                  key={p.id}
                  onClick={() => setSelectedPreset(p.id)}
                  className={`px-4 py-3 rounded-xl border cursor-pointer flex items-center gap-3 transition-all ${selectedPreset === p.id
                      ? "bg-white/[0.08] border-[#d946ef]/60"
                      : "bg-white/[0.02] border-white/5 hover:bg-white/[0.05]"
                    }`}
                >
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: p.color }}></div>
                  <span className="text-sm font-semibold">{p.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-white/[0.05]">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-white/10 text-gray-400 hover:text-white">
            Huy
          </button>
          <button onClick={handleSave} className="px-6 py-2.5 rounded-xl bg-[#d946ef] text-white font-bold hover:brightness-110">
            Luu
          </button>
        </div>
      </div>
    </div>
  );
};

/* --- TS Particles Preview --- */
const OverlayPreview = ({ overlay, onClose }) => {
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  useEffect(() => {
    const timer = setTimeout(onClose, overlay.duration * 1000);
    return () => clearTimeout(timer);
  }, [overlay, onClose]);

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none" style={{ backgroundColor: "rgba(0,0,0,0.8)" }}>
      {init && (
        <Particles
          id="tsparticles-preview"
          options={overlay.config}
          className="w-full h-full"
        />
      )}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 pointer-events-auto z-[101]">
        <button onClick={onClose} className="px-6 py-2 bg-red-500/80 rounded-full text-white font-bold">
          Dong Preview
        </button>
      </div>
    </div>
  );
};

const OverlayPage = () => {
  const { overlays, fetchOverlays, addOverlay, updateOverlay, deleteOverlay, toggleActive, loading } = useOverlayStore();
  const [modal, setModal] = useState(null);
  const [previewOverlay, setPreviewOverlay] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchOverlays();
  }, [fetchOverlays]);

  const filtered = overlays.filter((o) =>
    o.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full h-full text-white overflow-y-auto p-4 sm:p-10 flex flex-col">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h4 className="text-[9px] font-medium text-[#d946ef] mb-2 leading-none">Thu vien hieu ung</h4>
          <h1 className="text-3xl font-bold tracking-tight">Quan ly Overlay</h1>
          <p className="text-sm text-gray-400 mt-2">Dinh nghia cac hieu ung hinh anh (su dung Code) de gan vao qua tang.</p>
        </div>
        <button
          onClick={() => setModal({ mode: "add" })}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#d946ef] to-[#8b5cf6] font-semibold"
        >
          <MdAdd size={18} /> Them Overlay
        </button>
      </div>

      <div className="mb-6 relative w-full sm:max-w-md">
        <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tim kiem overlay..."
          className="w-full bg-white/[0.03] border border-white/5 rounded-xl pl-12 pr-4 py-3 text-sm focus:border-[#d946ef]/40 focus:outline-none"
        />
      </div>

      <div className="flex-1 pb-20">
        {loading ? (
          <div className="flex justify-center mt-20"><div className="w-10 h-10 border-4 border-[#d946ef] border-t-transparent rounded-full animate-spin"></div></div>
        ) : filtered.length === 0 ? (
          <div className="text-center mt-20 text-gray-500">Chua co Overlay nao.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((overlay) => (
              <div key={overlay.id} className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 hover:border-[#d946ef]/30 transition-all group flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-white/10 shadow-lg" style={{ backgroundColor: `${overlay.preview_color}20` }}>
                    <MdAutoAwesome style={{ color: overlay.preview_color }} size={24} />
                  </div>
                  <button
                    onClick={() => toggleActive(overlay.id)}
                    className={`w-10 h-5 rounded-full relative transition-colors ${overlay.active ? "bg-green-500" : "bg-gray-700"}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-[2px] transition-transform ${overlay.active ? "left-[22px]" : "left-[2px]"}`} />
                  </button>
                </div>

                <h3 className="text-lg font-bold truncate mb-1">{overlay.name}</h3>
                <p className="text-xs text-gray-400 mb-4">Hien thi: {overlay.duration} giay</p>

                <div className="mt-auto border-t border-white/[0.05] pt-4 flex gap-2">
                  <button onClick={() => setPreviewOverlay(overlay)} className="flex-1 flex gap-1 items-center justify-center bg-[#d946ef]/10 text-[#d946ef] py-2 rounded-lg text-xs font-bold hover:bg-[#d946ef]/20">
                    <MdPlayCircleOutline size={16} /> Preview
                  </button>
                  <button onClick={() => deleteOverlay(overlay.id)} className="w-10 flex items-center justify-center bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20">
                    <MdDelete />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modal && (
        <OverlayModal
          initial={modal.data}
          onSave={async (data) => {
            const res = modal.mode === "add" ? await addOverlay(data) : await updateOverlay(modal.data.id, data);
            if (res.success) setModal(null);
            return res;
          }}
          onClose={() => setModal(null)}
        />
      )}

      {previewOverlay && (
        <OverlayPreview overlay={previewOverlay} onClose={() => setPreviewOverlay(null)} />
      )}
    </div>
  );
};

export default OverlayPage;
