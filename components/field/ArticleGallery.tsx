"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export type ArticleGalleryItem = {
  src: string;
  caption?: string;
};

function ArrowPrevIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M5.78125 0.547852L1.09828 5.23082L5.78125 9.9138" stroke="black" strokeWidth="1.5494" />
      <path d="M0.934869 5.24609L10.7578 5.24609" stroke="black" strokeWidth="1.5494" />
    </svg>
  );
}

function ArrowNextIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M4.97656 9.91406L9.65954 5.23109L4.97656 0.548117" stroke="black" strokeWidth="1.5494" />
      <path d="M9.82294 5.21582L0 5.21582" stroke="black" strokeWidth="1.5494" />
    </svg>
  );
}

export function ArticleGallery({
  items,
  className,
}: {
  items: ArticleGalleryItem[];
  className?: string;
}) {
  const slides = React.useMemo(
    () => items.filter((item) => (item.src ?? "").trim().length > 0),
    [items]
  );
  const [index, setIndex] = React.useState(0);
  const thumbsRef = React.useRef<HTMLDivElement>(null);
  const touchStartX = React.useRef<number | null>(null);

  React.useEffect(() => {
    if (index >= slides.length) setIndex(0);
  }, [index, slides.length]);

  React.useEffect(() => {
    const root = thumbsRef.current;
    if (!root) return;
    const active = root.querySelector<HTMLElement>(`[data-thumb-index="${index}"]`);
    active?.scrollIntoView({ behavior: "smooth", inline: "nearest", block: "nearest" });
  }, [index]);

  if (!slides.length) return null;

  const atStart = index <= 0;
  const atEnd = index >= slides.length - 1;

  const goPrev = () => {
    if (atStart) return;
    setIndex((prev) => prev - 1);
  };
  const goNext = () => {
    if (atEnd) return;
    setIndex((prev) => prev + 1);
  };

  return (
    <div className={cn("gallery-thumbnail-slider mb-12 w-full", className)}>
      {/* Main stage — matches Chula swiper-thumbnail-slider */}
      <div
        className="relative mb-3 overflow-hidden rounded-2xl"
        onTouchStart={(e) => {
          touchStartX.current = e.touches[0]?.clientX ?? null;
        }}
        onTouchEnd={(e) => {
          const start = touchStartX.current;
          touchStartX.current = null;
          if (start == null) return;
          const end = e.changedTouches[0]?.clientX;
          if (end == null) return;
          const dx = end - start;
          if (Math.abs(dx) < 48) return;
          if (dx < 0) goNext();
          else goPrev();
        }}
      >
        <div className="relative block w-full">
          {slides.map((item, i) => {
            const active = i === index;
            return (
              <div
                key={`${item.src}-${i}`}
                className={cn(
                  "w-full transition-opacity duration-300",
                  active ? "relative opacity-100" : "pointer-events-none absolute inset-0 opacity-0"
                )}
                aria-hidden={!active}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.src.trim()}
                  alt={(item.caption || `gallery image ${i + 1}`).slice(0, 200)}
                  className="w-full object-cover"
                  style={{ aspectRatio: "16 / 9" }}
                />
              </div>
            );
          })}
        </div>

        {slides.length > 1 ? (
          <>
            <button
              type="button"
              onClick={goPrev}
              disabled={atStart}
              aria-label="Previous slide"
              className={cn(
                "absolute left-6 top-1/2 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-full border border-black/10 bg-white",
                atStart && "pointer-events-none opacity-40"
              )}
            >
              <ArrowPrevIcon />
            </button>
            <button
              type="button"
              onClick={goNext}
              disabled={atEnd}
              aria-label="Next slide"
              className={cn(
                "absolute right-6 top-1/2 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-full border border-black/10 bg-white",
                atEnd && "pointer-events-none opacity-40"
              )}
            >
              <ArrowNextIcon />
            </button>
          </>
        ) : null}

        {slides[index]?.caption ? (
          <p className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/50 to-transparent px-4 pb-3 pt-8 text-center text-sm text-white">
            {slides[index]!.caption}
          </p>
        ) : null}
      </div>

      {/* Thumb strip — matches Chula swiper-thumbnail-slider-nav */}
      {slides.length > 1 ? (
        <div
          ref={thumbsRef}
          className="flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="tablist"
          aria-label="แกลเลอรีรูปภาพ"
        >
          {slides.map((item, i) => {
            const active = i === index;
            return (
              <button
                key={`thumb-${item.src}-${i}`}
                type="button"
                role="tab"
                aria-selected={active}
                data-thumb-index={i}
                onClick={() => setIndex(i)}
                className={cn(
                  "w-full min-w-[116px] max-w-[160px] flex-[1_0_116px] cursor-pointer overflow-hidden rounded-lg",
                  active ? "opacity-100" : "opacity-60 hover:opacity-90"
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.src.trim()}
                  alt={(item.caption || `thumbnail ${i + 1}`).slice(0, 120)}
                  height={90}
                  className="h-[90px] max-h-[90px] w-full object-cover lg:max-h-[90px]"
                />
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
