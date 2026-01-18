import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { platformIntelligence, getOptimalPostTime } from '@/lib/PlatformIntelligence';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Plus, 
  Trash2,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';

interface ScheduledPost {
  id: string;
  platform: string;
  title: string;
  scheduledDate: Date;
  scheduledTime: string;
  status: 'scheduled' | 'published' | 'failed';
}

interface SchedulingEngineProps {
  posts?: ScheduledPost[];
  onSchedule?: (post: ScheduledPost) => void;
  onDelete?: (postId: string) => void;
}

export function SchedulingEngine({ posts = [], onSchedule, onDelete }: SchedulingEngineProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedPlatform, setSelectedPlatform] = useState('instagram');
  const [selectedTime, setSelectedTime] = useState('');
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');

  const platforms = Object.keys(platformIntelligence);
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const getOptimalTimes = () => {
    const dayName = dayNames[selectedDate.getDay()];
    return getOptimalPostTime(selectedPlatform, dayName);
  };

  const optimalTimes = getOptimalTimes();

  const getPostsForDate = (date: Date) => {
    return posts.filter(post => isSameDay(new Date(post.scheduledDate), date));
  };

  const getWeekDays = () => {
    const start = startOfWeek(selectedDate);
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  };

  const handleSchedule = () => {
    if (!selectedTime) return;
    
    const newPost: ScheduledPost = {
      id: Date.now().toString(),
      platform: selectedPlatform,
      title: 'New Post',
      scheduledDate: selectedDate,
      scheduledTime: selectedTime,
      status: 'scheduled',
    };
    
    onSchedule?.(newPost);
  };

  const timeSlots = [
    '6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
    '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM',
    '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM', '10:00 PM',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Content Scheduling Engine
          </CardTitle>
          <CardDescription>
            Schedule posts at optimal times for maximum engagement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setSelectedDate(addDays(selectedDate, -7))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="font-medium">
                {format(selectedDate, 'MMMM yyyy')}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setSelectedDate(addDays(selectedDate, 7))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'week' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('week')}
              >
                Week
              </Button>
              <Button
                variant={viewMode === 'month' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('month')}
              >
                Month
              </Button>
            </div>
          </div>

          {/* Week View */}
          {viewMode === 'week' && (
            <div className="grid grid-cols-7 gap-2">
              {getWeekDays().map((day, i) => (
                <div
                  key={i}
                  className={`p-2 border rounded-lg cursor-pointer transition-colors ${
                    isSameDay(day, selectedDate)
                      ? 'border-primary bg-primary/5'
                      : 'hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedDate(day)}
                >
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">{format(day, 'EEE')}</p>
                    <p className={`text-lg font-bold ${isSameDay(day, new Date()) ? 'text-primary' : ''}`}>
                      {format(day, 'd')}
                    </p>
                  </div>
                  <div className="mt-2 space-y-1">
                    {getPostsForDate(day).slice(0, 3).map(post => (
                      <div
                        key={post.id}
                        className="text-xs p-1 rounded truncate"
                        style={{ backgroundColor: platformIntelligence[post.platform]?.color + '20' }}
                      >
                        {platformIntelligence[post.platform]?.icon} {post.scheduledTime}
                      </div>
                    ))}
                    {getPostsForDate(day).length > 3 && (
                      <p className="text-xs text-muted-foreground text-center">
                        +{getPostsForDate(day).length - 3} more
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Month View */}
          {viewMode === 'month' && (
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="rounded-md border"
            />
          )}
        </CardContent>
      </Card>

      {/* Schedule New Post */}
      <Card>
        <CardHeader>
          <CardTitle>Schedule for {format(selectedDate, 'EEEE, MMMM d')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Platform</label>
              <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {platforms.map(platform => (
                    <SelectItem key={platform} value={platform}>
                      <span className="flex items-center gap-2">
                        {platformIntelligence[platform].icon}
                        {platformIntelligence[platform].name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Time</label>
              <Select value={selectedTime} onValueChange={setSelectedTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map(time => (
                    <SelectItem key={time} value={time}>
                      <span className="flex items-center gap-2">
                        {time}
                        {optimalTimes.includes(time) && (
                          <Sparkles className="h-3 w-3 text-yellow-500" />
                        )}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Optimal Times Suggestion */}
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm font-medium flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-yellow-500" />
              Optimal posting times for {platformIntelligence[selectedPlatform].name}
            </p>
            <div className="flex flex-wrap gap-2">
              {optimalTimes.length > 0 ? (
                optimalTimes.map(time => (
                  <Badge
                    key={time}
                    variant="secondary"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                    onClick={() => setSelectedTime(time)}
                  >
                    <Clock className="h-3 w-3 mr-1" />
                    {time}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">No specific optimal times for this day</span>
              )}
            </div>
          </div>

          <Button onClick={handleSchedule} disabled={!selectedTime} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Schedule Post
          </Button>
        </CardContent>
      </Card>

      {/* Scheduled Posts for Selected Date */}
      <Card>
        <CardHeader>
          <CardTitle>Scheduled Posts</CardTitle>
          <CardDescription>
            {getPostsForDate(selectedDate).length} posts scheduled for {format(selectedDate, 'MMM d')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {getPostsForDate(selectedDate).length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No posts scheduled for this date
            </p>
          ) : (
            <div className="space-y-3">
              {getPostsForDate(selectedDate).map(post => (
                <div
                  key={post.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                      style={{ backgroundColor: platformIntelligence[post.platform]?.color + '20' }}
                    >
                      {platformIntelligence[post.platform]?.icon}
                    </div>
                    <div>
                      <p className="font-medium">{post.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {post.scheduledTime} • {platformIntelligence[post.platform]?.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={post.status === 'scheduled' ? 'default' : 'secondary'}>
                      {post.status}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete?.(post.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default SchedulingEngine;
