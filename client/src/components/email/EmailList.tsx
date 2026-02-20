import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Mail, 
  MailOpen, 
  Star, 
  Archive, 
  Trash2, 
  Search,
  Filter,
  RefreshCw,
  Clock,
  User,
  Tag
} from 'lucide-react';

interface EmailListProps {
  onEmailSelect?: (emailId: number) => void;
}

export function EmailList({ onEmailSelect }: EmailListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const { data: emails, isLoading, refetch } = trpc.gmail.getEmails.useQuery({
    limit: 50,
    category: selectedCategory || undefined,
  });

  const markAsReadMutation = trpc.gmail.markAsRead.useMutation();

  const handleEmailClick = async (email: any) => {
    if (!email.isRead) {
      await markAsReadMutation.mutateAsync({ emailId: email.id });
      refetch();
    }
    onEmailSelect?.(email.id);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-600';
      case 'medium': return 'bg-yellow-600';
      case 'low': return 'bg-green-600';
      default: return 'bg-gray-600';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'work': return 'bg-blue-600';
      case 'personal': return 'bg-purple-600';
      case 'finance': return 'bg-green-600';
      case 'social': return 'bg-pink-600';
      case 'promotions': return 'bg-orange-600';
      default: return 'bg-gray-600';
    }
  };

  const filteredEmails = emails?.filter(email => 
    searchQuery === '' || 
    email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    email.from.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter Bar */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search emails..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-800 border-gray-700 text-white"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => refetch()}
          className="border-gray-700 text-gray-300 hover:bg-gray-700"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Category Filters */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={selectedCategory === null ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedCategory(null)}
          className={selectedCategory === null ? "bg-purple-600" : "border-gray-700"}
        >
          All
        </Button>
        {['work', 'personal', 'finance', 'social', 'promotions'].map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category)}
            className={selectedCategory === category ? getCategoryColor(category) : "border-gray-700"}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </Button>
        ))}
      </div>

      {/* Email List */}
      <div className="space-y-2">
        {filteredEmails && filteredEmails.length > 0 ? (
          filteredEmails.map((email) => (
            <Card
              key={email.id}
              className={`bg-gray-800 border-gray-700 cursor-pointer transition-all hover:bg-gray-750 ${
                !email.isRead ? 'border-l-4 border-l-purple-500' : ''
              }`}
              onClick={() => handleEmailClick(email)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    {email.isRead ? (
                      <MailOpen className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Mail className="h-5 w-5 text-purple-500" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`text-sm font-semibold truncate ${
                        email.isRead ? 'text-gray-300' : 'text-white'
                      }`}>
                        {email.from}
                      </h3>
                      <div className="flex gap-1">
                        {email.priority && (
                          <Badge className={`${getPriorityColor(email.priority)} text-xs`}>
                            {email.priority}
                          </Badge>
                        )}
                        {email.category && (
                          <Badge className={`${getCategoryColor(email.category)} text-xs`}>
                            {email.category}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <p className={`text-sm mb-1 truncate ${
                      email.isRead ? 'text-gray-400' : 'text-gray-200'
                    }`}>
                      {email.subject}
                    </p>
                    
                    <p className="text-xs text-gray-500 truncate">
                      {email.snippet}
                    </p>
                    
                    {email.actionItems && email.actionItems.length > 0 && (
                      <div className="flex gap-1 mt-2">
                        <Tag className="h-3 w-3 text-yellow-500" />
                        <span className="text-xs text-yellow-500">
                          {email.actionItems.length} action item{email.actionItems.length > 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-shrink-0 text-right">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      {new Date(email.receivedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Mail className="h-16 w-16 text-gray-600 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Emails Found</h3>
              <p className="text-gray-400 text-center">
                {searchQuery 
                  ? 'No emails match your search criteria'
                  : 'Connect your email accounts to start seeing your emails here'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default EmailList;
