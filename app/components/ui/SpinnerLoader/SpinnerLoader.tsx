import React from "react";
import styles from "./SpinnerLoader.module.css";

type SpinnerLoaderProps = {
  size?: number;
  color?: string;
  label?: string;
  gap?: number;
};

const bars = [
  { delay: "-1.2s", rotate: 0 },
  { delay: "-1.1s", rotate: 30 },
  { delay: "-1.0s", rotate: 60 },
  { delay: "-0.9s", rotate: 90 },
  { delay: "-0.8s", rotate: 120 },
  { delay: "-0.7s", rotate: 150 },
  { delay: "-0.6s", rotate: 180 },
  { delay: "-0.5s", rotate: 210 },
  { delay: "-0.4s", rotate: 240 },
  { delay: "-0.3s", rotate: 270 },
  { delay: "-0.2s", rotate: 300 },
  { delay: "-0.1s", rotate: 330 },
];

export function SpinnerLoader({
  size = 20,
  color = "var(--gray-8)",
  label,
  gap = 8,
}: SpinnerLoaderProps) {
  return (
    <div
      className={styles.root}
      style={{ gap }}
      role="status"
      aria-live="polite"
    >
      <div
        className={styles.spinner}
        style={{
          width: size,
          height: size,
        }}
      >
        {bars.map((bar) => (
          <span
            key={bar.rotate}
            className={styles.bar}
            style={{
              backgroundColor: color,
              animationDelay: bar.delay,
              transform: `rotate(${bar.rotate}deg) translate(146%)`,
            }}
          />
        ))}
      </div>

      {label && <span className={styles.label}>{label}</span>}
    </div>
  );
}
