"use client";

import { Field_Type } from "@prisma/client";
import {
  ChangeEvent,
  Dispatch,
  SetStateAction,
  SyntheticEvent,
  MouseEvent,
  useRef,
} from "react";
import { FaTrash } from "react-icons/fa";

import { Button } from "@/app/_components/global/Button";
import { SelectField, TextField } from "@/app/_components/global/Input";
import { H4, P } from "@/app/_components/global/Text";
import { FieldsWithOptions } from "@/types/entityRelations";
import { arrayMove } from "@/utils/atomics";
import { toast } from "sonner";

type Section = { id: number; title: string; order: number };

export default function QuestionEdit({
  fields,
  setFields,
  formId,
  sections,
  setSections,
}: {
  fields: FieldsWithOptions[];
  setFields: Dispatch<SetStateAction<FieldsWithOptions[]>>;
  formId: string;
  sections?: Section[];
  setSections?: Dispatch<SetStateAction<Section[]>>;
}) {
  //Dragable element
  function dragElement(e: React.DragEvent<HTMLDivElement>, index: number) {
    e.dataTransfer.setData("index", index.toString());
  }
  function allowDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
  }
  function dropElement(e: React.DragEvent<HTMLDivElement>, index: number) {
    e.preventDefault();

    const id = parseInt(e.dataTransfer.getData("index"));

    setFields((prev) => {
      const arr = [...prev];
      arrayMove(arr, id, index);
      return arr;
    });
  }

  function removeField(index: number, e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    if (!confirm("Apakah Anda yakin ingin menghapus ini?")) return;

    setFields((prev) => {
      const array = [...prev];
      array.splice(index, 1);
      return array;
    });
  }

  function addOptionByIndex(indexNum: number) {
    const inputElement = document.querySelector(`input[name="inputOption_${indexNum}"]`) as HTMLInputElement;

    if (!inputElement || !inputElement.value || inputElement.value == "") {
      return toast.error("Input tidak boleh kosong!");
    }

    const questions = [...fields];

    questions[indexNum].options = Array.from(
      new Set([
        ...questions[indexNum].options,
        {
          field_id: fields[indexNum].id,
          id: 0,
          value: inputElement.value,
        },
      ])
    );
    setFields(questions);

    inputElement.value = "";
  }

  function removeOption(
    index: number,
    indexOption: number,
    e: MouseEvent<HTMLLIElement>,
  ) {
    e.preventDefault();

    setFields((prev) => {
      const array = [...prev];
      array[index].options.splice(indexOption, 1);
      return array;
    });
  }

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    e.preventDefault();

    type FieldsProps = keyof (typeof fields)[0];
    const name = e.target.name;
    const value = e.target.value;
    const parts = name.split("_");
    const index = parseInt(parts[0]);
    const props = parts.slice(1).join("_") as FieldsProps;

    setFields((prev) => {
      const array = [...prev];
      (array[index][props] as FieldsProps) = (
        e.target.type == "checkbox"
          ? (e.target as HTMLInputElement).checked
          : value
      ) as FieldsProps;

      return array;
    });
  };

  const handleLabelChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    e.preventDefault();

    const name = e.target.name;
    const value = e.target.value;
    const index = parseInt(name.split("_")[0]);

    const tempFields = fields;
    tempFields[index].label = value;
    setFields(tempFields);
  };

  const sectionCounter = useRef(0);
  function nextSectionId() {
    return --sectionCounter.current;
  }

  function addQuestion(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    setFields((prev) => {
      return [
        ...prev,
        {
          form_id: formId,
          id: 0,
          label: "New Question",
          options: [],
          required: true,
          type: "text",
          fieldNumber: fields.length,
          accept_types: null,
          section_id: null,
        },
      ];
    });
  }

  const getSectionName = (sectionId: number | null) => {
    if (!sectionId || !sections) return null;
    return sections.find((s) => s.id === sectionId)?.title || null;
  };

  return (
    <div className="flex flex-col gap-4 transition-all">
      <div className="flex items-center justify-between">
        <H4>Pertanyaan</H4>
        {setSections && sections !== undefined && (
          <Button
            type="button"
            variant={"secondary"}
            onClick={(e: MouseEvent<HTMLButtonElement>) => {
              e.preventDefault();
              const nextOrder = sections.length + 1;
              setSections((prev) => [
                  ...prev,
                  { id: nextSectionId(), title: `Bagian ${nextOrder}`, order: nextOrder },
                ]);
            }}
          >
            + Tambah Bagian
          </Button>
        )}
      </div>

      {/* Section definition list — each section shows its questions */}
      {setSections && sections !== undefined && sections.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {sections.map((section, sIdx) => {
            const count = fields.filter((f) => f.section_id === section.id).length;
            return (
              <div
                key={section.id}
                className="flex items-center gap-2 bg-gray-50 border rounded-lg px-3 py-1.5 text-sm"
              >
                <span className="text-xs font-bold text-gray-400">#{sIdx + 1}</span>
                <input
                  type="text"
                  value={section.title}
                  onChange={(e) => {
                    setSections((prev) => {
                      const updated = [...prev];
                      updated[sIdx] = { ...updated[sIdx], title: e.target.value };
                      return updated;
                    });
                  }}
                  className="w-28 border-0 bg-transparent px-0 py-0 text-sm text-black focus:outline-none focus:ring-0"
                  placeholder="Nama bagian"
                />
                <span className="text-xs text-gray-400 shrink-0">{count} soal</span>
                <button
                  type="button"
                  onClick={() => {
                    setFields((prev) =>
                      prev.map((f) =>
                        f.section_id === section.id ? { ...f, section_id: null } : f,
                      ),
                    );
                    setSections((prev) => prev.filter((_, i) => i !== sIdx));
                  }}
                  className="text-red-400 hover:text-red-600 p-0.5"
                >
                  <FaTrash size={10} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {fields.length === 0 && (
        <P className="text-gray-400 text-sm">Belum ada pertanyaan.</P>
      )}

      {fields.map((item, index) => {
        const assignedSection = getSectionName(item.section_id);
        return (
          <div
            key={item.id + "_" + index + "_" + item.fieldNumber}
            className="p-4 bg-white rounded-md flex flex-col gap-2 cursor-move transition-all border"
            draggable
            onDragStart={(e) => dragElement(e, index)}
            onDrop={(e) => dropElement(e, index)}
            onDragOver={allowDrop}
          >
            <div className="w-full flex justify-between items-center">
              <span className="text-black font-semibold">No. {index + 1}</span>
              <div className="flex items-center gap-2">
                {/* Section badge & selector */}
                {setSections && sections !== undefined && (
                  <div className="flex items-center gap-1">
                    {assignedSection && (
                      <span className="text-[10px] font-semibold bg-primary-50 text-primary-600 px-1.5 py-0.5 rounded-full">
                        {assignedSection}
                      </span>
                    )}
                    <select
                      value={item.section_id ?? ""}
                      onChange={(e) => {
                        const val = e.target.value ? parseInt(e.target.value) : null;
                        setFields((prev) => {
                          const updated = [...prev];
                          updated[index] = { ...updated[index], section_id: val };
                          return updated;
                        });
                      }}
                      className="text-[10px] border border-gray-200 rounded px-1 py-0.5 text-gray-500 bg-white cursor-pointer"
                      onClick={(e: SyntheticEvent) => e.stopPropagation()}
                    >
                      <option value="">No section</option>
                      {sections.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <button
                  type="button"
                  onClick={(e) => removeField(index, e)}
                  className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-red-500 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center transition-all"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
            <SelectField
              name={index + "_type"}
              label="Jenis Pertanyaan"
              options={(
                Object.keys(Field_Type) as Array<keyof typeof Field_Type>
              ).map((key) => {
                return { label: key.toUpperCase(), value: key };
              })}
              value={item.type}
              required
              handleChange={handleChange}
            />
            <TextField
              name={index + "_label"}
              label="Label pertanyaan"
              type="text"
              value={item.label}
              required
              handleChange={handleLabelChange}
            />
            {["radio", "checkbox"].includes(item.type) && (
              <div>
                <div className="flex flex-col md:flex-row gap-2 md:items-end">
                  <TextField
                    name={`inputOption_${index}`}
                    label="Pilihan Jawaban"
                    type="text"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addOptionByIndex(index);
                      }
                    }}
                  />
                  <div>
                    <Button variant={"primary"} type="button" onClick={() => addOptionByIndex(index)}>
                      Tambahkan
                    </Button>
                  </div>
                </div>
                <ul className="list-disc list-inside mt-2">
                  {item.options.map((option, indexOption) => (
                    <li
                      key={item.id + "_option" + option.id}
                      onClick={(e) => removeOption(index, indexOption, e)}
                      className="cursor-pointer hover:text-red-500 transition-all"
                    >
                      {option.value}
                    </li>
                  ))}
                </ul>
                <P>Klik untuk menghapus pilihan</P>
              </div>
            )}
            {item.type === "file" && (
              <SelectField
                name={index + "_accept_types"}
                label="Jenis File yang Diizinkan"
                options={[
                  { label: "Gambar & Dokumen (PDF/Word)", value: "image/*,application/pdf,.doc,.docx" },
                  { label: "Gambar saja", value: "image/*" },
                  { label: "PDF saja", value: "application/pdf" },
                  { label: "Dokumen (PDF/Word)", value: "application/pdf,.doc,.docx" },
                ]}
                value={(item as any).accept_types || "image/*,application/pdf,.doc,.docx"}
                handleChange={handleChange}
              />
            )}
            <div className="flex gap-x-2 cursor-pointer items-center">
              <input
                type="checkbox"
                name={index + "_required"}
                value="true"
                defaultChecked={item.required}
                className="w-5 h-5 cursor-pointer bg-white text-primary-500 accent-primary-500 shrink-0 mt-0.5 border-gray-200 rounded focus:ring-primary-500 disabled:opacity-50 disabled:pointer-events-none transition-all"
                id={index + "_required"}
                onChange={handleChange}
              />
              <label
                htmlFor={index + "_required"}
                className="cursor-pointer ms-2"
              >
                Harus diisi
              </label>
            </div>
          </div>
        );
      })}
      <Button type="button" variant={"primary"} onClick={addQuestion} className="w-full">
        Tambah Pertanyaan
      </Button>

      {setSections && sections !== undefined && sections.length === 0 && (
        <div className="text-xs text-gray-400 text-center">
          <P>
            Belum ada bagian. Semua pertanyaan akan ditampilkan dalam satu halaman.
            Klik &quot;+ Tambah Bagian&quot; di atas untuk membuat halaman wizard.
          </P>
        </div>
      )}
    </div>
  );
}
