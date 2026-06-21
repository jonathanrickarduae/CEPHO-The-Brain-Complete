import React, { useState } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { Palette, Plus, Star, Trash2, Edit2, Globe, Type } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

type BrandKitForm = {
  companyName: string;
  tagline: string;
  description: string;
  website: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
};

const DEFAULT_FORM: BrandKitForm = {
  companyName: "",
  tagline: "",
  description: "",
  website: "",
  primaryColor: "#6366f1",
  secondaryColor: "#8b5cf6",
  accentColor: "#06b6d4",
  fontFamily: "Inter",
};

export default function BrandKitPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<BrandKitForm>(DEFAULT_FORM);

  const { data: kits, refetch } = trpc.brandKit.list.useQuery();

  const createMutation = trpc.brandKit.create.useMutation({
    onSuccess: () => {
      toast.success("Brand kit created");
      setShowCreate(false);
      setForm(DEFAULT_FORM);
      refetch();
    },
    onError: () => toast.error("Failed to create brand kit"),
  });

  const updateMutation = trpc.brandKit.update.useMutation({
    onSuccess: () => {
      toast.success("Brand kit updated");
      setEditingId(null);
      refetch();
    },
    onError: () => toast.error("Failed to update brand kit"),
  });

  const deleteMutation = trpc.brandKit.delete.useMutation({
    onSuccess: () => {
      toast.success("Brand kit deleted");
      refetch();
    },
  });

  const setDefaultMutation = trpc.brandKit.update.useMutation({
    onSuccess: () => {
      toast.success("Default brand kit updated");
      refetch();
    },
  });

  const handleSubmit = () => {
    if (!form.companyName.trim()) {
      toast.error("Company name is required");
      return;
    }
    if (editingId) {
      updateMutation.mutate({ id: editingId, ...form });
    } else {
      createMutation.mutate(form);
    }
  };

  const startEdit = (kit: NonNullable<typeof kits>[number]) => {
    setEditingId(kit.id);
    setForm({
      companyName: kit.companyName ?? "",
      tagline: kit.tagline ?? "",
      description: kit.description ?? "",
      website: kit.website ?? "",
      primaryColor: kit.primaryColor ?? "#6366f1",
      secondaryColor: kit.secondaryColor ?? "#8b5cf6",
      accentColor: kit.accentColor ?? "#06b6d4",
      fontFamily: kit.fontFamily ?? "Inter",
    });
    setShowCreate(true);
  };

  return (
    <PageShell
      title="Brand Kit"
      subtitle="Manage your company's brand identity — colours, fonts, logos, and guidelines."
      icon={Palette}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-muted-foreground">
          {kits?.length ?? 0} brand kit{kits?.length !== 1 ? "s" : ""} saved
        </p>
        <button
          onClick={() => {
            setEditingId(null);
            setForm(DEFAULT_FORM);
            setShowCreate(v => !v);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/90 transition-all"
        >
          <Plus className="w-4 h-4" />
          New Brand Kit
        </button>
      </div>

      {/* Create / Edit Form */}
      {showCreate && (
        <div className="mb-8 p-6 rounded-xl border border-accent/30 bg-card space-y-4">
          <h3 className="font-semibold text-sm">
            {editingId ? "Edit Brand Kit" : "New Brand Kit"}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                Company Name *
              </label>
              <input
                type="text"
                value={form.companyName}
                onChange={e =>
                  setForm(f => ({ ...f, companyName: e.target.value }))
                }
                placeholder="CEPHO.AI"
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent/50"
                aria-label="Company name"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                Tagline
              </label>
              <input
                type="text"
                value={form.tagline}
                onChange={e =>
                  setForm(f => ({ ...f, tagline: e.target.value }))
                }
                placeholder="Your AI-powered Chief of Staff"
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent/50"
                aria-label="Tagline"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                Website
              </label>
              <input
                type="url"
                value={form.website}
                onChange={e =>
                  setForm(f => ({ ...f, website: e.target.value }))
                }
                placeholder="https://cepho.ai"
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent/50"
                aria-label="Website URL"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                Font Family
              </label>
              <input
                type="text"
                value={form.fontFamily}
                onChange={e =>
                  setForm(f => ({ ...f, fontFamily: e.target.value }))
                }
                placeholder="Inter"
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent/50"
                aria-label="Font family"
              />
            </div>
          </div>

          {/* Colours */}
          <div className="grid grid-cols-3 gap-4">
            {(
              [
                { key: "primaryColor", label: "Primary" },
                { key: "secondaryColor", label: "Secondary" },
                { key: "accentColor", label: "Accent" },
              ] as const
            ).map(({ key, label }) => (
              <div key={key}>
                <label className="text-xs text-muted-foreground mb-1 block">
                  {label} Colour
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={form[key]}
                    onChange={e =>
                      setForm(f => ({ ...f, [key]: e.target.value }))
                    }
                    className="w-10 h-10 rounded-lg border border-border cursor-pointer bg-transparent"
                    aria-label={`${label} colour picker`}
                  />
                  <input
                    type="text"
                    value={form[key]}
                    onChange={e =>
                      setForm(f => ({ ...f, [key]: e.target.value }))
                    }
                    className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-accent/50"
                    aria-label={`${label} colour hex`}
                  />
                </div>
              </div>
            ))}
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={e =>
                setForm(f => ({ ...f, description: e.target.value }))
              }
              placeholder="Brand guidelines and usage notes..."
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-accent/50 min-h-[80px]"
              aria-label="Brand description"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={createMutation.isPending || updateMutation.isPending}
              className="px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/90 disabled:opacity-40 transition-all"
            >
              {createMutation.isPending || updateMutation.isPending
                ? "Saving..."
                : editingId
                  ? "Update"
                  : "Create"}
            </button>
            <button
              onClick={() => {
                setShowCreate(false);
                setEditingId(null);
              }}
              className="px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:border-accent/30 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Brand Kit Cards */}
      {!kits || kits.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Palette className="w-12 h-12 text-muted-foreground mb-4 opacity-40" />
          <p className="text-muted-foreground text-sm">
            No brand kits yet — create your first one above
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {kits.map(kit => (
            <div
              key={kit.id}
              className={`p-5 rounded-xl border bg-card transition-all ${
                kit.isDefault
                  ? "border-accent/50 shadow-sm shadow-accent/10"
                  : "border-border hover:border-accent/30"
              }`}
            >
              {/* Colour Swatches */}
              <div className="flex gap-2 mb-4">
                {[kit.primaryColor, kit.secondaryColor, kit.accentColor]
                  .filter(Boolean)
                  .map((c, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-lg border border-border/50"
                      style={{ backgroundColor: c ?? undefined }}
                      title={c ?? ""}
                    />
                  ))}
              </div>

              {/* Name & Tagline */}
              <div className="mb-3">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm">{kit.companyName}</h3>
                  {kit.isDefault && (
                    <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
                      <Star className="w-2.5 h-2.5" />
                      Default
                    </span>
                  )}
                </div>
                {kit.tagline && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {kit.tagline}
                  </p>
                )}
              </div>

              {/* Meta */}
              <div className="space-y-1 mb-4">
                {kit.fontFamily && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Type className="w-3 h-3" />
                    {kit.fontFamily}
                  </div>
                )}
                {kit.website && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Globe className="w-3 h-3" />
                    <a
                      href={kit.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-accent transition-colors"
                    >
                      {kit.website.replace(/^https?:\/\//, "")}
                    </a>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-3 border-t border-border">
                {!kit.isDefault && (
                  <button
                    onClick={() =>
                      setDefaultMutation.mutate({
                        id: kit.id,
                        isDefault: true,
                      })
                    }
                    className="flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-accent/10 text-accent border border-accent/20 hover:bg-accent/20 transition-all"
                  >
                    <Star className="w-3 h-3" />
                    Set default
                  </button>
                )}
                <button
                  onClick={() => startEdit(kit)}
                  className="flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-muted/20 text-muted-foreground border border-border hover:border-accent/30 transition-all"
                >
                  <Edit2 className="w-3 h-3" />
                  Edit
                </button>
                <button
                  onClick={() => deleteMutation.mutate({ id: kit.id })}
                  className="ml-auto p-1.5 rounded-md hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-all"
                  aria-label="Delete brand kit"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
}
