import { Organisasi_Type, Prisma } from "@prisma/client";

import prisma from "@/lib/prisma";
const PLACEHOLDER_IMG =
  "https://res.cloudinary.com/mokletorg/image/upload/v1720188074/assets/image_placeholder.png";

async function main() {
  console.log("🌱 Seeding organisation data from moklet.org/organisasi/2024-2025 …");

  // ── 1. Upsert period ────────────────────────────────────────────────
  const period = await prisma.period_Year.upsert({
    where: { period: "2024-2025" },
    update: {},
    create: { period: "2024-2025", is_active: false },
  });

  const period2025 = await prisma.period_Year.upsert({
    where: { period: "2025-2026" },
    update: {},
    create: { period: "2025-2026", is_active: true },
  });

  console.log(`  ✔ Period ${period.period} (${period.id})`);
  console.log(`  ✔ Period ${period2025.period} (${period2025.id})`);

  // ── 2. Organisation seed data ───────────────────────────────────────
  const orgs = [
    // ═══ Organisasi (not sub-organ) ═══
    {
      organisasi: "MPK" as Organisasi_Type,
      is_suborgan: false,
      organisasi_name: "Majelis Perwakilan Kelas",
      logo: PLACEHOLDER_IMG,
      description:
        "MPK Moklet merupakan singkatan dari Majelis Perwakilan Kelas adalah Legislatif Organisasi SMK Telkom Malang yang memiliki fungsi sebagai pengawas berjalannya kinerja OSIS. MPK Moklet juga berperan sebagai penyalur aspirasi dari mokleters, untuk mokleters, oleh mokleters.",
      vision:
        "Mengoptimalkan, Mengawasi, Mengontrol, dan Mengevaluasi Kinerja Organisasi",
      mission: "-",
      image: PLACEHOLDER_IMG,
      image_description: "Foto MPK Masa Bhakti 2024/2025",
      companion: "Siana Norma Heny M.Pd",
      contact: "https://www.instagram.com/mpkmoklet/",
      structure: "",
    },
    {
      organisasi: "OSIS" as Organisasi_Type,
      is_suborgan: false,
      organisasi_name: "Organisasi Siswa Intra Sekolah",
      logo: PLACEHOLDER_IMG,
      description:
        "OSIS SMK Telkom Malang merupakan sebuah organisasi siswa yang memiliki fungsi sebagai pengelola berbagai kegiatan yang bertujuan untuk meningkatkan keterampilan dan pengalaman siswa SMK Telkom Malang. OSIS SMK Telkom Malang juga berperan sebagai penghubung antara siswa dan pihak sekolah dalam mengadvokasi kepentingan siswa serta menjaga kedisiplinan dan semangat kebersamaan di lingkungan sekolah.",
      vision:
        "Membentuk OSIS SMK Telkom Malang sebagai wadah untuk mencetak siswa-siswi yang memiliki semangat idealisme dalam berproduktif, berdaya saing kuat, serta menjunjung tinggi solidaritas.",
      mission:
        "1. Menyediakan OSIS MOKLET suatu ruang untuk mengembangkan kreativitas dan inovasi melalui kompetisi akademik non-akademik\n2. Menjadikan OSIS MOKLET sebagai role model bagi organisasi dan sekolah melalui jejaring kerjasama dan interaksi sosial diluar sekolah\n3. Mengasah OSIS MOKLET untuk memiliki semangat solidaritas melalui partisipasi dalam kegiatan sosial guna mewujudkan lingkungan inklusif dan kolaboratif.",
      image: PLACEHOLDER_IMG,
      image_description: "Foto Bersama Anggota OSIS Periode 2024/2025",
      companion: "Siana Norma Heny M.Pd",
      contact: "https://instagram.com/osismoklet",
      structure: "",
    },

    // ═══ Sub-organisasi ═══
    {
      organisasi: "METIC" as Organisasi_Type,
      is_suborgan: true,
      organisasi_name: "Moklet Education of Technology Informatic Club",
      logo: PLACEHOLDER_IMG,
      description:
        "METIC adalah komunitas pelajar SMK Telkom Malang yang terbuka, inovatif, dan santai, mengembangkan teknologi, kewirausahaan, serta kreativitas melalui kolaborasi, workshop, dan kompetisi berdampak sosial dan bisnis.",
      vision:
        "Menciptakan generasi pemimpin muda yang inovatif, kolaboratif, dan berorientasi solusi di bidang teknologi untuk masa depan digital yang inklusif dan berkelanjutan.",
      mission:
        "1. Mengembangkan solusi teknologi yang inovatif, aman, dan berdaya saing global.\n2. Mendorong kolaborasi antara talenta muda, industri, dan akademisi di bidang teknologi.\n3. Menyediakan wadah bagi pengembangan riset, kreativitas, dan kewirausahaan berbasis teknologi.\n4. Menjunjung tinggi etika, profesionalisme, dan keberlanjutan dalam setiap pengembangan teknologi.",
      image: PLACEHOLDER_IMG,
      image_description: "Foto METIC 2024/2025",
      companion: "-",
      contact: "https://www.instagram.com/meticmoklet/",
      structure: "",
    },
    {
      organisasi: "PUSTEL" as Organisasi_Type,
      is_suborgan: true,
      organisasi_name: "Perpustakaan SMK Telkom Malang",
      logo: PLACEHOLDER_IMG,
      description:
        "Perpustakaan SMK Telkom Malang, yang dikenal dengan nama PUSTEL, merupakan bagian integral dari lingkungan sekolah yang berfokus pada pengembangan literasi dan layanan informasi bagi siswa dan staf. PUSTEL dikelola oleh tim pustakawan profesional dan didukung oleh Anggota PUSTEL dalam pengolahan buku di Perpustakaan SMK Telkom Malang. PUSTEL juga aktif dalam berbagai kegiatan literasi dan informasi.",
      vision: null,
      mission: null,
      image: PLACEHOLDER_IMG,
      image_description: "Foto PUSTEL 2024/2025",
      companion: "-",
      contact: "https://www.instagram.com/ipustel/",
      structure: "",
    },
    {
      organisasi: "PASKATEMA" as Organisasi_Type,
      is_suborgan: true,
      organisasi_name: "Paskibra SMK Telkom Malang",
      logo: PLACEHOLDER_IMG,
      description:
        "Paskatema (Paskibra SMK Telkom Malang) adalah sub-organisasi yang berkomitmen membentuk generasi muda yang disiplin, bertanggung jawab, dan memiliki jiwa kepemimpinan tinggi. Dengan semangat kebersamaan dan solidaritas, Paskatema hadir sebagai wadah pelatihan karakter serta pengembangan potensi siswa melalui pelatihan terarah dan kegiatan yang inspiratif.",
      vision: null,
      mission: null,
      image: PLACEHOLDER_IMG,
      image_description: "Foto PASKATEMA 2024/2025",
      companion: "-",
      contact: "https://www.instagram.com/paskatema_/",
      structure: "",
    },
    {
      organisasi: "COMET" as Organisasi_Type,
      is_suborgan: true,
      organisasi_name: "Community of Moklet English Talent",
      logo: PLACEHOLDER_IMG,
      description:
        "COMET (Community of Moklet English Talent) is a sub-organization under the auspices of OSIS SMK Telkom Malang. COMET is a sub-organization that focuses on organizing by English language. COMET creates events that aim to improve English language skills that is reading, writing, listening, and speaking. COMET is a place to learn with captains and other colleagues.",
      vision: null,
      mission: null,
      image: PLACEHOLDER_IMG,
      image_description: "Foto COMET 2024/2025",
      companion: "-",
      contact: "https://www.instagram.com/cometmoklet/",
      structure: "",
    },
    {
      organisasi: "MEMO" as Organisasi_Type,
      is_suborgan: true,
      organisasi_name: "Media Moklet",
      logo: PLACEHOLDER_IMG,
      description:
        "Media Moklet adalah Sub Organisasi yang bergerak di bidang Jurnalistik, Fotografi, Desain dengan kreativitas anak-anak dalam pembuatan berita meliput acara di SMK Telkom Malang serta konten-konten seru lainnya.",
      vision: null,
      mission: null,
      image: PLACEHOLDER_IMG,
      image_description: "Foto MEMO 2024/2025",
      companion: "-",
      contact: "https://www.instagram.com/mediamoklet/",
      structure: "",
    },
    {
      organisasi: "PMR" as Organisasi_Type,
      is_suborgan: true,
      organisasi_name: "Informatic Red Cross",
      logo: PLACEHOLDER_IMG,
      description:
        "Informatic Red Cross atau yang lebih dikenal dengan IRC adalah salah satu sub-organisasi di bawah naungan OSIS SMK Telkom Malang yang bergerak di bidang kesehatan dan kemanusiaan. IRC merupakan bagian dari organisasi sekolah yang bertujuan untuk meningkatkan kesadaran, pengetahuan, dan keterampilan siswa dalam bidang pertolongan pertama dan kesehatan umum.",
      vision: null,
      mission: null,
      image: PLACEHOLDER_IMG,
      image_description: "Foto PMR 2024/2025",
      companion: "-",
      contact: "https://www.instagram.com/ircmoklet/",
      structure: "",
    },
    {
      organisasi: "PALWAGA" as Organisasi_Type,
      is_suborgan: true,
      organisasi_name: "Pecinta Alam Wana Arga",
      logo: PLACEHOLDER_IMG,
      description:
        "Pecinta Alam Wana Arga (PALWAGA) adalah sub-organisasi di bawah naungan OSIS SMK Telkom Malang yang berfokus pada kegiatan kepecintaalaman. Organisasi ini bertujuan untuk menumbuhkan kesadaran lingkungan, keterampilan bertahan hidup, dan semangat petualangan di kalangan siswa.",
      vision: null,
      mission: null,
      image: PLACEHOLDER_IMG,
      image_description: "Foto PALWAGA 2024/2025",
      companion: "-",
      contact: "https://www.instagram.com/palwagamoklet/",
      structure: "",
    },
    {
      organisasi: "BDI" as Organisasi_Type,
      is_suborgan: true,
      organisasi_name: "Badan Dakwah Islam",
      logo: PLACEHOLDER_IMG,
      description:
        "Sebagai Sub-Organisasi yang dibawah naungan OSIS SMK TELKOM MALANG, Badan Dakwah Islam (BDI) merupakan Sub-Organisasi keagamaan yang bergerak di bidang dakwah, pendidikan, dan pembinaan umat Islam. Tujuan utama BDI adalah untuk menyebarkan nilai-nilai Islam yang rahmatan lil 'alamin melalui berbagai kegiatan dakwah yang konstruktif, edukatif, dan solutif.",
      vision:
        "Menjadi Sub-Organisasi dakwah Islam yang unggul, dan berdaya dalam membina umat menuju masyarakat yang beriman, berilmu, dan berakhlak mulia.",
      mission:
        "1. Menanamkan nilai-nilai keislaman dalam kehidupan pelajar melalui kegiatan dakwah yang kreatif, edukatif, dan menyenangkan.\n2. Membentuk karakter siswa yang religius, berakhlak mulia, serta mampu menjadi teladan dalam lingkungan sekolah dan masyarakat.\n3. Menjalin kolaborasi dengan organisasi siswa lainnya untuk memperkuat nilai-nilai Islami di lingkungan sekolah.",
      image: PLACEHOLDER_IMG,
      image_description: "Photo of BDI 2024/2025",
      companion: "Ahmad Nasikin M.Pd",
      contact:
        "https://www.instagram.com/bdi_moklet",
      structure: "",
    },
    {
      organisasi: "MAC" as Organisasi_Type,
      is_suborgan: true,
      organisasi_name: "Moklet Art Club",
      logo: PLACEHOLDER_IMG,
      description:
        "Sebagai Sub-Organisasi di bawah naungan OSIS SMK Telkom Malang, Moklet Art Club (MAC) sebagai wadah bagi siswa-siswi untuk mengasah kreativitas dan mengembangkan bakat khususnya di bidang kesenian. MAC membina tiga divisi utama, yaitu Akustik, Tari Tradisional Modern, dan Teater, yang bertujuan untuk menyalurkan minat seni, melatih keterampilan, serta membangun karakter percaya diri dan kolaboratif di antara anggotanya.",
      vision:
        "Mengembangkan SubOrganisasi Moklet Art Club untuk menjadi salah satu sumber inspirasi dan ekspresi kreatif, serta dapat membuka ruang positif secara internal maupun eksternal.",
      mission:
        "1. Memberi wadah untuk mengembangkan potensi dan minat bakat siswa-siswi dalam bidang seni.\n2. Meningkatkan rasa kebersamaan, kerjasama serta kolaboratif secara kreatif dan inovatif.\n3. Melanjutkan dan mengembangkan inovasi kreatif diberbagai progja MAC yang sudah ada.",
      image: PLACEHOLDER_IMG,
      image_description: "Regenerasi Ketua MAC masa bakti 2023/2024 menuju 2024/2025",
      companion: "Nurwidiasih Firstyana W., S. Psi",
      contact: "https://www.instagram.com/mokletartclub",
      structure: "",
    },
  ];

  // ── 3. Upsert each org for BOTH periods ─────────────────────────────
  for (const org of orgs) {
    for (const p of [period, period2025]) {
      await prisma.organisasi.upsert({
        where: {
          organisasi_period_id: {
            organisasi: org.organisasi,
            period_id: p.id,
          },
        },
        update: {
          organisasi_name: org.organisasi_name,
          description: org.description,
          vision: org.vision,
          mission: org.mission,
          image_description: org.image_description,
          companion: org.companion,
          contact: org.contact,
          is_suborgan: org.is_suborgan,
        },
        create: {
          period_id: p.id,
          organisasi: org.organisasi,
          is_suborgan: org.is_suborgan,
          organisasi_name: org.organisasi_name,
          logo: org.logo,
          description: org.description,
          vision: org.vision,
          mission: org.mission,
          image: org.image,
          image_description: org.image_description,
          companion: org.companion,
          contact: org.contact,
          structure: org.structure,
        },
      });
      console.log(`  ✔ ${org.organisasi} — ${p.period}`);
    }
  }

  console.log("\n✅ Seed complete! All organisations created for 2024-2025 and 2025-2026.");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
