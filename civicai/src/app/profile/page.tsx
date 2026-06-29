'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getStoredIssues, getStoredUser, Issue, UserStats } from '@/lib/mockData';
import { 
  User, 
  Award, 
  AlertCircle, 
  CheckCircle2, 
  MapPin, 
  Clock,
  Calendar,
  ThumbsUp,
  Inbox
} from 'lucide-react';

export default function ProfilePage() {
  const [user, setUser] = useState<UserStats | null>(null);
  const [userIssues, setUserIssues] = useState<Issue[]>([]);
  const [activeTab, setActiveTab] = useState<'reports' | 'badges'>('reports');

  useEffect(() => {
    getStoredUser().then((usr) => {
      if (usr) {
        setUser(usr);
        getStoredIssues().then((issues) => {
          setUserIssues(issues.filter(i => i.creator.name === usr.name));
        });
      }
    });
  }, []);

  const getStatusBadge = (status: Issue['status']) => {
    switch (status) {
      case 'reported': return <Badge variant="warning">Reported</Badge>;
      case 'verified': return <Badge variant="info">Verified</Badge>;
      case 'in-progress': return <Badge variant="default" pulse>Resolving</Badge>;
      case 'resolved': return <Badge variant="success">Resolved</Badge>;
    }
  };

  const getSeverityBadge = (severity: Issue['severity']) => {
    switch (severity) {
      case 'low': return <Badge variant="glass">Low</Badge>;
      case 'medium': return <Badge variant="warning">Medium</Badge>;
      case 'high': return <Badge variant="danger">High</Badge>;
      case 'critical': return <Badge variant="danger" pulse>Critical</Badge>;
    }
  };

  return (
    <div className="space-y-8 pb-10 max-w-4xl">
      {/* Header Profile summary */}
      {user && (
        <Card glow className="bg-[#0b0b0e]/70 border-white/5 pt-6">
          <CardContent className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
            <div className="h-20 w-20 rounded-full overflow-hidden border-2 border-indigo-500 bg-[#0c0c0f] flex-shrink-0">
              <img src={user.avatar} alt={user.name} className="w-full h-full" />
            </div>

            <div className="flex-1 min-w-0 space-y-4">
              <div>
                <h1 className="text-2xl font-extrabold text-white tracking-tight">{user.name}</h1>
                <p className="text-sm text-indigo-400 font-semibold mt-0.5">{user.rank}</p>
                <p className="text-xs text-gray-500 mt-1 flex items-center justify-center sm:justify-start gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  Metro City Ward #3 (Cyber District)
                </p>
              </div>

              {/* Stats counts */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/5 text-xs text-gray-400">
                <div>
                  <span className="text-lg font-black text-white block">{user.points}</span>
                  <span>XP Points</span>
                </div>
                <div>
                  <span className="text-lg font-black text-white block">{user.issuesReported}</span>
                  <span>Reports Submitted</span>
                </div>
                <div>
                  <span className="text-lg font-black text-white block">{user.verificationsCount}</span>
                  <span>Verifications Made</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <div className="space-y-4">
        <div className="flex border-b border-white/5">
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
              activeTab === 'reports' 
                ? 'border-indigo-500 text-white' 
                : 'border-transparent text-gray-500 hover:text-white'
            }`}
          >
            My Submissions ({userIssues.length})
          </button>
          <button
            onClick={() => setActiveTab('badges')}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
              activeTab === 'badges' 
                ? 'border-indigo-500 text-white' 
                : 'border-transparent text-gray-500 hover:text-white'
            }`}
          >
            My Badges ({user?.badges.length || 0})
          </button>
        </div>

        {/* Tab content 1: My Submissions */}
        {activeTab === 'reports' && (
          <div className="space-y-3.5">
            {userIssues.length > 0 ? (
              userIssues.map((issue) => (
                <Link key={issue.id} href={`/issues/${issue.id}`} className="block">
                  <div className="glass-panel p-4.5 rounded-xl border border-white/5 hover:border-white/10 hover:bg-white/5 transition-all flex flex-col sm:flex-row gap-4">
                    <div className="w-full sm:w-28 h-20 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
                      <img src={issue.imageUrl} alt={issue.title} className="w-full h-full object-cover" />
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          {getStatusBadge(issue.status)}
                          {getSeverityBadge(issue.severity)}
                          <span className="text-[10px] text-gray-500 font-semibold">{issue.category}</span>
                        </div>
                        <h3 className="text-sm font-bold text-white truncate">{issue.title}</h3>
                        <p className="text-xs text-gray-400 mt-1 truncate">{issue.location.address}</p>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-gray-500 mt-3 pt-2 border-t border-white/5">
                        <span>Logged {new Date(issue.createdAt).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1.5">
                          <ThumbsUp className="w-3 h-3" /> {issue.upvotes} Upvotes
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="glass-panel p-16 rounded-xl border border-white/5 text-center flex flex-col items-center justify-center gap-3 text-xs text-gray-500">
                <Inbox className="w-8 h-8 text-gray-600" />
                <span>You have not reported any issues yet. Click "Report Issue" to start.</span>
              </div>
            )}
          </div>
        )}

        {/* Tab content 2: My Badges */}
        {activeTab === 'badges' && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {user && user.badges.length > 0 ? (
              user.badges.map((badge) => (
                <Card key={badge.id} className="bg-[#0b0b0e]/70 border-white/5">
                  <CardContent className="pt-2 flex flex-col gap-4">
                    <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-indigo-400">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{badge.name}</h4>
                      <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">{badge.description}</p>
                    </div>
                    <div className="text-[9px] text-gray-500 border-t border-white/5 pt-2 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Earned {badge.dateEarned}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="sm:col-span-2 lg:col-span-3 glass-panel p-16 rounded-xl border border-white/5 text-center flex flex-col items-center justify-center gap-3 text-xs text-gray-500">
                <Award className="w-8 h-8 text-gray-600 animate-pulse" />
                <span>Perform verifications or report active concerns to unlock badges.</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
