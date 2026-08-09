import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FieldDiagramZoom } from "@/components/field-diagram-zoom";
import AsciiGlowBackground from "@/components/AsciiGlowBackground";
import { SectionHeading } from "@/components/section-heading";
import { HomeToc } from "@/components/toc";
import ImageSlider from "@/components/ui/ImageSlider";

export const metadata: Metadata = {
  title: "Rescue Line Robot Challenge",
  description:
    "รายละเอียดการแข่งขัน Rescue Line Robot Challenge สำหรับนักเรียนมัธยมศึกษาปีที่ 1–3",
};

const objectives = [
  "ส่งเสริมการเรียนรู้ด้านหุ่นยนต์และระบบสมองกลฝังตัว",
  "พัฒนาทักษะการเขียนโปรแกรมและการควบคุมหุ่นยนต์อัตโนมัติ",
  "พัฒนาทักษะการทำงานเป็นทีม",
];

const missions = [
  "หุ่นยนต์ต้องเดินตามเส้นสีดำบนสนาม (Line Following)",
  "ผ่าน Check Point ตามลำดับที่กำหนด",
  "ดันกระป๋องจากพื้นที่กู้ภัยไปยังพื้นที่เป้าหมาย (Target Zone) โดยใช้การดันเท่านั้น",
  "กระป๋องต้องไม่ล้มระหว่างการแข่งขัน",
  "เมื่อส่งกระป๋องสำเร็จแล้ว หุ่นยนต์ต้องเดินทางไปยังจุด FINISH เพื่อสิ้นสุดภารกิจ",
];

const retries = [
  "ต้องนำหุ่นยนต์กลับไปเริ่มต้นที่จุด START",
  "เวลาการแข่งขันจะเดินต่อเนื่อง ไม่มีการหยุดเวลา",
  "คะแนนที่ได้รับก่อนหน้ายังคงนับ",
  "หากกระป๋องล้ม จะต้อง Retry เท่านั้น",
  "กระป๋องที่ล้มจะถูกจัดวางกลับในตำแหน่งเริ่มต้นโดยกรรมการ ก่อนเริ่ม Retry",
  "ผู้เข้าแข่งขันห้ามสัมผัสหุ่นยนต์ระหว่างการแข่งขัน หากสัมผัสถือว่า Retry",
];

const equipment = [
  "ใช้ Microcontroller ได้เพียง 1 แผง เช่น Arduino UNO R3, ESP32, POP32i, POP X2 หรือเทียบเท่า",
  "ใช้เซนเซอร์ได้ตามความเหมาะสมในการแข่งขัน",
  "ใช้มอเตอร์ได้ไม่เกิน 4 มอเตอร์",
  "ขนาดหุ่นยนต์เมื่อเริ่มแข่งขันต้องมีขนาดไม่เกิน 200 × 200 มิลลิเมตร (เมื่อขยายเต็มที่) ไม่จำกัดความสูงและน้ำหนัก",
  "ใช้แรงดันไฟฟ้าไม่เกิน 12 โวลต์ (หรือ 13.5 โวลต์ขณะชาร์จเต็ม) หรือใช้ถ่าน AA 1.5V ไม่เกิน 8 ก้อน",
  "ผู้เข้าแข่งขันต้องเตรียมอุปกรณ์สำรองและแหล่งจ่ายไฟมาเอง คณะกรรมการจะไม่รับผิดชอบกรณีอุปกรณ์เสียหาย",
  "ห้ามใช้วิทยุบังคับ รีโมต หรือการสื่อสารไร้สายทุกชนิดระหว่างการแข่งขัน",
];

const steps = [
  "ผู้เข้าแข่งขันรายงานตัว ณ จุดลงทะเบียน",
  "คณะกรรมการตรวจสอบคุณสมบัติของหุ่นยนต์",
  "ชี้แจงกติกาการแข่งขัน",
  "ผู้เข้าแข่งขันมีเวลาประกอบหุ่นยนต์ เขียนโปรแกรม และทดสอบสนาม 2 ชั่วโมง",
  "เมื่อหมดเวลาต้องนำหุ่นยนต์เข้าตรวจสอบ",
  "เมื่อถูกเรียกแข่งขัน มีเวลา Setup หุ่นยนต์ 2 นาที",
  "เวลาแข่งขันต่อรอบ 3 นาที",
  "ระหว่างรอรอบแข่งขัน สามารถปรับแต่งหรือซ่อมหุ่นยนต์ได้",
  "หากหุ่นยนต์เสียหายระหว่างการแข่งขัน สามารถซ่อมได้ แต่เวลาการแข่งขันจะไม่หยุด และห้ามอัปโหลดโปรแกรมใหม่",
];

