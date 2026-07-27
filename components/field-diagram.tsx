import Image from "next/image";

export function FieldDiagram() {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-white">
      <Image
        src="/src/image/g5.jpg"
        alt="ภาพจำลองสนามแข่งขัน Rescue Line Robot Challenge"
        width={1600}
        height={700}
        className="h-auto w-full"
        priority
      />
    </div>
  );
}
