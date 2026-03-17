import { findAllTemplates } from "@/utils/database/permissionTemplate.query";
import PermissionBuilder from "./_components/PermissionBuilder";

export default async function PermissionsPage() {
  const templates = await findAllTemplates();

  return (
    <div className="max-w-6xl mx-auto">
      <PermissionBuilder initialTemplates={templates} />
    </div>
  );
}
