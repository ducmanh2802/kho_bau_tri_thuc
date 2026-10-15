import React from 'react';

export interface RulerProps {
  /** Độ dài trong cm (mặc định 100) */
  length: number;
  /** Số lượng đánh nhãn (mặc định 10) */
  ticks?: number;
}

export const Ruler: React.FC<RulerProps> = ({ length = 100, ticks = 10 }) => {
  const tickLength = length / ticks;
  const screenWidth = 300;

  return (
    <svg
      width={screenWidth}
      height="80"
      viewBox="0 0 {screenWidth} 80"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Đường thước chính */}
      <line x1="0" y1="40" x2={screenWidth} y2="40" stroke="#e5e7eb" stroke-width="3"/>
      {/* Các đánh cạch */}
      {Array.from({ length: ticks }, (_, i) => {
        const x = (i * screenWidth) / ticks;
        const isMajor = i % 5 === 0;
        return isMajor ? (
          <g key={i}>
            <line x1={x} y1="35" x2={x} y2="45" stroke="#e65100" stroke-width="2"/>
            <text
              x={x}
              y="25"
              text-anchor="middle"
              font-size="11"
              fill="#e65100"
            >{i}</text>
          </g>
        ) : (
          <line
            key={i}
            x1={x}
            y1="38"
            x2={x}
            y2="42"
            stroke="#e5e7eb"
            stroke-width="1"
          />
        );
      })}
      {/* Ghi đơn vị */}
      <text
        x={screenWidth / 2}
        y="65"
        text-anchor="middle"
        font-size="11"
        fill="#667085"
      >'cm'</text>
    </svg>
  );
};