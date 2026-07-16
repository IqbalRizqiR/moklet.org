"use client";

import React, { useState } from "react";
import { Button } from "@/app/_components/global/Button";
import { registerApplicant } from "@/actions/recruitment";
import { toast } from "sonner";
import { useRouter } from "next-nprogress-bar";
import RegistrationWizard from "./RegistrationWizard";
import SuccessModal from "./SuccessModal";

interface CampaignDetailClientProps {
  campaignId: string;
  formId: string;
  userId: string;
  registrationSuccessMessage?: string | null;
  registrationSuccessLinks?: Array<{ label: string; url: string }> | null;
}

export default function CampaignDetailClient({
  campaignId,
  formId,
  userId,
  registrationSuccessMessage,
  registrationSuccessLinks,
}: CampaignDetailClientProps) {
  const [showWizard, setShowWizard] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null | undefined>(registrationSuccessMessage);
  const [successLinks, setSuccessLinks] = useState<Array<{ label: string; url: string }> | null | undefined>(registrationSuccessLinks);
  const router = useRouter();

  const handleRegistrationSuccess = async (submissionId: string) => {
    try {
      const result = await registerApplicant(campaignId, submissionId);
      setShowWizard(false);
      if (result?.registration_success_message) {
        setSuccessMsg(result.registration_success_message);
      }
      if (result?.registration_success_links) {
        setSuccessLinks(result.registration_success_links);
      }
      setShowSuccess(true);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Gagal mendaftar.");
    }
  };

  const handleClose = () => {
    setShowSuccess(false);
    router.refresh();
  };

  return (
    <>
      <Button variant="primary" onClick={() => setShowWizard(true)}>
        Daftar Sekarang
      </Button>

      <RegistrationWizard
        isOpen={showWizard}
        onClose={() => setShowWizard(false)}
        formId={formId}
        userId={userId}
        campaignId={campaignId}
        onSuccess={handleRegistrationSuccess}
      />

      <SuccessModal
        isOpen={showSuccess}
        onClose={handleClose}
        message={successMsg}
        links={successLinks}
      />
    </>
  );
}
