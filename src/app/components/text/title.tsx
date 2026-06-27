import styles from "./text.module.css";
import clsx from "clsx";
import type { ComponentPropsWithoutRef } from "react";

type TitleSize = "h1" | "h2" | "h3" | "h4";

type TitleProps = {
  font?: "sans" | "mono";
  size?: TitleSize;
  TagName?: TitleSize;
} & ComponentPropsWithoutRef<"h1">;

const sizeClassNames: Record<TitleSize, string> = {
  h1: styles.h1,
  h2: styles.h2,
  h3: styles.h3,
  h4: styles.h4,
};

export function Title({
  children,
  font = "sans",
  size = "h1",
  TagName,
  className,
  ...props
}: TitleProps) {
  const Heading = TagName ?? size;
  const fontClassName = font === "sans" ? styles.sans : styles.mono;

  return (
    <Heading
      className={clsx(fontClassName, sizeClassNames[size], className)}
      {...props}
    >
      {children}
    </Heading>
  );
}
