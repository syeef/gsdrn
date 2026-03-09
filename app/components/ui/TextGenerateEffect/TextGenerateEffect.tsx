import React, { useEffect, useMemo } from "react";
import { motion, stagger, useAnimate } from "motion/react";
import styles from "./TextGenerateEffect.module.css";

type Props = {
  /** The (partial) string you want to render */
  text: string;

  /** Optional: split by whitespace; can be "char" if you prefer */
  mode?: "word" | "char";

  /** Blur-in effect like the original snippet */
  blur?: boolean;

  /** Total duration for one batch of items */
  duration?: number;

  /** Stagger between items */
  itemStagger?: number;

  /** Optional class hook */
  className?: string;
};

/**
 * Animates a chunk of text into view by revealing each word (or char).
 * Intended to be used for *newly appended* chunks while streaming.
 */
export function TextGenerateEffect({
  text,
  mode = "word",
  blur = true,
  duration = 0.25,
  itemStagger = 0.015,
  className,
}: Props) {
  const [scope, animate] = useAnimate();

  const items = useMemo(() => {
    if (!text) return [];
    if (mode === "char") return text.split("");
    // Keep spaces by splitting on spaces, then re-add a space after each word in render
    return text.split(/\s+/).filter(Boolean);
  }, [text, mode]);

  useEffect(() => {
    // Animate all spans under this scope when `text` changes
    // void animate(
    //   "span",
    //   { opacity: 1, filter: blur ? "blur(0px)" : "none" },
    //   { duration, delay: stagger(itemStagger) }
    // );
    void animate(
      `.${styles.item}`,
      { opacity: 1, filter: blur ? "blur(0px)" : "none" },
      { duration, delay: stagger(itemStagger) }
    );
  }, [text, blur, duration, itemStagger, animate]);

  if (!text) return null;

  return (
    <span className={`${styles.root} ${className ?? ""}`}>
      <motion.span ref={scope} className={styles.track} aria-label={text}>
        {items.map((item, idx) => (
          <motion.span
            key={`${item}-${idx}`}
            className={styles.item}
            style={{ filter: blur ? "blur(10px)" : "none" }}
          >
            {mode === "char" ? item : `${item} `}
          </motion.span>
        ))}
      </motion.span>
    </span>
  );
}
