import { H2, P } from "@/app/_components/global/Text";
import { SectionWrapper } from "@/app/_components/global/Wrapper";
import { FiLogIn, FiTarget, FiSend } from "react-icons/fi";

const steps = [
  {
    id: 1,
    title: "Masuk / Register",
    description: "Login menggunakan akun Google kamu untuk mulai mengirimkan aspirasi. Privasi kamu akan selalu terjaga.",
    icon: <FiLogIn className="w-8 h-8 text-primary-500" />,
  },
  {
    id: 2,
    title: "Pilih Tujuan",
    description: "Pilih apakah aspirasimu ditujukan untuk Event, Organisasi, ataupun Unit Sekolah tertentu.",
    icon: <FiTarget className="w-8 h-8 text-primary-500" />,
  },
  {
    id: 3,
    title: "Sampaikan Suaramu",
    description: "Tuliskan pendapat, saran, atau kritik membangun. Mari wujudkan masa depan yang lebih baik!",
    icon: <FiSend className="w-8 h-8 text-primary-500" />,
  },
];

export default function AspirationTutorial() {
  return (
    <SectionWrapper id="tutorial-aspirasi">
      <div className="flex flex-col items-center justify-center text-center w-full mb-12">
        <H2>Gimana Cara Kirim Aspirasi?</H2>
        <P className="mt-4 max-w-2xl">
          Hanya butuh 3 langkah mudah untuk ikut serta membangun perubahan yang lebih baik.
        </P>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 mt-10 mb-20 pr-4 pl-4 md:pr-0 md:pl-0">
        {steps.map((step) => (
          <div
            key={step.id}
            className="relative flex flex-col items-center text-center p-8 glass-card hover:-translate-y-3 hover:shadow-glass-soft group"
          >
            {/* Step Number Badge */}
            <div className="absolute -top-5 -right-5 w-14 h-14 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-black text-xl shadow-glass transform group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500 border-4 border-white">
              {step.id}
            </div>

            {/* Icon Container */}
            <div className="w-24 h-24 mb-8 rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100/50 flex items-center justify-center border border-primary-200/40 shadow-inner group-hover:from-primary-100 group-hover:border-primary-300 transition-all duration-500">
              {step.icon}
            </div>

            {/* Text Content */}
            <h3 className="text-2xl font-bold mb-4 text-neutral-700 group-hover:text-primary-500 transition-colors duration-300">{step.title}</h3>
            <p className="text-neutral-500 leading-relaxed text-md transition-colors duration-300">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}
