/**
 * WorkspaceSwitcher — p4-6 Multi-workspace support
 *
 * Displays the active workspace name in the sidebar and provides a dropdown
 * to switch between workspaces or create a new one.
 */
import { useState } from "react";
import { Check, ChevronDown, Building2, Plus, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";

interface WorkspaceSwitcherProps {
  collapsed?: boolean;
}

export function WorkspaceSwitcher({
  collapsed = false,
}: WorkspaceSwitcherProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [slugError, setSlugError] = useState("");

  const utils = trpc.useUtils();

  const { data: workspaceList, isLoading } = trpc.workspaces.list.useQuery(
    undefined,
    { staleTime: 30_000 }
  );

  const switchMutation = trpc.workspaces.switchTo.useMutation({
    onSuccess: () => {
      utils.workspaces.list.invalidate();
      utils.workspaces.getActive.invalidate();
    },
  });

  const createMutation = trpc.workspaces.create.useMutation({
    onSuccess: () => {
      utils.workspaces.list.invalidate();
      setCreateOpen(false);
      setNewName("");
      setNewSlug("");
    },
  });

  const activeWorkspace = workspaceList?.find(w => w.isActive);

  function handleNameChange(value: string) {
    setNewName(value);
    // Auto-generate slug from name
    const slug = value
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 100);
    setNewSlug(slug);
    setSlugError("");
  }

  function handleSlugChange(value: string) {
    setNewSlug(value);
    if (!/^[a-z0-9-]*$/.test(value)) {
      setSlugError("Only lowercase letters, numbers, and hyphens allowed");
    } else {
      setSlugError("");
    }
  }

  function handleCreate() {
    if (!newName.trim() || !newSlug.trim() || slugError) return;
    createMutation.mutate({ name: newName.trim(), slug: newSlug.trim() });
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-2 py-2 text-sidebar-foreground/50">
        <Loader2 className="h-4 w-4 animate-spin shrink-0" />
        {!collapsed && <span className="text-xs truncate">Loading...</span>}
      </div>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={cn(
              "flex items-center gap-2 rounded-lg px-2 py-2 w-full text-left",
              "hover:bg-sidebar-accent transition-colors",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
              "text-sidebar-foreground"
            )}
            aria-label="Switch workspace"
          >
            <div className="flex items-center justify-center h-6 w-6 rounded-md bg-primary/20 shrink-0">
              <Building2
                className="h-3.5 w-3.5 text-primary"
                aria-hidden="true"
              />
            </div>
            {!collapsed && (
              <>
                <span className="flex-1 text-xs font-medium truncate">
                  {activeWorkspace?.name ?? "My Workspace"}
                </span>
                <ChevronDown
                  className="h-3.5 w-3.5 shrink-0 text-sidebar-foreground/50"
                  aria-hidden="true"
                />
              </>
            )}
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          side="right"
          align="end"
          className="w-56 bg-popover border-border"
        >
          <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
            Workspaces
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          {workspaceList?.map(ws => (
            <DropdownMenuItem
              key={ws.id}
              onClick={() => {
                if (!ws.isActive) {
                  switchMutation.mutate({ workspaceId: ws.id });
                }
              }}
              className="flex items-center gap-2 cursor-pointer"
            >
              <div className="flex items-center justify-center h-5 w-5 rounded bg-primary/10 shrink-0">
                <Building2
                  className="h-3 w-3 text-primary"
                  aria-hidden="true"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate">{ws.name}</p>
                {ws.isPersonal && (
                  <p className="text-xs text-muted-foreground">Personal</p>
                )}
              </div>
              {ws.isActive && (
                <Check
                  className="h-4 w-4 text-primary shrink-0"
                  aria-label="Active"
                />
              )}
            </DropdownMenuItem>
          ))}

          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-2 cursor-pointer text-primary"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span className="text-sm">New workspace</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Create workspace dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create a new workspace</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="ws-name">Workspace name</Label>
              <Input
                id="ws-name"
                placeholder="Acme Corp"
                value={newName}
                onChange={e => handleNameChange(e.target.value)}
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ws-slug">
                URL slug{" "}
                <span className="text-muted-foreground font-normal text-xs">
                  (letters, numbers, hyphens only)
                </span>
              </Label>
              <Input
                id="ws-slug"
                placeholder="acme-corp"
                value={newSlug}
                onChange={e => handleSlugChange(e.target.value)}
              />
              {slugError && (
                <p className="text-xs text-destructive">{slugError}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={
                !newName.trim() ||
                !newSlug.trim() ||
                !!slugError ||
                createMutation.isPending
              }
            >
              {createMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Create workspace
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
