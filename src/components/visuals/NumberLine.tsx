import React from 'react';

export interface NumberLineProps {
  /** Số bắt đầu */
  start: number;
  /** Số kết thúc */
  end: number;
  /** Số hiện tại cần đánh */
  current: number;
  /** Đường kẻ bước nhảy (mặc định 1) */
  step?: number;
}

export const NumberLine: React.FC<NumberLineProps> = ({ start, end, current, step = 1 }) => {
  const totalLength = end - start;
  const numSteps = totalLength / step;
  const screenWidth = 300;
  const stepWidth = screenWidth / numSteps;
  const currentPos = ((current - start) / totalLength) * screenWidth;

  return (
    <svg
      width={300}
      height="100"
      viewBox="0 0 300 100"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Đường底线 */}
      <line x1="0" y1="50" x2={300} y2="50" stroke="#e5e7eb" stroke-width="2"/>
      {/* Các dấu nhảy */}
      {Array.from({ length: Math.floor(numSteps) + 1 }, (_, i) => (
        <line
          key={i}
          x1={i * stepWidth}
          y1="45"
          x2={i * stepWidth}
          y2="55"
          stroke="#e5e7eb"
          stroke-width="1"
        />
      ))}
      {/* Số hiện tại đánh đỏ */}
      <circle
        cx={currentPos}
        cy="50"
        r={8}
        fill="#e65100"
      />
      {/* Labels cho start và end */}
      <text
        x="10"
        y="40"
        text-anchor="start"
        font-size="12"
        fill="#667085"
      >{start}</text>
      <text
        x={290}
        y="40"
        text-anchor="end"
        font-size="12"
        fill="#667085"
      >{end}</text>
      {/* Label cho số hiện tại */}
      <text
        x={currentPos}
        y="70"
        text-anchor="middle"
        font-size="14"
        fill="#e65100"
      >{current}</text>
    </svg>
  );
};