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
          <div className="w-12 h-12 border-4 border-navy-200 border-t-navy-500 rounded-full animate-spin mx-auto" />
          <p className="text-gray-500 mt-4">Loading your leads...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-navy-700">My Leads</h1>

      {/* Stats Summary */}
      <div className="grid grid-cols-4 gap-3">
        <button
          onClick={() => setFilter('all')}
          className={`p-3 rounded-xl text-center transition-all shadow-card ${
            filter === 'all'
              ? 'bg-navy-500 border-navy-500 border text-white'
              : 'bg-white border border-gray-200'
          }`}
        >
          <p className={`text-xl font-bold ${filter === 'all' ? 'text-white' : 'text-navy-700'}`}>{stats.total}</p>
          <p className={`text-xs ${filter === 'all' ? 'text-navy-100' : 'text-gray-400'}`}>Total</p>
        </button>
        <button
          onClick={() => setFilter('new')}
          className={`p-3 rounded-xl text-center transition-all shadow-card ${
            filter === 'new'
              ? 'bg-blue-500 border-blue-500 border text-white'
              : 'bg-white border border-gray-200'
          }`}
        >
          <p className={`text-xl font-bold ${filter === 'new' ? 'text-white' : 'text-blue-500'}`}>{stats.new}</p>
          <p className={`text-xs ${filter === 'new' ? 'text-blue-100' : 'text-gray-400'}`}>New</p>
        </button>
        <button
          onClick={() => setFilter('meeting_done')}
          className={`p-3 rounded-xl text-center transition-all shadow-card ${
            filter === 'meeting_done'
              ? 'bg-orange-500 border-orange-500 border text-white'
              : 'bg-white border border-gray-200'
          }`}
        >
          <p className={`text-xl font-bold ${filter === 'meeting_done' ? 'text-white' : 'text-orange-500'}`}>{stats.meetingDone}</p>
          <p className={`text-xs ${filter === 'meeting_done' ? 'text-orange-100' : 'text-gray-400'}`}>Meeting</p>
        </button>
        <button
          onClick={() => setFilter('paid')}
          className={`p-3 rounded-xl text-center transition-all shadow-card ${
            filter === 'paid'
              ? 'bg-green-500 border-green-500 border text-white'
              : 'bg-white border border-gray-200'
          }`}
        >
          <p className={`text-xl font-bold ${filter === 'paid' ? 'text-white' : 'text-green-500'}`}>{stats.paid}</p>
          <p className={`text-xs ${filter === 'paid' ? 'text-green-100' : 'text-gray-400'}`}>Paid</p>
        </button>
      </div>

      {/* Leads List */}
      {filteredLeads.length === 0 ? (
        <div className="text-center text-gray-400 py-12 bg-white rounded-2xl border border-gray-200 shadow-card">
          <p className="text-4xl mb-3">👥</p>
          <p className="font-medium text-navy-700">No leads yet</p>
          <p className="text-sm mt-1">Share your QR code to start getting leads!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLeads.map((lead) => {
            const pkg = PACKAGES.find((p) => p.id === lead.package || p.name === lead.package);
            const clientName = `${lead.firstName} ${lead.lastName}`.trim();
            const isEnterprisePkg = pkg?.id === 'enterprise';
            const leadDate = new Date(lead.timestamp);
            const formattedDate = leadDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
            const formattedTime = leadDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

            return (
              <div
                key={lead.rowIndex}
                className="bg-white rounded-xl p-4 border border-gray-200 shadow-card"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-navy-700 font-semibold">{clientName}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <a href={`mailto:${lead.clientEmail}`} className="text-blue-500 text-sm hover:underline">{lead.clientEmail}</a>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <a href={`tel:${lead.clientPhone}`} className="text-blue-500 text-sm hover:underline">{lead.clientPhone}</a>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs bg-navy-50 text-navy-500 px-2 py-1 rounded-full font-medium">
                      {pkg?.name || lead.package}
                    </span>
                    {pkg && !isEnterprisePkg && pkg.price > 0 && (
                      <p className="text-navy-500 text-sm font-semibold mt-1">AED {pkg.price.toLocaleString()}{pkg.priceSuffix || ''}</p>
                    )}
                    {isEnterprisePkg && (
                      <p className="text-navy-500 text-sm font-semibold mt-1">Custom</p>
                    )}
                  </div>
                </div>

                {/* Lead Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3 p-3 bg-gray-50 rounded-lg text-xs">
                  <div>
                    <span className="text-gray-400 uppercase tracking-wider text-[10px] font-semibold">Date</span>
                    <p className="text-gray-700 font-medium">{formattedDate}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 uppercase tracking-wider text-[10px] font-semibold">Time</span>
                    <p className="text-gray-700 font-medium">{formattedTime}</p>
                  </div>
                  {lead.preferredContact && (
                    <div>
                      <span className="text-gray-400 uppercase tracking-wider text-[10px] font-semibold">Contact Via</span>
                      <p className="text-gray-700 font-medium capitalize">{lead.preferredContact}</p>
                    </div>
                  )}
                  {lead.bestTime && (
                    <div>
                      <span className="text-gray-400 uppercase tracking-wider text-[10px] font-semibold">Best Time</span>
                      <p className="text-gray-700 font-medium capitalize">{lead.bestTime}</p>
                    </div>
                  )}
                  {lead.companyName && (
                    <div>
                      <span className="text-gray-400 uppercase tracking-wider text-[10px] font-semibold">Company</span>
                      <p className="text-gray-700 font-medium">{lead.companyName}</p>
                    </div>
                  )}
                  {lead.teamSize && (
                    <div>
                      <span className="text-gray-400 uppercase tracking-wider text-[10px] font-semibold">Team Size</span>
                      <p className="text-gray-700 font-medium">{lead.teamSize}</p>
                    </div>
                  )}
                  {lead.leadSource && (
                    <div>
                      <span className="text-gray-400 uppercase tracking-wider text-[10px] font-semibold">Source</span>
                      <p className="text-gray-700 font-medium">{lead.leadSource}</p>
                    </div>
                  )}
                </div>

                {/* Notes */}
                {lead.notes && (
                  <div className="mb-3 p-3 bg-amber-50 border border-amber-100 rounded-lg">
                    <p className="text-amber-800 text-[10px] uppercase tracking-wider font-semibold mb-1">Client Notes</p>
                    <p className="text-gray-700 text-sm leading-relaxed">{lead.notes}</p>
                  </div>
                )}

                {/* Status Badge */}
                <div className="mb-3">
                  {lead.paymentReceived ? (
                    <span className="text-xs bg-green-50 text-green-600 px-3 py-1 rounded-full font-medium">
                      Paid
                    </span>
                  ) : lead.meetingDone ? (
                    <span className="text-xs bg-orange-50 text-orange-600 px-3 py-1 rounded-full font-medium">
                      Meeting Done
                    </span>
                  ) : (
                    <span className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-medium">
                      New Lead
                    </span>
                  )}
                  {pkg?.meetingOnly && (
                    <span className="text-xs bg-purple-50 text-purple-600 px-3 py-1 rounded-full font-medium ml-2">
                      Meeting Required
                    </span>
                  )}
                </div>

                {/* Toggle Switches */}
                <div className="flex items-center gap-6 pt-3 border-t border-gray-100">
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
                          lead.meetingDone ? 'bg-blue-500' : 'bg-gray-300'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform mt-0.5 ${
                            lead.meetingDone ? 'translate-x-5.5 ml-0.5' : 'translate-x-0.5'
                          }`}
                        />
                      </div>
                    </div>
                    <span className="text-sm text-gray-600">Meeting Done</span>
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
                          lead.paymentReceived ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform mt-0.5 ${
                            lead.paymentReceived ? 'translate-x-5.5 ml-0.5' : 'translate-x-0.5'
                          }`}
                        />
                      </div>
                    </div>
                    <span className="text-sm text-gray-600">Payment Received</span>
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
