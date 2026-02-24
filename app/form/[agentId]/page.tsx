'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { PACKAGES } from '@/lib/constants';

interface AgentInfo {
  agentId: string;
  fullName: string;
}

export default function ClientFormPage() {
  const params = useParams();
  const agentId = params.agentId as string;

  const [agent, setAgent] = useState<AgentInfo | null>(null);
  const [loadingAgent, setLoadingAgent] = useState(true);
  const [agentNotFound, setAgentNotFound] = useState(false);

  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [selectedPackage, setSelectedPackage] = useState('');
  const [wantsMeeting, setWantsMeeting] = useState(false);
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!agentId) return;
    fetch(`/api/agent/${agentId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then((data) => {
        if (data.agent) setAgent(data.agent);
        else setAgentNotFound(true);
      })
      .catch(() => setAgentNotFound(true))
      .finally(() => setLoadingAgent(false));
  }, [agentId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId,
          clientName,
          clientEmail,
          clientPhone,
          packageId: selectedPackage,
          meeting: wantsMeeting ? { preferredDate, preferredTime, notes } : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Something went wrong');
        return;
      }

      setSubmitted(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loadingAgent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  if (agentNotFound) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-6xl mb-4">😕</p>
          <h1 className="text-2xl font-bold text-gray-800">Agent Not Found</h1>
          <p className="text-gray-500 mt-2">This link appears to be invalid.</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    const pkg = PACKAGES.find((p) => p.id === selectedPackage);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✅</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Thank You!</h1>
            <p className="text-gray-600 mt-2">
              Your information has been submitted successfully.
            </p>
            {pkg && (
              <div className="bg-gray-50 rounded-xl p-4 mt-4">
                <p className="text-sm text-gray-500">Selected Package</p>
                <p className="font-semibold text-gray-800">{pkg.name}</p>
                <p className="text-gold font-bold text-lg">${pkg.price.toLocaleString()}</p>
              </div>
            )}
            <p className="text-gray-500 text-sm mt-4">
              <strong>{agent?.fullName}</strong> will be in touch with you shortly!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-block bg-gradient-to-r from-[#0A1628] to-[#0F2340] px-6 py-3 rounded-xl mb-4">
            <h1 className="font-heading text-xl font-bold text-[#C9A227]">SASA Training</h1>
          </div>
          <p className="text-gray-600">
            Your consultant: <strong>{agent?.fullName}</strong>
          </p>
        </div>

        {/* Package Selection */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Choose Your Package</h2>
          <div className="space-y-3">
            {PACKAGES.map((pkg) => (
              <button
                key={pkg.id}
                onClick={() => setSelectedPackage(pkg.id)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                  selectedPackage === pkg.id
                    ? 'border-[#C9A227] bg-[#C9A227]/5 shadow-md'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-800">{pkg.name}</h3>
                    <p className="text-gray-500 text-sm mt-0.5">{pkg.description}</p>
                  </div>
                  <span className="text-[#C9A227] font-bold text-lg">${pkg.price.toLocaleString()}</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {pkg.features.map((f, i) => (
                    <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      {f}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Contact Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Your Information</h2>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm mb-4">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">Full Name</label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#C9A227] transition-colors"
                placeholder="John Doe"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#C9A227] transition-colors"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">Phone Number</label>
              <input
                type="tel"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#C9A227] transition-colors"
                placeholder="+1 234 567 8900"
                required
              />
            </div>

            {/* Meeting Request Toggle */}
            <div className="pt-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={wantsMeeting}
                    onChange={(e) => setWantsMeeting(e.target.checked)}
                  />
                  <div className={`w-11 h-6 rounded-full transition-colors ${wantsMeeting ? 'bg-[#C9A227]' : 'bg-gray-300'}`}>
                    <div className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform mt-0.5 ${
                      wantsMeeting ? 'translate-x-5.5 ml-0.5' : 'translate-x-0.5'
                    }`} />
                  </div>
                </div>
                <span className="text-gray-700 text-sm font-medium">I&apos;d like to schedule a meeting</span>
              </label>
            </div>

            {wantsMeeting && (
              <div className="space-y-3 pl-4 border-l-2 border-[#C9A227]/30">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">Preferred Date</label>
                  <input
                    type="date"
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:border-[#C9A227] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">Preferred Time</label>
                  <input
                    type="time"
                    value={preferredTime}
                    onChange={(e) => setPreferredTime(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:border-[#C9A227] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">Notes (optional)</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#C9A227] transition-colors"
                    placeholder="Any specific topics you'd like to discuss?"
                    rows={3}
                  />
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting || !selectedPackage}
            className="w-full mt-6 bg-gradient-to-r from-[#A88620] to-[#C9A227] py-3 rounded-lg font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit'}
          </button>

          {!selectedPackage && (
            <p className="text-center text-gray-400 text-xs mt-2">Please select a package above</p>
          )}
        </form>

        {/* Footer */}
        <p className="text-center text-gray-400 text-xs mt-6">
          SASA Training Course | Building Tomorrow&apos;s Sales Leaders
        </p>
      </div>
    </div>
  );
}
