import React from 'react';

export interface PlaceValueBlocksProps {
  /** Chục (0–9) */
  chuc: number;
  /** Đơn vị (0–9) */
  donVi: number;
  /** Màu nền cho chục (tùy chọn) */
  chucColor?: string;
  /** Màu nền cho đơn vị (tùy chọn) */
  donViColor?: string;
}

export const PlaceValueBlocks: React.FC<PlaceValueBlocksProps> = ({ chuc, donVi, chucColor = "#e65100", donViColor = "#ffe082" }) => {
  return (
    <svg
      width="200"
      height="120"
      viewBox="0 0 200 120"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Cột chục (màu cam) */}
      <rect x="20" y="20" width="80" height="80" rx="6" ry="6" fill={chucColor} stroke="#fff3e0" stroke-width="2"/>
      <text
        x="50"
        y="55"
        text-anchor="middle"
        font-size="18"
        fill="#fff3e0"
        font-weight="bold"
      >{chuc}</text>

      {/* Cột đơn vị (màu vàng)nước */}
      <rect x="120" y="20" width="80" height="80" rx="6" ry="6" fill={donViColor} stroke="#fff3e0" stroke-width="2"/>
      <text
        x="150"
        y="55"
        text-anchor="middle"
        font-size="18"
        fill="#e65100"
        font-weight="bold"
      >{donVi}</text>

      {/* Ghi chú */}
      <text
        x="100"
        y="105"
        text-anchor="middle"
        font-size="11"
        fill="#667085"
      >Chục + Đơn vị</text>
    </svg>
  );
};