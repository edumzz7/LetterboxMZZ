import { type ReactNode, useEffect, useRef } from "react";

interface SmartStickySidebarProps {
  children: ReactNode;
  topGap?: number;
  bottomGap?: number;
  className?: string;
}

/**
 * Keeps a tall sidebar visible in the direction the page is being scrolled.
 * A short sidebar uses the usual sticky-top behavior.
 */
export default function SmartStickySidebar({
  children,
  topGap = 16,
  bottomGap = 16,
  className = "",
}: SmartStickySidebarProps) {
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = sidebarRef.current;
    if (!element) return;

    const desktopQuery = window.matchMedia("(min-width: 1280px)");
    let previousScrollY = window.scrollY;
    let currentTop = topGap;
    let animationFrame: number | null = null;

    const applyTop = (top: number) => {
      element.style.setProperty("--smart-sticky-top", `${top}px`);
    };

    const updatePosition = () => {
      animationFrame = null;

      if (!desktopQuery.matches) {
        currentTop = topGap;
        applyTop(topGap);
        previousScrollY = window.scrollY;
        return;
      }

      const scrollY = window.scrollY;
      const viewportHeight = window.innerHeight;
      const sidebarHeight = element.offsetHeight;
      const availableHeight = viewportHeight - topGap - bottomGap;

      if (scrollY <= 0 || sidebarHeight <= availableHeight) {
        currentTop = topGap;
      } else {
        const minTop = viewportHeight - sidebarHeight - bottomGap;
        const delta = scrollY - previousScrollY;
        currentTop = Math.max(minTop, Math.min(topGap, currentTop - delta));
      }

      applyTop(currentTop);
      previousScrollY = scrollY;
    };

    const scheduleUpdate = () => {
      if (animationFrame !== null) return;
      animationFrame = window.requestAnimationFrame(updatePosition);
    };

    const resizeObserver = new ResizeObserver(scheduleUpdate);
    resizeObserver.observe(element);
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    desktopQuery.addEventListener("change", scheduleUpdate);
    updatePosition();

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      desktopQuery.removeEventListener("change", scheduleUpdate);
      if (animationFrame !== null) window.cancelAnimationFrame(animationFrame);
    };
  }, [bottomGap, topGap]);

  return (
    <div
      ref={sidebarRef}
      className={`w-full xl:sticky xl:self-start ${className}`}
      style={{ top: `var(--smart-sticky-top, ${topGap}px)` }}
    >
      {children}
    </div>
  );
}
