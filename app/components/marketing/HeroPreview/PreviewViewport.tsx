import * as React from "react";
import styles from "./PreviewViewport.module.css";

type PreviewViewportProps = {
  height?: number | string;
  children: React.ReactNode;
};

export default function PreviewViewport({
  height,
  children,
}: PreviewViewportProps) {
  const viewportStyle =
    height == null
      ? undefined
      : ({
          ["--preview-viewport-height" as any]:
            typeof height === "number" ? `${height}px` : height,
        } as React.CSSProperties);

  return (
    <div className={styles.viewport} style={viewportStyle}>
      {children}
    </div>
  );
}
