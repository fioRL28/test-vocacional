"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";

export function DelayedResultsLink({
  children,
  className,
  delayMs = 2600,
  disabledClassName,
  href,
  loadingChildren = "Preparando resultados...",
}: {
  children: ReactNode;
  className: string;
  delayMs?: number;
  disabledClassName: string;
  href: string;
  loadingChildren?: ReactNode;
}) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsReady(true), delayMs);

    return () => window.clearTimeout(timer);
  }, [delayMs]);

  if (!isReady) {
    return (
      <span aria-disabled="true" className={disabledClassName}>
        {loadingChildren}
      </span>
    );
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
