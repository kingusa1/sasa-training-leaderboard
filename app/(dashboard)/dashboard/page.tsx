'use client';

import { useState, useEffect, useCallback } from 'react';
import { AgentLeaderboardStats, Lead } from '@/lib/types';
import { PACKAGES } from '@/lib/constants';

type TimePeriod = 'today' | 'week' | 'month' | 'all';

const TIME_LABELS: Record<TimePeriod, string> = {
  today: 'Today',
  week: 'This Week',
  month: 'This Month',
  all: 'All Time',
};

interface AgentInfo {
  agentId: string;
  fullName: string;
  email: string;
}

function isInTimePeriod(dateStr: string, period: TimePeriod): boolean {
  if (period === 'all') return true;
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return false;
  const now = new Date();

  if (period === 'today') {
    return (
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    );
  }
  if (period === 'week') {
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    return date >= startOfWeek;
  }
  if (period === 'month') {
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }
  return true;
}

function filterByTimePeriod(
  stats: AgentLeaderboardStats[],
  period: TimePeriod
): AgentLeaderboardStats[] {
  if (period === 'all') return stats;

  return stats
    .map((agent) => {
      const filteredLeads = agent.leads.filter((l) => isInTimePeriod(l.timestamp, period));
      let revenue = 0;
      let meetingsDone = 0;
      let paymentReceived = 0;
      for (const lead of filteredLeads) {
        if (lead.meetingDone) meetingsDone++;
        if (lead.paymentReceived) {
          paymentReceived++;
          const pkg = PACKAGES.find((p) => p.id === lead.package || p.name === lead.package);
          if (pkg) revenue += pkg.price;
        }
      }
      return {
        ...agent,
        totalLeads: filteredLeads.length,
        meetingsDone,
        paymentReceived,
        revenue,
        leads: filteredLeads,
      };
    })
    .filter((a) => a.totalLeads > 0)
    .sort((a, b) => b.revenue - a.revenue || b.totalLeads - a.totalLeads);
}

