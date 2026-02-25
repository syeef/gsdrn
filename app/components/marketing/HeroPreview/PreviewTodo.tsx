import * as React from "react";
import { motion } from "motion/react";
import styles from "./HeroPreview.module.css";
import PreviewSceneShell, { type PreviewSceneProps } from "./PreviewSceneShell";
import { TODO_ITEMS } from "./previewData";

export default function PreviewTodo({ transition }: PreviewSceneProps) {
  return (
    <PreviewSceneShell sceneKey="todos" heading="Tasks" transition={transition}>
      <motion.ul
        // layout
        // layoutId="preview-panel-tasks"
        className={[styles.previewTodoList, styles.previewTodoListPanel].join(
          " ",
        )}
        transition={transition}
      >
        {TODO_ITEMS.map((item) => (
          <li key={item.id} className={styles.previewTodoItemRow}>
            <div className={styles.previewTodoItem}>
              <span
                className={[
                  styles.previewTodoCheckbox,
                  item.checked ? styles.previewTodoCheckboxChecked : "",
                ].join(" ")}
                aria-hidden="true"
              />
              <span
                className={[
                  styles.previewTodoText,
                  item.checked ? styles.previewTodoTextDone : "",
                ].join(" ")}
              >
                {item.label}
              </span>
            </div>
            {item.children && item.children.length > 0 ? (
              <ul className={styles.previewTodoChildren}>
                {item.children.map((child) => (
                  <li
                    key={`${item.id}-${child}`}
                    className={styles.previewTodoChild}
                  >
                    {child}
                  </li>
                ))}
              </ul>
            ) : null}
          </li>
        ))}
      </motion.ul>
    </PreviewSceneShell>
  );
}
