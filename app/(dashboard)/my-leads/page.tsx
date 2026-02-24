'use client';

import { useState, useEffect, useCallback } from 'react';
import { Lead } from '@/lib/types';
import { PACKAGES } from '@/lib/constants';

type FilterStatus = 'all' | 'new' | 'meeting_done' | 'paid';

export default function MyLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [toggling, setToggling] = useState<string | null>(null);

  const fetchLeads = useCallback(async () => {
    try {
      const res = await fetch('/api/leads');
      const data = await res.json();
      if (data.leads) setLeads(data.leads);
    } catch (err) {
      console.error('Failed to load leads:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  async function handleToggle(lead: Lead, field: 'meetingDone' | 'paymentReceived') {
    if (!lead.rowIndex) return;

    // Enforce: Meeting must be done before payment can be toggled ON
    if (field === 'paymentReceived' && !lead.meetingDone && !lead.paymentReceived) {
      return;
    }

    const key = `${lead.timestamp}-${field}`;
    setToggling(key);

    const newValue = !lead[field];

    // Optimistic update
    setLeads((prev) =>
      prev.map((l) =>
        l.rowIndex === lead.rowIndex ? { ...l, [field]: newValue } : l
      )
    );

    try {
      const res = await fetch(`/api/leads/${lead.rowIndex}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field, value: newValue }),
      });

      if (!res.ok) {
        setLeads((prev) =>
          prev.map((l) =>
            l.rowIndex === lead.rowIndex ? { ...l, [field]: !newValue } : l
          )
        );
      }
    } catch {
      setLeads((prev) =>
        prev.map((l) =>
          l.rowIndex === lead.rowIndex ? { ...l, [field]: !newValue } : l
        )
      );
    } finally {
      setToggling(null);
    }
  }

  const filteredLeads = leads.filter((lead) => {
    if (filter === 'all') return true;
    if (filter === 'new') return !lead.meetingDone && !lead.paymentReceived;
    if (filter === 'meeting_done') return lead.meetingDone && !lead.paymentReceived;
    if (filter === 'paid') return lead.paymentReceived;
    return true;
  });

  const stats = {
    total: leads.length,
    new: leads.filter((l) => !l.meetingDone && !l.paymentReceived).length,
    meetingDone: leads.filter((l) => l.meetingDone && !l.paymentReceived).length,
    paid: leads.filter((l) => l.paymentReceived).length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gold/30 border-t-gold rounded-full animate-spin mx-auto" />
          <p className="text-gray-400 mt-4">Loading your leads...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold text-white">My Leads</h1>

      {/* Stats Summary */}
      <div className="grid grid-cols-4 gap-3">
        <button
          onClick={() => setFilter('all')}
          className={`p-3 rounded-xl text-center transition-all ${
            filter === 'all'
              ? 'bg-gold/10 border-gold border'
              : 'bg-navy-800 border border-navy-700'
          }`}
        >
          <p className="text-xl font-bold text-white">{stats.total}</p>
          <p className="text-xs text-gray-400">Total</p>
        </button>
        <button
          onClick={() => setFilter('new')}
          className={`p-3 rounded-xl text-center transition-all ${
            filter === 'new'
              ? 'bg-blue-500/10 border-blue-500 border'
              : 'bg-navy-800 border border-navy-700'
          }`}
        >
          <p className="text-xl font-bold text-blue-400">{stats.new}</p>
          <p className="text-xs text-gray-400">New</p>
        </button>
        <button
          onClick={() => setFilter('meeting_done')}
          className={`p-3 rounded-xl text-center transition-all ${
            filter === 'meeting_done'
              ? 'bg-orange-500/10 border-orange-500 border'
              : 'bg-navy-800 border border-navy-700'
          }`}
        >
          <p className="text-xl font-bold text-orange-400">{stats.meetingDone}</p>
          <p className="text-xs text-gray-400">Meeting</p>
        </button>
        <button
          onClick={() => setFilter('paid')}
          className={`p-3 rounded-xl text-center transition-all ${
            filter === 'paid'
              ? 'bg-green-500/10 border-green-500 border'
              : 'bg-navy-800 border border-navy-700'
          }`}
        >
          <p className="text-xl font-bold text-green-400">{stats.paid}</p>
          <p className="text-xs text-gray-400">Paid</p>
        </button>
      </div>

      {/* Leads List */}
      {filteredLeads.length === 0 ? (
        <div className="text-center text-gray-500 py-12 bg-navy-800 rounded-2xl border border-navy-700">
          <p className="text-4xl mb-3">👥</p>
          <p className="font-medium">No leads yet</p>
          <p className="text-sm mt-1">Share your QR code to start getting leads!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLeads.map((lead) => {
            const pkg = PACKAGES.find((p) => p.id === lead.package || p.name === lead.package);
            const clientName = `${lead.firstName} ${lead.lastName}`.trim();
            return (
              <div
                key={lead.rowIndex}
                className="bg-navy-800 rounded-xl p-4 border border-navy-700"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-white font-semibold">{clientName}</h3>
                    <p className="text-gray-400 text-sm">{lead.clientEmail}</p>
                    <p className="text-gray-500 text-xs">{lead.clientPhone}</p>
                    {lead.companyName && (
                      <p className="text-gray-500 text-xs mt-0.5">🏢 {lead.companyName}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-xs bg-navy-600 text-gray-300 px-2 py-1 rounded-full">
                      {pkg?.name || lead.package}
                    </span>
                    {pkg && pkg.price > 0 && (
                      <p className="text-gold text-sm font-semibold mt-1">AED {pkg.price.toLocaleString()}</p>
                    )}
                    {pkg && pkg.price === 0 && (
                      <p className="text-gold text-sm font-semibold mt-1">Custom</p>
                    )}
                  </div>
                </div>

                {/* Status Badge */}
                <div className="mb-3">
                  {lead.paymentReceived ? (
                    <span className="text-xs bg-green-500/10 text-green-400 px-3 py-1 rounded-full font-medium">
                      Paid
                    </span>
                  ) : lead.meetingDone ? (
                    <span className="text-xs bg-orange-500/10 text-orange-400 px-3 py-1 rounded-full font-medium">
                      Meeting Done
                    </span>
                  ) : (
                    <span className="text-xs bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full font-medium">
                      New Lead
                    </span>
                  )}
                  <span className="text-gray-500 text-xs ml-2">
                    {new Date(lead.timestamp).toLocaleDateString()}
                  </span>
                  {lead.preferredContact && (
                    <span className="text-gray-500 text-xs ml-2">
                      Contact via: {lead.preferredContact}
                    </span>
                  )}
                </div>

                {/* Toggle Switches */}
                <div className="flex items-center gap-6 pt-3 border-t border-navy-700">
                  {/* Meeting Done Toggle */}
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={lead.meetingDone}
                        onChange={() => handleToggle(lead, 'meetingDone')}
                        disabled={toggling === `${lead.timestamp}-meetingDone`}
                      />
                      <div
                        className={`w-11 h-6 rounded-full transition-colors ${
                          lead.meetingDone ? 'bg-blue-500' : 'bg-navy-600'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform mt-0.5 ${
                            lead.meetingDone ? 'translate-x-5.5 ml-0.5' : 'translate-x-0.5'
                          }`}
                        />
                      </div>
                    </div>
                    <span className="text-sm text-gray-300">Meeting Done</span>
                  </label>

                  {/* Payment Received Toggle */}
                  <label className={`flex items-center gap-3 ${lead.meetingDone ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}>
                    <div className="relative">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={lead.paymentReceived}
                        onChange={() => handleToggle(lead, 'paymentReceived')}
                        disabled={toggling === `${lead.timestamp}-paymentReceived` || (!lead.meetingDone && !lead.paymentReceived)}
                      />
                      <div
                        className={`w-11 h-6 rounded-full transition-colors ${
                          lead.paymentReceived ? 'bg-green-500' : 'bg-navy-600'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform mt-0.5 ${
                            lead.paymentReceived ? 'translate-x-5.5 ml-0.5' : 'translate-x-0.5'
                          }`}
                        />
                      </div>
                    </div>
                    <span className="text-sm text-gray-300">Payment Received</span>
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
