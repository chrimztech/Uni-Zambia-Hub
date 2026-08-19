import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  head: () => ({ meta: [{ title: "Settings — Admin — UBIRR" }, { name: "robots", content: "noindex" }] }),
  component: SettingsAdmin,
});

function SettingsAdmin() {
  const { isAdmin } = useAuth();
  const qc = useQueryClient();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["settings"],
    queryFn: () => api.admin.settings(),
  });
  const [edits, setEdits] = useState<Record<string, string>>({});
  useEffect(() => {
    if (data) {
      const e: Record<string, string> = {};
      data.forEach((s) => { e[s.setting_key] = s.setting_value ?? ""; });
      setEdits(e);
    }
  }, [data]);

  const save = async (key: string) => {
    try {
      await api.admin.updateSetting(key, edits[key]);
      toast.success("Saved");
      qc.invalidateQueries({ queryKey: ["settings"] });
    } catch (e: any) {
      toast.error(e.message || "Failed");
    }
  };

  return (
    <div className="p-6 lg:p-10">
      <h1 className="font-display text-3xl font-bold">System settings</h1>
      <p className="mt-1 text-muted-foreground">Configuration values for the repository.</p>
      {isLoading && <p className="mt-6 text-muted-foreground">Loading settings…</p>}
      {isError && (
        <div className="mt-6 rounded-lg border border-destructive/30 bg-destructive/10 p-6 text-destructive">
          <div className="font-semibold">Failed to load settings</div>
          <div className="mt-1 text-sm opacity-80">{(error as any)?.message ?? "Unknown error"}</div>
        </div>
      )}
      {data && (
        <div className="mt-6 divide-y divide-border rounded-lg border border-border bg-card">
          {data.map((s) => (
            <div key={s.id} className="grid items-center gap-4 p-4 sm:grid-cols-[1fr_2fr_auto]">
              <div>
                <div className="font-mono text-sm font-medium">{s.setting_key}</div>
                <div className="text-xs text-muted-foreground">{s.description}</div>
              </div>
              <input
                className="rounded-md border border-border bg-background px-3 py-2 text-sm font-mono"
                value={edits[s.setting_key] ?? ""}
                onChange={(e) => setEdits({ ...edits, [s.setting_key]: e.target.value })}
                disabled={!isAdmin}
              />
              <button onClick={() => save(s.setting_key)} disabled={!isAdmin} className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground disabled:opacity-50">Save</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
