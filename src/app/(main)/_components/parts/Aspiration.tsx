import LinkButton from "@/app/_components/global/Button";
import { H2, P } from "@/app/_components/global/Text";
import { SectionWrapper } from "@/app/_components/global/Wrapper";
import EclipseIcon from "@/app/_components/icons/EclipseIcon";

export default function Aspiration() {
  return (
    <SectionWrapper id="aspirasi">
      <div className="relative flex flex-col items-center justify-center text-center w-full gap-8 py-10">
        <div className="max-w-3xl z-10">
          <H2 className="mb-[18px]">
            Sampaikan Aspirasimu untuk Masa Depan yang Lebih Baik
          </H2>
          <P>
            Aspirasi mewujudkan impian dan memberi ruang tumbuh bagi harapan.
            Aspirasi Anda sebagai siswa akan membantu MPK Moklet untuk
            mengembangkan program-programnya.
          </P>
        </div>
        
        <div className="z-10 mt-4">
          <LinkButton variant={"primary"} href="/aspirasi">
            Kirim aspirasi
          </LinkButton>
        </div>

        {/* Decorative eclipses adjusted for centered layout */}
        <EclipseIcon className="absolute -top-12 md:-top-20 -left-10 md:left-[5%] opacity-50 hidden md:block z-0 pointer-events-none" />
        <EclipseIcon className="absolute bottom-0 md:-bottom-10 -right-10 md:right-[5%] opacity-50 hidden md:block z-0 pointer-events-none" />
      </div>
    </SectionWrapper>
  );
}
