import { useState } from 'react';
import { 
  Users, Mail, Calendar, MessageSquare, Briefcase, 
  TrendingUp, Clock, Star, ExternalLink, Phone,
  Linkedin, Twitter, Building2, MapPin
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ContactInsight {
  id: string;
  name: string;
  email: string;
  company: string;
  role: string;
  avatar?: string;
  relationship: 'strong' | 'moderate' | 'new';
  lastInteraction: string;
  interactionCount: number;
  sentiment: 'positive' | 'neutral' | 'needs-attention';
  upcomingMeetings: number;
  pendingEmails: number;
  notes: string[];
  tags: string[];
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
  };
  location?: string;
  phone?: string;
}

// Mock contact data
const MOCK_CONTACTS: ContactInsight[] = [
  {
    id: '1',
    name: 'James K.',
    email: 'james.k@vcpartners.com',
    company: 'VC Partners',
    role: 'Managing Partner',
    relationship: 'strong',
    lastInteraction: '2 days ago',
    interactionCount: 45,
    sentiment: 'positive',
    upcomingMeetings: 1,
    pendingEmails: 0,
    notes: ['Interested in Series B', 'Prefers morning meetings', 'Golf enthusiast'],
    tags: ['Investor', 'Key Relationship', 'Decision Maker'],
    socialLinks: { linkedin: '#', twitter: '#' },
    location: 'San Francisco, CA',
    phone: '+1 (555) 123-4567'
  },
  {
    id: '2',
    name: 'Sarah L.',
    email: 'sarah.l@company.com',
    company: 'Internal',
    role: 'Head of Product',
    relationship: 'strong',
    lastInteraction: 'Today',
    interactionCount: 234,
    sentiment: 'positive',
    upcomingMeetings: 3,
    pendingEmails: 2,
    notes: ['Key stakeholder for roadmap', 'Prefers Slack over email'],
    tags: ['Team', 'Product', 'Leadership'],
    location: 'Remote'
  },
  {
    id: '3',
    name: 'Dr. Chen',
    email: 'chen@research.edu',
    company: 'University Research Lab',
    role: 'Research Director',
    relationship: 'moderate',
    lastInteraction: '2 weeks ago',
    interactionCount: 12,
    sentiment: 'neutral',
    upcomingMeetings: 0,
    pendingEmails: 1,
    notes: ['Potential research partnership', 'Published paper on AI ethics'],
    tags: ['Academic', 'Research', 'Partnership'],
    socialLinks: { linkedin: '#' },
    location: 'Cambridge, UK'
  },
  {
    id: '4',
    name: 'Marcus T.',
    email: 'marcus@competitor.com',
    company: 'Competitor Inc',
    role: 'CTO',
    relationship: 'new',
    lastInteraction: '1 month ago',
    interactionCount: 3,
    sentiment: 'needs-attention',
    upcomingMeetings: 0,
    pendingEmails: 0,
    notes: ['Met at conference', 'Potential talent acquisition target'],
    tags: ['Industry', 'Networking'],
    socialLinks: { linkedin: '#', twitter: '#' }
  }
];

interface SocialInsightsProps {
  contactName?: string;
  compact?: boolean;
}

