import { auth } from "@/lib/auth";
import { TagWithPostCount } from "@/types/entityRelations";
import { findAllTags } from "@/utils/database/tag.query";
import { findUser } from "@/utils/database/user.query";

import PostForm from "./_components/Form";

export default async function CreatePost() {
  const session = await auth();
  const user = await findUser({ id: session?.user?.id });
  const tags = (await findAllTags()) as TagWithPostCount[];

  return (
    <div>
      <PostForm tags={tags} organizations={user?.memberships ?? []} />
    </div>
  );
}
