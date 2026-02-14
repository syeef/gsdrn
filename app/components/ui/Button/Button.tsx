// Button.tsx
import React from "react";
import styles from "./Button.module.css";

interface ButtonProps {
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  size?: "small" | "medium" | "large";
  variant?: "primary" | "secondary" | "destructive" | "shine";
  active?: boolean;
  children: React.ReactNode;
  type?: "button" | "submit" | "reset";
  style?: React.CSSProperties; // Add this line
  onKey?: {
    key: string;
    action: () => void;
  };
}

const Button: React.FC<ButtonProps> = ({
  onClick,
  disabled = false,
  size = "medium",
  variant = "primary",
  active = false,
  style,
  children,
  type = "button",
  onKey,
}) => {
  // Initialize an array with base class names
  const classNames = [styles.button];

  // Add the variant class
  if (variant && styles[variant]) {
    classNames.push(styles[variant]);
  }

  // Add the size class
  if (size && styles[size]) {
    classNames.push(styles[size]);
  }

  // Conditionally add the disabled class
  if (disabled) {
    classNames.push(styles.buttonDisabled);
  }

  // Conditionally add the active class
  if (active && !disabled) {
    classNames.push(styles.active);
  }

  // Join the class names into a single string
  const buttonClass = classNames.join(" ");

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (onKey && event.key === onKey.key) {
      onKey.action();
    }
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={buttonClass}
      style={style}
      onKeyDown={handleKeyDown}
    >
      {children}
    </button>
  );
};

export default Button;
