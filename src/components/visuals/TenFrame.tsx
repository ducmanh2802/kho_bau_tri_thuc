import React from 'react';

export interface TenFrameProps {
  /** Số lượng chấm cần hiển thị (0–20, hỗ trợ nhiều khung 10) */
  count: number;
  /** Màu chấm tô (mặc định cam) */
  fillColor?: string;
  /** Màu viền khung */
  frameColor?: string;
  /** Màu nền khung */
  bgColor?: string;
}

export const TenFrame: React.FC<TenFrameProps> = ({
  count,
  fillColor = '#e65100',
  frameColor = '#e65100',
  bgColor = '#fff3e0',
}) => {
  const numFrames = Math.ceil(Math.max(count, 1) / 10);
  const frames = Array.from({ length: numFrames }, (_, frameIndex) => {
    const frameStart = frameIndex * 10;
    const frameCount = Math.min(count - frameStart, 10);
    return (
      <g key={frameIndex} transform={`translate(${frameIndex * 220}, 0)`}>
        {/* Khung 10 ô: 2 hàng × 5 ô */}
        <rect
          x="10"
          y="10"
          width="200"
          height="80"
          rx="6"
          ry="6"
          fill={bgColor}
          stroke={frameColor}
          strokeWidth="3"
        />
        {/* Các ô - hàng trên (5 ô) */}
        {Array.from({ length: 5 }, (_, col) => (
          <rect
            key={`top-${col}`}
            x={20 + col * 38}
            y={18}
            width="30"
            height="30"
            rx="4"
            ry="4"
            fill={col < Math.min(frameCount, 5) ? fillColor : bgColor}
            stroke={frameColor}
            strokeWidth="1.5"
          />
        ))}
        {/* Các ô - hàng dưới (5 ô) */}
        {Array.from({ length: 5 }, (_, col) => (
          <rect
            key={`bottom-${col}`}
            x={20 + col * 38}
            y={54}
            width="30"
            height="30"
            rx="4"
            ry="4"
            fill={col < Math.max(0, frameCount - 5) ? fillColor : bgColor}
            stroke={frameColor}
            strokeWidth="1.5"
          />
        ))}
        {/* Số thứ tự khung */}
        <text
          x="110"
          y="105"
          textAnchor="middle"
          fontSize="12"
          fill="#667085"
        >
          {numFrames > 1 ? `Khung ${frameIndex + 1}` : `Tổng: ${count}`}
        </text>
      </g>
    );
  });

  const totalWidth = numFrames * 220;

  return (
    <svg
      width={totalWidth}
      height="120"
      viewBox={`0 0 ${totalWidth} 120`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {frames}
    </svg>
  );
};