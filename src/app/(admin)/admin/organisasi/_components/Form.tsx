"use client";

import {
  SelectField,
  TextArea,
  TextField,
} from "@/app/_components/global/Input";
import { Organisasi, Organisasi_Type } from "@prisma/client";
import { useState } from "react";
import Editor from "@/app/(admin)/admin/components/MdEditor";
import Image from "@/app/_components/global/Image";
import { organisasiUpsert } from "@/actions/organisasi";
import { toast } from "sonner";
import SubmitButton from "@/app/_components/global/SubmitButton";
import { useRouter } from "next-nprogress-bar";
import { fileSizeToMb } from "@/utils/atomics";
import { P } from "@/app/_components/global/Text";
import Link from "next/link";

export default function Form({
  organisasi,
  period,
  organisasiType,
  currentPeriod,
}: {
  organisasi: Organisasi;
  period: string;
  organisasiType: Organisasi_Type;
  currentPeriod: string;
}) {
  const router = useRouter();
  const [structure, setStructure] = useState(organisasi.structure || "");
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

        if (logoSizeInMb + imageSizeInMb > 4.3) {
          toast.error("Ukuran file terlalu besar! Ukuran maximum 4,3 MB", {
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
        router.refresh();
      }}
    >
      <SelectField
        name="is_suborgan"
        value={organisasi.is_suborgan?.toString()}
        required
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
          className="border border-neutral-500 border-dotted rounded-xl py-5 px-3"
        />
      </div>
      <TextArea
        label="Description"
        name="description"
        required={true}
        placeholder={`Deskripsi organisasi ${organisasi.organisasi}`}
        value={organisasi.description}
      ></TextArea>
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
          className="border border-neutral-500 border-dotted rounded-xl py-5 px-3"
        />
      </div>
      <TextField
        type="text"
        label="Photo Description"
        name="image_description"
        required={true}
        placeholder="Foto anggota/Foto Kegiatan/Lain-lain"
        value={organisasi.image_description}
      />
      <TextField
        type="text"
        label="Pembimbing"
        name="companion"
        required={true}
        placeholder={`Pembimbing ${organisasi.organisasi}`}
        value={organisasi.companion}
      />
      <TextField
        type="url"
        label="Sosial Media"
        name="contact"
        required={true}
        placeholder={`Link sosial media ${organisasi.organisasi}`}
        value={organisasi.contact}
      />
      <TextArea
        label="Visi"
        name="vision"
        required={false}
        placeholder={`Visi organisasi ${organisasi.organisasi}`}
        value={organisasi.vision!}
      />
      <TextArea
        label="Misi"
        name="mission"
        required={false}
        placeholder={`Misi organisasi ${organisasi.organisasi}`}
        value={organisasi.mission!}
      />
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

      {/* Hidden field to keep the structure value for backward compat */}
      <input type="hidden" name="structure" value={structure} onChange={() => {}} />
      <SubmitButton />
    </form>
  );
}
