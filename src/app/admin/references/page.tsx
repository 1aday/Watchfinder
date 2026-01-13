"use client";

/**
 * Admin References Page
 *
 * Manage reference watch library with TanStack Table
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAdminStore } from "@/lib/stores/admin-store";
import { ReferenceTable } from "@/components/admin/reference-table";
import { ReferenceForm } from "@/components/admin/reference-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ReferenceWatch } from "@/types/watch-schema";

export default function AdminReferencesPage() {
  const {
    references,
    isLoading,
    error,
    filters,
    pagination,
    loadReferences,
    setFilters,
    setPage,
  } = useAdminStore();

  const [formOpen, setFormOpen] = useState(false);
  const [editingReference, setEditingReference] = useState<
    Partial<ReferenceWatch> | undefined
  >(undefined);

  useEffect(() => {
    loadReferences();
  }, [loadReferences]);

  const handleAddNew = () => {
    setEditingReference(undefined);
    setFormOpen(true);
  };

  const handleEdit = (reference: ReferenceWatch) => {
    setEditingReference(reference);
    setFormOpen(true);
  };

  const handleSubmit = async (data: Partial<ReferenceWatch>) => {
    try {
      const url = editingReference
        ? `/api/references/${editingReference.id}`
        : "/api/references";
      const method = editingReference ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to save reference");
      }

      // Reload the references
      await loadReferences();
      setFormOpen(false);
    } catch (error) {
      console.error("Error saving reference:", error);
      alert("Failed to save reference. Please try again.");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Reference Library
          </h1>
          <p className="text-muted-foreground">
            Manage watch references for comparison against AI analysis
          </p>
        </div>
        <Link href="/admin/references/new">
          <Button className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 shadow-lg shadow-blue-500/25">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Reference
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Brand</label>
              <Input
                placeholder="Search by brand..."
                value={filters.brand || ""}
                onChange={(e) => setFilters({ brand: e.target.value || undefined })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Model</label>
              <Input
                placeholder="Search by model..."
                value={filters.model || ""}
                onChange={(e) => setFilters({ model: e.target.value || undefined })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <select
                value={filters.status || "all"}
                onChange={(e) =>
                  setFilters({ status: e.target.value === "all" ? undefined : e.target.value })
                }
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
              >
                <option value="all">All Statuses</option>
                <option value="verified">Verified</option>
                <option value="pending">Pending</option>
                <option value="needs_review">Needs Review</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      {error ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={() => loadReferences()}>Retry</Button>
          </CardContent>
        </Card>
      ) : (
        <ReferenceTable
          data={references}
          isLoading={isLoading}
          pagination={pagination}
          onPageChange={setPage}
          onEdit={handleEdit}
        />
      )}

      {/* Add/Edit Form */}
      <ReferenceForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleSubmit}
        initialData={editingReference}
        mode={editingReference ? "edit" : "create"}
      />
    </div>
  );
}
