import Link from "next/link";
import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getTeamsPublic } from "@/lib/google-sheets";

function FooterAccordion({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="border-t border-primary-foreground/10 pt-4 md:border-0 md:pt-0">
      <details className="group md:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between py-1 text-sm font-semibold tracking-wide [&::-webkit-details-marker]:hidden">
          {title}
          <ChevronDown
            className="size-4 shrink-0 text-footer-muted transition-transform duration-200 group-open:rotate-180"
            aria-hidden
          />
        </summary>
        <div className="mt-3 pb-1">{children}</div>
      </details>

      <div className="hidden md:block">
        <p className="text-sm font-semibold tracking-wide">{title}</p>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}

export async function Footer() {
  const teamsPublic = await getTeamsPublic();

  return (
    <footer className="relative z-0 mt-auto bg-footer pt-16 text-primary-foreground sm:pt-20">
      <div className="mx-auto grid w-full max-w-6xl gap-6 px-5 pb-10 pt-4 sm:px-8 sm:pb-12 md:grid-cols-[1.4fr_1fr_1fr] md:gap-10">
        <div>
          <p className="font-heading text-lg font-semibold tracking-tight sm:text-xl">
            Rescue Line Robot Challenge
          </p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-footer-muted">
            การแข่งขันหุ่นยนต์ Rescue Line Robot Challenge
            สำหรับนักเรียนมัธยมศึกษาปีที่ 1–3
          </p>
        </div>

        <FooterAccordion title="เมนู">
          <ul className="space-y-2 text-sm text-footer-muted">
            <li>
              <Button
                variant="link"
                size="sm"
                className="h-auto p-0 text-footer-muted hover:text-primary-foreground"
                render={<Link href="/" />}
                nativeButton={false}
              >
                หน้าแรก
              </Button>
            </li>
            {teamsPublic ? (
              <li>
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-footer-muted hover:text-primary-foreground"
                  render={<Link href="/teams" />}
                  nativeButton={false}
                >
                  ประกาศรายชื่อทีม
                </Button>
              </li>
            ) : null}
            <li>
              <Button
                variant="link"
                size="sm"
                className="h-auto p-0 text-footer-muted hover:text-primary-foreground"
                render={<Link href="/register" />}
                nativeButton={false}
              >
                ลงทะเบียน
              </Button>
            </li>
          </ul>
        </FooterAccordion>

        <FooterAccordion title="ติดต่อ">
          <ul className="space-y-2 text-sm text-footer-muted">
            <li>ห้อง AI and Robotics</li>
            <li>Saint Gabriel&apos;s College, Dusit, Bangkok</li>
          </ul>
        </FooterAccordion>
      </div>

      <Separator className="bg-primary-foreground/10" />
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-5 py-5 text-xs text-footer-muted sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p>
          © {new Date().getFullYear()} Occupations and Technology
          <br />
          Saint Gabriel&apos;s College
        </p>
        <p>Made by Master Aekkarat Wongchalee</p>
      </div>
    </footer>
  );
}
