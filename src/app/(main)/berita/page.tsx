import News from "./_components/News";
import { SearchBar } from "./_components/SearchBar";
import TopNews from "./_components/TopNews";

export default async function Berita({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  return (
    <>
      <SearchBar />
      <div className="w-full flex flex-wrap">
        <TopNews />
      </div>
      <News searchParams={resolvedSearchParams} />
    </>
  );
}

export const revalidate = 60;
