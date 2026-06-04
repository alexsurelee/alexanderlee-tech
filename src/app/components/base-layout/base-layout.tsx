import Image from "next/image";
import Link from "next/link";
import { TypewriterTitle } from "@/app/components/typewriter-title";
import styles from "./layout.module.css";

export function BaseLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <nav>
        <Link href={"/"} className={styles.homeLink}>
          <Image src={"logo-small.svg"} width="50" height={"50"} alt={"Home"} />
          <TypewriterTitle />
        </Link>
      </nav>
      <main>{children}</main>
    </>
  );
}
