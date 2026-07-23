export function parseDateWIB(d?: string): Date | null {
  if (!d) return null;
  if (d.includes("Z") || /[+-]\d{2}:\d{2}$/.test(d)) {
    const parsed = new Date(d);
    return isNaN(parsed.getTime()) ? null : parsed;
  }
  const normalized = d.length === 16 ? `${d}:00+07:00` : `${d}+07:00`;
  const parsed = new Date(normalized);
  return isNaN(parsed.getTime()) ? null : parsed;
}

export function requireDateWIB(d?: string, fieldName = "Tanggal"): Date {
  const parsed = parseDateWIB(d);
  if (!parsed) throw new Error(`${fieldName} wajib diisi.`);
  return parsed;
}

export function validateStepDates(
  campaignOpenDate: Date,
  campaignCloseDate: Date,
  stepOpenDate: Date,
  stepAnnouncementDate: Date,
  stepCloseDate: Date | null,
  stepType: "ANNOUNCEMENT" | "FORM",
) {
  if (stepOpenDate < campaignOpenDate) {
    throw new Error("Tanggal buka tahapan tidak boleh sebelum tanggal buka campaign.");
  }
  if (stepAnnouncementDate > campaignCloseDate) {
    throw new Error("Tanggal pengumuman tahapan tidak boleh setelah tanggal tutup campaign.");
  }
  if (stepOpenDate > stepAnnouncementDate) {
    throw new Error("Tanggal buka tahapan harus sebelum tanggal pengumuman.");
  }
  if (stepType === "FORM" && stepCloseDate) {
    if (stepCloseDate < stepOpenDate) {
      throw new Error("Batas waktu formulir harus setelah tanggal buka tahapan.");
    }
    if (stepCloseDate > stepAnnouncementDate) {
      throw new Error("Batas waktu formulir harus sebelum tanggal pengumuman.");
    }
  }
}
