import { Tag } from "@prisma/client";

import { P } from "@/app/_components/global/Text";
import { findPostByTag } from "@/utils/database/tag.query";

import RelatedNewsFigure from "./RelatedNewsFigure";

export default async function Related({
  currentPostId,
  tags,
}: {
  currentPostId: string;
  tags: Tag[];
}) {
  const relatedPosts =
    tags.length > 0
      ? (await findPostByTag(tags[0].tagName, true, 3))?.filter(
          (post: any) => post.id !== currentPostId,
        )
      : [];

  return (
    <div className="flex flex-col gap-[62px] w-full">
      {relatedPosts?.length !== 0 ? (
        relatedPosts?.map((post: any) => (
          <RelatedNewsFigure post={post} key={post.id} />
        ))
      ) : (
        <P>Belum ada berita lainnya...</P>
      )}
    </div>
  );
}
