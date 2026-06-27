import { Navbar } from "@/app/components/navbar";
import styles from "./base-layout.module.css";

type BaseLayoutProps = {
  children: React.ReactNode;
  left?: React.ReactNode;
  right?: React.ReactNode;
};

export function BaseLayout({ children, left, right }: BaseLayoutProps) {
  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Navbar />
        </div>
      </header>
      <div
        className={styles.body}
        data-has-left={left ? "" : undefined}
        data-has-right={right ? "" : undefined}
      >
        {left ? <aside className={styles.leftGutter}>{left}</aside> : null}
        <main className={styles.main}>{children}</main>
        {right ? <aside className={styles.rightGutter}>{right}</aside> : null}
      </div>
    </div>
  );
}
