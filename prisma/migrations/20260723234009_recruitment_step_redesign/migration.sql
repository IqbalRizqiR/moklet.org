-- Step 1: Backfill NULL campaign dates with sensible defaults before making them required
UPDATE "Recruitment_Campaign"
SET "open_date" = NOW()
WHERE "open_date" IS NULL;

UPDATE "Recruitment_Campaign"
SET "close_date" = NOW() + INTERVAL '30 days'
WHERE "close_date" IS NULL;

-- Step 2: Make campaign dates required
ALTER TABLE "Recruitment_Campaign" ALTER COLUMN "open_date" SET NOT NULL;
ALTER TABLE "Recruitment_Campaign" ALTER COLUMN "close_date" SET NOT NULL;

-- Step 3: Add new step columns (nullable first for backfill)
ALTER TABLE "Recruitment_Step" ADD COLUMN "open_date" TIMESTAMP(3);
ALTER TABLE "Recruitment_Step" ADD COLUMN "pass_message" TEXT;
ALTER TABLE "Recruitment_Step" ADD COLUMN "pass_links" JSONB;
ALTER TABLE "Recruitment_Step" ADD COLUMN "fail_message" TEXT;
ALTER TABLE "Recruitment_Step" ADD COLUMN "fail_links" JSONB;

-- Step 4: Backfill step.open_date from campaign.open_date
UPDATE "Recruitment_Step" s
SET "open_date" = c."open_date"
FROM "Recruitment_Campaign" c
WHERE s."campaign_id" = c."id"
AND s."open_date" IS NULL;

-- Step 5: Backfill step.announcement_date from existing data
-- If announcement_date is NULL, use campaign.close_date
UPDATE "Recruitment_Step" s
SET "announcement_date" = c."close_date"
FROM "Recruitment_Campaign" c
WHERE s."campaign_id" = c."id"
AND s."announcement_date" IS NULL;

-- Step 6: Migrate success_message/success_links to pass_message/pass_links
UPDATE "Recruitment_Step"
SET "pass_message" = "success_message",
    "pass_links" = "success_links";

-- Step 7: Make step.open_date and step.announcement_date required
ALTER TABLE "Recruitment_Step" ALTER COLUMN "open_date" SET NOT NULL;
ALTER TABLE "Recruitment_Step" ALTER COLUMN "announcement_date" SET NOT NULL;

-- Step 8: Drop old columns
ALTER TABLE "Recruitment_Step" DROP COLUMN "success_message";
ALTER TABLE "Recruitment_Step" DROP COLUMN "success_links";
