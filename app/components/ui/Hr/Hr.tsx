import styles from "./Hr.module.css";

interface HrProps {
  orientation?: "horizontal" | "vertical";
  marginSize?: "small" | "large";
}

export function Hr({
  orientation = "horizontal",
  marginSize = "large",
}: HrProps) {
  // Initialize the base class name
  const baseClassName = `${styles.tidyHR}`;

  // Determine additional class based on orientation
  const orientationClass =
    orientation === "vertical" ? `${styles.vertical}` : "";

  const marginSizeClass =
    marginSize === "small" ? `${styles.marginSmall}` : `${styles.marginLarge}`;

  // Combine class names
  const separatorStyleClass = `${baseClassName} ${orientationClass} ${marginSizeClass}`;

  return <hr className={separatorStyleClass} />;
}
