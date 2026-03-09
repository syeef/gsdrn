import React from "react";
import styles from "./Dock.module.css";

type NavItem = {
  label?: string;
  shortcutDescription?: string;
};

type Props = {
  show: boolean;
  isContactVisible: boolean;
  navItems: NavItem[];
};

export function DockShortcutsOverlay({
  show,
  isContactVisible,
  navItems,
}: Props) {
  if (!show || isContactVisible) return null;

  return (
    <div className={styles.shortcutsOverlay}>
      <div className={styles.shortcutsModal}>
        <h3>Keyboard Shortcuts</h3>

        <div className={styles.shortcutsGrid}>
          {navItems
            .filter((item) => item.shortcutDescription && item.label)
            .map((item, index) => (
              <div key={index} className={styles.shortcutItem}>
                <span>{item.label}</span>
                <kbd>{item.shortcutDescription}</kbd>
              </div>
            ))}

          <div key="cmdk" className={styles.shortcutItem}>
            <span>Command Palette</span>
            <kbd>⌘k</kbd>
          </div>
        </div>

        <div className={styles.shortcutsHelp}>
          <p>
            Press <kbd>?</kbd> to toggle Keyboard Shortcuts
          </p>
        </div>
      </div>
    </div>
  );
}
