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
      className={`fixed z-50 flex flex-col bg-black/40 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden shadow-2xl ${className} ${isDragging || isResizing ? "select-none" : ""}`}
      style={{
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        transition: isDragging || isResizing ? "none" : "all 0.15s ease-out",
        cursor: isDragging ? "grabbing" : "auto",
      }}
    >
      {/* Header / Drag Handle */}
      {title && (
        <div
          onMouseDown={handleMouseDown}
          className={`shrink-0 h-10 px-4 flex items-center justify-center cursor-grab active:cursor-grabbing bg-white/5 border-b border-white/10 hover:bg-white/10 transition-colors`}
        >
          <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.25em] leading-none select-none">
            {title}
          </span>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-hidden relative" onMouseDown={handleMouseDown}>{children}</div>

      {/* Resize Handle (Bottom Right) */}
      <div
        onMouseDown={handleResizeMouseDown}
        className="absolute bottom-0 right-0 w-8 h-8 cursor-nwse-resize flex items-end justify-end p-1.5 group z-[60]"
        title="Resize"
      >
        <div className="w-3 h-3 border-r-2 border-b-2 border-white/20 group-hover:border-white/60 transition-colors rounded-sm" />
      </div>
    </div>
  );
};

export default ResizableDraggable;
