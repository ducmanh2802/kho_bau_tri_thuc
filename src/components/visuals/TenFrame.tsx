import React from 'react';

export interface TenFrameProps {
  /** Số chục (0–10). */
  chuc: number;
  /** Số đơn vị (0–9). */
  donVi: number;
  /** Kích thước một ô (px). */
  cell?: number;
  /** Hiện tổng bên dưới (chỉ dùng khi không hỏi "số nào"). */
  showTotal?: boolean;
}

/**
 * T11A/T11B — khay 5 ô: mỗi hàng đầy là một chục, hàng cuối ghi số đơn vị.
 * Bé đếm được "mấy chục và mấy đơn vị" ngay trên hình.
 */
export const TenFrame: React.FC<TenFrameProps> = ({ chuc, donVi, cell = 18, showTotal = false }) => {
  const safeChuc = Math.min(10, Math.max(0, Math.round(Number(chuc) || 0)));
  const safeDonVi = Math.min(9, Math.max(0, Math.round(Number(donVi) || 0)));
  const rows = Math.max(1, safeChuc + (safeDonVi > 0 ? 1 : 0));
  const total = safeChuc * 10 + safeDonVi;
  const width = cell * 5 + cell * 0.6;
  const height = rows * cell + cell * 0.6 + (showTotal ? cell * 0.7 : 0);
  const radius = cell * 0.34;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={`Khay năm ô biểu diễn ${safeChuc} chục ${safeDonVi} đơn vị`}
    >
      {Array.from({ length: rows }, (_, row) =>
        Array.from({ length: 5 }, (_, col) => {
          const isChuc = row < safeChuc;
          const isUnit = row === safeChuc && col < safeDonVi;
          const cx = cell * 0.3 + col * cell;
          const cy = cell * 0.3 + row * cell;
          return (
            <circle
              key={`${row}-${col}`}
              cx={cx}
              cy={cy}
              r={radius}
              fill={isChuc ? '#f08c00' : isUnit ? '#ffd166' : '#fdf3e3'}
              stroke="#e65100"
              strokeWidth="1"
            />
          );
        })
      )}
      {showTotal && (
        <text
          x={width / 2}
          y={height - cell * 0.05}
          textAnchor="middle"
          fontSize={Math.max(11, cell * 0.6)}
          fontWeight="700"
          fill="#b34700"
        >
          {total}
        </text>
      )}
    </svg>
  );
};
