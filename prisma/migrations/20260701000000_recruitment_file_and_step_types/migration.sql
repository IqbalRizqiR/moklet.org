-- Feature 7: File upload field type + accept_types on Field
ALTER TYPE "Field_Type" ADD VALUE IF NOT EXISTS 'file';

ALTER TABLE "Field" ADD COLUMN IF NOT EXISTS "accept_types" TEXT;

-- Feature 8: Customizable recruitment steps (form vs announcement)
DO $$ BEGIN
  CREATE TYPE "StepType" AS ENUM ('ANNOUNCEMENT', 'FORM');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

ALTER TABLE "Recruitment_Step" ADD COLUMN IF NOT EXISTS "description" TEXT;
ALTER TABLE "Recruitment_Step" ADD COLUMN IF NOT EXISTS "type" "StepType" NOT NULL DEFAULT 'ANNOUNCEMENT';
ALTER TABLE "Recruitment_Step" ADD COLUMN IF NOT EXISTS "close_date" TIMESTAMP(3);
ALTER TABLE "Recruitment_Step" ADD COLUMN IF NOT EXISTS "form_id" TEXT;

DO $$ BEGIN
  ALTER TABLE "Recruitment_Step"
    ADD CONSTRAINT "Recruitment_Step_form_id_fkey"
    FOREIGN KEY ("form_id") REFERENCES "Form"("form_id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Link a step-level submission to an applicant's step status
ALTER TABLE "Applicant_Step_Status" ADD COLUMN IF NOT EXISTS "submission_id" TEXT;

DO $$ BEGIN
  CREATE UNIQUE INDEX "Applicant_Step_Status_submission_id_key" ON "Applicant_Step_Status"("submission_id");
EXCEPTION
  WHEN duplicate_table THEN null;
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "Applicant_Step_Status"
    ADD CONSTRAINT "Applicant_Step_Status_submission_id_fkey"
    FOREIGN KEY ("submission_id") REFERENCES "Submission"("submission_id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
