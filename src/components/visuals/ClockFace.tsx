import React from 'react';

export interface ClockFaceProps {
  /** Giờ (0–11) */
  gio: number;
  /** Phút (0–59) */
  phut: number;
  /** Định dạng 12 giờ */
  amPm: 'sáng' | 'chiều';
}

export const ClockFace: React.FC<ClockFaceProps> = ({ gio, phut, amPm }) => {
  const minuteAngle = (phut / 60) * 360;
  const hourAngle = ((gio % 12) / 12) * 360 + (phut / 60) * 30;

  return (
    <svg
      width="200"
      height="200"
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Mặt đồng hồ 12 giờ với sáng/chiều */}
      <circle cx="100" cy="100" r="90" fill="#fff3e0" stroke="#e65100" strokeWidth="5" />
      {/* Vạch giờ (12 vị trí) */}
      {Array.from({ length: 12 }, (_, i) => {
        const angle = (i * 30) * Math.PI / 180;
        const x1 = 100 + 60 * Math.cos(angle);
        const y1 = 100 - 60 * Math.sin(angle);
        const x2 = 100 + 70 * Math.cos(angle);
        const y2 = 100 - 70 * Math.sin(angle);
        const isMajor = i % 3 === 0;
        return isMajor ? (
          <g key={i}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#e65100" strokeWidth="3" />
            <text x={x1} y={y1 - 10} textAnchor="middle" fontSize="11" fill="#e65100">
              {i + 1}
            </text>
          </g>
        ) : (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#e5e7eb"
            strokeWidth="1"
          />
        );
      })}
      {/* Vạch phút (30 vị trí, nhỏ) */}
      {Array.from({ length: 30 }, (_, i) => {
        const angle = (i * 6 + 30) * Math.PI / 180;
        const r = 65;
        const x1 = 100 + r * Math.cos(angle);
        const y1 = 100 - r * Math.sin(angle);
        const x2 = 100 + (r + 5) * Math.cos(angle);
        const y2 = 100 - (r + 5) * Math.sin(angle);
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#e5e7eb"
            strokeWidth="1"
          />
        );
      })}
      {/* Kim giờ */}
      <line
        x1={100}
        y1={100}
        x2={100 + 50 * Math.cos(hourAngle * Math.PI / 180)}
        y2={100 - 50 * Math.sin(hourAngle * Math.PI / 180)}
        stroke="#e65100"
        strokeWidth="6"
        strokeLinecap="round"
      />
      {/* Kim phút */}
      <line
        x1={100}
        y1={100}
        x2={100 + 70 * Math.cos(minuteAngle * Math.PI / 180)}
        y2={100 - 70 * Math.sin(minuteAngle * Math.PI / 180)}
        stroke="#e65100"
        strokeWidth="4"
        strokeLinecap="round"
      />
      {/* Chấm tâm */}
      <circle cx="100" cy="100" r="4" fill="#e65100" />
      {/* Nhãn sáng/chiều */}
      <text x="100" y="185" textAnchor="middle" fontSize="11" fill="#667085">
        {amPm}
      </text>
    </svg>
  );
};