const rules = [
  "ผู้เข้าแข่งขันมีเวลา 2 ชั่วโมง สำหรับประกอบหุ่นยนต์และเขียนโปรแกรม และมีเวลา 2 นาที สำหรับตั้งค่าหุ่นยนต์ก่อนเริ่มการแข่งขัน",
  "เมื่อเริ่มการแข่งขัน ห้ามผู้เข้าแข่งขันสัมผัสหุ่นยนต์ หากมีการสัมผัสหุ่นยนต์ระหว่างการแข่งขัน จะถูกบังคับให้ Retry โดยนำหุ่นยนต์กลับไปเริ่มต้นที่จุด START และเวลาการแข่งขันจะยังคงเดินต่อเนื่อง",
  "หุ่นยนต์ต้องเคลื่อนที่เดินตามเส้นที่กำหนด จากจุด START ไปยังจุดปฏิบัติภารกิจ และต้องไม่ออกนอกเส้นทางการแข่งขัน หากหุ่นยนต์หลุดเส้นจนไม่สามารถกลับเข้าสู่เส้นทางได้ กรรมการสามารถสั่ง Retry ได้",
  "เมื่อถึงพื้นที่ปฏิบัติภารกิจ หุ่นยนต์ต้องดันกระป๋องจากจุดเริ่มต้นไปยังพื้นที่เป้าหมาย (Target Zone) โดยใช้การดันเท่านั้น",
  "ระหว่างการดันกระป๋อง กระป๋องต้องไม่ล้ม หากกระป๋องล้ม ไม่ว่าจะเกิดจากการชนหรือการควบคุมของหุ่นยนต์ จะถือว่าภารกิจไม่สำเร็จ และทีมต้อง Retry โดยเริ่มต้นใหม่จากจุด START ทั้งนี้ เวลาการแข่งขันจะไม่หยุด",
  "เมื่อดันกระป๋องเข้าสู่พื้นที่เป้าหมายสำเร็จ หุ่นยนต์ต้องเคลื่อนที่ไปยังจุด FINISH เพื่อจบภารกิจ",
  "การแข่งขันแต่ละทีมมี 2 รอบ และใช้คะแนนที่ดีที่สุดในการจัดอันดับ",
];

const scores = [
  { item: "ผ่าน Check Point", points: "+15 คะแนน / จุด" },
  { item: "ดันกระป๋องเข้าพื้นที่เป้าหมายโดยไม่ล้ม", points: "+30 คะแนน" },
  { item: "เดินทางถึงจุด FINISH", points: "+25 คะแนน" },
];

const equipmentSlides = [
  {
    id: "rover-iso",
    image: "/src/image/POP-X2-Rover-ISO.png",
    title: "POP-X2 Rover",
  },
  {
    id: "pop-x2",
    image: "/src/image/POP-X2-with-Battery-Holder-1003x1024.jpg",
    title: "บอร์ดควบคุม POP-X2",
  },
  {
    id: "robot",
    image: "/src/image/robot.png",
    title: "ตัวอย่างหุ่นยนต์แข่งขัน",
  },
];

const awards = [
  { place: "ชนะเลิศ", prize: "เกียรติบัตร พร้อมทุนการศึกษา" },
  { place: "รองชนะเลิศอันดับ 1", prize: "เกียรติบัตร พร้อมทุนการศึกษา" },
  { place: "รองชนะเลิศอันดับ 2", prize: "เกียรติบัตร พร้อมทุนการศึกษา" },
  { place: "ชมเชย", prize: "เกียรติบัตร" },
];

