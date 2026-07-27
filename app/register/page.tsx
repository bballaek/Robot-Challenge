import type { Metadata } from "next";
import Link from "next/link";

import { RegisterForm } from "@/components/register-form";
import { Button } from "@/components/ui/button";
import { getRegistrationOpen, getTeamsPublic } from "@/lib/google-sheets";

export const metadata: Metadata = {
  title: "ลงทะเบียน",
  description:
    "ลงทะเบียนทีมแข่งขัน Rescue Line Robot Challenge — กรอกชื่อทีมและข้อมูลสมาชิก 3 คน",
};

export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  const [registrationOpen, teamsPublic] = await Promise.all([
    getRegistrationOpen(),
    getTeamsPublic(),
  ]);

  return (
    <section className="mx-auto w-full max-w-3xl flex-1 px-5 py-24 sm:px-8 sm:py-28">
      <div className="mb-8 max-w-2xl sm:mb-10">
        <p className="text-sm font-medium tracking-wide text-primary">
          Rescue Line Robot Challenge
        </p>
        <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          ลงทะเบียนแข่งขัน
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
          กรอกชื่อทีมและข้อมูลสมาชิกทั้ง 3 คน ให้ครบถ้วนก่อนส่งใบลงทะเบียน
        </p>
      </div>

      {registrationOpen ? (
        <RegisterForm />
      ) : (
        <div className="rounded-2xl border border-dashed border-border bg-muted/30 px-5 py-12 text-center sm:px-6 sm:py-16">
          <h2 className="font-heading text-xl font-semibold">
            ปิดรับสมัครแล้ว
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
            ขณะนี้ปิดรับลงทะเบียนทีมแข่งขัน
            {teamsPublic
              ? " ติดตามประกาศรายชื่อทีมที่ผ่านการลงทะเบียนได้ที่หน้าประกาศ"
              : " โปรดติดตามประกาศจากทางโรงเรียนอีกครั้ง"}
          </p>
          {teamsPublic ? (
            <Button
              className="mt-6 w-full rounded-full sm:w-auto"
              render={<Link href="/teams" />}
              nativeButton={false}
            >
              ดูประกาศรายชื่อทีม
            </Button>
          ) : (
            <Button
              className="mt-6 w-full rounded-full sm:w-auto"
              render={<Link href="/" />}
              nativeButton={false}
            >
              กลับหน้าแรก
            </Button>
          )}
        </div>
      )}
    </section>
  );
}
