/* eslint-disable @typescript-eslint/no-explicit-any */
// Reusable admin data table with search, sort, pagination
"use client";
import { useState, useMemo } from "react";
import { Search, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

export interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (row: any) => React.ReactNode;
  className?: string;
}

interface AdminTableProps {
  data: any[];
  columns: Column[];
  searchKeys?: string[];
  pageSize?: number;
  emptyMessage?: string;
  actions?: (row: any) => React.ReactNode;
  toolbar?: React.ReactNode;
}

export default function AdminTable({
  data, columns, searchKeys = [], pageSize = 10,
  emptyMessage = "No records found.", actions, toolbar,
}: AdminTableProps) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let rows = [...data];
    if (search && searchKeys.length) {
      const q = search.toLowerCase();
      rows = rows.filter((row) =>
        searchKeys.some((k) => String(row[k] ?? "").toLowerCase().includes(q))
      );
    }
    if (sortKey) {
      rows.sort((a, b) => {
        const av = String(a[sortKey] ?? ""), bv = String(b[sortKey] ?? "");
        return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      });
    }
    return rows;
  }, [data, search, sortKey, sortDir, searchKeys]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const toggleSort = (key: string) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
    setPage(1);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-gray-100">
        {searchKeys.length > 0 && (
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search…"
              className="w-full bg-[#f4f4f4] border border-gray-200 rounded-xl pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4f000]" />
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        )}
        <div className="text-xs text-gray-400 ml-auto">{filtered.length} records</div>
        {toolbar}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#f9f9f9] border-b border-gray-100">
              {columns.map((col) => (
                <th key={col.key} className={`px-4 py-3 text-left text-xs font-extrabold text-gray-500 uppercase tracking-widest whitespace-nowrap ${col.className ?? ""}`}>
                  {col.sortable ? (
                    <button className="flex items-center gap-1 hover:text-[#0d0d0d]" onClick={() => toggleSort(col.key)}>
                      {col.label}
                      {sortKey === col.key
                        ? sortDir === "asc" ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                        : <span className="opacity-30"><ChevronUp size={10} /></span>}
                    </button>
                  ) : col.label}
                </th>
              ))}
              {actions && <th className="px-4 py-3 text-right text-xs font-extrabold text-gray-500 uppercase tracking-widest">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {paged.length === 0 ? (
              <tr><td colSpan={columns.length + (actions ? 1 : 0)} className="px-4 py-12 text-center text-gray-400 text-sm">{emptyMessage}</td></tr>
            ) : paged.map((row, i) => (
              <tr key={i} className="hover:bg-[#f9f9f9] transition-colors">
                {columns.map((col) => (
                  <td key={col.key} className={`px-4 py-3 ${col.className ?? ""}`}>
                    {col.render ? col.render(row) : <span className="text-gray-700">{String(row[col.key] ?? "—")}</span>}
                  </td>
                ))}
                {actions && <td className="px-4 py-3 text-right">{actions(row)}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
          <span className="text-xs text-gray-400">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-1">
            <button disabled={page <= 1} onClick={() => setPage(page - 1)}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40">
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
              return (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold border transition-all ${page === p ? "bg-[#0d0d0d] text-white border-[#0d0d0d]" : "border-gray-200 hover:bg-gray-50"}`}>
                  {p}
                </button>
              );
            })}
            <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
