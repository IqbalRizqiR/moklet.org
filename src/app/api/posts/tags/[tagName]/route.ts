import { internalServerError, success } from "@/utils/apiResponse";
import { findPostByTag } from "@/utils/database/tag.query";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ tagName: string }> },
) {
  const { tagName } = await params;

  try {
    const posts = await findPostByTag(tagName, true);

    return success(posts);
  } catch (error) {
    return internalServerError([]);
  }
}