function NumberedList({ items }: { items: string[] }) {
  return (
    <ol className="mt-8 space-y-4">
      {items.map((item, index) => (
        <li key={item} className="flex gap-3 sm:gap-4">
          <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
            {index + 1}
          </span>
          <p className="text-sm leading-relaxed text-foreground/90 sm:text-base">
            {item}
          </p>
        </li>
      ))}
    </ol>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="mt-5 space-y-3">
      {items.map((item) => (
        <li
          key={item}
          className="flex gap-3 text-sm leading-relaxed text-foreground/90 sm:text-base"
        >
          <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function HomePage() {
  return (
    <>
      <HomeToc />
      <section
        className="hero-plane relative min-h-svh overflow-hidden text-white"
        style={
          {
            "--background": "#07122b",
            "--foreground": "#e2ecff",
          } as React.CSSProperties
        }
      >
        <div className="absolute inset-0">
          <AsciiGlowBackground mode="panel" />
        </div>

        {/* Blur gradient: strong at bottom → clear at top, ASCII still visible */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[75%] backdrop-blur-[2px]"
          style={{
            WebkitMaskImage:
              "linear-gradient(to top, black 0%, black 35%, transparent 100%)",
            maskImage:
              "linear-gradient(to top, black 0%, black 35%, transparent 100%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%] backdrop-blur-md"
          style={{
            WebkitMaskImage:
              "linear-gradient(to top, black 0%, black 25%, transparent 100%)",
            maskImage:
              "linear-gradient(to top, black 0%, black 25%, transparent 100%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[35%] backdrop-blur-xl"
          style={{
            WebkitMaskImage:
              "linear-gradient(to top, black 0%, black 40%, transparent 100%)",
            maskImage:
              "linear-gradient(to top, black 0%, black 40%, transparent 100%)",
          }}
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#07122b]/90 via-[#07122b]/35 to-transparent" />

        <div className="relative mx-auto flex min-h-svh w-full max-w-6xl flex-col justify-end px-5 pb-14 pt-28 sm:px-8 sm:pb-20 sm:pt-32 lg:pb-24">
          <div className="grid items-end gap-8 sm:gap-10 lg:grid-cols-[1.35fr_0.85fr] lg:gap-16">
            <div className="min-w-0">
              <p className="animate-fade-up font-heading text-[2.35rem] font-semibold leading-[1.1] tracking-tight text-white break-words sm:text-6xl md:text-7xl lg:text-8xl">
                Rescue Line Robot Challenge
              </p>
              <h1 className="animate-fade-up-delay mt-4 max-w-xl text-lg font-medium leading-snug text-white/95 sm:text-2xl md:text-3xl">
                กิจกรรมวันวิทยาศาสตร์และเทคโนโลยี
                <br />
                วันครบรอบ 125 ปี มูลนิธิเซนต์คาเบรียล
              </h1>
              <div className="animate-fade-up-delay-2 mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Button
                  size="lg"
                  className="w-full rounded-full bg-white px-6 text-blue-950 hover:bg-white/90 sm:w-auto"
                  render={<Link href="/register" />}
                  nativeButton={false}
                >
                  ลงทะเบียนแข่งขัน
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full rounded-full border-white/35 bg-white/5 px-6 text-white backdrop-blur-sm hover:bg-white/15 hover:text-white sm:w-auto"
                  render={<a href="#objectives" />}
                  nativeButton={false}
                >
                  ดูรายละเอียด
                </Button>
              </div>
            </div>

            <p className="animate-fade-up-delay-2 hidden max-w-sm text-sm leading-relaxed text-white/70 sm:block sm:text-base lg:justify-self-end lg:text-right">
              การแข่งขันหุ่นยนต์เดินตามเส้นและกู้ภัย
              สำหรับนักเรียนมัธยมศึกษาปีที่ 1–3
              แข่งเป็นทีม ทีมละ 3 คน
            </p>
          </div>
        </div>
      </section>

      <section
        id="objectives"
        className="mx-auto w-full max-w-6xl scroll-mt-28 px-5 py-14 sm:px-8 sm:py-20"
      >
        <SectionHeading
          title="วัตถุประสงค์"
          description="มุ่งพัฒนาความรู้ ทักษะ และการทำงานร่วมกันผ่านการแข่งขันหุ่นยนต์อัตโนมัติ"
        />
        <NumberedList items={objectives} />
      </section>

      <Separator className="mx-auto max-w-6xl" />

      <section
        id="schedule"
        className="mx-auto w-full max-w-6xl scroll-mt-28 px-5 py-14 sm:px-8 sm:py-20"
      >
        <SectionHeading
          title="กำหนดการ"
          description="กำหนดการแข่งขัน Rescue Line Robot Challenge ปีการศึกษา 2569"
        />

        <div className="mt-8 overflow-x-auto rounded-xl border border-border sm:mt-10">
          <table className="w-full min-w-[32rem] border-collapse text-left text-sm sm:text-base">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 font-heading font-semibold text-foreground sm:px-5">
                  วันที่
                </th>
                <th className="px-4 py-3 font-heading font-semibold text-foreground sm:px-5">
                  กิจกรรม
                </th>
                <th className="px-4 py-3 font-heading font-semibold text-foreground sm:px-5">
                  สถานที่ / รายละเอียด
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border">
                <td className="px-4 py-4 align-top font-medium text-foreground whitespace-nowrap sm:px-5">
                  3–7 สิงหาคม 2569
                </td>
                <td className="px-4 py-4 align-top text-foreground/90 sm:px-5">
                  เปิดรับสมัครออนไลน์
                </td>
                <td className="px-4 py-4 align-top text-muted-foreground sm:px-5">
                  ผ่านเว็บไซต์นี้
                </td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-4 py-4 align-top font-medium text-foreground whitespace-nowrap sm:px-5">
                  11 สิงหาคม 2569
                </td>
                <td className="px-4 py-4 align-top text-foreground/90 sm:px-5">
                  Workshop ชี้แจงกติกา และประกอบหุ่นยนต์
                </td>
                <td className="px-4 py-4 align-top text-muted-foreground sm:px-5">
                  ห้อง AI and Robotics
                </td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-4 py-4 align-top font-medium text-foreground whitespace-nowrap sm:px-5">
                  13 สิงหาคม 2569
                </td>
                <td className="px-4 py-4 align-top text-foreground/90 sm:px-5">
                  Workshop การเขียนโค้ดและ functions
                </td>
                <td className="px-4 py-4 align-top text-muted-foreground sm:px-5">
                  ห้อง AI and Robotics
                </td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-4 py-4 align-top font-medium text-foreground whitespace-nowrap sm:px-5">
                  17 สิงหาคม 2569
                </td>
                <td className="px-4 py-4 align-top text-foreground/90 sm:px-5">
                  คัดเลือกครั้งที่ 1
                </td>
                <td className="px-4 py-4 align-top text-muted-foreground sm:px-5">
                  ห้อง AI and Robotics
                </td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-4 py-4 align-top font-medium text-foreground whitespace-nowrap sm:px-5">
                  18 สิงหาคม 2569
                </td>
                <td className="px-4 py-4 align-top text-foreground/90 sm:px-5">
                  คัดเลือกครั้งที่ 2
                </td>
                <td className="px-4 py-4 align-top text-muted-foreground sm:px-5">
                  ห้อง AI and Robotics
                </td>
              </tr>
              <tr>
                <td className="px-4 py-4 align-top font-medium text-foreground whitespace-nowrap sm:px-5">
                  31 สิงหาคม 2569
                </td>
                <td className="px-4 py-4 align-top text-foreground/90 sm:px-5">
                  รอบรอง และรอบชิงชนะเลิศ
                </td>
                <td className="px-4 py-4 align-top text-muted-foreground sm:px-5">
                  หอประชุม De Montfort Hall
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          หมายเหตุ : เปิดรับสมัคร 10 ทีม เมื่อครบจำนวนแล้วจะปิดรับสมัครทันที
        </p>

        <div className="mt-10 grid gap-10 sm:mt-12 md:grid-cols-2 md:gap-12">
          <div>
            <h3 className="font-heading text-lg font-semibold sm:text-xl">
              ระดับการแข่งขัน
            </h3>
            <dl className="mt-5 space-y-5">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  ระดับชั้น
                </dt>
                <dd className="mt-1 text-base font-medium text-foreground sm:text-lg">
                  มัธยมศึกษาปีที่ 1–3
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  รูปแบบ
                </dt>
                <dd className="mt-1 text-base font-medium text-foreground sm:text-lg">
                  แข่งขันเป็นทีม ทีมละ 3 คน
                </dd>
              </div>
            </dl>
          </div>
          <div>
            <h3 className="font-heading text-lg font-semibold sm:text-xl">
              สรุปรอบการแข่งขัน
            </h3>
            <dl className="mt-5 space-y-5">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Workshop / คัดเลือก
                </dt>
                <dd className="mt-1 text-base font-medium text-foreground sm:text-lg">
                  11–18 ส.ค. ณ ห้อง AI and Robotics
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  รอบรองและชิงชนะเลิศ
                </dt>
                <dd className="mt-1 text-base font-medium text-foreground sm:text-lg">
                  31 ส.ค. ณ หอประชุม De Montfort Hall
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <section
        id="field"
        className="scroll-mt-28 border-y border-border bg-muted/40 py-14 sm:py-20"
      >
        <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
          <SectionHeading
            title="ภาพจำลองสนามแข่งขัน"
            description="หุ่นยนต์เริ่มที่จุด START เดินตามเส้นสีดำผ่านทางแยกและจุดตรวจสอบ ไปยังพื้นที่เป้าหมายสีแดง เขียว หรือเหลือง"
            tone="muted"
          />
          <div className="mt-10">
            <FieldDiagramZoom />
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              หมายเหตุ : สนามอาจมีการเปลี่ยนแปลง แต่คงรูปแบบการแข่งขันไว้
            </p>
          </div>
        </div>
      </section>

      <section
        id="format"
        className="mx-auto w-full max-w-6xl scroll-mt-28 px-5 py-14 sm:px-8 sm:py-20"
      >
        <SectionHeading
          title="รูปแบบการแข่งขัน"
          description="หุ่นยนต์เริ่มต้นที่จุด START และเคลื่อนที่ตามเส้นทางที่กำหนดไปยังพื้นที่กู้ภัย"
        />

        <div className="mt-10 grid gap-10 sm:mt-12 sm:gap-14 lg:grid-cols-2">
          <div>
            <h3 className="font-heading text-lg font-semibold sm:text-xl">
              ภารกิจ
            </h3>
            <BulletList items={missions} />
          </div>
          <div>
            <h3 className="font-heading text-lg font-semibold sm:text-xl">
              การ Retry
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              ผู้เข้าแข่งขันสามารถ Retry ได้ โดยมีเงื่อนไขดังนี้
            </p>
            <BulletList items={retries} />
          </div>
        </div>
      </section>

      <Separator className="mx-auto max-w-6xl" />

      <section
        id="equipment"
        className="mx-auto w-full max-w-6xl scroll-mt-28 px-5 py-14 sm:px-8 sm:py-20"
      >
        <SectionHeading
          title="อุปกรณ์"
          description="ผู้เข้าแข่งขันออกแบบและสร้างหุ่นยนต์ขึ้นเอง โดยมีคุณสมบัติดังนี้"
        />
        <div className="mt-10 aspect-[16/10] overflow-hidden rounded-2xl border border-border bg-muted/40 sm:mt-12 sm:aspect-[21/9]">
          <ImageSlider
            slides={equipmentSlides}
            autoPlay
            interval={4500}
            overlayClassName="bg-transparent"
            imageClassName="object-contain p-4 sm:p-8"
          />
        </div>
        <div className="mt-8">
          <NumberedList items={equipment} />
        </div>
      </section>

      <section
        id="steps"
        className="scroll-mt-28 border-y border-border bg-muted/40 py-14 sm:py-20"
      >
        <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
          <SectionHeading title="ขั้นตอนการแข่งขัน" tone="muted" />
          <NumberedList items={steps} />
        </div>
      </section>

      <section
        id="rules"
        className="mx-auto w-full max-w-6xl scroll-mt-28 px-5 py-14 sm:px-8 sm:py-20"
      >
        <SectionHeading title="กติกาการแข่งขัน" />
        <NumberedList items={rules} />
      </section>

      <Separator className="mx-auto max-w-6xl" />

      <section
        id="scoring"
        className="mx-auto w-full max-w-6xl scroll-mt-28 px-5 py-14 sm:px-8 sm:py-20"
      >
        <SectionHeading
          title="การตัดสิน"
          description="ใช้คะแนนที่ดีที่สุดจาก 2 รอบในการจัดอันดับ"
        />
        <div className="mt-8 overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[20rem] text-left text-sm">
            <thead className="bg-muted/60">
              <tr>
                <th className="px-4 py-3.5 font-semibold text-foreground sm:px-5">
                  รายการ
                </th>
                <th className="px-4 py-3.5 font-semibold whitespace-nowrap text-foreground sm:px-5">
                  คะแนน
                </th>
              </tr>
            </thead>
            <tbody>
              {scores.map((row) => (
                <tr
                  key={row.item}
                  className="border-t border-border even:bg-muted/25"
                >
                  <td className="px-4 py-4 text-foreground/90 sm:px-5">
                    {row.item}
                  </td>
                  <td className="px-4 py-4 font-medium whitespace-nowrap text-primary sm:px-5">
                    {row.points}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section
        id="awards"
        className="scroll-mt-28 border-t border-border bg-muted/40 py-14 sm:py-20"
      >
        <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
          <SectionHeading title="รางวัล" tone="muted" />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {awards.map((award) => (
              <div key={award.place} className="border-l-2 border-primary pl-4">
                <h3 className="font-heading text-lg font-semibold">
                  {award.place}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {award.prize}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-col items-stretch gap-4 sm:mt-16 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-heading text-xl font-semibold sm:text-2xl">
                พร้อมลงสนามหรือยัง?
              </h3>
              <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                สมัครทีมละ 3 คน สำหรับระดับ ม.1–3
              </p>
            </div>
            <Button
              size="lg"
              className="w-full sm:w-auto"
              render={<Link href="/register" />}
              nativeButton={false}
            >
              ลงทะเบียนแข่งขัน
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
