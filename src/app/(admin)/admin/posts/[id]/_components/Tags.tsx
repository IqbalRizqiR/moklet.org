"use client";

import { Roles } from "@/types/enums";
import type { Tag } from "@prisma/client";
import { Dispatch, SetStateAction } from "react";
import { ActionMeta, MultiValue, OnChangeValue } from "react-select";
import CreatableSelect from "react-select/creatable";
import { toast } from "sonner";

import { createTag } from "@/actions/post";
import { TagWithPostCount } from "@/types/entityRelations";

interface selectTag {
  value: string;
  label: string;
}

export default function Tags({
  tags,
  setState,
  state,
  role,
}: Readonly<{
  tags: TagWithPostCount[];
  setState: Dispatch<
    SetStateAction<MultiValue<{ value: string; label: string }>>
  >;
  state: MultiValue<selectTag> | undefined;
  role: Roles;
}>) {
  const options = tags.map((option: Tag) => ({
    value: option.tagName,
    label: option.tagName,
  }));

  const onChange = (
    newValue: OnChangeValue<selectTag, true>,
    actionMeta: ActionMeta<selectTag>,
  ) => {
    switch (actionMeta.action) {
      case "remove-value":
      case "pop-value":
        if (actionMeta.removedValue.value === role) {
          return;
        }
        break;
      case "clear":
        newValue = tags
          .filter((v) => v.tagName === role)
          .map((tag) => ({ value: tag.tagName, label: tag.tagName }));
        break;
    }

    setState(
      newValue
        .filter((v) => v.value === role)
        .concat(newValue.filter((v) => v.value !== role)),
    );
  };

  return (
    <div>
      <label
        htmlFor={"tags"}
        className={
          "first-letter:capitalize after:text-red-500 after:content-['*']"
        }
      >
        Tags
      </label>
      <CreatableSelect
        isMulti
        unstyled
        value={state}
        options={options}
        onChange={onChange}
        name="tags"
        required
        isClearable={options.some((v) => v.value !== role)}
        classNames={{
          control: () =>
            "rounded-xl border border-neutral-400 px-[18px] active:border-black hover:border-black py-[14px] text-black placeholder-neutral-500 bg-white focus:outline-none transition-all duration-500",
          menu: () =>
            "bg-white rounded-lg px-[18px] py-[14px] border border-neutral-400",
          multiValue: () => "bg-primary-400 px-4 py-2 text-white rounded-2xl",
          valueContainer: () => "flex gap-2",
          menuList: () => "text-base flex flex-col gap-1",
          option: () =>
            "hover:bg-neutral-300 hover:cursor-pointer transition-all duration-500 rounded-lg p-2",
        }}
        onCreateOption={async (inputValue: string) => {
          const toastId = toast.loading("Membuat Tag....");
          const result = await createTag(inputValue);
          if (result.error) {
            return toast.error(result.message, { id: toastId });
          }

          const newValue = result.tag?.tagName;
          if (newValue) {
            setState(
              state
                ? [...state, { value: newValue, label: newValue }]
                : [{ value: newValue, label: newValue }],
            );
          }
          toast.success(result.message, { id: toastId });
        }}
      />
    </div>
  );
}
