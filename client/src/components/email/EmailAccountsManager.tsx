import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, Plus, Trash2, RefreshCw, CheckCircle, XCircle } from 'lucide-react';

export function EmailAccountsManager() {
  const { data: accounts, isLoading, refetch } = trpc.gmail.getAccounts.useQuery();
  const connectMutation = trpc.gmail.connect.useMutation();
  const disconnectMutation = trpc.gmail.disconnect.useMutation();
  const syncMutation = trpc.gmail.syncEmails.useMutation();

  const handleConnect = async () => {
    try {
      const result = await connectMutation.mutateAsync();
      if (result.authUrl) {
        window.location.href = result.authUrl;
      }
    } catch (error) {
      console.error('Failed to connect Gmail:', error);
    }
  };

  const handleDisconnect = async (accountId: number) => {
    try {
      await disconnectMutation.mutateAsync({ accountId });
      refetch();
    } catch (error) {
      console.error('Failed to disconnect account:', error);
    }
  };

  const handleSync = async (accountId: number) => {
    try {
      await syncMutation.mutateAsync({ accountId });
      refetch();
    } catch (error) {
      console.error('Failed to sync emails:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Email Accounts</h2>
          <p className="text-gray-400 mt-1">
            Connect your Gmail accounts to enable email aggregation and AI analysis
          </p>
        </div>
        <Button
          onClick={handleConnect}
          className="bg-purple-600 hover:bg-purple-700"
          disabled={connectMutation.isLoading}
        >
          <Plus className="h-4 w-4 mr-2" />
          Connect Gmail Account
        </Button>
      </div>

      <div className="grid gap-4">
        {accounts && accounts.length > 0 ? (
          accounts.map((account) => (
            <Card key={account.id} className="bg-gray-800 border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-purple-600 flex items-center justify-center">
                      <Mail className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-white">{account.email}</CardTitle>
                      <CardDescription className="text-gray-400">
                        {account.accountName || 'Personal Account'}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {account.isActive ? (
                      <Badge className="bg-green-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        <XCircle className="h-3 w-3 mr-1" />
                        Inactive
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-400">
                    Last synced: {account.lastSyncedAt 
                      ? new Date(account.lastSyncedAt).toLocaleString()
                      : 'Never'}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSync(account.id)}
                      disabled={syncMutation.isLoading}
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${syncMutation.isLoading ? 'animate-spin' : ''}`} />
                      Sync Now
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDisconnect(account.id)}
                      disabled={disconnectMutation.isLoading}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Disconnect
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Mail className="h-16 w-16 text-gray-600 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Email Accounts Connected</h3>
              <p className="text-gray-400 text-center mb-6 max-w-md">
                Connect your Gmail accounts to enable intelligent email aggregation, AI-powered analysis, 
                and automatic task creation from your emails.
              </p>
              <Button
                onClick={handleConnect}
                className="bg-purple-600 hover:bg-purple-700"
                disabled={connectMutation.isLoading}
              >
                <Plus className="h-4 w-4 mr-2" />
                Connect Your First Account
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default EmailAccountsManager;
