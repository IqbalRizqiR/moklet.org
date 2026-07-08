// Available permissions — constants shared between client and server
// This file is safe to import from client components

export const AVAILABLE_PERMISSIONS = [
  { key: "edit_structure", label: "Edit Struktur Organisasi", description: "Mengubah struktur organisasi" },
  { key: "edit_org_info", label: "Edit Info Organisasi", description: "Mengubah informasi organisasi (deskripsi, visi, misi, dll)" },
  { key: "publish_post", label: "Publish Post", description: "Mempublikasikan berita/post" },
  { key: "manage_members", label: "Kelola Anggota", description: "Menambah/menghapus/mengubah role anggota" },
  { key: "manage_events", label: "Kelola Event", description: "Membuat dan mengelola event" },
  { key: "manage_forms", label: "Kelola Formulir", description: "Membuat dan mengelola formulir" },
  { key: "manage_twibbons", label: "Kelola Twibbon", description: "Membuat dan mengelola twibbon" },
  { key: "manage_links", label: "Kelola Link Shortener", description: "Membuat dan mengelola link shortener" },
  { key: "manage_recruitment", label: "Kelola Recruitment", description: "Membuat dan mengelola campaign recruitment" },
] as const;

export type PermissionKey = typeof AVAILABLE_PERMISSIONS[number]["key"];
