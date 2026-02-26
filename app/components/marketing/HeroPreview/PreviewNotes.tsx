import * as React from "react";
import { motion } from "motion/react";
import styles from "./PreviewNotes.module.css";
import PreviewSceneShell, { type PreviewSceneProps } from "./PreviewSceneShell";
import PreviewViewport from "./PreviewViewport";
import { NOTE_ITEMS } from "./previewData";

type PreviewNotesProps = PreviewSceneProps & {
  height?: number | string;
};

export default function PreviewNotes({
  transition,
  height,
}: PreviewNotesProps) {
  return (
    <PreviewViewport height={height}>
      <PreviewSceneShell
        sceneKey="notes"
        heading="Notes"
        transition={transition}
      >
        {/* <motion.section
          className={styles.editorSection}
          transition={transition}
        > */}
        <motion.div className={styles.editorBody} transition={transition}>
          <ul className={styles.notesList}>
            {NOTE_ITEMS.map((item) => (
              <li key={item} className={styles.notesItem}>
                {item}
              </li>
            ))}
          </ul>
        </motion.div>
        {/* </motion.section> */}
      </PreviewSceneShell>
    </PreviewViewport>
  );
}
