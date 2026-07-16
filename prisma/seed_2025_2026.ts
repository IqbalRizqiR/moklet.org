import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const PLACEHOLDER_IMG =
  "https://res.cloudinary.com/mokletorg/image/upload/v1720188074/assets/image_placeholder.png";

const ORGS = [
  {
    organisasi: "MPK",
    is_suborgan: false,
    organisasi_name: "Majelis Perwakilan Kelas",
    description:
      "MPK Moklet merupakan singkatan dari Majelis Perwakilan Kelas adalah Legislatif Organisasi SMK Telkom Malang yang memiliki fungsi sebagai pengawas berjalannya kinerja OSIS. MPK Moklet juga berperan sebagai penyalur aspirasi dari mokleters, untuk mokleters, oleh mokleters.",
    vision: "Mengoptimalkan, Mengawasi, Mengontrol, dan Mengevaluasi Kinerja Organisasi",
    mission: "-",
    companion: "Siana Norma Heny M.Pd",
    contact: "https://www.instagram.com/mpkmoklet/",
  },
  {
    organisasi: "OSIS",
    is_suborgan: false,
    organisasi_name: "Organisasi Siswa Intra Sekolah",
    description:
      "OSIS SMK Telkom Malang merupakan sebuah organisasi siswa yang memiliki fungsi sebagai pengelola berbagai kegiatan yang bertujuan untuk meningkatkan keterampilan dan pengalaman siswa SMK Telkom Malang. OSIS SMK Telkom Malang juga berperan sebagai penghubung antara siswa dan pihak sekolah dalam mengadvokasi kepentingan siswa serta menjaga kedisiplinan dan semangat kebersamaan di lingkungan sekolah.",
    vision:
      "Membentuk OSIS SMK Telkom Malang sebagai wadah untuk mencetak siswa-siswi yang memiliki semangat idealisme dalam berproduktif, berdaya saing kuat, serta menjunjung tinggi solidaritas.",
    mission:
      "1. Menyediakan OSIS MOKLET suatu ruang untuk mengembangkan kreativitas dan inovasi melalui kompetisi akademik non-akademik\n2. Menjadikan OSIS MOKLET sebagai role model bagi organisasi dan sekolah melalui jejaring kerjasama dan interaksi sosial diluar sekolah\n3. Mengasah OSIS MOKLET untuk memiliki semangat solidaritas melalui partisipasi dalam kegiatan sosial guna mewujudkan lingkungan inklusif dan kolaboratif.",
    companion: "Siana Norma Heny M.Pd",
    contact: "https://instagram.com/osismoklet",
  },
  {
    organisasi: "BDI",
    is_suborgan: true,
    organisasi_name: "Badan Dakwah Islam",
    description:
      "Sebagai Sub-Organisasi yang dibawah naungan OSIS SMK TELKOM MALANG, Badan Dakwah Islam (BDI) merupakan Sub-Organisasi keagamaan yang bergerak di bidang dakwah, pendidikan, dan pembinaan umat Islam. Tujuan utama BDI adalah untuk menyebarkan nilai-nilai Islam yang rahmatan lil 'alamin melalui berbagai kegiatan dakwah yang konstruktif, edukatif, dan solutif.",
    vision:
      "Menjadi Sub-Organisasi dakwah Islam yang unggul, dan berdaya dalam membina umat menuju masyarakat yang beriman, berilmu, dan berakhlak mulia.",
    mission:
      "1. Menanamkan nilai-nilai keislaman dalam kehidupan pelajar melalui kegiatan dakwah yang kreatif, edukatif, dan menyenangkan.\n2. Membentuk karakter siswa yang religius, berakhlak mulia, serta mampu menjadi teladan dalam lingkungan sekolah dan masyarakat.\n3. Menjalin kolaborasi dengan organisasi siswa lainnya untuk memperkuat nilai-nilai Islami di lingkungan sekolah.",
    companion: "Ahmad Nasikin M.Pd",
    contact: "https://www.instagram.com/bdi_moklet",
  },
  {
    organisasi: "PALWAGA",
    is_suborgan: true,
    organisasi_name: "Pecinta Alam Wana Arga",
    description:
      "Pecinta Alam Wana Arga (PALWAGA) adalah sub-organisasi di bawah naungan OSIS SMK Telkom Malang yang berfokus pada kegiatan kepecintaalaman. Organisasi ini bertujuan untuk menumbuhkan kesadaran lingkungan, keterampilan bertahan hidup, dan semangat petualangan di kalangan siswa.",
    vision: null,
    mission: null,
    companion: "-",
    contact: "https://www.instagram.com/palwagamoklet/",
  },
  {
    organisasi: "PASKATEMA",
    is_suborgan: true,
    organisasi_name: "Paskibra SMK Telkom Malang",
    description:
      "Paskatema (Paskibra SMK Telkom Malang) adalah sub-organisasi yang berkomitmen membentuk generasi muda yang disiplin, bertanggung jawab, dan memiliki jiwa kepemimpinan tinggi. Dengan semangat kebersamaan dan solidaritas, Paskatema hadir sebagai wadah pelatihan karakter serta pengembangan potensi siswa melalui pelatihan terarah dan kegiatan yang inspiratif.",
    vision: null,
    mission: null,
    companion: "-",
    contact: "https://www.instagram.com/paskatema_/",
  },
  {
    organisasi: "TSBC",
    is_suborgan: true,
    organisasi_name: "Telkom School Basketball Club",
    description: "Sub-organisasi basket SMK Telkom Malang.",
    vision: null,
    mission: null,
    companion: "-",
    contact: "https://www.instagram.com/tsbcmoklet/",
  },
  {
    organisasi: "TSFC",
    is_suborgan: true,
    organisasi_name: "Telkom School Football Club",
    description: "Sub-organisasi sepak bola SMK Telkom Malang.",
    vision: null,
    mission: null,
    companion: "-",
    contact: "https://www.instagram.com/tsfcmoklet/",
  },
  {
    organisasi: "TSVC",
    is_suborgan: true,
    organisasi_name: "Telkom School Volleyball Club",
    description: "Sub-organisasi voli SMK Telkom Malang.",
    vision: null,
    mission: null,
    companion: "-",
    contact: "https://www.instagram.com/tsvcmoklet/",
  },
  {
    organisasi: "TSCC",
    is_suborgan: true,
    organisasi_name: "Telkom School Cheerleaders Club",
    description: "Sub-organisasi cheerleader SMK Telkom Malang.",
    vision: null,
    mission: null,
    companion: "-",
    contact: "https://www.instagram.com/tsccmoklet/",
  },
  {
    organisasi: "PMR",
    is_suborgan: true,
    organisasi_name: "Informatic Red Cross",
    description:
      "Informatic Red Cross atau yang lebih dikenal dengan IRC adalah salah satu sub-organisasi di bawah naungan OSIS SMK Telkom Malang yang bergerak di bidang kesehatan dan kemanusiaan.",
    vision: null,
    mission: null,
    companion: "-",
    contact: "https://www.instagram.com/ircmoklet/",
  },
  {
    organisasi: "MEMO",
    is_suborgan: true,
    organisasi_name: "Media Moklet",
    description:
      "Media Moklet adalah Sub Organisasi yang bergerak di bidang Jurnalistik, Fotografi, Desain dengan kreativitas anak-anak dalam pembuatan berita meliput acara di SMK Telkom Malang serta konten-konten seru lainnya.",
    vision: null,
    mission: null,
    companion: "-",
    contact: "https://www.instagram.com/mediamoklet/",
  },
  {
    organisasi: "MAC",
    is_suborgan: true,
    organisasi_name: "Moklet Art Club",
    description:
      "Sebagai Sub-Organisasi di bawah naungan OSIS SMK Telkom Malang, Moklet Art Club (MAC) sebagai wadah bagi siswa-siswi untuk mengasah kreativitas dan mengembangkan bakat khususnya di bidang kesenian.",
    vision:
      "Mengembangkan SubOrganisasi Moklet Art Club untuk menjadi salah satu sumber inspirasi dan ekspresi kreatif, serta dapat membuka ruang positif secara internal maupun eksternal.",
    mission:
      "1. Memberi wadah untuk mengembangkan potensi dan minat bakat siswa-siswi dalam bidang seni.\n2. Meningkatkan rasa kebersamaan, kerjasama serta kolaboratif secara kreatif dan inovatif.\n3. Melanjutkan dan mengembangkan inovasi kreatif diberbagai progja MAC yang sudah ada.",
    companion: "Nurwidiasih Firstyana W., S. Psi",
    contact: "https://www.instagram.com/mokletartclub",
  },
  {
    organisasi: "METIC",
    is_suborgan: true,
    organisasi_name: "Moklet Education of Technology Informatic Club",
    description:
      "METIC adalah komunitas pelajar SMK Telkom Malang yang terbuka, inovatif, dan santai, mengembangkan teknologi, kewirausahaan, serta kreativitas melalui kolaborasi, workshop, dan kompetisi berdampak sosial dan bisnis.",
    vision:
      "Menciptakan generasi pemimpin muda yang inovatif, kolaboratif, dan berorientasi solusi di bidang teknologi untuk masa depan digital yang inklusif dan berkelanjutan.",
    mission:
      "1. Mengembangkan solusi teknologi yang inovatif, aman, dan berdaya saing global.\n2. Mendorong kolaborasi antara talenta muda, industri, dan akademisi di bidang teknologi.\n3. Menyediakan wadah bagi pengembangan riset, kreativitas, dan kewirausahaan berbasis teknologi.\n4. Menjunjung tinggi etika, profesionalisme, dan keberlanjutan dalam setiap pengembangan teknologi.",
    companion: "-",
    contact: "https://www.instagram.com/meticmoklet/",
  },
  {
    organisasi: "COMET",
    is_suborgan: true,
    organisasi_name: "Community of Moklet English Talent",
    description:
      "COMET (Community of Moklet English Talent) is a sub-organization under the auspices of OSIS SMK Telkom Malang. COMET focuses on English language development through events that improve reading, writing, listening, and speaking skills.",
    vision: null,
    mission: null,
    companion: "-",
    contact: "https://www.instagram.com/cometmoklet/",
  },
  {
    organisasi: "DA",
    is_suborgan: true,
    organisasi_name: "Digital Art",
    description: "Sub-organisasi digital art SMK Telkom Malang.",
    vision: null,
    mission: null,
    companion: "-",
    contact: "https://www.instagram.com/moklet.da/",
  },
  {
    organisasi: "PUSTEL",
    is_suborgan: true,
    organisasi_name: "Perpustakaan SMK Telkom Malang",
    description:
      "Perpustakaan SMK Telkom Malang, yang dikenal dengan nama PUSTEL, merupakan bagian integral dari lingkungan sekolah yang berfokus pada pengembangan literasi dan layanan informasi bagi siswa dan staf.",
    vision: null,
    mission: null,
    companion: "-",
    contact: "https://www.instagram.com/ipustel/",
  },
];

