import * as React from "react";
import { motion } from "motion/react";
import styles from "./PreviewTodo.module.css";
import PreviewSceneShell, { type PreviewSceneProps } from "./PreviewSceneShell";
import PreviewViewport from "./PreviewViewport";
import { TODO_ITEMS } from "./previewData";

type PreviewTodoProps = PreviewSceneProps & {
  height?: number | string;
};

export default function PreviewTodo({ transition, height }: PreviewTodoProps) {
  return (
    <PreviewViewport height={height}>
      <PreviewSceneShell
        sceneKey="todos"
        heading="Tasks"
        transition={transition}
      >
        <motion.div className={styles.editorBody} transition={transition}>
          <motion.ul
            className={[styles.todoList, styles.todoListPanel].join(" ")}
            transition={transition}
          >
            {TODO_ITEMS.map((item) => (
              <li key={item.id} className={styles.todoItemRow}>
                <div className={styles.todoItem}>
                  <span
                    className={[
                      styles.todoCheckbox,
                      item.checked ? styles.todoCheckboxChecked : "",
                    ].join(" ")}
                    aria-hidden="true"
                  />
                  <span
                    className={[
                      styles.todoText,
                      item.checked ? styles.todoTextDone : "",
                    ].join(" ")}
                  >
                    {item.label}
                  </span>
                </div>
                {item.children && item.children.length > 0 ? (
                  <ul className={styles.todoChildren}>
                    {item.children.map((child) => (
                      <li
                        key={`${item.id}-${child}`}
                        className={styles.todoChild}
                      >
                        {child}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </motion.ul>
        </motion.div>
      </PreviewSceneShell>
    </PreviewViewport>
  );
}
