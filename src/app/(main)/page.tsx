import { findNewestPost } from "@/utils/database/post.query";

import About from "./_components/parts/About";
import Aspiration from "./_components/parts/Aspiration";
import AspirationTutorial from "./_components/parts/AspirationTutorial";
import Header from "./_components/parts/Header";
import News from "./_components/parts/News";
import Opinions from "./_components/parts/Opinions";
import SubOrgan from "./_components/parts/SubOrgan";

export default async function Home() {
  const latestPosts = await findNewestPost(3);

  return (
    <>
      <Header />
      <News latestPosts={latestPosts} />
      <About />
      <SubOrgan />
      <AspirationTutorial />
      <Aspiration />
      <Opinions />
    </>
  );
}

export const revalidate = 60;
