/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */

import LinkButton from "@/app/_components/global/Button";
import { H2, P } from "@/app/_components/global/Text";
import { auth } from "@/lib/auth";
import { PostWithTagsAndUser } from "@/types/entityRelations";
import { findPosts } from "@/utils/database/post.query";

import PostTable from "./_components/Table";

export default async function PostPanel() {
  const session = await auth();
  const posts = (await findPosts(
    session?.user?.role === "Admin" || session?.user?.role === "SuperAdmin"
      ? {}
      : { user: { role: session?.user?.role } },
  )) as PostWithTagsAndUser[];

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between mb-5">
        <div>
          <H2 className="font-semibold">Posts Panel</H2>
          <P>Share your organ activity, event, or promotion </P>
        </div>
        <div>
          <LinkButton variant={"primary"} href="/admin/posts/create">
            <div className="flex items-center w-full">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6 12H18"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 18V6"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Create Post
            </div>
          </LinkButton>
        </div>
      </div>
      <div>
        <PostTable data={posts} />
      </div>
    </div>
  );
}
