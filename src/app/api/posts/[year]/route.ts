import { Post } from "@prisma/client";
import { NextRequest } from "next/server";

import { internalServerError, success } from "@/utils/apiResponse";
import { validatePage } from "@/utils/atomics";
import { findPosts } from "@/utils/database/post.query";
import { PaginatedResult } from "@/utils/paginator";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ year: string }> },
) {
  const { year } = await params;
  const page = req.nextUrl.searchParams.get("page");

  try {
    const paginatedPosts = (await findPosts(
      {
        published_at: {
          gte: new Date(`${year}-01-01`),
          lte: new Date(`${year}-12-31`),
        },
      },
      validatePage(page!) ? parseInt(page!) : 1,
    )) as PaginatedResult<Post>;

    return success({ posts: paginatedPosts.data, meta: paginatedPosts.meta });
  } catch (error) {
    return internalServerError([]);
  }
}
