"use client";

import { deleteCampaign } from "@/actions/recruitment";
import { useRouter } from "next-nprogress-bar";
import { toast } from "sonner";

export default function DeleteCampaignButton({
  campaignId,
  orgTypeString,
}: {
  campaignId: string;
  orgTypeString: string;
}) {
  const router = useRouter();

  const handleDelete = async () => {
    if (
      !confirm(
        "Hapus campaign ini? Semua data tahapan, pendaftar, dan status akan ikut terhapus. Tindakan ini tidak dapat dibatalkan.",
      )
    )
      return;

    try {
      await deleteCampaign(campaignId);
      toast.success("Campaign berhasil dihapus.");
      router.push(`/admin/organisasi/${orgTypeString}/recruitment`);
    } catch (e: any) {
      toast.error(e.message || "Gagal menghapus campaign.");
    }
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      className="px-4 py-2 rounded text-white text-sm font-medium bg-red-600 hover:bg-red-700 transition-colors"
    >
      Hapus Campaign
    </button>
  );
}
