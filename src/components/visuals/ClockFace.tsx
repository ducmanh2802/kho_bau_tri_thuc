import React from 'react';

export interface ClockFaceProps {
  /** Giờ (0–11) */
  gio: number;
  /** Phút (0–59) */
  phut: number;
  /** Inclusive 12-hour format */
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
      {/* Vietnamese clock is 12-hour with am/pm */}
      <circle cx="100" cy="100" r="90" fill="#fff3e0" stroke="#e65100" stroke-width="5"/>
      {/* Hour ticks (12 positions) */}
      {Array.from({ length: 12 }, (_, i) => {
        const angle = (i * 30) * Math.PI / 180;
        const x1 = 100 + 60 * Math.cos(angle);
        const y1 = 100 - 60 * Math.sin(angle);
        const x2 = 100 + 70 * Math.cos(angle);
        const y2 = 100 - 70 * Math.sin(angle);
        const isMajor = i % 3 === 0;
        return isMajor ? (
          <g key={i}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#e65100" stroke-width="3"/>
            <text
              x={x1}
              y={y1 - 10}
              text-anchor="middle"
              font-size="11"
              fill="#e65100"
            >{i + 1}</text>
          </g>
        ) : (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#e5e7eb"
            stroke-width="1"
          />
        );
      })}
      {/* Minute ticks (60 positions, subtle) */}
      {Array.from({ length: 30 }, (_, i) => {
        const angle = (i * 6 + 30) * Math.PI / 180; // start at 30° (6 tick), every 6°
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
            stroke-width="1"
          />
        );
      })}
      {/* Hour hand */}
      <line
        x1={100}
        y1={100}
        x2={100 + 50 * Math.cos(hourAngle * Math.PI / 180)}
        y2={100 - 50 * Math.sin(hourAngle * Math.PI / 180)}
        stroke="#e65100"
        stroke-width="6"
        stroke-linecap="round"
      />
      {/* Minute hand */}
      <line
        x1={100}
        y1={100}
        x2={100 + 70 * Math.cos(minuteAngle * Math.PI / 180)}
        y2={100 - 70 * Math.sin(minuteAngle * Math.PI / 180)}
        stroke="#e65100"
        stroke-width="4"
        stroke-linecap="round"
      />
      {/* Center dot */}
      <circle cx="100" cy="100" r="4" fill="#e65100"/>
      {/* AM/PM label */}
      <text
        x="100"
        y="185"
        text-anchor="middle"
        font-size="11"
        fill="#667085"
      >{amPm}</text>
    </svg>
  );
};