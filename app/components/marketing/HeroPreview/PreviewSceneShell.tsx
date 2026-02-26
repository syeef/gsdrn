import * as React from "react";
import { AnimatePresence, motion, type Transition } from "motion/react";
import styles from "./PreviewSceneShell.module.css";
import Title from "~/components/ui/Title/Title";

export type PreviewSceneProps = {
  transition?: Transition;
};

type PreviewSceneShellProps = {
  sceneKey: string;
  heading: string;
  transition?: Transition;
  children: React.ReactNode;
};

export default function PreviewSceneShell({
  sceneKey,
  heading,
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
