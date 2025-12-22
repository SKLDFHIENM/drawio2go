"use client";

import { useEffect, useState } from "react";

export interface ContainerWidthQuery {
  minWidth?: number;
  maxWidth?: number;
}

const matchesWidthQuery = (
  width: number,
  minWidth: number | undefined,
  maxWidth: number | undefined,
) => {
  if (typeof minWidth === "number" && width < minWidth) return false;
  if (typeof maxWidth === "number" && width > maxWidth) return false;
  return true;
};

export function useContainerQuery<T extends Element>(
  ref: React.RefObject<T | null>,
  query: ContainerWidthQuery,
): boolean {
  const [matches, setMatches] = useState(false);
  const { minWidth, maxWidth } = query;

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const updateMatches = (width: number) => {
      const next = matchesWidthQuery(width, minWidth, maxWidth);
      setMatches((prev) => (prev === next ? prev : next));
    };

    updateMatches(element.getBoundingClientRect().width);

    if (typeof ResizeObserver === "undefined") {
      const handleResize = () => {
        updateMatches(element.getBoundingClientRect().width);
      };
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      updateMatches(entry.contentRect.width);
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, [maxWidth, minWidth, ref]);

  return matches;
}
