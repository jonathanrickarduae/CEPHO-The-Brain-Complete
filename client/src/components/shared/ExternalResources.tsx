import { useState, useMemo } from "react";
import { 
  Search, ExternalLink, Zap, Building2, Newspaper, Brain, 
  Database, GraduationCap, Briefcase, Filter, ChevronRight,
  Globe, Link2, CheckCircle2, Clock, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { 
  EXTERNAL_SME_RESOURCES, 
  RESOURCE_CATEGORIES,
  API_STATUS_LABELS,
  ACCESS_TYPE_LABELS,
  type ExternalSMEResource 
} from "@/data/external-s-m-e-resources.data";

interface ExternalResourcesProps {
  onBack?: () => void;
}

export function ExternalResources({ onBack }: ExternalResourcesProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedResource, setSelectedResource] = useState<ExternalSMEResource | null>(null);

  // Get category icon
  const getCategoryIcon = (categoryId: string) => {
    switch (categoryId) {
      case 'consulting': return Briefcase;
      case 'research': return Search;
      case 'media': return Newspaper;
      case 'ai_platform': return Brain;
      case 'data': return Database;
      case 'training': return GraduationCap;
      default: return Globe;
    }
  };

  // Filter resources based on search and category
  const filteredResources = useMemo(() => {
    let results = EXTERNAL_SME_RESOURCES;
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      results = results.filter(r => 
        r.name.toLowerCase().includes(query) ||
        r.description.toLowerCase().includes(query) ||
        r.specializations.some(s => s.toLowerCase().includes(query)) ||
        r.features.some(f => f.toLowerCase().includes(query))
      );
    }
    
    if (selectedCategory && selectedCategory !== 'all') {
      results = results.filter(r => r.category === selectedCategory);
    }
    
    return results;
  }, [searchQuery, selectedCategory]);

  // Get category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: EXTERNAL_SME_RESOURCES.length };
    EXTERNAL_SME_RESOURCES.forEach(r => {
      counts[r.category] = (counts[r.category] || 0) + 1;
    });
    return counts;
  }, []);

  // Handle resource click
  const handleResourceClick = (resource: ExternalSMEResource) => {
    setSelectedResource(resource);
  };

  // Handle external link
  const handleOpenPortal = (resource: ExternalSMEResource) => {
    window.open(resource.portalUrl, '_blank');
    toast.success(`Opening ${resource.name} portal...`);
  };

  // Handle API connection request
  const handleConnectAPI = (resource: ExternalSMEResource) => {
    if (resource.apiStatus === 'connected') {
      toast.success(`${resource.name} API is already connected`);
    } else if (resource.apiStatus === 'available') {
      toast.info(`API connection for ${resource.name} requires configuration. Contact admin.`);
    } else {
      toast.info(`${resource.name} API integration not yet implemented`);
    }
  };

  // Resource Detail View
  if (selectedResource) {
    const CategoryIcon = getCategoryIcon(selectedResource.category);
    const apiStatus = API_STATUS_LABELS[selectedResource.apiStatus];
    const accessType = ACCESS_TYPE_LABELS[selectedResource.accessType];

    return (
      <div className="h-full bg-background">
        <div className="border-b border-border bg-card/80 backdrop-blur-xl sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <Button 
              variant="ghost" 
              onClick={() => setSelectedResource(null)}
              className="mb-2"
            >
              ← Back to Resources
            </Button>
          </div>
        </div>

        <ScrollArea className="h-[calc(100%-80px)]">
          <div className="max-w-4xl mx-auto px-4 py-6">
            {/* Resource Header */}
            <div className="flex items-start gap-6 mb-8">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center overflow-hidden">
                {selectedResource.logoUrl ? (
                  <img alt="External resource thumbnail" 
                    src={selectedResource.logoUrl} 
                    alt={selectedResource.name}
                    className="w-16 h-16 object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement!.innerHTML = `<span class="text-4xl"><CategoryIcon /></span>`;
                    }}
                  />
                ) : (
                  <CategoryIcon className="w-12 h-12 text-emerald-400" />
                )}
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-foreground mb-1">{selectedResource.name}</h1>
                <p className="text-lg text-emerald-400 mb-3">{selectedResource.description}</p>
                <div className="flex items-center gap-3 flex-wrap">
                  <Badge variant="outline" className="capitalize">
                    <CategoryIcon className="w-3 h-3 mr-1" />
                    {selectedResource.category.replace('_', ' ')}
                  </Badge>
                  <Badge className={apiStatus.color}>
                    {selectedResource.apiStatus === 'connected' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                    {selectedResource.apiStatus === 'available' && <Link2 className="w-3 h-3 mr-1" />}
                    {selectedResource.apiStatus === 'coming_soon' && <Clock className="w-3 h-3 mr-1" />}
                    {apiStatus.label}
                  </Badge>
                  <Badge variant="outline" className={accessType.color}>
                    {accessType.label}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mb-8">
              <Button 
                onClick={() => handleOpenPortal(selectedResource)}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open {selectedResource.name} Portal
              </Button>
              {selectedResource.hasApi && (
                <Button 
                  onClick={() => handleConnectAPI(selectedResource)}
                  variant="outline"
                  className="flex-1"
                >
                  <Link2 className="w-4 h-4 mr-2" />
                  {selectedResource.apiStatus === 'connected' ? 'API Connected' : 'Connect API'}
                </Button>
              )}
            </div>

            {/* Specializations */}
            <Card className="mb-6 bg-card/60 border-border">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-emerald-400" />
                  Specializations
                </h2>
                <div className="flex flex-wrap gap-2">
                  {selectedResource.specializations.map((spec, idx) => (
                    <Badge key={idx} variant="outline" className="text-sm py-1 px-3">
                      {spec}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Features */}
            <Card className="mb-6 bg-card/60 border-border">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  Key Features
                </h2>
                <ul className="space-y-2">
                  {selectedResource.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-muted-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Integration Status */}
            {selectedResource.hasApi && (
              <Card className="bg-card/60 border-border">
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Link2 className="w-5 h-5 text-emerald-400" />
                    Integration Status
                  </h2>
                  <div className="p-4 bg-secondary/30 rounded-xl">
                    <div className="flex items-center gap-3 mb-2">
                      {selectedResource.apiStatus === 'connected' ? (
                        <CheckCircle2 className="w-6 h-6 text-green-500" />
                      ) : selectedResource.apiStatus === 'available' ? (
                        <AlertCircle className="w-6 h-6 text-blue-500" />
                      ) : (
                        <Clock className="w-6 h-6 text-amber-500" />
                      )}
                      <div>
                        <p className="font-medium text-foreground">
                          {selectedResource.apiStatus === 'connected' 
                            ? 'API Connected & Active' 
                            : selectedResource.apiStatus === 'available'
                            ? 'API Available for Connection'
                            : 'Not Yet Implemented'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {selectedResource.apiStatus === 'connected' 
                            ? 'Data is being synced automatically with CEPHO' 
                            : selectedResource.apiStatus === 'available'
                            ? 'Configure API credentials to enable automatic data sync'
                            : 'This integration is on our roadmap'}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>
      </div>
    );
  }

  // Main Directory View
  return (
    <div className="h-full bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4 mb-4">
            {onBack && (
              <Button variant="ghost" onClick={onBack} className="mr-2">
                ← Action Engine
              </Button>
            )}
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30">
                <Globe className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">External Resources</h1>
                <p className="text-sm text-muted-foreground">{EXTERNAL_SME_RESOURCES.length} real-world SME portals & integrations</p>
              </div>
            </div>
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search resources, specializations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-secondary/50"
                />
              </div>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {RESOURCE_CATEGORIES.map((cat) => {
              const IconComponent = getCategoryIcon(cat.id);
              return (
                <Button
                  key={cat.id}
                  variant={selectedCategory === cat.id || (cat.id === 'all' && !selectedCategory) ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(cat.id === 'all' ? null : cat.id)}
                  className="whitespace-nowrap"
                >
                  <IconComponent className="w-4 h-4 mr-1" />
                  {cat.name} ({categoryCounts[cat.id] || 0})
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="h-[calc(100%-160px)]">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Connected APIs Section */}
          {!selectedCategory && !searchQuery && (
            <div className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-teal-500/10 border-2 border-green-500/30">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-green-500/20">
                    <CheckCircle2 className="w-6 h-6 text-green-400" />
                  </div>
                  <span>Connected APIs</span>
                  <Badge className="bg-green-500/20 text-green-400 border-0 ml-2">Live</Badge>
                </h2>
                <span className="text-sm text-muted-foreground">Real-time data sync enabled</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {EXTERNAL_SME_RESOURCES.filter(r => r.apiStatus === 'connected').map((resource) => {
                  const CategoryIcon = getCategoryIcon(resource.category);
                  return (
                    <Card 
                      key={resource.id}
                      className="bg-gradient-to-br from-green-500/5 to-emerald-500/5 border-green-500/20 hover:border-green-500/50 transition-all cursor-pointer group"
                      onClick={() => handleResourceClick(resource)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 flex items-center justify-center overflow-hidden">
                            {resource.logoUrl ? (
                              <img alt="Resource preview image" 
                                src={resource.logoUrl} 
                                alt={resource.name}
                                className="w-8 h-8 object-contain"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            ) : (
                              <CategoryIcon className="w-5 h-5 text-green-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm text-foreground group-hover:text-green-400 transition-colors truncate">
                              {resource.name}
                            </h3>
                            <p className="text-xs text-green-400">Connected</p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="w-full text-xs text-green-400 hover:text-green-300 hover:bg-green-500/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenPortal(resource);
                          }}
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Open Portal
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Resource Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredResources.map((resource) => {
              const CategoryIcon = getCategoryIcon(resource.category);
              const apiStatus = API_STATUS_LABELS[resource.apiStatus];
              const accessType = ACCESS_TYPE_LABELS[resource.accessType];

              return (
                <Card 
                  key={resource.id}
                  className="bg-card/60 border-border hover:border-emerald-500/50 transition-all cursor-pointer group"
                  onClick={() => handleResourceClick(resource)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {resource.logoUrl ? (
                          <img alt="Resource icon" 
                            src={resource.logoUrl} 
                            alt={resource.name}
                            className="w-10 h-10 object-contain"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <CategoryIcon className="w-7 h-7 text-emerald-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-foreground group-hover:text-emerald-400 transition-colors">
                          {resource.name}
                        </h3>
                        <p className="text-sm text-muted-foreground capitalize">
                          {resource.category.replace('_', ' ')}
                        </p>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {resource.description}
                    </p>

                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {resource.specializations.slice(0, 3).map((spec, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {spec}
                        </Badge>
                      ))}
                      {resource.specializations.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{resource.specializations.length - 3}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className={`${apiStatus.color} text-xs`}>
                          {apiStatus.label}
                        </Badge>
                        <span className={`text-xs ${accessType.color}`}>
                          {accessType.label}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenPortal(resource);
                        }}
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Open
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredResources.length === 0 && (
            <div className="text-center py-12">
              <Globe className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No resources found matching your search.</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

export default ExternalResources;
