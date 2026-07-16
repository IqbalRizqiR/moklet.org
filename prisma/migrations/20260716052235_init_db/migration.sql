-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('DRAFT', 'ACTIVE', 'COMPLETED');

-- CreateEnum
CREATE TYPE "Roles" AS ENUM ('SuperAdmin', 'Admin', 'OSIS', 'MPK', 'BDI', 'PALWAGA', 'PASKATEMA', 'TSBC', 'TSFC', 'TSVC', 'TSCC', 'PMR', 'MEMO', 'MAC', 'METIC', 'COMET', 'DA', 'PUSTEL', 'Guest');

-- CreateEnum
CREATE TYPE "UnitSekolah" AS ENUM ('HUBIN', 'KURIKULUM', 'KESISWAAN', 'SARPRA', 'ISO', 'TU', 'GURU', 'SATPAMCS');

-- CreateEnum
CREATE TYPE "LinkType" AS ENUM ('User', 'System');

-- CreateEnum
CREATE TYPE "Field_Type" AS ENUM ('text', 'number', 'email', 'password', 'longtext', 'radio', 'checkbox', 'file');

-- CreateEnum
CREATE TYPE "Organisasi_Type" AS ENUM ('OSIS', 'MPK', 'BDI', 'PALWAGA', 'PASKATEMA', 'TSBC', 'TSFC', 'TSVC', 'TSCC', 'PMR', 'MEMO', 'MAC', 'METIC', 'COMET', 'PUSTEL', 'DA');

-- CreateEnum
CREATE TYPE "TwibbonType" AS ENUM ('PHOTO', 'VIDEO');

-- CreateEnum
CREATE TYPE "StepType" AS ENUM ('ANNOUNCEMENT', 'FORM');

-- CreateEnum
CREATE TYPE "ApplicantStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "StepStatus" AS ENUM ('PENDING', 'PASSED', 'FAILED');

