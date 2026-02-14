import React from "react";
import styles from "./Title.module.css";

type HeadingColor = "default" | "orange" | "blue" | "purple" | "green" | "gray";
type HeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
type TitleVariant = "Lora" | "Inter" | "GoogleSans";

interface TitleProps {
  children: React.ReactNode;
  variant?: TitleVariant;
  className?: string;
  as?: HeadingTag;
  headingColor?: HeadingColor;
}

const headingColorClassMap: Record<HeadingColor, string | undefined> = {
  default: undefined,
  orange: styles.headingOrange,
  blue: styles.headingBlue,
  purple: styles.headingPurple,
  green: styles.headingGreen,
  gray: styles.headingGray,
};

const variantToClass: Record<TitleVariant, string> = {
  GoogleSans: styles.GoogleSans,
  Inter: styles.Inter,
  Lora: styles.Lora,
};

type TitleComponent = React.FC<TitleProps> & {
  Em: React.FC<
    React.PropsWithChildren<{
      className?: string;
      as?: "span" | "em";
      headingColor?: HeadingColor;
    }>
  >;
};

const Title: TitleComponent = function Title({
  children,
  variant = "GoogleSans",
  className = "",
  as = "h1",
  headingColor = "default",
}: TitleProps) {
  const Component = as;

  return (
    <Component
      className={[
        styles.title,
        variantToClass[variant],
        headingColorClassMap[headingColor],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </Component>
  );
};

Title.Em = function TitleEm({
  children,
  className = "",
  as = "em",
  headingColor = "default",
}) {
  const Component = as;
  return (
    <Component
      className={[
        styles.emphasis,
        headingColorClassMap[headingColor],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </Component>
  );
};

export default Title;
