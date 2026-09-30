import { useState } from "react";
import { ListPlus, Plus } from "lucide-react";
import { api } from "@/lib/api";
import type { ReadingList } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem,
  DropdownMenuSeparator, DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

export function AddToReadingListButton({ contentId }: { contentId: string }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const { data: lists } = useQuery({
    queryKey: ["reading-lists", user?.id],
    enabled: !!user && open,
    queryFn: () => api.account.readingLists(),
  });

  if (!user) {
    return (
      <Link
        to="/auth"
        search={{ redirect: "/" } as any}
        className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-2 text-sm hover:bg-secondary"
      >
        <ListPlus className="h-4 w-4" /> Add to list
      </Link>
    );
  }

  const toggle = async (list: ReadingList) => {
    const existingItem = list.items.find((i) => i.content_id === contentId);
    setBusyId(list.id);
    try {
      if (existingItem) {
        await api.account.removeReadingListItem(existingItem.id);
        toast.success(`Removed from "${list.name}"`);
      } else {
        await api.account.addReadingListItem(list.id, { content_id: contentId });
        toast.success(`Added to "${list.name}"`);
      }
      qc.invalidateQueries({ queryKey: ["reading-lists"] });
    } catch (e: any) {
      toast.error(e.message ?? "Failed");
    } finally {
      setBusyId(null);
    }
  };

  const createAndAdd = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const list = await api.account.createReadingList({ name: newName.trim(), is_public: false });
      await api.account.addReadingListItem(list.id, { content_id: contentId });
      toast.success(`Created "${list.name}" and added resource`);
      setNewName("");
      qc.invalidateQueries({ queryKey: ["reading-lists"] });
    } catch (e: any) {
      toast.error(e.message ?? "Failed");
    } finally {
      setCreating(false);
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-2 text-sm hover:bg-secondary">
          <ListPlus className="h-4 w-4" /> Add to list
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72">
        <DropdownMenuLabel className="text-xs text-muted-foreground">Save to a reading list</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {lists && lists.length > 0 ? (
          lists.map((list) => {
            const inList = list.items.some((i) => i.content_id === contentId);
            return (
              <DropdownMenuCheckboxItem
                key={list.id}
                checked={inList}
                disabled={busyId === list.id}
                onSelect={(e) => {
                  e.preventDefault();
                  toggle(list);
                }}
                className="cursor-pointer"
              >
                {list.name}
              </DropdownMenuCheckboxItem>
            );
          })
        ) : (
          <p className="px-2 py-1.5 text-xs text-muted-foreground">No lists yet — create one below.</p>
        )}
        <DropdownMenuSeparator />
        <div className="flex items-center gap-1.5 p-1.5">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                createAndAdd();
              }
            }}
            placeholder="New list name"
            className="h-8 flex-1 rounded-md border border-border bg-background px-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <button
            onClick={createAndAdd}
            disabled={creating || !newName.trim()}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground disabled:opacity-50"
            aria-label="Create list"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
