import { useState } from 'react';
import { Users, Gift, ArrowUp, Copy, Check, Share2, Mail, Twitter, Linkedin, Brain } from 'lucide-react';

interface WaitlistPosition {
  position: number;
  totalWaiting: number;
  referralCode: string;
  referralsCount: number;
  positionsGained: number;
}

interface ReferralStats {
  totalReferrals: number;
  pendingReferrals: number;
  convertedReferrals: number;
  creditsEarned: number;
  referralCode: string;
}

// Waitlist signup component for new users
export function WaitlistSignup({ onJoin }: { onJoin?: (email: string, referralCode?: string) => void }) {
  const [email, setEmail] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [showReferralInput, setShowReferralInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [joined, setJoined] = useState(false);
  const [position, setPosition] = useState<WaitlistPosition | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock response
    setPosition({
      position: Math.floor(Math.random() * 5000) + 1000,
      totalWaiting: 15000,
      referralCode: `BRAIN-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      referralsCount: 0,
      positionsGained: referralCode ? 500 : 0,
    });
    
    setJoined(true);
    setIsSubmitting(false);
    onJoin?.(email, referralCode || undefined);
  };

  if (joined && position) {
    return <WaitlistStatus position={position} />;
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 mb-4">
          <Brain className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Join the Cepho Waitlist</h2>
        <p className="text-foreground/70">
          Get early access to your AI-powered Chief of Staff. 
          <span className="text-cyan-400"> 15,000+ people</span> are already waiting.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        {showReferralInput ? (
          <div>
            <input
              type="text"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
              placeholder="Referral code (optional)"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
            <p className="text-xs text-foreground/60 mt-1">
              Have a referral code? Enter it to skip ahead in the queue!
            </p>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowReferralInput(true)}
            className="text-sm text-cyan-400 hover:text-cyan-300"
          >
            Have a referral code?
          </button>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isSubmitting ? 'Joining...' : 'Join the Waitlist'}
        </button>
      </form>

      <p className="text-xs text-foreground/60 text-center mt-4">
        By joining, you agree to our Terms of Service and Privacy Policy.
      </p>
    </div>
  );
}

// Waitlist status component showing position and referral options
export function WaitlistStatus({ position }: { position: WaitlistPosition }) {
  const [copied, setCopied] = useState(false);

  const copyReferralLink = async () => {
    const link = `${window.location.origin}/join?ref=${position.referralCode}`;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareToTwitter = () => {
    const text = encodeURIComponent(`I just joined the Cepho waitlist. Get early access to your AI-powered Chief of Staff. Use my referral link to skip ahead:`);
    const url = encodeURIComponent(`${window.location.origin}/join?ref=${position.referralCode}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  const shareToLinkedIn = () => {
    const url = encodeURIComponent(`${window.location.origin}/join?ref=${position.referralCode}`);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
  };

  const percentile = Math.round((1 - position.position / position.totalWaiting) * 100);

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
        {/* Position Display */}
        <div className="text-center mb-6">
          <div className="text-sm text-foreground/70 mb-1">Your position</div>
          <div className="text-5xl font-bold text-white mb-1">
            #{position.position.toLocaleString()}
          </div>
          <div className="text-sm text-foreground/70">
            of {position.totalWaiting.toLocaleString()} waiting
          </div>
          {position.positionsGained > 0 && (
            <div className="inline-flex items-center gap-1 mt-2 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
              <ArrowUp className="w-4 h-4" />
              Jumped {position.positionsGained} spots with referral!
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-foreground/70 mb-2">
            <span>Queue progress</span>
            <span>Top {percentile}%</span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full transition-all duration-500"
              style={{ width: `${percentile}%` }}
            />
          </div>
        </div>

        {/* Skip Ahead Section */}
        <div className="bg-gray-900 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-cyan-500/20 rounded-lg">
              <Gift className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="font-semibold text-white">Skip ahead!</div>
              <div className="text-sm text-foreground/70">
                Invite friends to move up the queue
              </div>
            </div>
          </div>

          <div className="space-y-2 text-sm text-foreground/80">
            <div className="flex justify-between">
              <span>Each invite sent</span>
              <span className="text-cyan-400">+50 spots</span>
            </div>
            <div className="flex justify-between">
              <span>Friend joins waitlist</span>
              <span className="text-cyan-400">+200 spots</span>
            </div>
            <div className="flex justify-between">
              <span>Friend becomes user</span>
              <span className="text-cyan-400">+500 spots</span>
            </div>
          </div>
        </div>

        {/* Referral Code */}
        <div className="mb-4">
          <div className="text-sm text-foreground/70 mb-2">Your referral code</div>
          <div className="flex gap-2">
            <div className="flex-1 px-4 py-2 bg-gray-900 rounded-lg font-mono text-white">
              {position.referralCode}
            </div>
            <button
              onClick={copyReferralLink}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5 text-foreground/80" />}
            </button>
          </div>
        </div>

        {/* Share Buttons */}
        <div className="flex gap-2">
          <button
            onClick={copyReferralLink}
            className="flex-1 flex items-center justify-center gap-2 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-foreground/80 transition-colors"
          >
            <Copy className="w-4 h-4" />
            <span>Copy link</span>
          </button>
          <button
            onClick={shareToTwitter}
            className="flex-1 flex items-center justify-center gap-2 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-foreground/80 transition-colors"
          >
            <Twitter className="w-4 h-4" />
            <span>Tweet</span>
          </button>
          <button
            onClick={shareToLinkedIn}
            className="flex-1 flex items-center justify-center gap-2 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-foreground/80 transition-colors"
          >
            <Linkedin className="w-4 h-4" />
            <span>Share</span>
          </button>
        </div>

        {/* Referral Stats */}
        {position.referralsCount > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-700">
            <div className="flex items-center gap-2 text-sm text-foreground/70">
              <Users className="w-4 h-4" />
              <span>{position.referralsCount} friends referred</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Referral dashboard for active users
export function ReferralDashboard({ stats }: { stats: ReferralStats }) {
  const [copied, setCopied] = useState(false);

  const copyReferralLink = async () => {
    const link = `${window.location.origin}/join?ref=${stats.referralCode}`;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Referral Program</h3>
        <div className="flex items-center gap-2 px-3 py-1 bg-cyan-500/20 rounded-full">
          <Gift className="w-4 h-4 text-cyan-400" />
          <span className="text-sm text-cyan-400">{stats.creditsEarned} credits earned</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-900 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-white">{stats.totalReferrals}</div>
          <div className="text-sm text-foreground/70">Total Referrals</div>
        </div>
        <div className="bg-gray-900 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400">{stats.pendingReferrals}</div>
          <div className="text-sm text-foreground/70">Pending</div>
        </div>
        <div className="bg-gray-900 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-400">{stats.convertedReferrals}</div>
          <div className="text-sm text-foreground/70">Converted</div>
        </div>
      </div>

      {/* Rewards Info */}
      <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-xl p-4 mb-6">
        <h4 className="font-semibold text-white mb-3">Earn rewards</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-foreground/80">
            <span>Friend joins waitlist</span>
            <span className="text-cyan-400">+50 credits</span>
          </div>
          <div className="flex justify-between text-foreground/80">
            <span>Friend becomes active user</span>
            <span className="text-cyan-400">+200 credits</span>
          </div>
          <div className="flex justify-between text-foreground/80">
            <span>Friend upgrades to Pro</span>
            <span className="text-cyan-400">+1 month free</span>
          </div>
        </div>
      </div>

      {/* Referral Link */}
      <div>
        <div className="text-sm text-foreground/70 mb-2">Your referral link</div>
        <div className="flex gap-2">
          <div className="flex-1 px-4 py-2 bg-gray-900 rounded-lg text-sm text-foreground/80 truncate">
            {window.location.host}/join?ref={stats.referralCode}
          </div>
          <button
            onClick={copyReferralLink}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 rounded-lg transition-colors"
          >
            {copied ? <Check className="w-5 h-5 text-white" /> : <Copy className="w-5 h-5 text-white" />}
          </button>
        </div>
      </div>
    </div>
  );
}

// Invite modal for quick sharing
export function InviteModal({ 
  isOpen, 
  onClose,
  referralCode 
}: { 
  isOpen: boolean; 
  onClose: () => void;
  referralCode: string;
}) {
  const [emails, setEmails] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  if (!isOpen) return null;

  const handleSendInvites = async () => {
    setSending(true);
    // Simulate sending invites
    await new Promise(resolve => setTimeout(resolve, 1500));
    setSending(false);
    setSent(true);
    setTimeout(() => {
      setSent(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl p-6 max-w-md w-full">
        <h3 className="text-xl font-semibold text-white mb-2">Invite Friends</h3>
        <p className="text-foreground/70 text-sm mb-6">
          Share Cepho with friends and earn rewards when they join.
        </p>

        <div className="mb-4">
          <label className="text-sm text-foreground/70 mb-2 block">
            Email addresses (comma separated)
          </label>
          <textarea
            value={emails}
            onChange={(e) => setEmails(e.target.value)}
            placeholder="friend1@email.com, friend2@email.com"
            rows={3}
            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors resize-none"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-foreground/80 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSendInvites}
            disabled={!emails.trim() || sending}
            className="flex-1 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {sending ? (
              'Sending...'
            ) : sent ? (
              <>
                <Check className="w-4 h-4" />
                Sent!
              </>
            ) : (
              <>
                <Mail className="w-4 h-4" />
                Send Invites
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
