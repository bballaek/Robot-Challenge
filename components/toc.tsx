"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

export type TocItem = {
  id: string;
  title: string;
};

/** รายการสารบัญหน้าแรก Rescue Line Robot Challenge */
export const homeTocItems: TocItem[] = [
  { id: "objectives", title: "วัตถุประสงค์" },
  { id: "schedule", title: "กำหนดการและระดับการแข่งขัน" },
  { id: "field", title: "ภาพจำลองสนามแข่งขัน" },
  { id: "format", title: "รูปแบบการแข่งขัน" },
  { id: "equipment", title: "อุปกรณ์" },
  { id: "steps", title: "ขั้นตอนการแข่งขัน" },
  { id: "rules", title: "กติกาการแข่งขัน" },
  { id: "scoring", title: "การตัดสิน" },
  { id: "awards", title: "รางวัล" },
];

function ProgressRing({ progress }: { progress: number }) {
  const size = 18;
  const stroke = 2;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(1, Math.max(0, progress)));

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="shrink-0 -rotate-90"
      aria-hidden
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={stroke}
        className="text-border"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className="text-primary transition-[stroke-dashoffset] duration-300"
      />
    </svg>
  );
}

type TocProps = {
  items: TocItem[];
  className?: string;
};

/** TOC แบบเลื่อนตามหัวข้อ — รับรายการ `items` แล้วใช้ซ้ำได้ทุกหน้า */
export function Toc({ items, className }: TocProps) {
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const update = () => {
      const threshold = window.matchMedia("(min-width: 640px)").matches
        ? 132
        : 120;
      let current: string | null = null;
      for (const item of items) {
        const el = document.getElementById(item.id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top <= threshold && rect.bottom > threshold) {
          current = item.id;
        }
      }
      setActiveId((prev) => {
        if (prev !== current && current === null) setOpen(false);
        return current;
      });
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [items]);

  const activeIndex = items.findIndex((item) => item.id === activeId);
  const active = activeIndex >= 0 ? items[activeIndex] : null;
  const visible = Boolean(active);
  const progress = activeIndex >= 0 ? (activeIndex + 1) / items.length : 0;

  return (
    <div
      className={cn(
        "fixed inset-x-4 top-[4.75rem] z-40 transition-all duration-200 sm:inset-x-6 sm:top-[5.25rem]",
        visible
          ? "visible translate-y-0 opacity-100"
          : "pointer-events-none invisible -translate-y-2 opacity-0",
        className
      )}
    >
      <div className="mx-auto w-full max-w-3xl overflow-hidden rounded-2xl border border-border/70 bg-background/90 shadow-[0_8px_30px_rgba(0,0,0,0.1)] backdrop-blur-xl">
        <button
          type="button"
          className="flex h-11 w-full items-center justify-between gap-3 px-4 text-left sm:h-12 sm:px-5"
          aria-expanded={open}
          aria-controls="page-toc"
          onClick={() => setOpen((prev) => !prev)}
        >
          <span className="flex min-w-0 items-center gap-2.5">
            <ProgressRing progress={progress} />
            <span className="truncate text-sm font-semibold tracking-tight text-foreground sm:text-base">
              {active?.title ?? ""}
            </span>
          </span>
          <ChevronDown
            className={cn(
              "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
              open && "rotate-180"
            )}
            aria-hidden
          />
        </button>

        <div
          id="page-toc"
          className={cn(
            "grid transition-[grid-template-rows] duration-200 ease-out",
            open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          )}
        >
          <nav className="overflow-hidden" aria-label="สารบัญ">
            <div className="border-t border-border/60 px-2 py-2">
              {items.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "block rounded-lg px-3 py-2.5 text-sm transition-colors",
                    item.id === activeId
                      ? "bg-primary/10 font-semibold text-primary"
                      : "text-foreground/80 hover:bg-muted hover:text-foreground"
                  )}
                >
                  {item.title}
                </a>
              ))}
            </div>
          </nav>
        </div>
      </div>
    </div>
  );
}

/** TOC พร้อมรายการหน้าแรก — ใช้ `<HomeToc />` ได้เลย */
export function HomeToc() {
  return <Toc items={homeTocItems} />;
}

/** alias เดิม */
export const SectionToc = Toc;
