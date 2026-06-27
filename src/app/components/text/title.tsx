import styles from "./text.module.css";
import clsx from "clsx";

type TitleProps = React.HTMLProps<HTMLHeadingElement> & {
  font?: "sans" | "mono";
  TagName?: "h1" | "h2" | "h3" | "h4";
};

export function Title({
  children,
  font = "sans",
  TagName = "h1",
  ...props
}: TitleProps) {
  const fontClassName = font === "sans" ? styles.sans : styles.mono;

  return (
    <TagName className={clsx(fontClassName)} {...props}>
      {children}
    </TagName>
  );
}
