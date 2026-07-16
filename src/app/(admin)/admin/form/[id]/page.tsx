import { notFound, redirect } from "next/navigation";

import { H2 } from "@/app/_components/global/Text";
import { auth } from "@/lib/auth";
import { FormWithFields } from "@/types/entityRelations";
import { findForm } from "@/utils/database/form.query";
import { BreadcrumbSetter } from "../../components/BreadcrumbContext";

import FormEditContent from "../_components/FormEditContent";

export default async function FormEdit({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const { user } = session!;

  let form: FormWithFields | null;
  if (id == "new") {
    const formBlankTemplate: FormWithFields = {
      allow_edit: false,
      close_at: null,
      created_at: new Date(),
      description: "",
      fields: [],
      id: "",
      is_open: true,
      open_at: null,
      submit_once: true,
      title: "Formulir Baru",
      updated_at: new Date(),
      user_id: user?.id || "",
      _count: { submissions: 0 },
      sections: [],
    };
    form = formBlankTemplate;
  } else form = await findForm({ id });

  if (!form) return notFound();
  if (user?.role != "SuperAdmin" && form.user_id != user?.id)
    return redirect("/unauthorized");

  return (
    <>
      <BreadcrumbSetter id={id} title={form.title} />
      <H2>Edit Formulir</H2>
      <div className="py-2 flex flex-col gap-4">
        <FormEditContent form={form} isNewForm={id == "new"} />
      </div>
    </>
  );
}