async function main() {
  console.log("🌱 Seeding organizations for 2025-2026 period …\n");

  const pool = new Pool({ connectionString: process.env.DIRECT_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    const period = await prisma.period_Year.upsert({
      where: { period: "2025-2026" },
      update: { is_active: true },
      create: { period: "2025-2026", is_active: true },
    });
    console.log(`  ✔ Period 2025-2026 (${period.id})`);

    let count = 0;
    for (const org of ORGS) {
      await prisma.organisasi.upsert({
        where: {
          organisasi_period_id: {
            organisasi: org.organisasi as any,
            period_id: period.id,
          },
        },
        update: {
          organisasi_name: org.organisasi_name,
          description: org.description,
          vision: org.vision,
          mission: org.mission,
          companion: org.companion,
          contact: org.contact,
          is_suborgan: org.is_suborgan,
        },
        create: {
          period_id: period.id,
          organisasi: org.organisasi as any,
          is_suborgan: org.is_suborgan,
          organisasi_name: org.organisasi_name,
          logo: PLACEHOLDER_IMG,
          description: org.description,
          vision: org.vision,
          mission: org.mission,
          image: PLACEHOLDER_IMG,
          image_description: `Foto ${org.organisasi_name} Masa Bhakti 2025/2026`,
          companion: org.companion,
          contact: org.contact,
          structure: "",
        },
      });
      console.log(`  ✔ ${org.organisasi} — ${org.organisasi_name}`);
      count++;
    }

    console.log(`\n✅ Done! ${count} organizations seeded for 2025-2026.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error("❌ Seed failed:", e);
  process.exit(1);
});
