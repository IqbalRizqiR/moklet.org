import { H2, P } from "@/app/_components/global/Text";
import { SectionWrapper } from "@/app/_components/global/Wrapper";
import Image from "next/image";
import MdViewer from "@/app/(main)/berita/[slug]/_components/MdViewer";

export default function Overview({
  organisasi_name,
  description,
  period,
  logo,
}: {
  organisasi_name: string;
  description: string;
  period: string;
  logo: string;
}) {
  return (
    <SectionWrapper id={"overview"}>
      <div className="flex flex-col gap-[58px] w-full">
        <div className="w-full flex flex-col gap-[18px]">
          <div className="block">
            <div className="flex items-center justify-between mb-4">
              <Image
                src={logo}
                alt={`Logo ${organisasi_name}`}
                width={106}
                height={106}
                className="rounded-full w-[100px] h-[100px] md:w-[120px] md:h-[120px] object-cover border-2"
              />
              <P className="px-4 py-3 border border-glass-border bg-glass-white backdrop-blur-sm shadow-glass-soft rounded-full w-[50%] md:w-[20%] text-center h-fit">
                Periode {period.replace(/-/, " / ")}
              </P>
            </div>
            <H2 className="font-bold">{organisasi_name}</H2>
          </div>
          <MdViewer
            markdown={description}
            className="max-w-none prose-sm sm:prose-base [&_p]:text-neutral-500"
          />
        </div>
      </div>
    </SectionWrapper>
  );
}
