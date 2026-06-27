import { Organisasi_Type } from "@prisma/client";

import { findOrganisasi } from "@/utils/database/organisasi.query";
import { findPeriod } from "@/utils/database/periodYear.query";
import { findNewestPost } from "@/utils/database/post.query";
import { notFound } from "next/navigation";

import { Metadata } from "next";
import Contact from "./_components/parts/Contact";
import OrgGallery from "./_components/parts/Gallery";
import Overview from "./_components/parts/Overview";
import RelatedNews from "./_components/parts/RelatedNews";
import OrgStructureChart from "./_components/parts/OrgStructureChart";
import VisiMisi from "./_components/parts/VisiMisi";
import RecruitmentBanner from "./_components/parts/RecruitmentBanner";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

interface Props {
  params: Promise<{ slug: string; period: string }>;
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, period } = await params;
  if (
    !Object.values(Organisasi_Type).includes(slug as Organisasi_Type)
  ) {
    return {
      title: "Not Found",
    };
  }

  const organisasiType = slug.toUpperCase() as Organisasi_Type;
  const periodData = await findPeriod({ period });

  if (!periodData) return { title: "Not Found" };

  const organisasi = await findOrganisasi({
    organisasi_period_id: {
      organisasi: organisasiType,
      period_id: periodData?.id,
    },
  });

  return {
    title: organisasi?.organisasi_name ?? "Not Found",
    description: organisasi?.description,
    openGraph: {
      images: organisasi?.logo,
    },
    keywords: `${organisasi?.organisasi}, organisasi, SMK, Telkom, Malang, ${organisasi?.organisasi_name.split(" ").join(", ")}`,
  };
}

export default async function Organ({ params }: Readonly<Props>) {
  const { slug, period } = await params;
  if (!Object.values(Organisasi_Type).includes(slug as Organisasi_Type))
    return notFound();

  const organisasiType = slug.toUpperCase() as Organisasi_Type;
  const periodData = await findPeriod({ period });

  if (!periodData) return notFound();

  const organisasi = await findOrganisasi({
    organisasi_period_id: {
      organisasi: organisasiType,
      period_id: periodData.id,
    },
  });

  if (!organisasi) return notFound();

  const relatedNews = await findNewestPost(5, {
    AND: {
      tags: { some: { tagName: organisasiType } },
      published: true,
    },
  });

  const activeCampaigns = await prisma.recruitment_Campaign.findMany({
    where: {
      is_active: true,
      organisasi: {
        organisasi: organisasiType
      }
    }
  });

  const session = await auth();
  let applicantStatus: "WAITING_ANNOUNCEMENT" | "REJECTED_STEP" | "REJECTED_FINAL" | "ACCEPTED_FINAL" | "PENDING_FINAL" | undefined;
  let applicantStepName: string | undefined;
  let applicantDate: Date | undefined;
  let applicantPassedStepName: string | undefined;

  if (activeCampaigns.length > 0 && session?.user?.id) {
    const applicant = await prisma.recruitment_Applicant.findFirst({
      where: {
        campaign_id: activeCampaigns[0].id,
        user_id: session.user.id
      },
      include: {
        campaign: { include: { steps: { orderBy: { order: 'asc' } } } },
        step_statuses: true
      }
    });

    if (applicant) {
      const now = new Date();
      const pastSteps = applicant.campaign.steps.filter((s: any) => s.announcement_date && new Date(s.announcement_date) <= now);
      let rejectedInPastStep = false;

      for (const step of pastSteps) {
        const status = applicant.step_statuses.find((s: any) => s.step_id === step.id)?.status || "PENDING";
        if (status === "REJECTED" || status === "FAILED") {
          applicantStatus = "REJECTED_STEP";
          applicantStepName = step.name;
          rejectedInPastStep = true;
          break;
        }
      }

      if (!rejectedInPastStep) {
        // Find if they passed any previous steps to congratulate them
        const lastPassedStep = [...pastSteps].reverse().find(step => {
          const status = applicant.step_statuses.find((s: any) => s.step_id === step.id)?.status || "PENDING";
          return status === "PASSED" || status === "ACCEPTED";
        });
        if (lastPassedStep) applicantPassedStepName = lastPassedStep.name;

        const futureStep = applicant.campaign.steps.find((s: any) => s.announcement_date && new Date(s.announcement_date) > now);
        
        if (futureStep) {
          applicantStatus = "WAITING_ANNOUNCEMENT";
          applicantStepName = futureStep.name;
          applicantDate = futureStep.announcement_date as Date;
        } else {
          if (applicant.status === "ACCEPTED") applicantStatus = "ACCEPTED_FINAL";
          else if (applicant.status === "REJECTED") applicantStatus = "REJECTED_FINAL";
          else applicantStatus = "PENDING_FINAL";
        }
      }
    }
  }

  return (
    <div className="pt-3 md:pt-0">
      <Overview
        organisasi_name={organisasi.organisasi_name}
        description={organisasi.description}
        period={periodData.period}
        logo={organisasi.logo}
      />
      <RecruitmentBanner 
        campaigns={activeCampaigns} 
        orgName={organisasi.organisasi} 
        applicantStatus={applicantStatus}
        stepName={applicantStepName}
        announcementDate={applicantDate}
        passedStepName={applicantPassedStepName}
      />
      {organisasi.vision && organisasi.mission && (
        <VisiMisi visi={organisasi.vision} misi={organisasi.mission} />
      )}
      <OrgStructureChart organisasiId={organisasi.id} />
      <OrgGallery
        image={organisasi.image}
        organisasi_name={organisasi.organisasi}
        period={periodData.period}
        image_description={organisasi.image_description}
      />
      <RelatedNews data={relatedNews} orgName={organisasiType} />
      <Contact data={organisasi} />
    </div>
  );
}

export const revalidate = 60;
