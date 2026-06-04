import Image from "next/image";
import Link from "next/link";
import { TypewriterTitle } from "@/app/components/typewriter-title";
import styles from "./base-layout.module.css";

export function BaseLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <nav className={styles.nav}>
          <Link href={"/"} className={styles.homeLink}>
            <Image
              src={"logo-small.svg"}
              width="50"
              height={"50"}
              alt={"Home"}
            />
            <TypewriterTitle />
          </Link>
        </nav>
      </header>
      <div className={styles.body}>
        <div className={styles.leftGutter} aria-hidden="true" />
        <main className={styles.main}>{children}</main>
        <div className={styles.rightGutter} aria-hidden="true" />
      </div>
    </div>
  );
}
