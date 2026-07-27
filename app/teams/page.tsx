import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isSheetsConfigured, listTeams, getTeamsPublic } from "@/lib/google-sheets";

export const metadata: Metadata = {
  title: "ประกาศรายชื่อทีม",
  description:
    "ประกาศรายชื่อทีมที่ผ่านการลงทะเบียนแข่งขัน Rescue Line Robot Challenge",
};

export const dynamic = "force-dynamic";

export default async function TeamsPage() {
  const teamsPublic = await getTeamsPublic();

  if (!teamsPublic) {
    return (
      <section className="mx-auto w-full max-w-3xl flex-1 px-5 py-24 sm:px-8 sm:py-28">
        <div className="max-w-2xl">
          <p className="text-sm font-medium tracking-wide text-primary">
            Rescue Line Robot Challenge
          </p>
          <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            ประกาศรายชื่อทีม
          </h1>
        </div>
        <div className="mt-10 rounded-2xl border border-dashed border-border bg-muted/30 px-5 py-12 text-center sm:mt-12 sm:px-6 sm:py-16">
          <h2 className="font-heading text-xl font-semibold">
            ยังไม่เปิดประกาศรายชื่อ
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
            รายชื่อทีมจะประกาศที่นี่เมื่อถึงกำหนด
            โปรดติดตามอีกครั้งในภายหลัง
          </p>
          <Button
            className="mt-6 w-full rounded-full sm:w-auto"
            render={<Link href="/" />}
            nativeButton={false}
          >
            กลับหน้าแรก
          </Button>
        </div>
      </section>
    );
  }

  let teams: Awaited<ReturnType<typeof listTeams>> = [];
  let loadError = false;

  if (isSheetsConfigured()) {
    try {
      teams = await listTeams();
    } catch (error) {
      console.error("[teams]", error);
      loadError = true;
    }
  }

  return (
    <section className="mx-auto w-full max-w-3xl flex-1 px-5 py-24 sm:px-8 sm:py-28">
      <div className="max-w-2xl">
        <p className="text-sm font-medium tracking-wide text-primary">
          Rescue Line Robot Challenge
        </p>
        <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          ประกาศรายชื่อทีม
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
          รายชื่อทีมที่ผ่านการลงทะเบียนและได้รับสิทธิ์เข้าร่วมการแข่งขัน
        </p>
      </div>

      {loadError ? (
        <div className="mt-10 rounded-2xl border border-dashed border-destructive/40 bg-destructive/5 px-5 py-12 text-center sm:mt-12 sm:px-6 sm:py-16">
          <h2 className="font-heading text-xl font-semibold">
            โหลดรายชื่อไม่สำเร็จ
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
            ไม่สามารถดึงข้อมูลจาก Google Sheets ได้ในขณะนี้
            โปรดลองใหม่อีกครั้งในภายหลัง
          </p>
        </div>
      ) : teams.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-border bg-muted/30 px-5 py-12 text-center sm:mt-12 sm:px-6 sm:py-16">
          <h2 className="font-heading text-xl font-semibold">
            ยังไม่มีการประกาศรายชื่อ
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
            {isSheetsConfigured()
              ? "ยังไม่มีทีมลงทะเบียน หรือรายชื่อจะปรากฏหลังมีการสมัคร"
              : "ระบบยังไม่ได้เชื่อม Google Sheets — ตั้งค่าใน .env ก่อนใช้งาน"}
          </p>
          <Button
            className="mt-6 w-full sm:w-auto"
            render={<Link href="/register" />}
            nativeButton={false}
          >
            ไปหน้าลงทะเบียน
          </Button>
        </div>
      ) : (
        <div className="mt-10 divide-y divide-border overflow-hidden rounded-xl border border-border sm:mt-12">
          {teams.map((team, index) => (
            <details
              key={`${team.name}-${team.registeredAt}-${index}`}
              className="group bg-card open:bg-muted/20"
            >
              <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-4 sm:gap-4 sm:px-5 [&::-webkit-details-marker]:hidden">
                <span className="w-5 shrink-0 text-sm font-medium text-muted-foreground sm:w-6">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-heading text-sm font-semibold text-foreground sm:text-base">
                    {team.name}
                  </p>
                  <p className="mt-0.5 text-xs text-primary sm:text-sm">
                    {team.grade}
                    {team.registrationCode
                      ? ` · ${team.registrationCode}`
                      : ""}
                  </p>
                </div>
                <ChevronDown
                  className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180"
                  aria-hidden
                />
              </summary>
              <div className="border-t border-border px-4 pb-4 pt-3 sm:px-5 sm:pl-[3.25rem]">
                <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground">
                  สมาชิก
                </p>
                <ul className="space-y-1.5 text-sm text-foreground/90">
                  {team.members.map((member, memberIndex) => (
                    <li
                      key={`${team.name}-${memberIndex}-${member}`}
                      className="break-words"
                    >
                      {member}
                    </li>
                  ))}
                </ul>
              </div>
            </details>
          ))}
        </div>
      )}
    </section>
  );
}
