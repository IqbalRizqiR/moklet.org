import { MetadataRoute } from "next";

import { PostWithTagsAndUser, TagWithPostCount } from "@/types/entityRelations";
import { findOrganisasis } from "@/utils/database/organisasi.query";
import { findPosts } from "@/utils/database/post.query";
import { findAllTags } from "@/utils/database/tag.query";
import { findAllPeriods } from "@/utils/database/periodYear.query";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = (await findPosts()) as PostWithTagsAndUser[];
  const tags = (await findAllTags()) as TagWithPostCount[];
  const organisasis = await findOrganisasis();
  const periods = await findAllPeriods();

  // Except /berita because its set to changes monthly
  const conventionalRoutes: MetadataRoute.Sitemap = [
    "/organisasi",
    "/tentang",
    "/kontributor",
  ].map((route) => ({
    url: `${process.env.URL ?? "https://www.moklet.org"}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "monthly",
  }));

  const postsRoutes: MetadataRoute.Sitemap = posts.map((post: any) => ({
    url: `${process.env.URL ?? "https://www.moklet.org"}/berita/${post.slug}`,
    lastModified: post.updated_at.toISOString(),
    changeFrequency: "yearly",
  }));

  const tagsRoutes: MetadataRoute.Sitemap = tags.map((tag: any) => ({
    url: `${process.env.URL ?? "https://www.moklet.org"}/berita/tags/${tag.tagName}`,
    changeFrequency: "monthly",
  }));

  const organisasisRoutes: MetadataRoute.Sitemap = organisasis.map(
    (organisasi: any) => ({
      url: `${process.env.URL ?? "https://www.moklet.org"}/organisasi/${organisasi.period.period}/${organisasi.organisasi}`,
      lastModified: organisasi.updated_at.toISOString(),
      changeFrequency: "yearly",
    }),
  );

  const periodsRoutes: MetadataRoute.Sitemap = periods.map((period: any) => ({
    url: `${process.env.URL ?? "https://www.moklet.org"}/organisasi/${period.period}`,
    changeFrequency: "monthly",
  }));

  return [
    {
      url: `${process.env.URL ?? "https://www.moklet.org"}/`,
      lastModified: new Date().toISOString(),
      priority: 1,
      changeFrequency: "never",
    },
    {
      url: `${process.env.URL ?? "https://www.moklet.org"}/berita`,
      priority: 0.8,
      changeFrequency: "monthly",
    },
    ...conventionalRoutes,
    ...postsRoutes,
    ...tagsRoutes,
    ...organisasisRoutes,
    ...periodsRoutes,
  ];
}

export const revalidate = 7200;
