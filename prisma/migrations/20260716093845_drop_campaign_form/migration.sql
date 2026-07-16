-- Drop campaign-level form columns and relations
ALTER TABLE "Recruitment_Campaign" DROP CONSTRAINT IF EXISTS "Recruitment_Campaign_form_id_fkey";
ALTER TABLE "Recruitment_Campaign" DROP COLUMN IF EXISTS "form_id";
ALTER TABLE "Recruitment_Campaign" DROP COLUMN IF EXISTS "registration_success_message";
ALTER TABLE "Recruitment_Campaign" DROP COLUMN IF EXISTS "registration_success_links";

-- Make submission_id optional in Recruitment_Applicant
ALTER TABLE "Recruitment_Applicant" DROP CONSTRAINT IF EXISTS "Recruitment_Applicant_submission_id_fkey";
ALTER TABLE "Recruitment_Applicant" ALTER COLUMN "submission_id" DROP NOT NULL;
ALTER TABLE "Recruitment_Applicant" ADD CONSTRAINT "Recruitment_Applicant_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "Submission"("submission_id") ON DELETE SET NULL ON UPDATE CASCADE;
