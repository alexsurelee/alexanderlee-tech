"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  getNavTransitionType,
  navTransitionClass,
} from "@/app/lib/nav-transition";
import { runViewTransition } from "@/app/lib/run-view-transition";

export function useTransitionRouter() {
  const router = useRouter();
  const pathname = usePathname();

  function push(href: string) {
    const className = navTransitionClass(
      getNavTransitionType(pathname, href),
    );

    const transition = runViewTransition(() => {
      document.documentElement.dataset.navTransition = className;
      router.push(href);
    });

    void transition?.finished.finally(() => {
      delete document.documentElement.dataset.navTransition;
    });
  }

  return { push };
}