-- CreateTable
CREATE TABLE "User" (
    "user_id" CHAR(36) NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "Roles" NOT NULL DEFAULT 'Guest',
    "user_pic" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "User_Auth" (
    "userauth_id" CHAR(36) NOT NULL,
    "password" TEXT,
    "last_login" TIMESTAMP(3),
    "userEmail" TEXT NOT NULL,
    "google_access_token" TEXT,
    "google_refresh_token" TEXT,

    CONSTRAINT "User_Auth_pkey" PRIMARY KEY ("userauth_id")
);

-- CreateTable
CREATE TABLE "Post" (
    "post_id" CHAR(36) NOT NULL,
    "title" TEXT NOT NULL,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "published_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3) NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "user_id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "thumbnail" TEXT NOT NULL,
    "reaction" JSONB NOT NULL,
    "deleted" TIMESTAMP(3),
    "organisasi_id" CHAR(36),

    CONSTRAINT "Post_pkey" PRIMARY KEY ("post_id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "tagName" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("tagName")
);

-- CreateTable
CREATE TABLE "Form" (
    "form_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "allow_edit" BOOLEAN NOT NULL DEFAULT false,
    "submit_once" BOOLEAN NOT NULL DEFAULT true,
    "is_open" BOOLEAN NOT NULL DEFAULT true,
    "open_at" TIMESTAMP(3),
    "close_at" TIMESTAMP(3),

    CONSTRAINT "Form_pkey" PRIMARY KEY ("form_id")
);

-- CreateTable
CREATE TABLE "Field_Section" (
    "field_section_id" SERIAL NOT NULL,
    "form_id" TEXT NOT NULL,
    "title" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Field_Section_pkey" PRIMARY KEY ("field_section_id")
);

-- CreateTable
CREATE TABLE "Field" (
    "field_id" SERIAL NOT NULL,
    "label" TEXT NOT NULL,
    "type" "Field_Type" NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "form_id" TEXT NOT NULL,
    "fieldNumber" INTEGER NOT NULL DEFAULT 0,
    "accept_types" TEXT,
    "section_id" INTEGER,

    CONSTRAINT "Field_pkey" PRIMARY KEY ("field_id")
);

-- CreateTable
CREATE TABLE "Field_Option" (
    "field_option_id" SERIAL NOT NULL,
    "value" TEXT NOT NULL,
    "field_id" INTEGER NOT NULL,

    CONSTRAINT "Field_Option_pkey" PRIMARY KEY ("field_option_id")
);

-- CreateTable
CREATE TABLE "Submission" (
    "submission_id" CHAR(36) NOT NULL,
    "form_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("submission_id")
);

-- CreateTable
CREATE TABLE "Submission_Field" (
    "submission_field_id" CHAR(36) NOT NULL,
    "submission_id" TEXT NOT NULL,
    "field_id" INTEGER NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "Submission_Field_pkey" PRIMARY KEY ("submission_field_id")
);

-- CreateTable
CREATE TABLE "Link_Shortener" (
    "slug" VARCHAR(50) NOT NULL,
    "target_url" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "password" CHAR(32),
    "type" "LinkType" NOT NULL DEFAULT 'User',

    CONSTRAINT "Link_Shortener_pkey" PRIMARY KEY ("slug")
);

-- CreateTable
CREATE TABLE "Link_Shortener_Count" (
    "id" VARCHAR(50) NOT NULL,
    "click_count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Link_Shortener_Count_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Period_Year" (
    "periode_year_id" CHAR(36) NOT NULL,
    "period" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Period_Year_pkey" PRIMARY KEY ("periode_year_id")
);

-- CreateTable
CREATE TABLE "Organisasi" (
    "suborgan_id" CHAR(36) NOT NULL,
    "period_id" TEXT NOT NULL,
    "organisasi" "Organisasi_Type" NOT NULL,
    "is_suborgan" BOOLEAN NOT NULL,
    "organisasi_name" TEXT NOT NULL,
    "logo" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "vision" TEXT,
    "mission" TEXT,
    "image" TEXT NOT NULL,
    "image_description" TEXT NOT NULL,
    "companion" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "structure" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "wa_notify_phone" TEXT,

    CONSTRAINT "Organisasi_pkey" PRIMARY KEY ("suborgan_id")
);

-- CreateTable
CREATE TABLE "Twibbon" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "frame_url" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "color_key" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "caption" TEXT,
    "type" "TwibbonType" NOT NULL DEFAULT 'PHOTO',

    CONSTRAINT "Twibbon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "event_name" TEXT NOT NULL,
    "description" TEXT,
    "logo" TEXT,
    "banner" TEXT,
    "start_date" TIMESTAMP(3),
    "date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "status" "EventStatus" NOT NULL DEFAULT 'DRAFT',
    "organisasi_id" CHAR(36),
    "user_id" CHAR(36) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event_Level" (
    "id" CHAR(36) NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "event_id" CHAR(36) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Event_Level_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event_Custom_Role" (
    "id" CHAR(36) NOT NULL,
    "name" TEXT NOT NULL,
    "event_id" CHAR(36) NOT NULL,
    "level_id" CHAR(36),
    "hierarchy_level" INTEGER NOT NULL DEFAULT 5,
    "is_leader" BOOLEAN NOT NULL DEFAULT false,
    "can_edit_rundown" BOOLEAN NOT NULL DEFAULT false,
    "can_manage_task" BOOLEAN NOT NULL DEFAULT false,
    "can_manage_budget" BOOLEAN NOT NULL DEFAULT false,
    "can_post_news" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Event_Custom_Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event_Member" (
    "id" CHAR(36) NOT NULL,
    "user_id" CHAR(36) NOT NULL,
    "event_id" CHAR(36) NOT NULL,
    "role_id" CHAR(36) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Event_Member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Aspirasi" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "event_id" CHAR(36),
    "judul_aspirasi" TEXT NOT NULL,
    "pesan_aspirasi" TEXT NOT NULL,
    "organisasi" "Organisasi_Type",
    "unit_sekolah" "UnitSekolah",
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_anonymous" BOOLEAN NOT NULL DEFAULT false,
    "gambar_aspirasi" TEXT,

    CONSTRAINT "Aspirasi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Unit_Sekolah_Config" (
    "unit" "UnitSekolah" NOT NULL,
    "wa_notify_phone" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Unit_Sekolah_Config_pkey" PRIMARY KEY ("unit")
);

-- CreateTable
CREATE TABLE "Org_Level" (
    "id" CHAR(36) NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "organisasi_id" CHAR(36) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Org_Level_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Org_Custom_Role" (
    "id" CHAR(36) NOT NULL,
    "name" TEXT NOT NULL,
    "organisasi_id" CHAR(36) NOT NULL,
    "is_leader" BOOLEAN NOT NULL DEFAULT false,
    "hierarchy_level" INTEGER NOT NULL DEFAULT 5,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "level_id" CHAR(36),

    CONSTRAINT "Org_Custom_Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Org_Permission" (
    "id" CHAR(36) NOT NULL,
    "user_id" CHAR(36) NOT NULL,
    "organisasi_id" CHAR(36) NOT NULL,
    "permission" TEXT NOT NULL,
    "granted_by" CHAR(36) NOT NULL,
    "granted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Org_Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission_Template" (
    "id" CHAR(36) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Permission_Template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission_Template_Item" (
    "id" CHAR(36) NOT NULL,
    "template_id" CHAR(36) NOT NULL,
    "permission" TEXT NOT NULL,

    CONSTRAINT "Permission_Template_Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" CHAR(36) NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "target_url" TEXT,
    "actor_id" CHAR(36) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification_Recipient" (
    "id" CHAR(36) NOT NULL,
    "notification_id" CHAR(36) NOT NULL,
    "user_id" CHAR(36) NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "read_at" TIMESTAMP(3),

    CONSTRAINT "Notification_Recipient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Org_Member" (
    "id" CHAR(36) NOT NULL,
    "user_id" CHAR(36) NOT NULL,
    "organisasi_id" CHAR(36) NOT NULL,
    "role_id" CHAR(36) NOT NULL,
    "is_main" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recruitment_campaign_id" CHAR(36),

    CONSTRAINT "Org_Member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recruitment_Campaign" (
    "id" CHAR(36) NOT NULL,
    "organisasi_id" CHAR(36) NOT NULL,
    "form_id" TEXT NOT NULL,
    "default_role_id" CHAR(36),
    "title" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "open_date" TIMESTAMP(3),
    "close_date" TIMESTAMP(3),
    "registration_success_message" TEXT,
    "registration_success_links" JSONB,

    CONSTRAINT "Recruitment_Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recruitment_Step" (
    "id" CHAR(36) NOT NULL,
    "campaign_id" CHAR(36) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "type" "StepType" NOT NULL DEFAULT 'ANNOUNCEMENT',
    "announcement_date" TIMESTAMP(3),
    "close_date" TIMESTAMP(3),
    "form_id" TEXT,
    "success_message" TEXT,
    "success_links" JSONB,

    CONSTRAINT "Recruitment_Step_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recruitment_Applicant" (
    "id" CHAR(36) NOT NULL,
    "campaign_id" CHAR(36) NOT NULL,
    "user_id" CHAR(36) NOT NULL,
    "submission_id" TEXT NOT NULL,
    "status" "ApplicantStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "Recruitment_Applicant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Applicant_Step_Status" (
    "id" CHAR(36) NOT NULL,
    "applicant_id" CHAR(36) NOT NULL,
    "step_id" CHAR(36) NOT NULL,
    "status" "StepStatus" NOT NULL DEFAULT 'PENDING',
    "submission_id" TEXT,

    CONSTRAINT "Applicant_Step_Status_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PostToTag" (
    "A" CHAR(36) NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PostToTag_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_Auth_userEmail_key" ON "User_Auth"("userEmail");

-- CreateIndex
CREATE UNIQUE INDEX "Post_slug_key" ON "Post"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Link_Shortener_Count_id_key" ON "Link_Shortener_Count"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Period_Year_period_key" ON "Period_Year"("period");

-- CreateIndex
CREATE UNIQUE INDEX "Organisasi_organisasi_period_id_key" ON "Organisasi"("organisasi", "period_id");

-- CreateIndex
CREATE UNIQUE INDEX "Twibbon_slug_key" ON "Twibbon"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Event_Level_name_event_id_key" ON "Event_Level"("name", "event_id");

-- CreateIndex
CREATE UNIQUE INDEX "Event_Custom_Role_name_event_id_key" ON "Event_Custom_Role"("name", "event_id");

-- CreateIndex
CREATE UNIQUE INDEX "Event_Member_user_id_event_id_key" ON "Event_Member"("user_id", "event_id");

-- CreateIndex
CREATE INDEX "Aspirasi_organisasi_idx" ON "Aspirasi"("organisasi");

-- CreateIndex
CREATE INDEX "Aspirasi_unit_sekolah_idx" ON "Aspirasi"("unit_sekolah");

-- CreateIndex
CREATE INDEX "Aspirasi_created_at_idx" ON "Aspirasi"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "Org_Level_name_organisasi_id_key" ON "Org_Level"("name", "organisasi_id");

-- CreateIndex
CREATE UNIQUE INDEX "Org_Custom_Role_name_organisasi_id_key" ON "Org_Custom_Role"("name", "organisasi_id");

-- CreateIndex
CREATE UNIQUE INDEX "Org_Permission_user_id_organisasi_id_permission_key" ON "Org_Permission"("user_id", "organisasi_id", "permission");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_Template_name_key" ON "Permission_Template"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_Template_Item_template_id_permission_key" ON "Permission_Template_Item"("template_id", "permission");

-- CreateIndex
CREATE UNIQUE INDEX "Notification_Recipient_notification_id_user_id_key" ON "Notification_Recipient"("notification_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Org_Member_user_id_organisasi_id_key" ON "Org_Member"("user_id", "organisasi_id");

-- CreateIndex
CREATE UNIQUE INDEX "Recruitment_Applicant_submission_id_key" ON "Recruitment_Applicant"("submission_id");

-- CreateIndex
CREATE UNIQUE INDEX "Recruitment_Applicant_campaign_id_user_id_key" ON "Recruitment_Applicant"("campaign_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Applicant_Step_Status_submission_id_key" ON "Applicant_Step_Status"("submission_id");

-- CreateIndex
CREATE UNIQUE INDEX "Applicant_Step_Status_applicant_id_step_id_key" ON "Applicant_Step_Status"("applicant_id", "step_id");

-- CreateIndex
CREATE INDEX "_PostToTag_B_index" ON "_PostToTag"("B");

-- AddForeignKey
ALTER TABLE "User_Auth" ADD CONSTRAINT "User_Auth_userEmail_fkey" FOREIGN KEY ("userEmail") REFERENCES "User"("email") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_organisasi_id_fkey" FOREIGN KEY ("organisasi_id") REFERENCES "Organisasi"("suborgan_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Form" ADD CONSTRAINT "Form_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Field_Section" ADD CONSTRAINT "Field_Section_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "Form"("form_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Field" ADD CONSTRAINT "Field_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "Form"("form_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Field" ADD CONSTRAINT "Field_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "Field_Section"("field_section_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Field_Option" ADD CONSTRAINT "Field_Option_field_id_fkey" FOREIGN KEY ("field_id") REFERENCES "Field"("field_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "Form"("form_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission_Field" ADD CONSTRAINT "Submission_Field_field_id_fkey" FOREIGN KEY ("field_id") REFERENCES "Field"("field_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission_Field" ADD CONSTRAINT "Submission_Field_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "Submission"("submission_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Link_Shortener" ADD CONSTRAINT "Link_Shortener_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Link_Shortener_Count" ADD CONSTRAINT "Link_Shortener_Count_id_fkey" FOREIGN KEY ("id") REFERENCES "Link_Shortener"("slug") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Organisasi" ADD CONSTRAINT "Organisasi_period_id_fkey" FOREIGN KEY ("period_id") REFERENCES "Period_Year"("periode_year_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Twibbon" ADD CONSTRAINT "Twibbon_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_organisasi_id_fkey" FOREIGN KEY ("organisasi_id") REFERENCES "Organisasi"("suborgan_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event_Level" ADD CONSTRAINT "Event_Level_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event_Custom_Role" ADD CONSTRAINT "Event_Custom_Role_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event_Custom_Role" ADD CONSTRAINT "Event_Custom_Role_level_id_fkey" FOREIGN KEY ("level_id") REFERENCES "Event_Level"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event_Member" ADD CONSTRAINT "Event_Member_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event_Member" ADD CONSTRAINT "Event_Member_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event_Member" ADD CONSTRAINT "Event_Member_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "Event_Custom_Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Aspirasi" ADD CONSTRAINT "Aspirasi_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Aspirasi" ADD CONSTRAINT "Aspirasi_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Org_Level" ADD CONSTRAINT "Org_Level_organisasi_id_fkey" FOREIGN KEY ("organisasi_id") REFERENCES "Organisasi"("suborgan_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Org_Custom_Role" ADD CONSTRAINT "Org_Custom_Role_level_id_fkey" FOREIGN KEY ("level_id") REFERENCES "Org_Level"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Org_Custom_Role" ADD CONSTRAINT "Org_Custom_Role_organisasi_id_fkey" FOREIGN KEY ("organisasi_id") REFERENCES "Organisasi"("suborgan_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Org_Permission" ADD CONSTRAINT "Org_Permission_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Org_Permission" ADD CONSTRAINT "Org_Permission_organisasi_id_fkey" FOREIGN KEY ("organisasi_id") REFERENCES "Organisasi"("suborgan_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Permission_Template_Item" ADD CONSTRAINT "Permission_Template_Item_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "Permission_Template"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification_Recipient" ADD CONSTRAINT "Notification_Recipient_notification_id_fkey" FOREIGN KEY ("notification_id") REFERENCES "Notification"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification_Recipient" ADD CONSTRAINT "Notification_Recipient_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Org_Member" ADD CONSTRAINT "Org_Member_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Org_Member" ADD CONSTRAINT "Org_Member_organisasi_id_fkey" FOREIGN KEY ("organisasi_id") REFERENCES "Organisasi"("suborgan_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Org_Member" ADD CONSTRAINT "Org_Member_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "Org_Custom_Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recruitment_Campaign" ADD CONSTRAINT "Recruitment_Campaign_organisasi_id_fkey" FOREIGN KEY ("organisasi_id") REFERENCES "Organisasi"("suborgan_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recruitment_Campaign" ADD CONSTRAINT "Recruitment_Campaign_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "Form"("form_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recruitment_Step" ADD CONSTRAINT "Recruitment_Step_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "Recruitment_Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recruitment_Step" ADD CONSTRAINT "Recruitment_Step_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "Form"("form_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recruitment_Applicant" ADD CONSTRAINT "Recruitment_Applicant_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "Recruitment_Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recruitment_Applicant" ADD CONSTRAINT "Recruitment_Applicant_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recruitment_Applicant" ADD CONSTRAINT "Recruitment_Applicant_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "Submission"("submission_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Applicant_Step_Status" ADD CONSTRAINT "Applicant_Step_Status_applicant_id_fkey" FOREIGN KEY ("applicant_id") REFERENCES "Recruitment_Applicant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Applicant_Step_Status" ADD CONSTRAINT "Applicant_Step_Status_step_id_fkey" FOREIGN KEY ("step_id") REFERENCES "Recruitment_Step"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Applicant_Step_Status" ADD CONSTRAINT "Applicant_Step_Status_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "Submission"("submission_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PostToTag" ADD CONSTRAINT "_PostToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Post"("post_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PostToTag" ADD CONSTRAINT "_PostToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("tagName") ON DELETE CASCADE ON UPDATE CASCADE;
