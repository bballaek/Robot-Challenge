"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MenuIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const allNavItems = [
  { href: "/", label: "หน้าแรก" },
  { href: "/#objectives", label: "รายละเอียดการแข่งขัน" },
  { href: "/teams", label: "ประกาศรายชื่อทีม", requiresTeamsPublic: true },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [teamsPublic, setTeamsPublic] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const onChange = () => {
      if (mq.matches) setOpen(false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data: { teamsPublic?: boolean }) => {
        if (typeof data.teamsPublic === "boolean") {
          setTeamsPublic(data.teamsPublic);
        }
      })
      .catch(() => {
        // ถ้าโหลดไม่ได้ ให้แสดงเมนูตามค่าเริ่มต้น
      });
  }, [pathname]);

  const navItems = allNavItems.filter(
    (item) => !item.requiresTeamsPublic || teamsPublic
  );

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6 sm:pt-6">
      <div className="pointer-events-auto relative mx-auto w-full max-w-3xl">
        <div className="flex w-full items-center justify-between gap-2 rounded-full border border-white/20 bg-zinc-950/35 px-2 py-2 shadow-[0_8px_40px_rgba(0,0,0,0.2)] backdrop-blur-2xl supports-backdrop-filter:bg-zinc-950/25">
          <div className="flex min-w-0 flex-1 items-center gap-1 md:gap-2">
            <Link
              href="/"
              className="relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white shadow-sm transition-opacity hover:opacity-90"
              aria-label="Saint Gabriel's College — From Robot"
              onClick={() => setOpen(false)}
            >
              <Image
                src="/src/image/SG-Emblem-Blue-EN.png"
                alt="Saint Gabriel's College"
                width={36}
                height={36}
                className="size-9 object-cover"
                priority
              />
            </Link>

            <nav
              className="hidden min-w-0 items-center gap-0.5 md:flex"
              aria-label="เมนูหลัก"
            >
              {navItems.map((item) => (
                <Button
                  key={item.href}
                  variant="ghost"
                  size="sm"
                  className="rounded-full px-2.5 text-white/90 hover:bg-white/10 hover:text-white lg:px-3"
                  render={<Link href={item.href} />}
                  nativeButton={false}
                >
                  {item.label}
                </Button>
              ))}
            </nav>
          </div>

          <Button
            size="sm"
            className="hidden h-9 shrink-0 rounded-full bg-white px-4 text-zinc-950 hover:bg-white/90 md:inline-flex"
            render={<Link href="/register" />}
            nativeButton={false}
          >
            ลงทะเบียน
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 rounded-full text-white hover:bg-white/10 hover:text-white md:hidden"
            aria-label={open ? "ปิดเมนู" : "เปิดเมนู"}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((prev) => !prev)}
          >
            {open ? <XIcon /> : <MenuIcon />}
          </Button>
        </div>

        <div
          id="mobile-nav"
          className={cn(
            "md:hidden transition-[opacity,transform,margin] duration-300 ease-out",
            open
              ? "relative mt-2 translate-y-0 opacity-100"
              : "pointer-events-none absolute inset-x-0 top-full mt-0 -translate-y-2 opacity-0"
          )}
        >
          <nav
            aria-label="เมนูมือถือ"
            className="rounded-[1.75rem] border border-white/20 bg-zinc-950/55 p-3 shadow-[0_12px_40px_rgba(0,0,0,0.28)] backdrop-blur-2xl supports-backdrop-filter:bg-zinc-950/40"
          >
            <div className="flex flex-col gap-1">
              {navItems.map((item) => (
                <Button
                  key={item.href}
                  variant="ghost"
                  className="justify-start rounded-full text-white/90 hover:bg-white/10 hover:text-white"
                  render={<Link href={item.href} />}
                  nativeButton={false}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Button>
              ))}
              <Separator className="my-2 bg-white/10" />
              <Button
                className="rounded-full bg-white text-zinc-950 hover:bg-white/90"
                render={<Link href="/register" />}
                nativeButton={false}
                onClick={() => setOpen(false)}
              >
                ลงทะเบียน
              </Button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
