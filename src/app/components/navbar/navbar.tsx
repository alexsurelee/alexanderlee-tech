"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { TypewriterTitle } from "@/app/components/typewriter-title";
import { BlogSearch } from "@/app/components/blog-search";
import { isRouteActive, navRoutes } from "@/app/lib/routes";
import styles from "./navbar.module.css";

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className={styles.nav} aria-label="Primary">
      <Link href="/" className={styles.homeLink}>
        <Image
          src={"logo-small.svg"}
          loading="eager"
          width="50"
          height={"50"}
          alt={"Home"}
        />
        <TypewriterTitle aria-hidden={true} />
      </Link>
      <ul className={styles.links}>
        {navRoutes.map((route) => {
          const current = isRouteActive(pathname, route.href);
          return (
            <li key={route.href}>
              {route.href === "/blog" ? (
                <BlogSearch current={current} />
              ) : (
                <Link
                  href={route.href}
                  className={clsx("navLink", styles.link)}
                  data-current={current ? "" : undefined}
                  aria-current={current ? "page" : undefined}
                >
                  {route.label}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
