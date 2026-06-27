"use client";

import {
  SelectField,
  TextField,
} from "@/app/_components/global/Input";
import { Organisasi, Organisasi_Type } from "@prisma/client";
import { useState } from "react";
import Editor from "@/app/(admin)/admin/components/LazyEditor";
import Image from "@/app/_components/global/Image";
import { organisasiUpsert } from "@/actions/organisasi";
import { toast } from "sonner";
import SubmitButton from "@/app/_components/global/SubmitButton";
import { fileSizeToMb } from "@/utils/atomics";
import { P } from "@/app/_components/global/Text";
import Link from "next/link";

export default function Form({
  organisasi,
  period,
  organisasiType,
  currentPeriod,
  isReadOnly,
}: {
  organisasi: Organisasi;
  period: string;
  organisasiType: Organisasi_Type;
  currentPeriod: string;
  isReadOnly?: boolean;
}) {

  const [structure, setStructure] = useState(organisasi.structure || "");
  const [description, setDescription] = useState(organisasi.description || "");
  const [vision, setVision] = useState(organisasi.vision || "");
  const [mission, setMission] = useState(organisasi.mission || "");
  const [logo, setLogo] = useState(
    organisasi.logo ||
      "https://res.cloudinary.com/mokletorg/image/upload/v1720188074/assets/image_placeholder.png",
  );
  const [image, setImage] = useState(
    organisasi.image ||
      "https://res.cloudinary.com/mokletorg/image/upload/v1720188074/assets/image_placeholder.png",
  );
  return (
    <form
      className="flex flex-col gap-y-3 my-2"
      action={async (data) => {
        const toastId = toast.loading("Loading....");

        const logo = data.get("logo") as File | undefined;
        const image = data.get("image") as File | undefined;

        if (logo?.name === "") data.delete("logo");
        if (image?.name === "") data.delete("image");

        const logoSizeInMb = logo ? fileSizeToMb(logo.size) : 0;
        const imageSizeInMb = image ? fileSizeToMb(image.size) : 0;

        if (logoSizeInMb + imageSizeInMb > 10) {
          toast.error("Ukuran file terlalu besar! Ukuran maximum 10 MB", {
            id: toastId,
          });
          return;
        }

        const result = await organisasiUpsert({
          data,
          id: organisasi.id || null,
          period,
          structure,
          organisasiType,
        });

        if (result.error) {
          toast.error(result.message, { id: toastId });
          return;
        }

        toast.success(result.message, { id: toastId });
      }}
    >
      <SelectField
        name="is_suborgan"
        value={organisasi.is_suborgan?.toString()}
        required
        disabled={isReadOnly}
        label="Organ/Sub"
        options={[
          { label: "Organisasi", value: "false" },
          { label: "Sub-Organisasi", value: "true" },
        ]}
      />
      <TextField
        type="text"
        label="Organisasi Name"
        name="organisasi_name"
        required={true}
        disabled={isReadOnly}
        placeholder="Majelis Perwakilan Kelas"
        value={organisasi.organisasi_name}
      />
      <div className="flex flex-col">
        <label
          htmlFor="logo"
          className="after:text-red-500 after:content-['*']"
        >
          Logo
        </label>
        <Image
          className="w-[100px] h-[100px] rounded-2xl object-cover mb-2"
          width={100}
          height={100}
          alt="Logo Organisasi"
          src={logo}
          unoptimized
        />
        <input
          type="file"
          onChange={(e) => {
            setLogo(URL.createObjectURL(e.target.files![0]));
          }}
          accept="image/*"
          name="logo"
          id="logo"
          required={!organisasi.id}
          disabled={isReadOnly}
          className={`border border-neutral-500 border-dotted rounded-xl py-5 px-3 ${isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
        />
      </div>
      <div className={isReadOnly ? 'pointer-events-none opacity-70' : ''}>
        <Editor
          label={`Description organisasi ${organisasi.organisasi}`}
          value={description}
          onChange={(value) => setDescription(value || "")}
        />
      </div>
      <input type="hidden" name="description" value={description} readOnly />
      <div className="flex flex-col">
        <label
          htmlFor="image"
          className="after:text-red-500 after:content-['*']"
        >
          Photo
        </label>
        <Image
          className="w-[299px] h-[207px] rounded-2xl object-cover mb-2"
          width={299}
          height={207}
          alt="Foto Organisasi"
          src={image}
          unoptimized
        />
        <input
          type="file"
          onChange={(e) => {
            setImage(URL.createObjectURL(e.target.files![0]));
          }}
          accept="image/*"
          name="image"
          required={!organisasi.id}
          disabled={isReadOnly}
          className={`border border-neutral-500 border-dotted rounded-xl py-5 px-3 ${isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
        />
      </div>
      <TextField
        type="text"
        label="Photo Description"
        name="image_description"
        required={true}
        disabled={isReadOnly}
        placeholder="Foto anggota/Foto Kegiatan/Lain-lain"
        value={organisasi.image_description}
      />
      <TextField
        type="text"
        label="Pembimbing"
        name="companion"
        required={true}
        disabled={isReadOnly}
        placeholder={`Pembimbing ${organisasi.organisasi}`}
        value={organisasi.companion}
      />
      <TextField
        type="url"
        label="Sosial Media"
        name="contact"
        required={true}
        disabled={isReadOnly}
        placeholder={`Link sosial media ${organisasi.organisasi}`}
        value={organisasi.contact}
      />
      <TextField
        type="text"
        label="No. WhatsApp Notifikasi"
        name="wa_notify_phone"
        required={false}
        disabled={isReadOnly}
        placeholder="6281234567890 (Gunakan kode negara, misal 62)"
        value={organisasi.wa_notify_phone || ""}
      />
      <div className={isReadOnly ? 'pointer-events-none opacity-70' : ''}>
        <Editor
          label={`Visi organisasi ${organisasi.organisasi}`}
          value={vision}
          onChange={(value) => setVision(value || "")}
        />
      </div>
      <input type="hidden" name="vision" value={vision} readOnly />
      <div className={isReadOnly ? 'pointer-events-none opacity-70' : ''}>
        <Editor
          label={`Misi organisasi ${organisasi.organisasi}`}
          value={mission}
          onChange={(value) => setMission(value || "")}
        />
      </div>
      <input type="hidden" name="mission" value={mission} readOnly />
      <P className="text-black first-letter:capitalize">
        Struktur Organisasi
      </P>
      <div className="rounded-2xl backdrop-blur-md bg-white/50 border border-white/30 p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500/20 to-rose-500/10 flex items-center justify-center">
            <span className="text-lg">📊</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-700">Struktur di-generate otomatis</p>
            <p className="text-xs text-gray-400">dari daftar anggota & role yang sudah diatur</p>
          </div>
        </div>
        <Link
          href={`/admin/organisasi/${organisasiType.toLowerCase()}/${currentPeriod}/members`}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-500/90 to-rose-500/90 text-white rounded-xl hover:from-red-500 hover:to-rose-500 transition-all shadow-sm text-sm font-medium"
        >
          👥 Kelola Anggota & Struktur
        </Link>
        <p className="mt-2 text-[11px] text-gray-400">
          Di halaman ini kamu bisa: membuat role, atur hierarchy level, tambah anggota, assign leader, dan preview struktur.
        </p>
      </div>

      <P className="text-black first-letter:capitalize mt-4">
        Open Recruitment
      </P>
      <div className="rounded-2xl backdrop-blur-md bg-white/50 border border-white/30 p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/10 flex items-center justify-center">
            <span className="text-lg">📢</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-700">Manajemen Open Recruitment</p>
            <p className="text-xs text-gray-400">Kelola campaign oprec dan pantau pendaftar</p>
          </div>
        </div>
        <Link
          href={`/admin/organisasi/${organisasiType}/recruitment`}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500/90 to-cyan-500/90 text-white rounded-xl hover:from-blue-500 hover:to-cyan-500 transition-all shadow-sm text-sm font-medium"
        >
          📢 Kelola Oprec
        </Link>
        <p className="mt-2 text-[11px] text-gray-400">
          Di halaman ini kamu bisa membuat campaign baru, mengatur formulir pendaftaran, dan meluluskan calon anggota.
        </p>
      </div>

      <input type="hidden" name="structure" value={structure} onChange={() => {}} />
      
      {!isReadOnly && <SubmitButton />}
      
      {isReadOnly && (
        <div className="bg-yellow-50 text-yellow-800 p-4 rounded-xl border border-yellow-200 mt-4 text-center">
          Anda tidak memiliki izin untuk mengedit informasi organisasi ini.
        </div>
      )}
    </form>
  );
}
