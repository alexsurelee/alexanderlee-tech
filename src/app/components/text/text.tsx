import styles from "./text.module.css";
import clsx from "clsx";

type TextProps = React.HTMLProps<HTMLParagraphElement> & {
  font?: "sans" | "mono";
};

export function Text({ children, font = "sans", ...props }: TextProps) {
  const fontClassName = font === "sans" ? styles.sans : styles.mono;

  return (
    <p className={clsx(fontClassName)} {...props}>
      {children}
    </p>
  );
}