export function SocialInsights({ contactName, compact = false }: SocialInsightsProps) {
  const [selectedContact, setSelectedContact] = useState<ContactInsight | null>(
    contactName ? MOCK_CONTACTS.find(c => c.name.toLowerCase().includes(contactName.toLowerCase())) || null : null
  );

  const getRelationshipColor = (relationship: string) => {
    switch (relationship) {
      case 'strong': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'moderate': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'new': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default: return 'bg-gray-500/20 text-foreground/70 border-gray-500/30';
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-400';
      case 'neutral': return 'text-blue-400';
      case 'needs-attention': return 'text-orange-400';
      default: return 'text-foreground/70';
    }
  };

  if (compact && selectedContact) {
    return (
      <div className="p-3 bg-card/60 rounded-lg border border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
            {selectedContact.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-foreground truncate">{selectedContact.name}</div>
            <div className="text-xs text-muted-foreground truncate">{selectedContact.role} at {selectedContact.company}</div>
          </div>
          <Badge variant="outline" className={getRelationshipColor(selectedContact.relationship)}>
            {selectedContact.relationship}
          </Badge>
        </div>
        <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {selectedContact.lastInteraction}
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare className="w-3 h-3" />
            {selectedContact.interactionCount} interactions
          </span>
        </div>
        {selectedContact.notes.length > 0 && (
          <div className="mt-2 text-xs text-muted-foreground italic">
            💡 {selectedContact.notes[0]}
          </div>
        )}
      </div>
    );
  }

  return (
    <Card className="bg-card/60 border-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Users className="w-5 h-5 text-primary" />
          Contact Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        {selectedContact ? (
          <div className="space-y-4">
            {/* Contact Header */}
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xl font-semibold">
                {selectedContact.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground">{selectedContact.name}</h3>
                <p className="text-muted-foreground">{selectedContact.role}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Building2 className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{selectedContact.company}</span>
                </div>
                {selectedContact.location && (
                  <div className="flex items-center gap-2 mt-1">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{selectedContact.location}</span>
                  </div>
                )}
              </div>
              <Badge variant="outline" className={getRelationshipColor(selectedContact.relationship)}>
                {selectedContact.relationship} relationship
              </Badge>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-4 gap-3">
              <div className="bg-background/50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-foreground">{selectedContact.interactionCount}</div>
                <div className="text-xs text-muted-foreground">Interactions</div>
              </div>
              <div className="bg-background/50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-foreground">{selectedContact.upcomingMeetings}</div>
                <div className="text-xs text-muted-foreground">Upcoming</div>
              </div>
              <div className="bg-background/50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-foreground">{selectedContact.pendingEmails}</div>
                <div className="text-xs text-muted-foreground">Pending</div>
              </div>
              <div className="bg-background/50 rounded-lg p-3 text-center">
                <div className={`text-2xl font-bold ${getSentimentColor(selectedContact.sentiment)}`}>
                  {selectedContact.sentiment === 'positive' ? '😊' : selectedContact.sentiment === 'neutral' ? '😐' : '⚠️'}
                </div>
                <div className="text-xs text-muted-foreground">Sentiment</div>
              </div>
            </div>

            {/* Contact Actions */}
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="flex-1">
                <Mail className="w-4 h-4 mr-2" />
                Email
              </Button>
              <Button size="sm" variant="outline" className="flex-1">
                <Calendar className="w-4 h-4 mr-2" />
                Schedule
              </Button>
              {selectedContact.phone && (
                <Button size="sm" variant="outline" className="flex-1">
                  <Phone className="w-4 h-4 mr-2" />
                  Call
                </Button>
              )}
            </div>

            {/* Social Links */}
            {selectedContact.socialLinks && (
              <div className="flex gap-2">
                {selectedContact.socialLinks.linkedin && (
                  <Button size="sm" variant="ghost" className="text-blue-400">
                    <Linkedin className="w-4 h-4 mr-2" />
                    LinkedIn
                  </Button>
                )}
                {selectedContact.socialLinks.twitter && (
                  <Button size="sm" variant="ghost" className="text-cyan-400">
                    <Twitter className="w-4 h-4 mr-2" />
                    Twitter
                  </Button>
                )}
              </div>
            )}

            {/* Notes */}
            <div>
              <h4 className="text-sm font-medium text-foreground mb-2">Notes & Context</h4>
              <ul className="space-y-1">
                {selectedContact.notes.map((note, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-primary">•</span>
                    {note}
                  </li>
                ))}
              </ul>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {selectedContact.tags.map((tag, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>

            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setSelectedContact(null)}
              className="w-full"
            >
              View All Contacts
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {MOCK_CONTACTS.map((contact) => (
              <div 
                key={contact.id}
                onClick={() => setSelectedContact(contact)}
                className="flex items-center gap-3 p-3 rounded-lg bg-background/50 hover:bg-background/80 cursor-pointer transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                  {contact.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-foreground truncate">{contact.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{contact.role} • {contact.company}</div>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className={`${getRelationshipColor(contact.relationship)} text-xs`}>
                    {contact.relationship}
                  </Badge>
                  <div className="text-xs text-muted-foreground mt-1">{contact.lastInteraction}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default SocialInsights;
