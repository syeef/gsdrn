import * as React from "react";
import { motion } from "motion/react";
import styles from "./HeroPreview.module.css";
import PreviewSceneShell, { type PreviewSceneProps } from "./PreviewSceneShell";
import { NOTE_ITEMS } from "./previewData";

export default function PreviewNotes({ transition }: PreviewSceneProps) {
  return (
    <PreviewSceneShell
      sceneKey="notes"
      heading="Notes"
      badge="Notes"
      transition={transition}
    >
      <motion.section
        layout
        layoutId="preview-panel-notes"
        className={styles.previewEditorSection}
        transition={transition}
      >
        <motion.div
          layout
          layoutId="preview-panel-notes-title"
          className={styles.previewEditorTitle}
          transition={transition}
        >
          Notes
        </motion.div>
        <motion.div
          layout
          layoutId="preview-panel-notes-body"
          className={styles.previewEditorBody}
          transition={transition}
        >
          <ul className={styles.previewNotesList}>
            {NOTE_ITEMS.map((item) => (
              <li key={item} className={styles.previewNotesItem}>
                {item}
              </li>
            ))}
          </ul>
        </motion.div>
      </motion.section>
    </PreviewSceneShell>
  );
}
