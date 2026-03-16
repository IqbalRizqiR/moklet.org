-- AlterTable
ALTER TABLE "Organisasi" ADD COLUMN     "wa_notify_phone" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "org_role_id" CHAR(36),
ADD COLUMN     "organisasi_id" CHAR(36);

-- CreateTable
CREATE TABLE "Org_Custom_Role" (
    "id" CHAR(36) NOT NULL,
    "name" TEXT NOT NULL,
    "organisasi_id" CHAR(36) NOT NULL,
    "is_leader" BOOLEAN NOT NULL DEFAULT false,
    "hierarchy_level" INTEGER NOT NULL DEFAULT 5,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

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

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_org_role_id_fkey" FOREIGN KEY ("org_role_id") REFERENCES "Org_Custom_Role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_organisasi_id_fkey" FOREIGN KEY ("organisasi_id") REFERENCES "Organisasi"("suborgan_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Org_Custom_Role" ADD CONSTRAINT "Org_Custom_Role_organisasi_id_fkey" FOREIGN KEY ("organisasi_id") REFERENCES "Organisasi"("suborgan_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Org_Permission" ADD CONSTRAINT "Org_Permission_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Permission_Template_Item" ADD CONSTRAINT "Permission_Template_Item_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "Permission_Template"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification_Recipient" ADD CONSTRAINT "Notification_Recipient_notification_id_fkey" FOREIGN KEY ("notification_id") REFERENCES "Notification"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification_Recipient" ADD CONSTRAINT "Notification_Recipient_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
