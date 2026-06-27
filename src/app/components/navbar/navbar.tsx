"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useHotkey } from "@tanstack/react-hotkeys";
import clsx from "clsx";
import { TypewriterTitle } from "@/app/components/typewriter-title";
import { BlogSearch } from "@/app/components/blog-search";
import { CommandPalette } from "@/app/components/command-palette";
import { isRouteActive, navRoutes } from "@/app/lib/routes";
import { NAV_WIDE_QUERY } from "@/app/lib/nav-breakpoint";
import { useMediaQuery } from "@/app/lib/use-media-query";
import { runViewTransition } from "@/app/lib/run-view-transition";
import styles from "./navbar.module.css";
import { Text } from "../text/text";
import { Title } from "../text/title";

export function Navbar() {
  const pathname = usePathname();
  const isWide = useMediaQuery(NAV_WIDE_QUERY);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [animatePalette, setAnimatePalette] = useState(true);
  const menuTriggerRef = useRef<HTMLButtonElement>(null);

  useHotkey(
    "Mod+K",
    () => {
      // Keyboard-initiated and frequently used: open instantly, no animation.
      setAnimatePalette(false);
      setPaletteOpen(true);
    },
    {
      enabled: isWide,
      ignoreInputs: true,
    },
  );

  function openPalette() {
    setAnimatePalette(true);
    runViewTransition(() => setPaletteOpen(true));
  }

  function closePalette() {
    setPaletteOpen(false);
  }

  return (
    <nav
      className={styles.nav}
      aria-label="Primary"
      data-layout={isWide ? "wide" : "narrow"}
    >
      <Link href="/" className={styles.homeLink}>
        <Image
          src="/logo-small.svg"
          loading="eager"
          width="75"
          height="75"
          alt=""
        />
        <Title font="mono">lee.computer</Title>
      </Link>

      <button
        ref={menuTriggerRef}
        type="button"
        className={styles.menuTrigger}
        aria-haspopup="dialog"
        aria-expanded={paletteOpen}
        aria-controls={paletteOpen ? "command-menu" : undefined}
        onClick={openPalette}
      >
        Menu
      </button>

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

      <CommandPalette
        open={paletteOpen}
        animateEnter={animatePalette}
        onClose={closePalette}
        returnFocusRef={menuTriggerRef}
      />
    </nav>
  );
}
