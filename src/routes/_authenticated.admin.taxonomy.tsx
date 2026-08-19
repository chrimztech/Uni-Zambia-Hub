import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api, type TaxonomyEntry } from "@/lib/api";
import { slugify } from "@/lib/format";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, Check, X } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/taxonomy")({
  head: () => ({ meta: [{ title: "Taxonomy — Admin — Sanitation Hub" }, { name: "robots", content: "noindex" }] }),
  component: TaxonomyAdmin,
});

type TaxTab = "categories" | "content_types" | "departments" | "schools" | "tags";

const TABS: { key: TaxTab; label: string; hasSlug: boolean; hasDescription?: boolean; slugLabel?: string }[] = [
  { key: "categories", label: "Categories", hasSlug: true, hasDescription: true, slugLabel: "URL slug" },
  { key: "content_types", label: "Content Types", hasSlug: true, hasDescription: true, slugLabel: "Type key (used in content)" },
  { key: "departments", label: "Departments", hasSlug: false },
  { key: "schools", label: "Schools", hasSlug: false },
  { key: "tags", label: "Tags", hasSlug: true },
];

function EditRow({
  row,
  tab,
  meta,
  onSave,
  onCancel,
}: {
  row: TaxonomyEntry;
  tab: TaxTab;
  meta: (typeof TABS)[0];
  onSave: (id: string, payload: Record<string, unknown>) => Promise<void>;
  onCancel: () => void;
}) {
  const [name, setName] = useState(row.name);
  const [slug, setSlug] = useState(row.slug ?? "");
  const [description, setDescription] = useState((row as any).description ?? "");

  const save = async () => {
    if (!name.trim()) return toast.error("Name required");
    const payload: Record<string, unknown> = { name: name.trim() };
    if (meta.hasSlug) payload.slug = slug || slugify(name);
    if (meta.hasDescription) payload.description = description;
    await onSave(row.id, payload);
  };

  return (
    <tr className="bg-primary/5">
      <td className="px-4 py-2">
        <input
          className="w-full rounded border border-border bg-background px-2 py-1 text-sm"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />
      </td>
      {meta.hasSlug && (
        <td className="px-4 py-2">
          <input
            className="w-full rounded border border-border bg-background px-2 py-1 font-mono text-xs"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder={slugify(name)}
          />
        </td>
      )}
      {meta.hasDescription && (
        <td className="px-4 py-2">
          <input
            className="w-full rounded border border-border bg-background px-2 py-1 text-sm"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </td>
      )}
      <td className="px-4 py-2 text-right">
        <div className="flex items-center justify-end gap-2">
          <button onClick={save} className="inline-flex items-center gap-1 rounded bg-primary px-2 py-1 text-xs font-medium text-primary-foreground">
            <Check className="h-3 w-3" /> Save
          </button>
          <button onClick={onCancel} className="inline-flex items-center gap-1 rounded border border-border px-2 py-1 text-xs hover:bg-secondary">
            <X className="h-3 w-3" /> Cancel
          </button>
        </div>
      </td>
    </tr>
  );
}

