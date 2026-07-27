"use client";

import { ZoomInIcon } from "lucide-react";
import { FieldDiagram } from "@/components/field-diagram";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function FieldDiagramZoom() {
  return (
    <Dialog>
      <DialogTrigger
        className="group relative block w-full cursor-zoom-in rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        aria-label="ขยายภาพจำลองสนามแข่งขัน"
      >
        <FieldDiagram />
        <span className="absolute right-2 bottom-2 flex items-center gap-1.5 rounded-full bg-foreground/80 px-2.5 py-1 text-[11px] font-medium text-background opacity-100 transition-opacity sm:right-3 sm:bottom-3 sm:px-3 sm:py-1.5 sm:text-xs sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-visible:opacity-100">
          <ZoomInIcon className="size-3.5" />
          คลิกเพื่อขยาย
        </span>
      </DialogTrigger>
      <DialogContent
        showCloseButton
        className="fixed inset-0 top-0 left-0 flex h-svh max-h-svh w-screen max-w-none translate-x-0 translate-y-0 flex-col gap-0 overflow-auto rounded-none bg-background p-4 ring-0 sm:max-w-none sm:p-8 data-open:zoom-in-100 data-closed:zoom-out-100"
      >
        <DialogTitle className="sr-only">
          ภาพจำลองสนามแข่งขัน Rescue Line Robot Challenge
        </DialogTitle>
        <div className="flex min-h-0 flex-1 items-center justify-center">
          <div className="w-full max-w-6xl">
            <FieldDiagram />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
