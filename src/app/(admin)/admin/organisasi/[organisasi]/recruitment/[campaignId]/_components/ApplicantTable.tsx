"use client";

import React, { useEffect, useState } from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import Link from "next/link";

interface Applicant {
  id: string;
  name: string;
  email: string;
  status: string;
  user_pic: string;
}

interface Props {
  applicants: Applicant[];
  orgTypeString: string;
  campaignId: string;
}

export default function ApplicantTable({ applicants, orgTypeString, campaignId }: Props) {
  const [loader, setLoader] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setLoader(false);
  }, []);

  const filtered = applicants.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.email.toLowerCase().includes(search.toLowerCase())
  );

  const columns: TableColumn<Applicant>[] = [
    {
      name: "#",
      cell: (_row, index) => <span className="text-gray-400">{(index ?? 0) + 1}</span>,
      width: "60px",
    },
    {
      name: "Nama Pendaftar",
      selector: (row) => row.name,
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-3 py-2">
          <img src={row.user_pic} alt="" className="w-8 h-8 rounded-full object-cover" />
          <div>
            <div className="font-medium text-gray-900">{row.name}</div>
            <div className="text-xs text-gray-400">{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      name: "Status",
      selector: (row) => row.status,
      sortable: true,
      cell: (row) => {
        const styles: Record<string, string> = {
          ACCEPTED: "bg-green-100 text-green-700",
          REJECTED: "bg-red-100 text-red-700",
          PENDING: "bg-yellow-100 text-yellow-700",
        };
        return (
          <span className={`px-2 py-1 rounded text-xs font-bold ${styles[row.status] || "bg-gray-100 text-gray-700"}`}>
            {row.status}
          </span>
        );
      },
      width: "140px",
    },
    {
      name: "Aksi",
      cell: (row) => (
        <Link
          href={`/admin/organisasi/${orgTypeString}/recruitment/${campaignId}/applicant/${row.id}`}
          className="text-primary-500 hover:underline font-medium text-sm"
        >
          Review
        </Link>
      ),
      width: "100px",
    },
  ];

  if (loader) return <div className="bg-white rounded-xl border shadow-sm p-8 text-center text-gray-400">Memuat...</div>;

  return (
    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
      <div className="p-4 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h3 className="font-semibold text-gray-700">Daftar Pendaftar</h3>
        <input
          type="text"
          placeholder="Cari nama atau email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>
      <DataTable
        columns={columns}
        data={filtered}
        pagination
        highlightOnHover
        noDataComponent={
          <div className="p-8 text-center text-gray-500">
            {search ? "Tidak ada hasil yang cocok." : "Belum ada pendaftar."}
          </div>
        }
        paginationPerPage={10}
        paginationRowsPerPageOptions={[10, 25, 50]}
      />
    </div>
  );
}
