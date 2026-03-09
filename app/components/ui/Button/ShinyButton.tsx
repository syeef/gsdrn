import * as React from "react";
import { NavLink, type NavLinkProps } from "react-router";
import styles from "./ShinyButton.module.css";

type ShinyButtonBaseProps = {
  children: React.ReactNode;
  className?: string;
};

type ShinyButtonAsButtonProps = ShinyButtonBaseProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "Button";
  };

type ShinyButtonAsNavLinkProps = ShinyButtonBaseProps &
  Omit<
    NavLinkProps,
    "children" | "className" | "to" | "prefetch" | "viewTransition"
  > & {
    variant: "NavLink";
    to: NavLinkProps["to"];
  };

type FeyButtonProps = ShinyButtonAsButtonProps | ShinyButtonAsNavLinkProps;

export function ShinyButton(props: FeyButtonProps) {
  if (props.variant === "NavLink") {
    const { className, children, to, variant: _variant, ...linkProps } = props;

    return (
      <NavLink
        className={[styles.button, className].filter(Boolean).join(" ")}
        to={to}
        prefetch="intent"
        viewTransition
        {...linkProps}
      >
        <span className={styles.label}>{children}</span>
      </NavLink>
    );
  }

  const {
    className,
    children,
    type,
    variant: _variant,
    ...buttonProps
  } = props;

  return (
    <button
      className={[styles.button, className].filter(Boolean).join(" ")}
      type={type ?? "button"}
      {...buttonProps}
    >
      <span className={styles.label}>{children}</span>
    </button>
  );
}
