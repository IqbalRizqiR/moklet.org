"use client";

import React, { useState, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AVAILABLE_PERMISSIONS } from "@/utils/permissions.constants";
import {
  createTemplateAction,
  updateTemplateAction,
  deleteTemplateAction,
} from "@/actions/permissionTemplate";
import { toast } from "sonner";
import { FaGripVertical, FaPlus, FaTrash, FaEdit, FaSave, FaTimes, FaEye } from "react-icons/fa";

interface Template {
  id: string;
  name: string;
  description: string | null;
  items: { id: string; permission: string }[];
}

function DraggablePermission({
  permission,
  label,
  description,
  isInTemplate,
  onAdd,
  onRemove,
}: {
  permission: string;
  label: string;
  description: string;
  isInTemplate?: boolean;
  onAdd?: () => void;
  onRemove?: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: permission });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all cursor-grab active:cursor-grabbing ${
        isInTemplate
          ? "bg-red-50 border-red-200 hover:border-red-400"
          : "bg-white border-gray-200 hover:border-gray-400 hover:shadow-sm"
      }`}
    >
      <span {...attributes} {...listeners} className="text-gray-400 hover:text-gray-600">
        <FaGripVertical size={12} />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-700 truncate">{label}</p>
        <p className="text-xs text-gray-400 truncate">{description}</p>
      </div>
      {isInTemplate && onRemove && (
        <button
          onClick={onRemove}
          className="text-red-400 hover:text-red-600 p-1 transition-colors"
        >
          <FaTimes size={12} />
        </button>
      )}
      {!isInTemplate && onAdd && (
        <button
          onClick={onAdd}
          className="text-green-500 hover:text-green-700 p-1 transition-colors"
        >
          <FaPlus size={12} />
        </button>
      )}
    </div>
  );
}

export default function PermissionBuilder({
  initialTemplates,
}: {
  initialTemplates: Template[];
}) {
  const [templates, setTemplates] = useState<Template[]>(initialTemplates);
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [newTemplateDesc, setNewTemplateDesc] = useState("");
  const [newTemplatePerms, setNewTemplatePerms] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);

  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editPerms, setEditPerms] = useState<string[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor),
  );

  const getPermLabel = (key: string) =>
    AVAILABLE_PERMISSIONS.find((p) => p.key === key)?.label ?? key;
  const getPermDesc = (key: string) =>
    AVAILABLE_PERMISSIONS.find((p) => p.key === key)?.description ?? "";

  const handleCreate = async () => {
    if (!newTemplateName.trim()) {
      toast.error("Nama template wajib diisi");
      return;
    }
    if (newTemplatePerms.length === 0) {
      toast.error("Pilih minimal 1 permission");
      return;
    }
    setIsLoading(true);
    const result = await createTemplateAction(
      newTemplateName,
      newTemplateDesc || null,
      newTemplatePerms,
    );
    setIsLoading(false);

    if (result.error) {
      toast.error(result.message);
    } else {
      toast.success(result.message);
      if (result.data) {
        setTemplates((prev) => [result.data!, ...prev]);
      }
      setIsCreating(false);
      setNewTemplateName("");
      setNewTemplateDesc("");
      setNewTemplatePerms([]);
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editName.trim()) {
      toast.error("Nama template wajib diisi");
      return;
    }
    setIsLoading(true);
    const result = await updateTemplateAction(id, editName, editDesc || null, editPerms);
    setIsLoading(false);

    if (result.error) {
      toast.error(result.message);
    } else {
      toast.success(result.message);
      if (result.data) {
        setTemplates((prev) =>
          prev.map((t) => (t.id === id ? result.data! : t)),
        );
      }
      setEditingTemplate(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus template ini?")) return;
    setIsLoading(true);
    const result = await deleteTemplateAction(id);
    setIsLoading(false);

    if (result.error) {
      toast.error(result.message);
    } else {
      toast.success(result.message);
      setTemplates((prev) => prev.filter((t) => t.id !== id));
    }
  };

  const startEdit = (template: Template) => {
    setEditingTemplate(template.id);
    setEditName(template.name);
    setEditDesc(template.description ?? "");
    setEditPerms(template.items.map((i) => i.permission));
  };

  const getAvailablePerms = (currentPerms: string[]) =>
    AVAILABLE_PERMISSIONS.filter((p) => !currentPerms.includes(p.key));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Permission Builder</h1>
          <p className="text-gray-500 text-sm mt-1">
            Buat template permission yang bisa di-assign ke anggota organisasi
          </p>
        </div>
        {!isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors shadow-md"
          >
            <FaPlus size={12} />
            Buat Template
          </button>
        )}
      </div>

      {isCreating && (
        <div className="bg-white rounded-xl border-2 border-red-200 p-6 shadow-lg">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Template Baru</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="Nama template (e.g. Editor Bundle)"
              value={newTemplateName}
              onChange={(e) => setNewTemplateName(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-300 focus:border-red-400 focus:outline-none"
            />
            <input
              type="text"
              placeholder="Deskripsi (optional)"
              value={newTemplateDesc}
              onChange={(e) => setNewTemplateDesc(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-300 focus:border-red-400 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">
                Permissions Tersedia
              </p>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                <SortableContext
                  items={getAvailablePerms(newTemplatePerms).map((p) => p.key)}
                  strategy={verticalListSortingStrategy}
                >
                  {getAvailablePerms(newTemplatePerms).map((perm) => (
                    <DraggablePermission
                      key={perm.key}
                      permission={perm.key}
                      label={perm.label}
                      description={perm.description}
                      onAdd={() =>
                        setNewTemplatePerms((prev) => [...prev, perm.key])
                      }
                    />
                  ))}
                </SortableContext>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">
                Permissions di Template ({newTemplatePerms.length})
              </p>
              <div
                className={`space-y-2 max-h-64 overflow-y-auto rounded-lg border-2 border-dashed p-3 min-h-[100px] transition-colors ${
                  newTemplatePerms.length === 0
                    ? "border-gray-200 bg-gray-50"
                    : "border-red-200 bg-red-50/30"
                }`}
              >
                {newTemplatePerms.length === 0 && (
                  <p className="text-center text-sm text-gray-400 py-4">
                    Klik + atau drag permission ke sini
                  </p>
                )}
                <SortableContext
                  items={newTemplatePerms}
                  strategy={verticalListSortingStrategy}
                >
                  {newTemplatePerms.map((key) => (
                    <DraggablePermission
                      key={key}
                      permission={key}
                      label={getPermLabel(key)}
                      description={getPermDesc(key)}
                      isInTemplate
                      onRemove={() =>
                        setNewTemplatePerms((prev) =>
                          prev.filter((p) => p !== key),
                        )
                      }
                    />
                  ))}
                </SortableContext>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={handleCreate}
              disabled={isLoading}
              className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
            >
              <FaSave size={12} />
              {isLoading ? "Menyimpan..." : "Simpan"}
            </button>
            <button
              onClick={() => {
                setIsCreating(false);
                setNewTemplatePerms([]);
              }}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter}>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {templates.map((template) => (
            <div
              key={template.id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
            >
              {editingTemplate === template.id ? (
                <div className="p-4 space-y-3">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-red-400 focus:outline-none text-sm"
                  />
                  <input
                    type="text"
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    placeholder="Deskripsi"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-red-400 focus:outline-none text-sm"
                  />
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {AVAILABLE_PERMISSIONS.map((perm) => (
                      <label
                        key={perm.key}
                        className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 p-1 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={editPerms.includes(perm.key)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setEditPerms((prev) => [...prev, perm.key]);
                            } else {
                              setEditPerms((prev) =>
                                prev.filter((p) => p !== perm.key),
                              );
                            }
                          }}
                          className="rounded border-gray-300 text-red-500 focus:ring-red-400"
                        />
                        <span className="text-gray-700">{perm.label}</span>
                      </label>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdate(template.id)}
                      disabled={isLoading}
                      className="flex items-center gap-1 bg-green-500 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-green-600 transition-colors disabled:opacity-50"
                    >
                      <FaSave size={10} />
                      Simpan
                    </button>
                    <button
                      onClick={() => setEditingTemplate(null)}
                      className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-600 text-sm hover:bg-gray-50 transition-colors"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-800">
                          {template.name}
                        </h3>
                        {template.description && (
                          <p className="text-xs text-gray-400 mt-0.5">
                            {template.description}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => setPreviewTemplate(template)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
                          title="Preview"
                        >
                          <FaEye size={12} />
                        </button>
                        <button
                          onClick={() => startEdit(template)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 transition-colors"
                          title="Edit"
                        >
                          <FaEdit size={12} />
                        </button>
                        <button
                          onClick={() => handleDelete(template.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                          title="Hapus"
                        >
                          <FaTrash size={12} />
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {template.items.map((item) => (
                        <span
                          key={item.id}
                          className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded-full font-medium"
                        >
                          {getPermLabel(item.permission)}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-2 text-xs text-gray-400">
                    {template.items.length} permission
                    {template.items.length !== 1 ? "s" : ""}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </DndContext>

      {previewTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4">
              <h3 className="text-white font-bold text-lg">
                {previewTemplate.name}
              </h3>
              {previewTemplate.description && (
                <p className="text-red-100 text-sm mt-1">
                  {previewTemplate.description}
                </p>
              )}
            </div>
            <div className="p-6">
              <p className="text-sm font-medium text-gray-600 mb-3">
                Permissions yang diberikan:
              </p>
              <div className="space-y-2">
                {previewTemplate.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        {getPermLabel(item.permission)}
                      </p>
                      <p className="text-xs text-gray-400">
                        {getPermDesc(item.permission)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="px-6 py-4 border-t bg-gray-50">
              <button
                onClick={() => setPreviewTemplate(null)}
                className="w-full py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
