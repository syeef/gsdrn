// Popover.tsx
import * as React from "react";
import { Popover as Base } from "@base-ui-components/react/popover";
import styles from "./Popover.module.css";
// import { IconDoubleChevronUpDown } from "../Icons/Icons";

type PopoverProps = {
  trigger: React.ReactNode;
  children: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right" | "inline-start" | "inline-end";
  align?: "start" | "center" | "end";
  sideOffset?: number;
  alignOffset?: number;
  collisionPadding?:
    | number
    | { top?: number; right?: number; bottom?: number; left?: number };
  simple: boolean;
};

export default function Popover({
  trigger,
  children,
  side = "bottom",
  align = "start",
  sideOffset = 8,
  alignOffset = 0,
  collisionPadding = 12,
  simple = false,
}: PopoverProps) {
  return (
    <Base.Root>
      {/* IMPORTANT: asChild expects exactly ONE child and we don't block its events */}
      {/* <Base.Trigger asChild> */}

      {simple ? (
        <Base.Trigger>{trigger}</Base.Trigger>
      ) : (
        <Base.Trigger>
          <span className={styles.trigger}>
            {trigger}
            {/* <IconDoubleChevronUpDown /> */}
          </span>
        </Base.Trigger>
      )}

      <Base.Portal>
        <Base.Positioner
          side={side}
          align={align}
          sideOffset={sideOffset}
          alignOffset={alignOffset}
          collisionPadding={collisionPadding}
          collisionAvoidance={{ side: "flip", align: "shift" }}
          className={styles.Positioner}
        >
          <Base.Popup className={styles.Popup}>
            {children}
            {/* <Base.Close className={styles.close} aria-label="Close">
              ×
            </Base.Close> */}
          </Base.Popup>
        </Base.Positioner>
      </Base.Portal>
    </Base.Root>
  );
}
