import React, { useState, useEffect, useRef } from "react";

const ResizableDraggable = ({
  children,
  initialPos = { x: 50, y: 50 },
  initialSize = { width: 320, height: 480 },
  minSize = { width: 150, height: 150 }, // Reduced min size for better flexibility
  className = "",
  title = "",
}) => {
  const [pos, setPos] = useState(initialPos);
  const [size, setSize] = useState(initialSize);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  // Use refs to track the current values during mouse movement to avoid closure staleness
  const posRef = useRef(pos);
  const sizeRef = useRef(size);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    posRef.current = pos;
  }, [pos]);

  useEffect(() => {
    sizeRef.current = size;
  }, [size]);

  // Handle Dragging
  const handleMouseDown = (e) => {
    if (e.button !== 0) return; // Only left click
    setIsDragging(true);
    dragOffsetRef.current = {
      x: e.clientX - pos.x,
      y: e.clientY - pos.y,
    };
  };

  // Handle Resizing
  const handleResizeMouseDown = (e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        setPos({
          x: e.clientX - dragOffsetRef.current.x,
          y: e.clientY - dragOffsetRef.current.y,
        });
      }

      if (isResizing) {
        const newWidth = Math.max(minSize.width, e.clientX - posRef.current.x);
        const newHeight = Math.max(
          minSize.height,
          e.clientY - posRef.current.y,
        );
        setSize({ width: newWidth, height: newHeight });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      // Prevent text selection while interacting
      document.body.style.userSelect = "none";
    } else {
      document.body.style.userSelect = "";
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      document.body.style.userSelect = "";
    };
  }, [isDragging, isResizing, minSize]);

  return (
    <div
      className={`fixed z-50 flex flex-col bg-white/[0.06] backdrop-blur-[50px] border border-white/[0.12] rounded-[1.75rem] overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.12)] transition-colors ${className} ${isDragging || isResizing ? "select-none ring-1 ring-[#d946ef]/30" : ""}`}
      style={{
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        transition: isDragging || isResizing ? "none" : "all 0.15s ease-out",
        cursor: isDragging ? "grabbing" : "auto",
      }}
    >
      {/* Decorative Top Glow Line */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent z-10" />

      {/* Header / Drag Handle */}
      {title && (
        <div
          onMouseDown={handleMouseDown}
          className={`shrink-0 h-12 px-5 flex items-center justify-between cursor-grab active:cursor-grabbing bg-gradient-to-r from-white/[0.06] to-transparent border-b border-white/[0.08] hover:bg-white/[0.09] transition-colors relative`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-[#d946ef] to-[#06b6d4] shadow-[0_0_8px_rgba(217,70,239,0.7)]" />
            <span className="text-[10px] font-extrabold text-white/80 uppercase tracking-[0.25em] leading-none select-none">
              {title}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-white/10" />
            <div className="w-2 h-2 rounded-full bg-white/10" />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-hidden relative bg-transparent" onMouseDown={handleMouseDown}>
         {children}
      </div>

      {/* Resize Handle (Bottom Right) */}
      <div
        onMouseDown={handleResizeMouseDown}
        className="absolute bottom-1 right-1 w-8 h-8 cursor-nwse-resize flex items-end justify-end p-2.5 z-[60]"
      >
        <div className="w-3 h-3 border-r-2 border-b-2 border-white/25 hover:border-[#d946ef]/70 transition-colors rounded-sm" />
      </div>
    </div>
  );
};

export default ResizableDraggable;
