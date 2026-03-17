"use client";

import React, { useState, useMemo } from "react";
import { AVAILABLE_PERMISSIONS } from "@/utils/permissions.constants";
import {
  assignToOrg,
  removeFromOrg,
  updateOrgRole,
  assignTemplateAction,
  grantPermissionAction,
  revokePermissionAction,
  registerAndAssign,
} from "@/actions/orgMember";
import { createRoleAction } from "@/actions/orgCustomRole";
import { toast } from "sonner";
import { FaTrash, FaUserPlus, FaShieldAlt, FaPlus, FaCheck, FaStar } from "react-icons/fa";
import OrgStructurePreview from "./OrgStructurePreview";

interface Level {
  id: string;
  name: string;
  order: number;
}

interface OrgRole {
  id: string;
  name: string;
  is_leader: boolean;
  hierarchy_level: number;
  level_id?: string | null;
}

interface MemberPermission {
  id: string;
  permission: string;
}

interface Member {
  id: string;
  name: string;
  email: string;
  user_pic: string;
  org_role: (OrgRole & { level?: Level | null }) | null;
  permissions: MemberPermission[];
}

interface PermTemplate {
  id: string;
  name: string;
  description: string | null;
  items: { id: string; permission: string }[];
}

interface GuestUser {
  id: string;
  name: string;
  email: string;
  user_pic: string;
}

interface MembersTableProps {
  members: Member[];
  setMembers?: React.Dispatch<React.SetStateAction<Member[]>>;
  customRoles: OrgRole[];
  setCustomRoles?: React.Dispatch<React.SetStateAction<OrgRole[]>>;
  organisasiId: string;
  permissionTemplates: PermTemplate[];
  guestUsers: GuestUser[];
  levels?: Level[];
}

