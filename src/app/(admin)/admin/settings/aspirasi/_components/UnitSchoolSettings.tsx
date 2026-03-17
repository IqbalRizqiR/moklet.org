"use client";

import React, { useState } from "react";
import { UnitSekolah } from "@prisma/client";
import { FaWhatsapp, FaSave, FaSchool } from "react-icons/fa";
import { updateUnitSekolahConfig } from "@/actions/unitSekolahConfig";
import { toast } from "sonner";

interface Config {
  unit: UnitSekolah;
  wa_notify_phone: string | null;
}

export default function UnitSchoolSettings({ initialConfigs }: { initialConfigs: Config[] }) {
  const [configs, setConfigs] = useState<Config[]>(initialConfigs);
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const units = Object.values(UnitSekolah);

  const handleUpdate = async (unit: UnitSekolah, phone: string) => {
    setIsLoading(unit);
    const result = await updateUnitSekolahConfig(unit, phone);
    setIsLoading(null);

    if (result.error) {
      toast.error(result.message);
    } else {
      toast.success(result.message);
    }
  };

  const handleChange = (unit: UnitSekolah, value: string) => {
    setConfigs((prev) => {
      const existing = prev.find((c) => c.unit === unit);
      if (existing) {
        return prev.map((c) => (c.unit === unit ? { ...c, wa_notify_phone: value } : c));
      }
      return [...prev, { unit, wa_notify_phone: value }];
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {units.map((unit) => {
          const config = configs.find((c) => c.unit === unit);
          const phone = config?.wa_notify_phone || "";

          return (
            <div
              key={unit}
              className="glass-card p-5 group hover:red-glow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center text-primary-400">
                    <FaSchool size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-neutral-700">{unit}</h3>
                    <p className="text-[10px] text-neutral-400 font-medium tracking-wider">UNIT SEKOLAH</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-semibold text-neutral-500 flex items-center gap-1.5">
                  <FaWhatsapp className="text-success-600" /> WhatsApp Notifikasi
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => handleChange(unit, e.target.value)}
                    placeholder="6281234567890"
                    className="flex-1 text-sm px-4 py-2.5 rounded-xl bg-white/50 border border-neutral-100 focus:border-primary-400 focus:ring-4 focus:ring-primary-400/5 focus:outline-none transition-all placeholder:text-neutral-300"
                  />
                  <button
                    onClick={() => handleUpdate(unit, phone)}
                    disabled={isLoading === unit}
                    className="px-4 py-2.5 bg-primary-400 text-white rounded-xl text-xs font-semibold hover:bg-primary-500 disabled:opacity-50 transition-all shadow-sm flex items-center gap-2"
                  >
                    {isLoading === unit ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <FaSave />
                    )}
                    <span>Simpan</span>
                  </button>
                </div>
                <p className="text-[10px] text-neutral-400 italic">
                  Gunakan kode negara tanpa tanda +, misal: 628xxx
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
