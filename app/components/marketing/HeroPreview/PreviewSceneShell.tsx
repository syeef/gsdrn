import * as React from "react";
import { AnimatePresence, motion, type Transition } from "motion/react";
import styles from "./HeroPreview.module.css";
import Title from "~/components/ui/Title/Title";

export type PreviewSceneProps = {
  transition: Transition;
};

type PreviewSceneShellProps = {
  sceneKey: string;
  heading: string;
  badge?: string;
  transition: Transition;
  children: React.ReactNode;
};

export default function PreviewSceneShell({
  sceneKey,
  heading,
  badge,
  transition,
  children,
}: PreviewSceneShellProps) {
  return (
    <section className={styles.previewShell}>
      <header className={styles.previewShellHeader}>
        <Title as="h3" className={styles.previewShellTitle}>
          <span className={styles.previewShellTitleStack}>
            <AnimatePresence mode="sync" initial={false}>
              <motion.span
                key={`preview-shell-title-${sceneKey}`}
                className={styles.previewShellTitleText}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={transition}
              >
                {heading}
              </motion.span>
            </AnimatePresence>
          </span>
        </Title>
        {/* {badge ? (
          <motion.span
            layout
            layoutId="preview-shell-badge"
            className={styles.previewShellBadge}
            transition={transition}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={`preview-shell-badge-${sceneKey}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={transition}
                style={{ display: "inline-block" }}
              >
                {badge}
              </motion.span>
            </AnimatePresence>
          </motion.span>
        ) : null} */}
      </header>
      <div className={styles.previewShellBody}>
        <AnimatePresence mode="sync" initial={false}>
          <motion.div
            key={`preview-shell-body-${sceneKey}`}
            className={styles.previewShellBodyScene}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={transition}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