export default function MembersTable({
  members,
  setMembers,
  customRoles: roles,
  setCustomRoles,
  organisasiId,
  permissionTemplates,
  guestUsers,
  levels = [],
}: MembersTableProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPermModal, setShowPermModal] = useState<string | null>(null);
  const [showTemplatePreview, setShowTemplatePreview] = useState<PermTemplate | null>(null);

  // Add member state
  const [addTab, setAddTab] = useState<"existing" | "register">("existing");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regRoleId, setRegRoleId] = useState("");

  // Inline role creation
  const [showNewRole, setShowNewRole] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleLevelId, setNewRoleLevelId] = useState("");
  const [newRoleIsLeader, setNewRoleIsLeader] = useState(false);

  // Datatable page
  const [tablePage, setTablePage] = useState(0);
  const PAGE_SIZE = 5;

  // Filtered guests for datatable
  const filteredGuests = useMemo(() => {
    return guestUsers.filter(
      (u) =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [guestUsers, searchQuery]);

  const pagedGuests = filteredGuests.slice(tablePage * PAGE_SIZE, (tablePage + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(filteredGuests.length / PAGE_SIZE);

  // Preview members for structure chart
  const previewMembers = useMemo(() => {
    return members.map((m) => ({
      id: m.id,
      name: m.name,
      user_pic: m.user_pic,
      org_role: m.org_role,
    }));
  }, [members]);

  const pendingMember = useMemo(() => {
    const roleId = addTab === "existing" ? selectedRoleId : regRoleId;
    const role = roles.find((r) => r.id === roleId);
    if (!role) return null;

    if (addTab === "existing") {
      const user = guestUsers.find((u) => u.id === selectedUserId);
      if (!user) return null;
      return { id: "__pending__", name: user.name, user_pic: user.user_pic, org_role: role };
    } else {
      if (!regName.trim()) return null;
      return {
        id: "__pending__",
        name: regName.trim(),
        user_pic: `https://ui-avatars.com/api/?name=${encodeURIComponent(regName.trim())}&background=E04E4E&color=fff`,
        org_role: role,
      };
    }
  }, [addTab, selectedUserId, selectedRoleId, regName, regRoleId, guestUsers, roles]);

  // ── Handlers ─────────────────────────────────────────────────────────
  const handleAddMember = async () => {
    if (!selectedUserId || !selectedRoleId) {
      toast.error("Pilih user dan role");
      return;
    }
    setIsLoading(true);
    const result = await assignToOrg(selectedUserId, organisasiId, selectedRoleId);
    setIsLoading(false);
    if (result.error) {
      toast.error(result.message);
    } else {
      toast.success(result.message);
      if (result.data && setMembers) {
        setMembers((prev) => [...prev, result.data!]);
      }
      closeModal();
    }
  };

  const handleRegisterMember = async () => {
    if (!regName.trim() || !regEmail.trim() || !regRoleId) {
      toast.error("Nama, email, dan role wajib diisi");
      return;
    }
    setIsLoading(true);
    const result = await registerAndAssign(regName, regEmail, organisasiId, regRoleId);
    setIsLoading(false);
    if (result.error) {
      toast.error(result.message);
    } else {
      toast.success(result.message);
      if (result.data && setMembers) {
        setMembers((prev) => [...prev, result.data!]);
      }
      closeModal();
    }
  };

  const handleCreateRoleInline = async () => {
    if (!newRoleName.trim()) {
      toast.error("Nama role wajib diisi");
      return;
    }
    setIsLoading(true);
    const selectedLevel = levels.find((l) => l.id === newRoleLevelId);
    const hierarchyLevel = selectedLevel ? selectedLevel.order : 5;
    const result = await createRoleAction(organisasiId, newRoleName, newRoleIsLeader, hierarchyLevel, newRoleLevelId || null);
    setIsLoading(false);
    if (result.error) {
      toast.error(result.message);
    } else {
      toast.success(`Role "${newRoleName}" berhasil dibuat`);
      if (result.data && setCustomRoles) {
        const created = { ...result.data, hierarchy_level: hierarchyLevel, level_id: newRoleLevelId || null };
        setCustomRoles((prev) => [...prev, created].sort((a, b) => a.hierarchy_level - b.hierarchy_level));
        if (addTab === "existing") setSelectedRoleId(created.id);
        else setRegRoleId(created.id);
      }
      setShowNewRole(false);
      setNewRoleName("");
      setNewRoleLevelId("");
      setNewRoleIsLeader(false);
    }
  };

  const handleRemoveMember = async (userId: string, name: string) => {
    if (!confirm(`Yakin menghapus ${name} dari organisasi?`)) return;
    setIsLoading(true);
    const result = await removeFromOrg(userId);
    setIsLoading(false);
    if (result.error) toast.error(result.message);
    else {
      toast.success(result.message);
      if (setMembers) setMembers((prev) => prev.filter((m) => m.id !== userId));
    }
  };

  const handleRoleChange = async (userId: string, roleId: string) => {
    setIsLoading(true);
    const result = await updateOrgRole(userId, roleId);
    setIsLoading(false);
    if (result.error) toast.error(result.message);
    else {
      toast.success(result.message);
      if (setMembers) {
        setMembers((prev) =>
          prev.map((m) =>
            m.id === userId ? { ...m, org_role: roles.find((r) => r.id === roleId) ?? null } : m,
          ),
        );
      }
    }
  };

  const handleAssignTemplate = async (userId: string, templateId: string) => {
    setIsLoading(true);
    const result = await assignTemplateAction(userId, organisasiId, templateId);
    setIsLoading(false);
    if (result.error) toast.error(result.message);
    else {
      toast.success(result.message);
      if (result.data && setMembers) {
        setMembers((prev) =>
          prev.map((m) =>
            m.id === userId ? { ...m, permissions: result.data!.permissions } : m,
          ),
        );
      }
    }
  };

  const handleTogglePermission = async (userId: string, permission: string, has: boolean) => {
    setIsLoading(true);
    const result = has
      ? await revokePermissionAction(userId, organisasiId, permission)
      : await grantPermissionAction(userId, organisasiId, permission);
    setIsLoading(false);
    if (result.error) toast.error(result.message);
    else {
      toast.success(result.message);
      if (setMembers) {
        setMembers((prev) =>
          prev.map((m) => {
            if (m.id !== userId) return m;
            const perms = has
              ? m.permissions.filter((p) => p.permission !== permission)
              : [...m.permissions, { id: "new", permission }];
            return { ...m, permissions: perms };
          }),
        );
      }
    }
  };

  const closeModal = () => {
    setShowAddModal(false);
    setSearchQuery("");
    setSelectedUserId("");
    setSelectedRoleId("");
    setRegName("");
    setRegEmail("");
    setRegRoleId("");
    setShowNewRole(false);
    setAddTab("existing");
    setTablePage(0);
  };

  // ── Role select with inline creation ─────────────────────────────────
  const currentRoleId = addTab === "existing" ? selectedRoleId : regRoleId;
  const setCurrentRoleId = addTab === "existing" ? setSelectedRoleId : setRegRoleId;

  const RoleSelector = () => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-600">Role</label>
      {roles.length > 0 ? (
        <div className="space-y-1.5 max-h-40 overflow-y-auto">
          {roles.map((role) => (
            <button
              key={role.id}
              type="button"
              onClick={() => setCurrentRoleId(role.id)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left transition-all text-sm ${
                currentRoleId === role.id
                  ? "bg-red-50/80 border-red-300/60 border ring-1 ring-red-200/50"
                  : "bg-white/40 border border-white/30 hover:bg-white/60"
              }`}
            >
              <span className="text-[10px] font-medium bg-white/50 px-1.5 py-0.5 rounded-md text-gray-400">
                {levels.find((l) => l.id === role.level_id)?.name ?? `L${role.hierarchy_level}`}
              </span>
              <span className="font-medium text-gray-700 flex-1">{role.name}</span>
              {role.is_leader && <FaStar className="text-amber-400" size={10} />}
              {currentRoleId === role.id && <FaCheck className="text-red-500" size={10} />}
            </button>
          ))}
        </div>
      ) : (
        <div className="text-center py-4 bg-white/30 rounded-xl border border-dashed border-gray-300/40">
          <p className="text-xs text-gray-400 mb-2">Belum ada role. Buat role dulu!</p>
        </div>
      )}

      {/* Inline new role creation */}
      {showNewRole ? (
        <div className="p-3 rounded-xl bg-blue-50/40 border border-blue-200/40 space-y-2">
          <input
            type="text"
            placeholder="Nama role (cth: Ketua, Sekretaris, PIC Akustik)"
            value={newRoleName}
            onChange={(e) => setNewRoleName(e.target.value)}
            className="w-full text-sm px-3 py-2 rounded-lg bg-white/70 border border-white/50 focus:border-blue-300/60 focus:outline-none"
            autoFocus
          />
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 flex-1">
              <label className="text-[10px] text-gray-500 font-medium whitespace-nowrap">Level:</label>
              <select
                value={newRoleLevelId}
                onChange={(e) => setNewRoleLevelId(e.target.value)}
                className="text-xs px-2 py-1 rounded-lg bg-white/70 border border-white/50 focus:outline-none flex-1"
              >
                <option value="">-- Pilih Level --</option>
                {levels.map((l) => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </div>
            <label className="flex items-center gap-1 text-[10px] text-gray-500 cursor-pointer whitespace-nowrap">
              <input
                type="checkbox"
                checked={newRoleIsLeader}
                onChange={(e) => setNewRoleIsLeader(e.target.checked)}
                className="rounded border-gray-300 text-red-500 focus:ring-red-300 w-3 h-3"
              />
              Leader
            </label>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCreateRoleInline}
              disabled={isLoading || !newRoleName.trim()}
              className="flex-1 py-1.5 bg-blue-500 text-white rounded-lg text-xs font-medium hover:bg-blue-600 disabled:opacity-50 transition-colors"
            >
              {isLoading ? "Membuat..." : "✓ Buat Role"}
            </button>
            <button
              onClick={() => setShowNewRole(false)}
              className="px-3 py-1.5 bg-gray-200 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-300 transition-colors"
            >
              Batal
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowNewRole(true)}
          className="w-full flex items-center justify-center gap-1.5 py-2 text-xs text-blue-500/80 hover:text-blue-600 font-medium border border-dashed border-blue-300/40 rounded-xl hover:bg-blue-50/30 transition-all"
        >
          <FaPlus size={8} /> Buat Role Baru
        </button>
      )}
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Anggota Organisasi</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-red-500/90 to-rose-500/90 text-white px-4 py-2 rounded-xl hover:from-red-500 hover:to-rose-500 transition-all shadow-sm text-sm font-medium"
        >
          <FaUserPlus size={14} />
          Tambah Anggota
        </button>
      </div>

      {/* Members table */}
      <div className="rounded-2xl backdrop-blur-md bg-white/50 border border-white/30 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-white/30 border-b border-white/20">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Anggota</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Role</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Permissions</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600 w-20">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id} className="hover:bg-white/40 transition-all border-b border-white/10 last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={member.user_pic} alt={member.name} className="w-8 h-8 rounded-full ring-1 ring-white/50" />
                      <div>
                        <p className="font-medium text-gray-800">{member.name}</p>
                        <p className="text-xs text-gray-400">{member.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={member.org_role?.id ?? ""}
                      onChange={(e) => handleRoleChange(member.id, e.target.value)}
                      disabled={isLoading}
                      className="text-sm px-2 py-1 rounded-lg bg-white/50 border border-white/30 focus:border-red-300/50 focus:outline-none transition-all"
                    >
                      <option value="">-- Pilih Role --</option>
                      {roles.map((role) => {
                        const assignedLevel = levels.find(l => l.id === role.level_id);
                        const levelDisplay = assignedLevel ? assignedLevel.name : `L${role.hierarchy_level}`;
                        return (
                          <option key={role.id} value={role.id}>
                            {role.name} {role.is_leader ? "⭐" : ""} ({levelDisplay})
                          </option>
                        );
                      })}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {member.permissions.map((perm) => (
                        <span key={perm.id} className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full">
                          {AVAILABLE_PERMISSIONS.find((p) => p.key === perm.permission)?.label ?? perm.permission}
                        </span>
                      ))}
                      {member.permissions.length === 0 && <span className="text-xs text-gray-400">Belum ada</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => setShowPermModal(member.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
                        title="Kelola Permissions"
                      >
                        <FaShieldAlt size={14} />
                      </button>
                      <button
                        onClick={() => handleRemoveMember(member.id, member.name)}
                        disabled={isLoading}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        title="Hapus dari org"
                      >
                        <FaTrash size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {members.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-gray-400">
                    Belum ada anggota. Klik &quot;Tambah Anggota&quot; untuk memulai.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Live structure preview */}
      <OrgStructurePreview
        members={previewMembers}
        pendingMember={showAddModal ? pendingMember : null}
        levels={levels}
      />

      {/* ═══ Add member modal ═══ */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden border border-white/40 max-h-[90vh] flex flex-col">
            <div className="bg-gradient-to-r from-red-500/90 to-rose-500/90 px-6 py-4 shrink-0">
              <h3 className="text-white font-bold text-lg">Tambah Anggota</h3>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200/30 shrink-0">
              <button
                onClick={() => setAddTab("existing")}
                className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                  addTab === "existing"
                    ? "text-red-600 border-b-2 border-red-500"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                User Terdaftar
              </button>
              <button
                onClick={() => setAddTab("register")}
                className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                  addTab === "register"
                    ? "text-red-600 border-b-2 border-red-500"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                Daftarkan Baru
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              {addTab === "existing" ? (
                <>
                  {/* ── User search + datatable ── */}
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Pilih User</label>
                    <input
                      type="text"
                      placeholder="🔍 Cari nama atau email..."
                      value={searchQuery}
                      onChange={(e) => { setSearchQuery(e.target.value); setTablePage(0); }}
                      className="w-full px-3 py-2 rounded-xl bg-white/60 border border-white/40 focus:border-red-300/60 focus:bg-white/80 focus:outline-none transition-all placeholder:text-gray-400/60 mb-2"
                    />

                    {/* Datatable */}
                    <div className="rounded-xl border border-white/30 overflow-hidden bg-white/30">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50/50 border-b border-gray-200/30">
                          <tr>
                            <th className="text-left px-3 py-2 font-medium text-gray-500 text-xs w-8"></th>
                            <th className="text-left px-3 py-2 font-medium text-gray-500 text-xs">Nama</th>
                            <th className="text-left px-3 py-2 font-medium text-gray-500 text-xs">Email</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pagedGuests.map((user) => (
                            <tr
                              key={user.id}
                              onClick={() => setSelectedUserId(user.id)}
                              className={`cursor-pointer transition-all border-b border-white/10 last:border-0 ${
                                selectedUserId === user.id
                                  ? "bg-red-50/60"
                                  : "hover:bg-white/50"
                              }`}
                            >
                              <td className="px-3 py-2">
                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                  selectedUserId === user.id ? "border-red-500 bg-red-500" : "border-gray-300"
                                }`}>
                                  {selectedUserId === user.id && <FaCheck className="text-white" size={8} />}
                                </div>
                              </td>
                              <td className="px-3 py-2">
                                <div className="flex items-center gap-2">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={user.user_pic} alt={user.name} className="w-6 h-6 rounded-full" />
                                  <span className="font-medium text-gray-700 text-sm">{user.name}</span>
                                </div>
                              </td>
                              <td className="px-3 py-2 text-gray-400 text-xs">{user.email}</td>
                            </tr>
                          ))}
                          {filteredGuests.length === 0 && (
                            <tr>
                              <td colSpan={3} className="text-center py-4 text-gray-400 text-xs">
                                Tidak ditemukan. Coba tab &quot;Daftarkan Baru&quot;.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                      {/* Pagination */}
                      {totalPages > 1 && (
                        <div className="flex items-center justify-between px-3 py-2 border-t border-gray-200/20 bg-gray-50/30">
                          <span className="text-[10px] text-gray-400">{filteredGuests.length} user</span>
                          <div className="flex gap-1">
                            {Array.from({ length: totalPages }, (_, i) => (
                              <button
                                key={i}
                                onClick={() => setTablePage(i)}
                                className={`w-6 h-6 rounded text-[10px] font-medium transition-colors ${
                                  tablePage === i
                                    ? "bg-red-500 text-white"
                                    : "bg-white/50 text-gray-500 hover:bg-gray-100"
                                }`}
                              >
                                {i + 1}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* ── Register new user ── */}
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Nama Lengkap</label>
                    <input
                      type="text"
                      placeholder="Nama lengkap anggota"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white/60 border border-white/40 focus:border-red-300/60 focus:bg-white/80 focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                    <input
                      type="email"
                      placeholder="email@example.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white/60 border border-white/40 focus:border-red-300/60 focus:bg-white/80 focus:outline-none transition-all"
                    />
                  </div>
                  <p className="text-xs text-gray-400">
                    💡 User baru akan dibuat dan bisa login nanti via Google OAuth.
                  </p>
                </>
              )}

              {/* ── Role selector (shared by both tabs) ── */}
              <RoleSelector />

              {/* Preview */}
              {pendingMember && (
                <div className="border-t border-gray-200/30 pt-3">
                  <p className="text-xs font-medium text-gray-500 mb-2">📊 Preview posisi di struktur:</p>
                  <OrgStructurePreview members={previewMembers} pendingMember={pendingMember} levels={levels} />
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t bg-gray-50/50 flex gap-3 shrink-0">
              {addTab === "existing" ? (
                <button
                  onClick={handleAddMember}
                  disabled={isLoading || !selectedUserId || !selectedRoleId}
                  className="flex-1 py-2.5 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl hover:from-red-600 hover:to-rose-600 transition-all font-medium disabled:opacity-40 text-sm"
                >
                  {isLoading ? "Menambahkan..." : "Tambah Anggota"}
                </button>
              ) : (
                <button
                  onClick={handleRegisterMember}
                  disabled={isLoading || !regName.trim() || !regEmail.trim() || !regRoleId}
                  className="flex-1 py-2.5 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl hover:from-red-600 hover:to-rose-600 transition-all font-medium disabled:opacity-40 text-sm"
                >
                  {isLoading ? "Mendaftarkan..." : "Daftarkan & Tambah"}
                </button>
              )}
              <button
                onClick={closeModal}
                className="flex-1 py-2.5 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-medium text-sm"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Permissions modal ═══ */}
      {showPermModal && (() => {
        const member = members.find((m) => m.id === showPermModal);
        if (!member) return null;
        return (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden border border-white/40">
              <div className="bg-gradient-to-r from-blue-500/90 to-indigo-500/90 px-6 py-4">
                <h3 className="text-white font-bold text-lg">Permissions — {member.name}</h3>
              </div>
              <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                {/* Templates */}
                {permissionTemplates.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">Apply Template</label>
                    <div className="flex flex-wrap gap-2">
                      {permissionTemplates.map((tmpl) => (
                        <button
                          key={tmpl.id}
                          onClick={() => handleAssignTemplate(member.id, tmpl.id)}
                          disabled={isLoading}
                          className="text-xs px-3 py-1.5 bg-blue-50/60 text-blue-600 rounded-lg border border-blue-200/30 hover:bg-blue-100/60 transition-colors"
                        >
                          {tmpl.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {/* Individual Permissions */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Permission Individual
                  </label>
                  <div className="space-y-1.5">
                    {AVAILABLE_PERMISSIONS.map((perm) => {
                      const has = member.permissions.some((p) => p.permission === perm.key);
                      return (
                        <button
                          key={perm.key}
                          onClick={() => handleTogglePermission(member.id, perm.key, has)}
                          disabled={isLoading}
                          className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-sm transition-all ${
                            has
                              ? "bg-green-50/60 border border-green-200/40"
                              : "bg-white/30 border border-white/20 hover:bg-white/50"
                          }`}
                        >
                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                            has ? "border-green-500 bg-green-500" : "border-gray-300"
                          }`}>
                            {has && <FaCheck className="text-white" size={8} />}
                          </div>
                          <div>
                            <p className="font-medium text-gray-700">{perm.label}</p>
                            <p className="text-[10px] text-gray-400">{perm.key}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 border-t bg-gray-50/50">
                <button
                  onClick={() => setShowPermModal(null)}
                  className="w-full py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-medium text-sm"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
