"use client";

/**
 * Reference Table Component
 *
 * Advanced table with sorting, filtering, and pagination using TanStack Table
 */

import { useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { useState } from "react";
import type { ReferenceWatchWithStats } from "@/types/watch-schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface ReferenceTableProps {
  data: ReferenceWatchWithStats[];
  isLoading: boolean;
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
  onPageChange: (page: number) => void;
  onEdit?: (reference: ReferenceWatchWithStats) => void;
}

export function ReferenceTable({
  data,
  isLoading,
  pagination,
  onPageChange,
  onEdit,
}: ReferenceTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useMemo<ColumnDef<ReferenceWatchWithStats>[]>(
    () => [
      {
        accessorKey: "brand",
        header: "Brand",
        cell: ({ row }) => (
          <div className="font-semibold">{row.original.brand}</div>
        ),
      },
      {
        accessorKey: "model_name",
        header: "Model",
        cell: ({ row }) => (
          <div>
            <div className="font-medium">{row.original.model_name}</div>
            {row.original.collection_family && (
              <div className="text-xs text-muted-foreground">
                {row.original.collection_family}
              </div>
            )}
          </div>
        ),
      },
      {
        accessorKey: "reference_number",
        header: "Reference",
        cell: ({ row }) => (
          <code className="text-xs bg-muted px-2 py-1 rounded">
            {row.original.reference_number}
          </code>
        ),
      },
      {
        accessorKey: "case_material",
        header: "Material",
        cell: ({ row }) => (
          <div className="text-sm">{row.original.case_material || "-"}</div>
        ),
      },
      {
        accessorKey: "dial_color",
        header: "Dial",
        cell: ({ row }) => (
          <div className="text-sm">{row.original.dial_color || "-"}</div>
        ),
      },
      {
        accessorKey: "verification_status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.original.verification_status;
          const variants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
            verified: "default",
            pending: "secondary",
            needs_review: "outline",
            deprecated: "destructive",
          };

          return (
            <Badge variant={variants[status] || "secondary"} className="capitalize">
              {status.replace(/_/g, " ")}
            </Badge>
          );
        },
      },
      {
        accessorKey: "comparison_count",
        header: "Matches",
        cell: ({ row }) => (
          <div className="text-center text-sm">
            {row.original.comparison_count || 0}
          </div>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit?.(row.original)}
            >
              Edit
            </Button>
          </div>
        ),
      },
    ],
    [onEdit]
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    pageCount: pagination.total_pages,
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading references...</p>
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground mb-4">No references found</p>
          <Button>Add Reference</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr
                  key={headerGroup.id}
                  className="border-b bg-muted/50"
                >
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-left text-sm font-medium"
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          className={
                            header.column.getCanSort()
                              ? "cursor-pointer select-none flex items-center gap-2"
                              : ""
                          }
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {{
                            asc: " ↑",
                            desc: " ↓",
                          }[header.column.getIsSorted() as string] ?? null}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b hover:bg-muted/30 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-4 border-t">
          <div className="text-sm text-muted-foreground">
            Showing {data.length} of {pagination.total} references
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
            >
              Previous
            </Button>

            <div className="text-sm">
              Page {pagination.page} of {pagination.total_pages}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.total_pages}
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
