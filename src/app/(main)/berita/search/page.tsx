import { NewsSearchFigure } from "@/app/_components/global/NewsFigure";
import { H2 } from "@/app/_components/global/Text";
import { SmallSectionWrapper } from "@/app/_components/global/Wrapper";
import { PostWithTagsAndUser } from "@/types/entityRelations";
import { findPosts } from "@/utils/database/post.query";

import GoBack from "../[slug]/_components/BackButton";
import { SearchBar } from "../_components/SearchBar";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function Search({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams.q ?? "";

  if (!query) {
    redirect("/berita");
  }

  const posts = (await findPosts({
    published: true,
    OR: query.split(" ").map((q) => ({
      title: { contains: q },
    })),
  })) as PostWithTagsAndUser[];

  return (
    <SmallSectionWrapper id="search">
      <GoBack />
      <div className="mt-0 md:mt-8">
        <SearchBar query={query} className="pt-0" />
        <div className="">
          <H2 className="mb-[52px]">
            Menampilkan hasil pencarian untuk &quot;
            {query}&quot;
          </H2>
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-4">
            {posts.length !== 0
              ? posts.map((post) => (
                  <NewsSearchFigure post={post} key={post.id} />
                ))
              : null}
          </div>
        </div>
      </div>
    </SmallSectionWrapper>
  );
}
