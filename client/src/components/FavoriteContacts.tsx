import React, { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";

interface FavoriteContact {
  id: number;
  contactId: string;
  contactName: string;
  contactAvatar: string | null;
  contactType: "expert" | "corporate_partner" | "ai_expert" | "colleague";
  order: number | null;
}

interface FavoriteContactsProps {
  onSelectContact?: (contact: FavoriteContact) => void;
  maxDisplay?: number;
  className?: string;
}

export function FavoriteContacts({
  onSelectContact,
  maxDisplay = 5,
  className,
}: FavoriteContactsProps) {
  const [favorites, setFavorites] = useState<FavoriteContact[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { data: favoritesList } = trpc.favorites.list.useQuery();

  useEffect(() => {
    if (favoritesList) {
      setFavorites(favoritesList.slice(0, maxDisplay));
    }
  }, [favoritesList, maxDisplay]);

  const handleSelectContact = (contact: FavoriteContact) => {
    if (onSelectContact) {
      onSelectContact(contact);
    }
  };

  if (!favorites || favorites.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-2 mb-3">
        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
        <span className="text-xs font-semibold text-muted-foreground">FAVORITES</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
        {favorites.map((contact) => (
          <button
            key={contact.id}
            onClick={() => handleSelectContact(contact)}
            className="flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-primary/10 transition-colors group"
            title={contact.contactName}
          >
            <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center overflow-hidden">
              {contact.contactAvatar ? (
                <img
                  src={contact.contactAvatar}
                  alt={contact.contactName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xs font-bold text-white">
                  {contact.contactName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </span>
              )}
            </div>
            <span className="text-xs text-center line-clamp-2 group-hover:text-foreground transition-colors">
              {contact.contactName}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function FavoriteContactsDropdown({
  onSelectContact,
  className,
}: {
  onSelectContact?: (contact: FavoriteContact) => void;
  className?: string;
}) {
  const { data: favoritesList } = trpc.favorites.list.useQuery();
  const [isOpen, setIsOpen] = useState(false);

  if (!favoritesList || favoritesList.length === 0) {
    return null;
  }

  return (
    <div className={cn("relative", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-primary/10 transition-colors"
      >
        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
        <span className="text-sm font-medium">Favorites ({favoritesList.length})</span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-50">
          {favoritesList.map((contact) => (
            <button
              key={contact.id}
              onClick={() => {
                onSelectContact?.(contact);
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-2 hover:bg-primary/10 transition-colors text-left first:rounded-t-lg last:rounded-b-lg"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center flex-shrink-0">
                {contact.contactAvatar ? (
                  <img
                    src={contact.contactAvatar}
                    alt={contact.contactName}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <span className="text-xs font-bold text-white">
                    {contact.contactName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{contact.contactName}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {contact.contactType.replace(/_/g, " ")}
                </p>
              </div>
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 flex-shrink-0" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