function TaxonomyAdmin() {
  const [tab, setTab] = useState<TaxTab>("categories");
  const meta = TABS.find((t) => t.key === tab)!;
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [extra, setExtra] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["taxonomy", tab],
    queryFn: () => api.admin.taxonomy(tab),
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["taxonomy", tab] });

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast.error("Name is required"); return; }
    setAdding(true);
    const payload: Record<string, unknown> = { name: name.trim() };
    if (meta.hasSlug) payload.slug = slug || slugify(name);
    if (meta.hasDescription) payload.description = description;
    if (tab === "departments" && extra) payload.code = extra.trim();
    try {
      await api.admin.createTaxonomy(tab, payload);
      setName(""); setSlug(""); setDescription(""); setExtra("");
      toast.success("Added");
      invalidate();
    } catch (err: any) {
      toast.error(err.message || "Failed");
    } finally {
      setAdding(false);
    }
  };

  const update = async (id: string, payload: Record<string, unknown>) => {
    try {
      await api.admin.updateTaxonomy(tab, id, payload);
      setEditingId(null);
      toast.success("Updated");
      invalidate();
    } catch (err: any) {
      toast.error(err.message || "Failed to update");
    }
  };

  const remove = async (id: string, rowName: string) => {
    if (!window.confirm(`Delete "${rowName}"?`)) return;
    try {
      await api.admin.deleteTaxonomy(tab, id);
      invalidate();
      toast.success("Deleted");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete");
    }
  };

  const colCount = 1 + (meta.hasSlug ? 1 : 0) + (meta.hasDescription ? 1 : 0) + 1;

  return (
    <div className="p-6 lg:p-10">
      <h1 className="font-display text-3xl font-bold">Taxonomy</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Manage categories, content types, departments, schools, and tags used across the repository.
      </p>

      <div className="mt-6 flex flex-wrap gap-1 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key); setEditingId(null); }}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition ${
              tab === t.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <form onSubmit={add} className="mt-6 flex flex-wrap items-end gap-3 rounded-lg border border-border bg-card p-4">
        <label className="flex-1 min-w-[180px]">
          <span className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">Name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            placeholder={`New ${meta.label.toLowerCase()} name`}
          />
        </label>
        {meta.hasSlug && (
          <label className="w-48">
            <span className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">{meta.slugLabel ?? "Slug"}</span>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-sm"
              placeholder={name ? slugify(name) : "auto"}
            />
          </label>
        )}
        {meta.hasDescription && (
          <label className="flex-1 min-w-[180px]">
            <span className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">Description</span>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              placeholder="Optional description"
            />
          </label>
        )}
        {tab === "departments" && (
          <label className="w-36">
            <span className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">Code</span>
            <input value={extra} onChange={(e) => setExtra(e.target.value)} className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm" placeholder="e.g. AGRENG" />
          </label>
        )}
        <button disabled={adding} className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed">
          <Plus className="h-4 w-4" /> {adding ? "Adding…" : "Add"}
        </button>
      </form>

      {isError && (
        <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-destructive text-sm">
          <strong>Failed to load {meta.label.toLowerCase()}:</strong> {(error as any)?.message ?? "Unknown error"}
        </div>
      )}

      <div className="mt-4 overflow-hidden rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Name</th>
              {meta.hasSlug && <th className="px-4 py-3">Slug / Key</th>}
              {meta.hasDescription && <th className="px-4 py-3">Description</th>}
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading && (
              <tr><td colSpan={colCount} className="px-4 py-10 text-center text-muted-foreground">Loading…</td></tr>
            )}
            {!isLoading && data?.map((row) =>
              editingId === row.id ? (
                <EditRow
                  key={row.id}
                  row={row}
                  tab={tab}
                  meta={meta}
                  onSave={update}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <tr key={row.id} className="hover:bg-secondary/30">
                  <td className="px-4 py-3 font-medium">{row.name}</td>
                  {meta.hasSlug && <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{row.slug}</td>}
                  {meta.hasDescription && <td className="px-4 py-3 text-sm text-muted-foreground line-clamp-1">{(row as any).description ?? "—"}</td>}
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button onClick={() => setEditingId(row.id)} className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                        <Pencil className="h-3 w-3" /> Rename
                      </button>
                      <button onClick={() => remove(row.id, row.name)} className="inline-flex items-center gap-1 text-xs text-destructive hover:underline">
                        <Trash2 className="h-3 w-3" /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              )
            )}
            {!isLoading && !isError && data?.length === 0 && (
              <tr>
                <td colSpan={colCount} className="px-4 py-10 text-center text-muted-foreground">
                  No {meta.label.toLowerCase()} yet. Use the form above to add one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
