"use client";

import React, { useState } from "react";
import { FaPlus, FaTrash, FaEdit, FaCheck, FaTimes, FaStar, FaArrowUp, FaArrowDown, FaGripVertical, FaSave } from "react-icons/fa";
import { createLevel, updateLevel, deleteLevel, reorderLevels } from "@/actions/orgLevel";
import { createRoleAction, updateRoleAction, deleteRoleAction } from "@/actions/orgCustomRole";
import { toast } from "sonner";

interface Level {
  id: string;
  name: string;
  order: number;
}

interface Role {
  id: string;
  name: string;
  is_leader: boolean;
  hierarchy_level: number;
  level_id: string | null;
}

export default function CustomRoleManager({
  organisasiId,
  initialLevels,
  initialRoles,
}: {
  organisasiId: string;
  initialLevels: Level[];
  initialRoles: Role[];
}) {
  const [levels, setLevels] = useState(initialLevels.sort((a, b) => a.order - b.order));
  const [roles, setRoles] = useState(initialRoles);
  const [isLoading, setIsLoading] = useState(false);

  const [newLevelName, setNewLevelName] = useState("");
  const [editingLevel, setEditingLevel] = useState<string | null>(null);
  const [editLevelName, setEditLevelName] = useState("");

  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleLevelId, setNewRoleLevelId] = useState("");
  const [newRoleIsLeader, setNewRoleIsLeader] = useState(false);
  const [editingRole, setEditingRole] = useState<string | null>(null);
  const [editRoleName, setEditRoleName] = useState("");
  const [editRoleLevelId, setEditRoleLevelId] = useState("");
  const [editRoleIsLeader, setEditRoleIsLeader] = useState(false);

  const [draggedId, setDraggedId] = useState<string | null>(null);

  const handleCreateLevel = async () => {
    if (!newLevelName.trim()) return;
    setIsLoading(true);
    const maxOrder = levels.length > 0 ? Math.max(...levels.map((l) => l.order)) + 1 : 0;
    const result = await createLevel(organisasiId, newLevelName.trim(), maxOrder);
    setIsLoading(false);
    if (result.error) toast.error(result.message);
    else {
      toast.success(result.message);
      if (result.data) setLevels((prev) => [...prev, result.data!].sort((a, b) => a.order - b.order));
      setNewLevelName("");
    }
  };

  const handleUpdateLevel = async (id: string) => {
    if (!editLevelName.trim()) return;
    setIsLoading(true);
    const result = await updateLevel(id, editLevelName.trim());
    setIsLoading(false);
    if (result.error) toast.error(result.message);
    else {
      toast.success(result.message);
      setLevels((prev) => prev.map((l) => (l.id === id ? { ...l, name: editLevelName.trim() } : l)));
      setEditingLevel(null);
    }
  };

  const handleDeleteLevel = async (id: string) => {
    if (!confirm("Hapus level ini?")) return;
    setIsLoading(true);
    const result = await deleteLevel(id);
    setIsLoading(false);
    if (result.error) toast.error(result.message);
    else {
      toast.success(result.message);
      setLevels((prev) => prev.filter((l) => l.id !== id));
    }
  };

  const moveLevel = async (index: number, direction: "up" | "down") => {
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= levels.length) return;
    const newLevels = [...levels];
    [newLevels[index], newLevels[target]] = [newLevels[target], newLevels[index]];
    const reordered = newLevels.map((l, i) => ({ ...l, order: i }));
    setLevels(reordered);
    const result = await reorderLevels(organisasiId, reordered.map((l) => ({ id: l.id, order: l.order })));
    if (result.error) toast.error(result.message);
  };

  const handleDragStart = (id: string) => setDraggedId(id);
  const handleDragEnd = () => setDraggedId(null);
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = async (targetId: string) => {
    if (!draggedId || draggedId === targetId) return;
    const fromIdx = levels.findIndex((l) => l.id === draggedId);
    const toIdx = levels.findIndex((l) => l.id === targetId);
    if (fromIdx === -1 || toIdx === -1) return;
    const newLevels = [...levels];
    const [moved] = newLevels.splice(fromIdx, 1);
    newLevels.splice(toIdx, 0, moved);
    const reordered = newLevels.map((l, i) => ({ ...l, order: i }));
    setLevels(reordered);
    setDraggedId(null);
    const result = await reorderLevels(organisasiId, reordered.map((l) => ({ id: l.id, order: l.order })));
    if (result.error) toast.error(result.message);
  };

  const handleCreateRole = async () => {
    if (!newRoleName.trim()) return;
    setIsLoading(true);
    const level = levels.find((l) => l.id === newRoleLevelId);
    const hierarchyLevel = level ? level.order : 5;
    const result = await createRoleAction(organisasiId, newRoleName.trim(), newRoleIsLeader, hierarchyLevel, newRoleLevelId || null);
    setIsLoading(false);
    if (result.error) toast.error(result.message);
    else {
      toast.success(result.message);
      if (result.data) {
        setRoles((prev) => [...prev, {
          id: result.data!.id,
          name: result.data!.name,
          is_leader: result.data!.is_leader,
          hierarchy_level: result.data!.hierarchy_level,
          level_id: (result.data as { level_id: string | null }).level_id ?? null,
        }]);
      }
      setNewRoleName("");
      setNewRoleLevelId("");
      setNewRoleIsLeader(false);
    }
  };

  const handleUpdateRole = async (id: string) => {
    if (!editRoleName.trim()) return;
    setIsLoading(true);
    const level = levels.find((l) => l.id === editRoleLevelId);
    const hierarchyLevel = level ? level.order : 5;
    const result = await updateRoleAction(id, editRoleName.trim(), editRoleIsLeader, hierarchyLevel, editRoleLevelId || null);
    setIsLoading(false);
    if (result.error) {
      toast.error(result.message);
    } else {
      toast.success("Role berhasil diupdate!");
      setRoles((prev) =>
        prev.map((r) =>
          r.id === id
            ? { ...r, name: editRoleName.trim(), is_leader: editRoleIsLeader, hierarchy_level: hierarchyLevel, level_id: editRoleLevelId || null }
            : r,
        ),
      );
      setEditingRole(null);
    }
  };

  const handleDeleteRole = async (id: string) => {
    if (!confirm("Hapus role ini?")) return;
    setIsLoading(true);
    const result = await deleteRoleAction(id);
    setIsLoading(false);
    if (result.error) toast.error(result.message);
    else {
      toast.success(result.message);
      setRoles((prev) => prev.filter((r) => r.id !== id));
    }
  };

  const startEditRole = (role: Role) => {
    setEditingRole(role.id);
    setEditRoleName(role.name);
    setEditRoleLevelId(role.level_id || "");
    setEditRoleIsLeader(role.is_leader);
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-white/60 backdrop-blur-lg border border-white/40 overflow-hidden shadow-sm">
        <div className="bg-gradient-to-r from-red-500 to-rose-500 px-5 py-3">
          <h3 className="text-white font-bold text-sm">📊 Level Tiers</h3>
          <p className="text-white/70 text-[10px] mt-0.5">Drag atau klik panah untuk mengubah urutan hierarchy</p>
        </div>

        <div className="p-4 space-y-1.5">
          {levels.map((level, index) => (
            <div
              key={level.id}
              draggable
              onDragStart={() => handleDragStart(level.id)}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(level.id)}
              className={`group flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all ${
                draggedId === level.id
                  ? "opacity-40 scale-95 bg-red-50/50 border border-red-200/50"
                  : "bg-white/50 border border-gray-100/50 hover:bg-white/80 hover:shadow-sm"
              }`}
            >
              <FaGripVertical className="text-gray-300 group-hover:text-gray-400 cursor-grab active:cursor-grabbing shrink-0 transition-colors" size={10} />

              <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-red-500/15 to-rose-500/10 flex items-center justify-center text-[10px] font-bold text-red-500 shrink-0">
                {index}
              </span>

              {editingLevel === level.id ? (
                <div className="flex items-center gap-1.5 flex-1">
                  <input
                    value={editLevelName}
                    onChange={(e) => setEditLevelName(e.target.value)}
                    className="flex-1 text-sm px-2 py-1 rounded-lg bg-white border border-gray-200 focus:outline-none focus:border-red-300 focus:ring-1 focus:ring-red-100"
                    autoFocus
                    onKeyDown={(e) => e.key === "Enter" && handleUpdateLevel(level.id)}
                  />
                  <button onClick={() => handleUpdateLevel(level.id)} disabled={isLoading} className="p-1.5 text-green-500 hover:bg-green-50 rounded-lg transition-colors"><FaCheck size={10} /></button>
                  <button onClick={() => setEditingLevel(null)} className="p-1.5 text-gray-400 hover:bg-gray-50 rounded-lg transition-colors"><FaTimes size={10} /></button>
                </div>
              ) : (
                <>
                  <span className="flex-1 text-sm font-medium text-gray-700">{level.name}</span>
                  <span className="text-[9px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded-md">
                    {roles.filter((r) => r.level_id === level.id).length} role
                  </span>
                </>
              )}

              {editingLevel !== level.id && (
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button onClick={() => moveLevel(index, "up")} disabled={index === 0} className="p-1 text-gray-400 hover:text-red-500 disabled:opacity-20 rounded transition-colors"><FaArrowUp size={8} /></button>
                  <button onClick={() => moveLevel(index, "down")} disabled={index === levels.length - 1} className="p-1 text-gray-400 hover:text-red-500 disabled:opacity-20 rounded transition-colors"><FaArrowDown size={8} /></button>
                  <button onClick={() => { setEditingLevel(level.id); setEditLevelName(level.name); }} className="p-1 text-gray-400 hover:text-blue-500 rounded transition-colors"><FaEdit size={8} /></button>
                  <button onClick={() => handleDeleteLevel(level.id)} className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors"><FaTrash size={8} /></button>
                </div>
              )}
            </div>
          ))}

          {levels.length === 0 && (
            <div className="text-center py-6">
              <p className="text-xs text-gray-400">Belum ada level.</p>
              <p className="text-[10px] text-gray-300 mt-1">Buat level untuk mengatur hierarchy organisasi.</p>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <input
              type="text"
              placeholder="Nama level baru..."
              value={newLevelName}
              onChange={(e) => setNewLevelName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateLevel()}
              className="flex-1 text-sm px-3 py-2 rounded-xl bg-white/70 border border-gray-100 focus:border-red-300 focus:ring-1 focus:ring-red-100 focus:outline-none transition-all placeholder:text-gray-300"
            />
            <button
              onClick={handleCreateLevel}
              disabled={isLoading || !newLevelName.trim()}
              className="px-3 py-2 bg-red-500 text-white rounded-xl text-xs font-medium hover:bg-red-600 disabled:opacity-30 transition-all flex items-center gap-1 shadow-sm"
            >
              <FaPlus size={8} /> Tambah
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white/60 backdrop-blur-lg border border-white/40 overflow-hidden shadow-sm">
        <div className="bg-gradient-to-r from-red-500 to-rose-500 px-5 py-3">
          <h3 className="text-white font-bold text-sm">🏷️ Roles</h3>
          <p className="text-white/70 text-[10px] mt-0.5">Jabatan yang bisa di-assign ke anggota</p>
        </div>

        <div className="p-4 space-y-3">
          {levels.map((level) => {
            const levelRoles = roles.filter((r) => r.level_id === level.id);
            if (levelRoles.length === 0) return null;
            return (
              <div key={level.id}>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 px-1">{level.name}</p>
                <div className="space-y-1">
                  {levelRoles.map((role) => renderRoleItem(role))}
                </div>
              </div>
            );
          })}

          {(() => {
            const unassigned = roles.filter((r) => !r.level_id);
            if (unassigned.length === 0) return null;
            return (
              <div>
                <p className="text-[10px] font-semibold text-gray-300 uppercase tracking-wider mb-1.5 px-1">Tanpa Level</p>
                <div className="space-y-1">
                  {unassigned.map((role) => renderRoleItem(role))}
                </div>
              </div>
            );
          })()}

          {roles.length === 0 && (
            <div className="text-center py-6">
              <p className="text-xs text-gray-400">Belum ada role.</p>
              <p className="text-[10px] text-gray-300 mt-1">Buat level dulu, lalu tambah role.</p>
            </div>
          )}

          <div className="pt-3 border-t border-gray-100/60 space-y-2">
            <input
              type="text"
              placeholder="Nama role baru..."
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              className="w-full text-sm px-3 py-2 rounded-xl bg-white/70 border border-gray-100 focus:border-red-300 focus:ring-1 focus:ring-red-100 focus:outline-none transition-all placeholder:text-gray-300"
            />
            <div className="flex items-center gap-2">
              <select
                value={newRoleLevelId}
                onChange={(e) => setNewRoleLevelId(e.target.value)}
                className="flex-1 text-xs px-2 py-1.5 rounded-lg bg-white/70 border border-gray-100 focus:outline-none focus:border-red-300"
              >
                <option value="">-- Pilih Level --</option>
                {levels.map((l) => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
              <button
                onClick={handleCreateRole}
                disabled={isLoading || !newRoleName.trim()}
                className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-medium hover:bg-red-600 disabled:opacity-30 transition-all flex items-center gap-1 shadow-sm"
              >
                <FaPlus size={8} /> Tambah
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  function renderRoleItem(role: Role) {
    if (editingRole === role.id) {
      return (
        <div key={role.id} className="p-3 rounded-xl bg-blue-50/50 border border-blue-200/40 space-y-2">
          <input
            value={editRoleName}
            onChange={(e) => setEditRoleName(e.target.value)}
            className="w-full text-sm px-3 py-2 rounded-lg bg-white border border-gray-200 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
            autoFocus
          />
          <div className="flex items-center gap-2">
            <select
              value={editRoleLevelId}
              onChange={(e) => setEditRoleLevelId(e.target.value)}
              className="flex-1 text-xs px-2 py-1.5 rounded-lg bg-white border border-gray-200 focus:outline-none focus:border-blue-400"
            >
              <option value="">-- Pilih Level --</option>
              {levels.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
            <label className="flex items-center gap-1 text-xs text-gray-500 cursor-pointer whitespace-nowrap select-none">
              <input type="checkbox" checked={editRoleIsLeader} onChange={(e) => setEditRoleIsLeader(e.target.checked)} className="w-3 h-3 rounded accent-red-500" />
              <FaStar className="text-amber-400" size={8} />
            </label>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleUpdateRole(role.id)}
              disabled={isLoading || !editRoleName.trim()}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-primary-400 text-white rounded-lg text-xs font-medium hover:bg-blue-600 disabled:opacity-40 transition-all"
            >
              <FaSave size={10} /> {isLoading ? "Menyimpan..." : "Simpan"}
            </button>
            <button
              onClick={() => setEditingRole(null)}
              className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors"
            >
              Batal
            </button>
          </div>
        </div>
      );
    }

    return (
      <div key={role.id} className="group flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/50 border border-gray-100/50 hover:bg-white/80 hover:shadow-sm transition-all">
        <span className="flex-1 text-sm font-medium text-gray-700">{role.name}</span>
        {role.is_leader && <FaStar className="text-amber-400 shrink-0" size={10} />}
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button onClick={() => startEditRole(role)} className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"><FaEdit size={10} /></button>
          <button onClick={() => handleDeleteRole(role.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><FaTrash size={10} /></button>
        </div>
      </div>
    );
  }
}
