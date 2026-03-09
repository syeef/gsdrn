import * as React from "react";
import { Input as BaseInput } from "@base-ui-components/react/input";
import styles from "./Input.module.css";

export type InputVariant = "default" | "transparent";

export type InputProps = React.ComponentProps<typeof BaseInput> & {
  variant?: InputVariant;
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, variant = "default", ...props },
  ref
) {
  return (
    <BaseInput
      ref={ref}
      className={[
        styles.Input,
        styles[variant], // maps to CSS module
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
});

export default Input;
