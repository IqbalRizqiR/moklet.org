"use client";
import { useRouter } from "next-nprogress-bar";
import { useEffect, useState } from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import { FaRegTrashAlt, FaPen } from "react-icons/fa";
import { toast } from "sonner";

import { deleteEvent } from "@/utils/database/event.query";
import { EventWithRelations } from "@/types/entityRelations";
import { stringifyDate } from "@/utils/atomics";

export default function EventTable({
  data,
}: Readonly<{ data: EventWithRelations[] }>) {
  const [loader, setLoader] = useState(true);
  const router = useRouter();

  const columns: TableColumn<EventWithRelations>[] = [
    {
      name: "Event Name",
      selector: (row: EventWithRelations) => row.event_name,
      sortable: true,
    },
    {
      name: "Organization",
      selector: (row: EventWithRelations) => row.organisasi?.organisasi_name || "-",
      sortable: true,
    },
    {
      name: "Start Date",
      selector: (row: EventWithRelations) => (row.start_date ? row.start_date.toString() : ""),
      cell: (row: EventWithRelations) => (
        <span>{row.start_date ? stringifyDate(row.start_date) : "-"}</span>
      ),
      sortable: true,
    },
    {
      name: "End Date",
      selector: (row: EventWithRelations) => (row.end_date ? row.end_date.toString() : ""),
      cell: (row: EventWithRelations) => (
        <span>{row.end_date ? stringifyDate(row.end_date) : "-"}</span>
      ),
      sortable: true,
    },
    {
      name: "Status",
      selector: (row: EventWithRelations) => row.status,
      cell: (row: EventWithRelations) => {
        let badgeColor = "bg-gray-100 text-gray-800";
        if (row.status === "ACTIVE") badgeColor = "bg-green-100 text-green-800";
        if (row.status === "COMPLETED") badgeColor = "bg-blue-100 text-blue-800";
        return (
          <span className={`text-xs font-medium me-2 px-2.5 py-0.5 rounded ${badgeColor}`}>
            {row.status}
          </span>
        );
      },
      sortable: true,
    },
    {
      name: "Action",
      cell: (row: EventWithRelations) => (
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/admin/events/${row.id}/edit`);
            }}
            title="Edit Event"
            className="bg-blue-100 text-blue-800 text-xs font-medium me-2 p-2.5 rounded hover:text-white hover:bg-blue-700 transition-all"
          >
            <FaPen />
          </button>
        </div>
      ),
    },
  ];

  useEffect(() => {
    setLoader(false);
  }, []);

  if (loader) return <div>Loading</div>;

  return (
    <div className="p-2 rounded-md bg-white">
      <DataTable
        columns={columns}
        data={data}
        pagination
        highlightOnHover
        customStyles={{
          cells: {
            style: {
              "&:hover": {
                cursor: "pointer",
              },
            },
          },
        }}
        onRowClicked={(row: EventWithRelations) =>
          router.push(`/admin/events/${row.id}`)
        }
      />
    </div>
  );
}
