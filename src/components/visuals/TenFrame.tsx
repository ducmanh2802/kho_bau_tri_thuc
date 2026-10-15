import React from 'react';

export interface TenFrameProps {
  /** Số chục (0–5). */
  chuc: number;
  /** Số đơn vị (0–4). */
  donVi: number;
}

export const TenFrame: React.FC<TenFrameProps> = ({ chuc, donVi }) => {
  const total = chuc * 10 + donVi;
  const filled = Math.min(total, 5);
  const empty = Math.max(0, 5 - total);

  return (
    <svg
      width="200"
      height="180"
      viewBox="0 0 200 180"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="20" y="20" width="160" height="140" rx="8" ry="8" fill="#fff3e0" stroke="#e65100" stroke-width="3"/>
      {/* Chục cột trái (màu cam) */}
      {chuc > 0 && (
        <g fill="#e65100">
          {Array.from({ length: chuc }, (_, i) => (
            <circle
              key={i}
              cx={30 + i * 30}
              cy={70}
              r={18}
            />
          ))}
        </g>
      )}
      {/* Đơn vị cột phải */}
      {donVi > 0 && (
        <g fill="#ffe082">
          {Array.from({ length: donVi }, (_, i) => (
            <circle
              key={i}
              cx={90 + i * 30}
              cy={70}
              r={18}
            />
          ))}
        </g>
      )}
      {/* Hết tròn trắng cho chỗ trống */}
      {filled < 5 && (
        <g fill="#fff3e0">
          {Array.from({ length: 5 - filled }, (_, i) => (
            <circle
              key={i}
              cx={30 + i * 30}
              cy={70}
              r={18}
            />
          ))}
        </g>
      )}
      {empty > 0 && (
        <g fill="#ffe082">
          {Array.from({ length: empty }, (_, i) => (
            <circle
              key={i}
              cx={90 + (i - (5 - filled)) * 30}
              cy={70}
              r={18}
            />
          ))}
        </g>
      )}
      {/* Ghi số ở dưới */}
      <text
        x="100"
        y="95"
        text-anchor="middle"
        font-size="14"
        fill="#e65100"
      >{total}</text>
    </svg>
  );
};