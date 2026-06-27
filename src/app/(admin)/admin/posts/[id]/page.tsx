import { notFound, redirect } from "next/navigation";

import { H1 } from "@/app/_components/global/Text";
import { auth } from "@/lib/auth";
import { TagWithPostCount } from "@/types/entityRelations";
import { findUser } from "@/utils/database/user.query";
import { findPost } from "@/utils/database/post.query";
import { findAllTags } from "@/utils/database/tag.query";
import { BreadcrumbSetter } from "../../components/BreadcrumbContext";

import EditForm from "./_components/Form";
import PublishButton from "./_components/parts/PublishButton";
import DownloadIGStoryButton from "./_components/parts/DownloadIGStoryButton";

export const revalidate = 0;

export default async function Edit({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const data = await findPost({ id: id ?? "" });

  if (!data) return notFound();

  const user = await findUser({ id: session?.user?.id });
  let organizations = user?.memberships ?? [];

  // Ensure the post's current organization is in the list, so Admins can see/keep the selection
  if (data.organisasi_id && data.organisasi) {
    const orgExists = organizations.some(
      (m: any) => m.organisasi_id === data.organisasi_id
    );
    if (!orgExists) {
      organizations = [
        ...organizations,
        {
          organisasi_id: data.organisasi_id,
          organisasi: data.organisasi,
          role: null, // Dummy role for the option to render
        },
      ];
    }
  }

  // Permission check
  const isAuthor = data.user_id === session?.user?.id;
  const isAdmin =
    session?.user?.role === "Admin" || session?.user?.role === "SuperAdmin";
  let hasPermission = isAuthor || isAdmin;

  if (!hasPermission && data.organisasi_id) {
    const isOrgLeader = organizations.some(
      (m: any) =>
        m.organisasi_id === data.organisasi_id && m.role?.is_leader === true,
    );
    if (isOrgLeader) hasPermission = true;
  }

  if (!hasPermission) {
    return redirect("/unauthorized");
  }

  const tags = (await findAllTags()) as TagWithPostCount[];

  return (
    <div className="flex flex-col gap-4">
      <BreadcrumbSetter id={data.id} title={data.title} />
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <H1>Edit Post</H1>
          <DownloadIGStoryButton slug={data.slug} />
        </div>
        <PublishButton state={data.published} id={data.id} />
      </div>
      <EditForm tags={tags} post={data} organizations={organizations} />
    </div>
  );
}
