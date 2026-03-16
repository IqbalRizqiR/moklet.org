import { NewsFigure } from "@/app/_components/global/NewsFigure";
import { H2 } from "@/app/_components/global/Text";
import { SmallSectionWrapper } from "@/app/_components/global/Wrapper";
import { PostWithTagsAndUser } from "@/types/entityRelations";
import { findPostByTag } from "@/utils/database/tag.query";
import GoBack from "../../[slug]/_components/BackButton";

export default async function Tag({ params }: { params: Promise<{ tag: string }> }) {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);

  const filteredPost = await findPostByTag(decodedTag, true);

  return (
    <SmallSectionWrapper id="tag">
      <GoBack />

      <div className="mt-8">
        <H2 className="mb-[54px]">Post dengan tag &quot;{decodedTag}&quot;</H2>
        <div className="flex flex-wrap gap-x-[36px] gap-y-[62px]">
          {filteredPost?.map((post) => (
            <NewsFigure post={post as PostWithTagsAndUser} key={post.id} />
          ))}
        </div>
      </div>
    </SmallSectionWrapper>
  );
}
