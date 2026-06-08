"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ComponentProps } from "react";
import {
  getNavTransitionType,
  navTransitionClass,
} from "@/app/lib/nav-transition";
import { runViewTransition } from "@/app/lib/run-view-transition";

type TransitionLinkProps = ComponentProps<typeof Link>;

function hrefToPath(href: TransitionLinkProps["href"]): string {
  if (typeof href === "string") return href;
  return `${href.pathname ?? ""}${href.search ?? ""}${href.hash ?? ""}`;
}

export function TransitionLink({ href, onClick, ...props }: TransitionLinkProps) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <Link
      {...props}
      href={href}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;

        const target = hrefToPath(href);
        if (target === pathname) return;

        event.preventDefault();

        const className = navTransitionClass(
          getNavTransitionType(pathname, target),
        );

        const transition = runViewTransition(() => {
          document.documentElement.dataset.navTransition = className;
          router.push(target);
        });

        void transition?.finished.finally(() => {
          delete document.documentElement.dataset.navTransition;
        });
      }}
    />
  );
}
