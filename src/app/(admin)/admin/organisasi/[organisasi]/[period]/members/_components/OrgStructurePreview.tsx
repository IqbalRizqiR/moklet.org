"use client";

import React from "react";

interface OrgLevel {
  id: string;
  name: string;
  order: number;
}

interface OrgRole {
  id: string;
  name: string;
  is_leader: boolean;
  hierarchy_level: number;
  level?: OrgLevel | null;
}

interface PreviewMember {
  id: string;
  name: string;
  user_pic: string;
  org_role: OrgRole | null;
}

const DOTS = [
  "bg-amber-400",
  "bg-rose-500",
  "bg-pink-400",
  "bg-blue-500",
  "bg-emerald-500",
  "bg-slate-400",
  "bg-violet-400",
  "bg-cyan-400",
];

export default function OrgStructurePreview({
  members,
  pendingMember,
  levels = [],
}: {
  members: PreviewMember[];
  pendingMember?: PreviewMember | null;
  levels?: OrgLevel[];
}) {
  const allMembers = pendingMember
    ? [...members, { ...pendingMember, id: "__pending__" }]
    : members;

  if (allMembers.length === 0) {
    return (
      <div className="rounded-2xl backdrop-blur-md bg-white/50 border border-white/30 p-5 shadow-sm">
        <h3 className="font-semibold text-gray-700 mb-3 text-sm">📊 Struktur Organisasi</h3>
        <p className="text-xs text-gray-400 text-center py-3">
          Belum ada anggota untuk ditampilkan
        </p>
      </div>
    );
  }

  // Group members by level
  const grouped: { key: string; label: string; order: number; members: PreviewMember[] }[] = [];
  const groupMap = new Map<string, number>();

  for (const m of allMembers) {
    let levelName = m.org_role?.level?.name;
    let levelOrder = m.org_role?.level?.order ?? m.org_role?.hierarchy_level ?? 99;
    
    // If level info is missing (common for pending members or partial roles), 
    // try to find it in the levels array using level_id
    if (!levelName && m.org_role?.level_id) {
      const matchedLevel = levels.find(l => l.id === m.org_role?.level_id);
      if (matchedLevel) {
        levelName = matchedLevel.name;
        levelOrder = matchedLevel.order;
      }
    }

    const key = levelName ?? `__level_${m.org_role?.hierarchy_level ?? 99}`;
    const label = levelName ?? (m.org_role ? `Level ${m.org_role.hierarchy_level}` : "Tanpa Level");

    let idx = groupMap.get(key);
    if (idx === undefined) {
      idx = grouped.length;
      groupMap.set(key, idx);
      grouped.push({ key, label, order: levelOrder, members: [] });
    }
    grouped[idx].members.push(m);
  }

  // Sort groups by order
  grouped.sort((a, b) => a.order - b.order);

  return (
    <div className="rounded-2xl backdrop-blur-md bg-white/50 border border-white/30 p-4 shadow-sm">
      <h3 className="font-semibold text-gray-700 mb-3 text-sm">📊 Preview Struktur</h3>

      <div className="space-y-0.5">
        {grouped.map((group, groupIdx) => {
          const dot = DOTS[groupIdx % DOTS.length];

          return (
            <div key={group.key} className="relative">
              {/* Connector */}
              {groupIdx > 0 && (
                <div className="flex justify-center">
                  <div className="w-px h-2.5 bg-gradient-to-b from-gray-300/50 to-transparent" />
                </div>
              )}

              {/* Level pill */}
              <div className="text-center mb-1">
                <span className="inline-flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/60 backdrop-blur-sm border border-white/30 text-gray-500">
                  <span className={`w-1 h-1 rounded-full ${dot}`} />
                  {group.label}
                </span>
              </div>

              {/* Members */}
              <div className="flex flex-wrap justify-center gap-1.5">
                {group.members.map((member) => {
                  const isPending = member.id === "__pending__";
                  return (
                    <div
                      key={member.id}
                      className={`flex items-center gap-1.5 px-2 py-1.5 rounded-xl backdrop-blur-sm transition-all ${
                        isPending
                          ? "bg-green-50/60 border border-green-300/40 border-dashed ring-1 ring-green-400/30 animate-pulse"
                          : "bg-white/40 border border-white/30"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={member.user_pic}
                        alt={member.name}
                        className="w-5 h-5 rounded-full object-cover ring-1 ring-white/50"
                      />
                      <div className="min-w-0">
                        <p className="text-[10px] font-medium text-gray-700 truncate max-w-[80px] leading-tight">
                          {isPending && "⊕ "}
                          {member.name}
                        </p>
                        <p className="text-[8px] text-gray-400 truncate max-w-[80px]">
                          {member.org_role?.name ?? "—"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Connector below */}
              {groupIdx < grouped.length - 1 && (
                <div className="flex justify-center">
                  <div className="w-px h-2.5 bg-gradient-to-b from-transparent to-gray-300/50" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

