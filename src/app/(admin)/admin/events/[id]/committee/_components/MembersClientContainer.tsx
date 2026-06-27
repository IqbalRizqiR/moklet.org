"use client";

import React, { useState, useEffect } from "react";
import MembersTable from "./MembersTable";
import CustomRoleManager from "./CustomRoleManager";

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
  level_id?: string | null;
}

interface Member {
  id: string;
  name: string;
  email: string;
  user_pic: string;
  org_role: {
    id: string;
    name: string;
    is_leader: boolean;
    hierarchy_level: number;
    level_id?: string | null;
    level?: { id: string; name: string; order: number } | null;
  } | null;
  permissions: { id: string; permission: string }[];
}

export default function EventMembersClientContainer({
  initialMembers,
  initialRoles,
  initialLevels,
  eventId,
  permissionTemplates,
  guestUsers,
}: {
  initialMembers: Member[];
  initialRoles: Role[];
  initialLevels: Level[];
  eventId: string;
  permissionTemplates: any[];
  guestUsers: any[];
}) {
  const [members, setMembers] = useState(initialMembers);
  const [roles, setRoles] = useState(initialRoles);
  const [levels, setLevels] = useState(initialLevels.sort((a, b) => a.order - b.order));

  // Sync server props if they change (e.g. from RSC revalidation)
  useEffect(() => {
    setMembers(initialMembers);
    setRoles(initialRoles);
    setLevels(initialLevels.sort((a, b) => a.order - b.order));
  }, [initialMembers, initialRoles, initialLevels]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <MembersTable
          members={members}
          setMembers={setMembers}
          customRoles={roles}
          setCustomRoles={setRoles}
          levels={levels}
          eventId={eventId}
          permissionTemplates={permissionTemplates}
          guestUsers={guestUsers}
        />
      </div>
      <div>
        <CustomRoleManager
          roles={roles}
          setRoles={setRoles}
          levels={levels}
          setLevels={setLevels}
          eventId={eventId}
        />
      </div>
    </div>
  );
}