export default function DashboardPage() {
  const [leaderboard, setLeaderboard] = useState<AgentLeaderboardStats[]>([]);
  const [recentLeads, setRecentLeads] = useState<Omit<Lead, 'rowIndex'>[]>([]);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('all');
  const [loading, setLoading] = useState(true);
  const [agent, setAgent] = useState<AgentInfo | null>(null);
  const [activeTab, setActiveTab] = useState<'rankings' | 'activity'>('rankings');

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/leaderboard');
      const data = await res.json();
      if (data.leaderboard) setLeaderboard(data.leaderboard);
      if (data.recentLeads) setRecentLeads(data.recentLeads);
    } catch (err) {
      console.error('Failed to load leaderboard:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.agent) setAgent(data.agent);
      })
      .catch(() => {});
  }, [fetchData]);

  const filtered = filterByTimePeriod(leaderboard, timePeriod);
  const myStats = agent ? filtered.find((a) => a.agentId === agent.agentId || a.email === agent.email) : null;
  const myRank = agent ? filtered.findIndex((a) => a.agentId === agent.agentId || a.email === agent.email) + 1 : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-navy-200 border-t-navy-500 rounded-full animate-spin mx-auto" />
          <p className="text-gray-500 mt-4">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Your Stats Card */}
      {agent && (
        <div className="bg-white rounded-2xl p-6 shadow-card border border-gray-100">
          <h2 className="text-lg font-semibold text-navy-700 mb-4">Your Performance</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-navy-500">{myRank > 0 ? `#${myRank}` : '-'}</p>
              <p className="text-gray-400 text-xs mt-1">Rank</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-navy-700">{myStats?.totalLeads || 0}</p>
              <p className="text-gray-400 text-xs mt-1">Total Leads</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{myStats?.paymentReceived || 0}</p>
              <p className="text-gray-400 text-xs mt-1">Payments</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-accent-teal">AED {(myStats?.revenue || 0).toLocaleString()}</p>
              <p className="text-gray-400 text-xs mt-1">Revenue</p>
            </div>
          </div>
        </div>
      )}

      {/* Time Period Filter */}
      <div className="grid grid-cols-4 gap-2">
        {(Object.keys(TIME_LABELS) as TimePeriod[]).map((period) => (
          <button
            key={period}
            onClick={() => setTimePeriod(period)}
            className={`py-2 px-3 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              timePeriod === period
                ? 'bg-navy-500 text-white shadow-navy'
                : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            {TIME_LABELS[period]}
          </button>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('rankings')}
          className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'rankings'
              ? 'bg-navy-500 text-white shadow-navy'
              : 'bg-white text-gray-500 border border-gray-200'
          }`}
        >
          🏆 Rankings
        </button>
        <button
          onClick={() => setActiveTab('activity')}
          className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'activity'
              ? 'bg-accent-teal text-white'
              : 'bg-white text-gray-500 border border-gray-200'
          }`}
        >
          📋 Recent Activity
        </button>
      </div>

      {activeTab === 'rankings' ? (
        <>
          {/* Podium - Top 3 */}
          {filtered.length >= 3 && (
            <div className="flex items-end justify-center gap-3 py-4">
              {/* 2nd Place */}
              <div className="text-center flex-1 max-w-[120px]">
                <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center mb-2 ring-2 ring-gray-400">
                  <span className="text-white text-sm font-bold">
                    {filtered[1].fullName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                  </span>
                </div>
                <div className="bg-white rounded-t-xl pt-3 pb-6 border border-gray-200 border-b-0 shadow-card">
                  <span className="text-gray-400 text-2xl">🥈</span>
                  <p className="text-navy-700 text-xs font-semibold mt-1 truncate px-2">{filtered[1].fullName}</p>
                  <p className="text-accent-teal text-xs font-medium">AED {filtered[1].revenue.toLocaleString()}</p>
                </div>
                <div className="bg-gray-200 h-16 rounded-b-lg" />
              </div>

              {/* 1st Place */}
              <div className="text-center flex-1 max-w-[140px]">
                <div className="w-16 h-16 mx-auto rounded-full bg-navy-500 flex items-center justify-center mb-2 ring-3 ring-navy-400 shadow-navy">
                  <span className="text-white text-sm font-bold">
                    {filtered[0].fullName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                  </span>
                </div>
                <div className="bg-white rounded-t-xl pt-3 pb-6 border border-navy-100 border-b-0 shadow-card">
                  <span className="text-3xl">👑</span>
                  <p className="text-navy-700 text-sm font-bold mt-1 truncate px-2">{filtered[0].fullName}</p>
                  <p className="text-navy-500 text-sm font-semibold">AED {filtered[0].revenue.toLocaleString()}</p>
                </div>
                <div className="bg-navy-100 h-24 rounded-b-lg" />
              </div>

              {/* 3rd Place */}
              <div className="text-center flex-1 max-w-[120px]">
                <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center mb-2 ring-2 ring-amber-600">
                  <span className="text-white text-sm font-bold">
                    {filtered[2].fullName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                  </span>
                </div>
                <div className="bg-white rounded-t-xl pt-3 pb-6 border border-gray-200 border-b-0 shadow-card">
                  <span className="text-amber-600 text-2xl">🥉</span>
                  <p className="text-navy-700 text-xs font-semibold mt-1 truncate px-2">{filtered[2].fullName}</p>
                  <p className="text-accent-teal text-xs font-medium">AED {filtered[2].revenue.toLocaleString()}</p>
                </div>
                <div className="bg-amber-100 h-10 rounded-b-lg" />
              </div>
            </div>
          )}

          {/* Rankings Table */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-card">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-cream-100">
                    <th className="text-left text-gray-500 text-xs font-medium px-4 py-3">#</th>
                    <th className="text-left text-gray-500 text-xs font-medium px-4 py-3">Agent</th>
                    <th className="text-center text-gray-500 text-xs font-medium px-4 py-3">Leads</th>
                    <th className="text-center text-gray-500 text-xs font-medium px-4 py-3">Meetings</th>
                    <th className="text-center text-gray-500 text-xs font-medium px-4 py-3">Paid</th>
                    <th className="text-right text-gray-500 text-xs font-medium px-4 py-3">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((a, idx) => {
                    const isMe = agent && (a.agentId === agent.agentId || a.email === agent.email);
                    return (
                      <tr
                        key={a.agentId}
                        className={`border-b border-gray-100 ${
                          isMe ? 'bg-navy-50' : 'hover:bg-cream-50'
                        } transition-colors`}
                      >
                        <td className="px-4 py-3">
                          <span className={`text-sm font-bold ${idx < 3 ? 'text-navy-500' : 'text-gray-400'}`}>
                            {idx + 1}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                              isMe
                                ? 'bg-navy-500 text-white'
                                : 'bg-navy-50 text-navy-500'
                            }`}>
                              {a.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                            </div>
                            <div>
                              <p className={`text-sm font-medium ${isMe ? 'text-navy-500' : 'text-navy-700'}`}>
                                {a.fullName}
                                {isMe && <span className="ml-1.5 text-xs text-navy-400">(You)</span>}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center text-navy-700 text-sm">{a.totalLeads}</td>
                        <td className="px-4 py-3 text-center text-navy-700 text-sm">{a.meetingsDone}</td>
                        <td className="px-4 py-3 text-center text-green-600 text-sm font-medium">{a.paymentReceived}</td>
                        <td className="px-4 py-3 text-right text-navy-500 font-semibold text-sm">
                          AED {a.revenue.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center text-gray-400 py-8">
                        No data for this time period
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Activity Feed */
        <div className="space-y-3">
          {recentLeads.length === 0 ? (
            <div className="text-center text-gray-400 py-12 bg-white rounded-2xl border border-gray-200 shadow-card">
              No recent activity
            </div>
          ) : (
            recentLeads.filter((l) => isInTimePeriod(l.timestamp, timePeriod)).map((lead, idx) => {
              const pkg = PACKAGES.find((p) => p.id === lead.package || p.name === lead.package);
              const clientName = `${lead.firstName} ${lead.lastName}`.trim();
              return (
                <div
                  key={`${lead.timestamp}-${idx}`}
                  className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-card-hover transition-shadow shadow-card"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-navy-50 flex items-center justify-center">
                        <span className="text-navy-500 text-xs font-bold">
                          {lead.agentName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                        </span>
                      </div>
                      <div>
                        <p className="text-navy-700 text-sm font-medium">{lead.agentName}</p>
                        <p className="text-gray-400 text-xs">
                          New lead: <span className="text-gray-600">{clientName}</span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs bg-navy-50 text-navy-500 px-2 py-1 rounded-full font-medium">
                        {pkg?.name || lead.package}
                      </span>
                      <p className="text-gray-400 text-xs mt-1">
                        {new Date(lead.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {(lead.meetingDone || lead.paymentReceived) && (
                    <div className="flex gap-2 mt-2 ml-13">
                      {lead.meetingDone && (
                        <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">Meeting Done</span>
                      )}
                      {lead.paymentReceived && (
                        <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full">Paid</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
