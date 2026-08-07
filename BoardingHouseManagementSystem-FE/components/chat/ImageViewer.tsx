"use client";

import { X, ZoomIn, ZoomOut, Maximize, Download } from "lucide-react";
import { useState } from "react";

interface Props {
  imageUrl: string;
  onClose: () => void;
}

export default function ImageViewer({ imageUrl, onClose }: Props) {
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.25, 4));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.25, 0.5));
  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm">
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between text-white z-10 bg-gradient-to-b from-black/50 to-transparent">
        <div className="text-sm font-medium">Trình xem ảnh</div>
        <div className="flex items-center gap-4">
          <button onClick={handleZoomOut} className="hover:text-gray-300 transition-colors" title="Thu nhỏ">
            <ZoomOut size={24} />
          </button>
          <button onClick={handleReset} className="hover:text-gray-300 transition-colors" title="Vừa màn hình">
            <Maximize size={24} />
          </button>
          <button onClick={handleZoomIn} className="hover:text-gray-300 transition-colors" title="Phóng to">
            <ZoomIn size={24} />
          </button>
          <a href={imageUrl} download target="_blank" rel="noreferrer" className="hover:text-gray-300 transition-colors" title="Tải xuống">
            <Download size={24} />
          </a>
          <div className="w-px h-6 bg-gray-500/50 mx-2"></div>
          <button onClick={onClose} className="hover:text-red-400 transition-colors" title="Đóng">
            <X size={28} />
          </button>
        </div>
      </div>

      {/* Image Area */}
      <div 
        className="w-full h-full overflow-hidden flex items-center justify-center"
        onWheel={handleWheel}
      >
        <img
          src={imageUrl}
          alt="Hình ảnh trong đoạn chat"
          className="max-w-full max-h-full object-contain cursor-grab active:cursor-grabbing transition-transform duration-100 ease-out"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          draggable={false} // Ngăn chặn hành vi drag mặc định của HTML ảnh
        />
      </div>
    </div>
  );
}
