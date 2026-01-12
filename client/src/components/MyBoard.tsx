import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Star, Trash2, MessageSquare, Video } from 'lucide-react';
import { allExperts } from '@/data/aiExperts';

interface FavoriteExpert {
  id: string;
  addedAt: number;
}

export function MyBoard() {
  const [, setLocation] = useLocation();
  const [favorites, setFavorites] = useState<FavoriteExpert[]>([]);

  // Load favorites from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('favoriteExperts');
    if (saved) {
      try {
        setFavorites(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load favorites:', error);
      }
    }
  }, []);

  // Save favorites to localStorage
  const saveFavorites = (newFavorites: FavoriteExpert[]) => {
    setFavorites(newFavorites);
    localStorage.setItem('favoriteExperts', JSON.stringify(newFavorites));
  };

  const addFavorite = (expertId: string) => {
    if (!favorites.find(f => f.id === expertId)) {
      saveFavorites([...favorites, { id: expertId, addedAt: Date.now() }]);
    }
  };

  const removeFavorite = (expertId: string) => {
    saveFavorites(favorites.filter(f => f.id !== expertId));
  };

  const isFavorite = (expertId: string) => {
    return favorites.some(f => f.id === expertId);
  };

  // Get expert details for favorites
  const favoriteExperts = favorites
    .map(fav => ({
      ...allExperts.find(e => e.id === fav.id),
      addedAt: fav.addedAt
    }))
    .filter(e => e && e.id)
    .sort((a, b) => (b.addedAt || 0) - (a.addedAt || 0));

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
        <h2 className="text-xl font-bold text-foreground">My Board</h2>
        <span className="text-sm text-muted-foreground ml-auto">{favorites.length} Expert{favorites.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Empty State */}
      {favorites.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-lg border border-dashed border-border">
          <Star className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground mb-2">No favorite experts yet</p>
          <p className="text-sm text-muted-foreground/60">Star experts to add them to your board for quick access</p>
        </div>
      ) : (
        /* Favorites Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {favoriteExperts.map((expert) => (
            <div
              key={expert.id}
              className="group relative p-4 rounded-lg bg-card/60 border border-border hover:border-primary/50 hover:bg-card/80 transition-all duration-300"
            >
              {/* Remove Button */}
              <button
                onClick={() => removeFavorite(expert.id!)}
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors opacity-0 group-hover:opacity-100"
                title="Remove from board"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              {/* Star Badge */}
              <div className="absolute top-2 left-2">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              </div>

              {/* Expert Info */}
              <div className="mt-6">
                <div className="text-2xl mb-2">{expert.avatar}</div>
                <h3 className="font-bold text-foreground text-sm mb-1">{expert.name}</h3>
                <p className="text-xs text-muted-foreground mb-3">{expert.specialty}</p>
                
                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                  <div className="bg-primary/10 rounded px-2 py-1">
                    <div className="text-primary font-bold">{expert.performanceScore}</div>
                    <div className="text-muted-foreground">Score</div>
                  </div>
                  <div className="bg-primary/10 rounded px-2 py-1">
                    <div className="text-primary font-bold">{expert.projectsCompleted}</div>
                    <div className="text-muted-foreground">Projects</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button 
                    onClick={() => setLocation(`/digital-twin?expert=${expert.id}&name=${encodeURIComponent(expert.name || '')}`)}
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Chat
                  </button>
                  <button 
                    onClick={() => setLocation(`/video-studio?expert=${expert.id}&name=${encodeURIComponent(expert.name || '')}`)}
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                  >
                    <Video className="w-3.5 h-3.5" />
                    Video
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Export the favorites hook for use in other components
export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteExpert[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('favoriteExperts');
    if (saved) {
      try {
        setFavorites(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load favorites:', error);
      }
    }
  }, []);

  const addFavorite = (expertId: string) => {
    setFavorites(prev => {
      if (!prev.find(f => f.id === expertId)) {
        const newFavorites = [...prev, { id: expertId, addedAt: Date.now() }];
        localStorage.setItem('favoriteExperts', JSON.stringify(newFavorites));
        return newFavorites;
      }
      return prev;
    });
  };

  const removeFavorite = (expertId: string) => {
    setFavorites(prev => {
      const newFavorites = prev.filter(f => f.id !== expertId);
      localStorage.setItem('favoriteExperts', JSON.stringify(newFavorites));
      return newFavorites;
    });
  };

  const isFavorite = (expertId: string) => {
    return favorites.some(f => f.id === expertId);
  };

  return { favorites, addFavorite, removeFavorite, isFavorite };
}
