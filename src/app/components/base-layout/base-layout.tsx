import { Navbar } from "@/app/components/navbar";
import styles from "./base-layout.module.css";

export function BaseLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <Navbar />
      </header>
      <div className={styles.body}>
        <div className={styles.leftGutter} aria-hidden="true" />
        <main className={styles.main}>{children}</main>
        <div className={styles.rightGutter} aria-hidden="true" />
      </div>
    </div>
  );
}
