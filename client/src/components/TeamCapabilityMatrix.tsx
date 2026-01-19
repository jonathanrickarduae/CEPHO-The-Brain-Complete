import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import { Plus, Users, TrendingUp, AlertTriangle } from 'lucide-react';

const SKILL_CATEGORIES = [
  'Technical',
  'Leadership',
  'Communication',
  'Strategy',
  'Operations',
  'Finance',
  'Marketing',
  'Sales',
  'Product',
  'Design',
];

export function TeamCapabilityMatrix() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [groupBy, setGroupBy] = useState<'member' | 'category'>('member');

  const { data: capabilities, isLoading, refetch } = trpc.teamCapabilities.list.useQuery();

  const addMutation = trpc.teamCapabilities.add.useMutation({
    onSuccess: () => {
      toast.success('Capability added');
      setIsAddOpen(false);
      refetch();
    },
    onError: () => {
      toast.error('Failed to add capability');
    },
  });

  const [newCapability, setNewCapability] = useState({
    teamMember: '',
    role: '',
    skillCategory: 'Technical',
    skillName: '',
    currentLevel: 3,
    targetLevel: 4,
    developmentPlan: '',
  });

  const handleAdd = () => {
    if (!newCapability.teamMember || !newCapability.skillName) {
      toast.error('Team member and skill name are required');
      return;
    }
    addMutation.mutate({
      ...newCapability,
      developmentPlan: newCapability.developmentPlan || undefined,
    });
  };

  // Calculate stats
  const stats = {
    totalMembers: new Set(capabilities?.map((c) => c.teamMember)).size,
    totalSkills: capabilities?.length || 0,
    avgLevel: capabilities?.length
      ? (capabilities.reduce((sum, c) => sum + c.currentLevel, 0) / capabilities.length).toFixed(1)
      : '0',
    gapsCount: capabilities?.filter((c) => (c.gap || 0) > 0).length || 0,
  };

  // Group data
  const groupedData = capabilities?.reduce((acc, cap) => {
    const key = groupBy === 'member' ? cap.teamMember : cap.skillCategory;
    if (!acc[key]) acc[key] = [];
    acc[key].push(cap);
    return acc;
  }, {} as Record<string, typeof capabilities>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Team Capability Matrix</h2>
          <p className="text-sm text-muted-foreground">Track skills, gaps, and development plans</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#E91E8C] hover:bg-[#E91E8C]/90">
              <Plus className="w-4 h-4 mr-2" />
              Add Capability
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Team Capability</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Team Member *</Label>
                  <Input
                    placeholder="Name"
                    value={newCapability.teamMember}
                    onChange={(e) => setNewCapability({ ...newCapability, teamMember: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Role</Label>
                  <Input
                    placeholder="Job title"
                    value={newCapability.role}
                    onChange={(e) => setNewCapability({ ...newCapability, role: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Skill Category</Label>
                  <Select
                    value={newCapability.skillCategory}
                    onValueChange={(v) => setNewCapability({ ...newCapability, skillCategory: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SKILL_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Skill Name *</Label>
                  <Input
                    placeholder="e.g., Python, Leadership"
                    value={newCapability.skillName}
                    onChange={(e) => setNewCapability({ ...newCapability, skillName: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label>Current Level: {newCapability.currentLevel}</Label>
                <Slider
                  value={[newCapability.currentLevel]}
                  onValueChange={(v) => setNewCapability({ ...newCapability, currentLevel: v[0] })}
                  min={1}
                  max={5}
                  step={1}
                  className="mt-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>1 - Beginner</span>
                  <span>5 - Expert</span>
                </div>
              </div>
              <div>
                <Label>Target Level: {newCapability.targetLevel}</Label>
                <Slider
                  value={[newCapability.targetLevel]}
                  onValueChange={(v) => setNewCapability({ ...newCapability, targetLevel: v[0] })}
                  min={1}
                  max={5}
                  step={1}
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Development Plan</Label>
                <Textarea
                  placeholder="Training, courses, mentorship..."
                  value={newCapability.developmentPlan}
                  onChange={(e) => setNewCapability({ ...newCapability, developmentPlan: e.target.value })}
                  rows={3}
                />
              </div>
              <Button
                onClick={handleAdd}
                disabled={addMutation.isPending}
                className="w-full bg-[#E91E8C] hover:bg-[#E91E8C]/90"
              >
                {addMutation.isPending ? 'Adding...' : 'Add Capability'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Users className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.totalMembers}</div>
                <div className="text-xs text-muted-foreground">Team Members</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.totalSkills}</div>
                <div className="text-xs text-muted-foreground">Skills Tracked</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#E91E8C]/20 rounded-lg">
                <div className="w-5 h-5 text-[#E91E8C] font-bold text-center leading-5">Ø</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.avgLevel}</div>
                <div className="text-xs text-muted-foreground">Avg Level</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.gapsCount}</div>
                <div className="text-xs text-muted-foreground">Skill Gaps</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Group Toggle */}
      <div className="flex gap-2">
        <Button
          variant={groupBy === 'member' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setGroupBy('member')}
        >
          By Team Member
        </Button>
        <Button
          variant={groupBy === 'category' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setGroupBy('category')}
        >
          By Skill Category
        </Button>
      </div>

      {/* Capability Matrix */}
      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading capabilities...</div>
      ) : !capabilities || capabilities.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No capabilities tracked yet</p>
            <p className="text-sm text-muted-foreground mt-1">Add your first team capability to get started</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedData || {}).map(([key, caps]) => (
            <Card key={key}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center justify-between">
                  <span>{key}</span>
                  <Badge variant="outline">{caps?.length} skills</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {caps?.map((cap) => (
                    <div
                      key={cap.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{cap.skillName}</span>
                          {groupBy === 'category' && (
                            <span className="text-xs text-muted-foreground">({cap.teamMember})</span>
                          )}
                          {groupBy === 'member' && (
                            <Badge variant="outline" className="text-xs">
                              {cap.skillCategory}
                            </Badge>
                          )}
                        </div>
                        {cap.developmentPlan && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                            {cap.developmentPlan}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="flex items-center gap-1">
                            <SkillLevel level={cap.currentLevel} />
                            {cap.targetLevel && cap.targetLevel > cap.currentLevel && (
                              <>
                                <span className="text-xs text-muted-foreground mx-1">→</span>
                                <SkillLevel level={cap.targetLevel} target />
                              </>
                            )}
                          </div>
                          {(cap.gap || 0) > 0 && (
                            <div className="text-xs text-yellow-500 mt-1">Gap: +{cap.gap}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function SkillLevel({ level, target = false }: { level: number; target?: boolean }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className={`w-2 h-4 rounded-sm ${
            i <= level
              ? target
                ? 'bg-[#E91E8C]/50'
                : 'bg-[#E91E8C]'
              : 'bg-muted'
          }`}
        />
      ))}
    </div>
  );
}
