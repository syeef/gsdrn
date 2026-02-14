import styles from "./SavingIndicator.module.css";

type SavingIndicatorProps = {
  visible?: boolean;
};

export default function SavingIndicator({ visible = true }: SavingIndicatorProps) {
  if (!visible) return null;

  return (
    <div className={styles.container} role="status" aria-live="polite">
      <span className={styles.spinner} aria-hidden="true" />
      <span className={styles.label}>Saving...</span>
    </div>
  );
}
