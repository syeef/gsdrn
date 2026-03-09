import React from "react";
import styles from "../Dock.module.css";
import {
  Icon10SecondsBackwards,
  Icon10SecondsForwards,
  IconPause,
  IconPlay,
} from "../../Icons/Icons";

type Props = {
  title?: string;
  subtitle?: string;

  /** playback state */
  isPlaying?: boolean;

  /** seconds */
  currentTimeSec?: number;
  durationSec?: number;

  /** 0..1 */
  progress?: number;

  onBack10?: () => void;
  onForward10?: () => void;
  onTogglePlay?: () => void;
};

function formatTime(totalSeconds: number) {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return "0:00";
  const s = Math.floor(totalSeconds);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

export function MediaPlayer({
  title = "Podcast Episode Title",
  subtitle = "Podcast Name",
  isPlaying = false,
  currentTimeSec = 0,
  durationSec = 0,
  progress = 0,
  onBack10,
  onForward10,
  onTogglePlay,
}: Props) {
  const safeProgress = Number.isFinite(progress)
    ? Math.min(1, Math.max(0, progress))
    : 0;

  const remainingSec = Math.max(0, (durationSec || 0) - (currentTimeSec || 0));

  return (
    <div className={styles.mediaPlayer}>
      {/* Episode Title | Podcast Title */}
      <div className={styles.mediaMeta}>
        <div className={styles.mediaTitle} title={title}>
          {title}
        </div>
        <div className={styles.mediaSubtitle} title={subtitle}>
          {subtitle}
        </div>
      </div>

      {/* Current Time | Progress Bar | Remaining Time */}
      <div className={styles.mediaStatus}>
        <div className={styles.mediaTime}>{formatTime(currentTimeSec)}</div>

        <div
          className={styles.mediaProgress}
          role="progressbar"
          aria-label="Playback progress"
          aria-valuemin={0}
          aria-valuemax={1}
          aria-valuenow={safeProgress}
        >
          <div
            className={styles.mediaProgressFill}
            style={{ transform: `scaleX(${safeProgress})` }}
          />
        </div>

        {/* Remaining duration */}
        <div className={styles.mediaDuration}>-{formatTime(remainingSec)}</div>
      </div>

      {/* Back 10 | Play/Pause Control | Forward 10 */}
      <div className={styles.mediaControls}>
        <button
          className={styles.mediaButton}
          type="button"
          onClick={onBack10}
          aria-label="Back 10 seconds"
        >
          <div className={styles.mediaButtonContent}>
            <Icon10SecondsBackwards width={24} height={24} />
          </div>
        </button>

        <button
          className={styles.mediaPlay}
          type="button"
          onClick={onTogglePlay}
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <IconPause /> : <IconPlay />}
        </button>

        <button
          className={styles.mediaButton}
          type="button"
          onClick={onForward10}
          aria-label="Forward 10 seconds"
        >
          <div className={styles.mediaButtonContent}>
            <Icon10SecondsForwards width={24} height={24} />
          </div>
        </button>
      </div>

      {/* Keyboard note */}
      <div className={styles.mediaKeyboardNote}>
        <kbd className={styles.contactKbd}>Esc</kbd> to Close
      </div>
    </div>
  );
}
