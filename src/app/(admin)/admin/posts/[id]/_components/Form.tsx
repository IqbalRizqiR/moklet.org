"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { MultiValue } from "react-select";
import { toast } from "sonner";

import { postUpdate } from "@/actions/post";
import Image from "@/app/_components/global/Image";
import { TextArea, TextField } from "@/app/_components/global/Input";
import { PostWithTagsAndUser, TagWithPostCount } from "@/types/entityRelations";

import Editor from "@/app/(admin)/admin/components/MdEditor";
import FormButton from "../../_components/parts/SubmitButton";

import { fileSizeToMb } from "@/utils/atomics";
import Tags from "./Tags";

export default function EditForm({
  tags,
  post,
}: Readonly<{
  tags: TagWithPostCount[];
  post: PostWithTagsAndUser;
}>) {
  const [value, setValue] = useState(post.content);
  const [image, setImage] = useState(post.thumbnail);
  const [slug, setSlug] = useState(post.slug);
  const { data: session } = useSession();
  const selected = post.tags.map((tag) => ({
    value: tag.tagName,
    label: tag.tagName,
  }));
  const [tag, setTag] = useState<MultiValue<{ value: string; label: string }>>(
    [],
  );

  useEffect(() => {
    if (
      session?.user?.role &&
      selected.findIndex((i) => i.value === session?.user?.role) === -1 &&
      !session?.user?.role.includes("Admin")
    ) {
      selected.unshift({
        label: post.user.role.toString(),
        value: post.user.role.toString(),
      });
    }
    setTag(selected);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.role]);

  return (
    <form
      action={async (data) => {
        const toastId = toast.loading("Loading...");

        const thumbnail = data.get("thumbnail") as File | undefined;
        if (thumbnail?.name === "") data.delete("thumbnail");

        const thumbnailSizeInMb = thumbnail ? fileSizeToMb(thumbnail.size) : 0;
        if (thumbnailSizeInMb >= 4.3) {
          toast.error("Ukuran file terlalu besar! Ukuran maximum 4,3 MB", {
            id: toastId,
          });
          return;
        }

        const result = await postUpdate(data, value, tag, post.id);
        if (result.error) {
          toast.error(result.message, { id: toastId });
          return;
        }
        toast.success(result.message, { id: toastId });
      }}
      className="flex flex-col gap-y-3"
    >
      <TextField
        type="text"
        label="Judul Post"
        name="title"
        required={true}
        handleChange={(e) => {
          const splitString = e.currentTarget.value
            .replace(/[^a-zA-Z0-9]/g, "")
            .toLowerCase()
            .split(" ");
          const slug = splitString.join("-");
          setSlug(slug);
        }}
        value={post.title}
      />
      <TextArea
        label="Deskripsi"
        name="desc"
        placeholder="berita tentang bblaballala"
        value={post.description}
        required
      />
      <TextField
        type="text"
        label="Custom Slug"
        name="slug"
        value={slug}
        placeholder="berita-paling-panas-2024"
      />
      <Tags tags={tags} setState={setTag} state={tag} role={post.user?.role} />
      <div className="flex flex-col">
        <label htmlFor="thumbnail" className="">
          Thumbnail
        </label>
        <Image
          className="w-[300px] h-[200px] rounded-2xl object-cover mb-2"
          width={300}
          height={200}
          alt={post.title}
          src={image}
          unoptimized
        />
        <input
          type="file"
          onChange={(e) => {
            setImage(URL.createObjectURL(e.target.files![0]));
          }}
          accept="image/*"
          name="thumbnail"
          className="border border-neutral-500 border-dotted rounded-xl py-5 px-3"
        />
      </div>
      <Editor
        onChange={(data) => {
          setValue(data!);
        }}
        value={value}
      />
      <FormButton />
    </form>
  );
}
