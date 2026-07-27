"use client";

import { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";

import { cn } from "@/lib/utils";

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const update = () => setVisible(window.scrollY > 400);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <button
      type="button"
      aria-label="กลับขึ้นด้านบน"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={cn(
        "fixed right-4 bottom-6 z-50 flex size-11 items-center justify-center rounded-full",
        "border border-border/70 bg-background/90 text-foreground shadow-[0_8px_30px_rgba(0,0,0,0.12)]",
        "backdrop-blur-xl transition-all duration-200 hover:bg-muted sm:right-6 sm:bottom-8",
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-3 opacity-0"
      )}
    >
      <ChevronUp className="size-5" strokeWidth={2.25} />
    </button>
  );
}
