import React from "react";
import { AnimatePresence, motion } from "motion/react";
import styles from "./Dock.module.css";
import { MediaPlayer } from "./MediaPlayer/MediaPlayer";

type Props = {
  isVisible: boolean;
  title: string;
  subtitle: string;

  isPlaying: boolean;
  currentTimeSec: number;
  durationSec: number;
  progress: number;

  onClose: () => void;
  onTogglePlay: () => void;
  onBack10: () => void;
  onForward10: () => void;
};

export function DockMediaPlayerPanel({
  isVisible,
  title,
  subtitle,
  isPlaying,
  currentTimeSec,
  durationSec,
  progress,
  onClose,
  onTogglePlay,
  onBack10,
  onForward10,
}: Props) {
  return (
    <AnimatePresence initial={false}>
      {isVisible && (
        <motion.div
          className={styles.mediaPlayerPanel}
          initial={{ opacity: 0, y: 8, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: 8, filter: "blur(10px)" }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          style={{ transformOrigin: "bottom" }}
        >
          <MediaPlayer
            title={title}
            subtitle={subtitle}
            isPlaying={isPlaying}
            currentTimeSec={currentTimeSec}
            durationSec={durationSec}
            progress={progress}
            onTogglePlay={onTogglePlay}
            onBack10={onBack10}
            onForward10={onForward10}
            // ignore onClose for now unless you add a close button in MediaPlayer
            // onClose={onClose as any}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
