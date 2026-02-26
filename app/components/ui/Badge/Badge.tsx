import * as React from "react";
import styles from "./Badge.module.css";

export type BadgeVariant = "primary" | "secondary";

type BadgeProps = Omit<React.ComponentPropsWithoutRef<"span">, "children"> & {
  label: string;
  icon?: React.ReactNode;
  variant?: BadgeVariant;
};

export default function Badge({
  label,
  icon,
  variant = "primary",
  className,
  ...rest
}: BadgeProps) {
  const badgeClassName = [styles.badge, styles[variant], className]
    .filter(Boolean)
    .join(" ");

  return (
    <span {...rest} className={badgeClassName}>
      {icon ? (
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <span>{label}</span>
    </span>
  );
}
