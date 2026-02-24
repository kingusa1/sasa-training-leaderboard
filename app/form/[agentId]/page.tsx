'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { PACKAGES, COMPANY } from '@/lib/constants';

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

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [selectedPackage, setSelectedPackage] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [teamSize, setTeamSize] = useState('');
  const [preferredContact, setPreferredContact] = useState('email');
  const [bestTime, setBestTime] = useState('');
  const [notes, setNotes] = useState('');

  const [wantsMeeting, setWantsMeeting] = useState(false);
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [meetingNotes, setMeetingNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const isCorporate = selectedPackage === 'corporate';

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
          firstName,
          lastName,
          clientEmail,
          clientPhone,
          packageId: selectedPackage,
          companyName: isCorporate ? companyName : '',
          teamSize: isCorporate ? teamSize : '',
          preferredContact,
          bestTime,
          notes,
          meeting: wantsMeeting ? { preferredDate, preferredTime, notes: meetingNotes } : undefined,
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
        <div className="w-10 h-10 border-4 border-[#C9A227]/30 border-t-[#C9A227] rounded-full animate-spin" />
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
                <p className="font-semibold text-gray-800">{pkg.fullName}</p>
                {pkg.price > 0 ? (
                  <p className="text-[#C9A227] font-bold text-lg">AED {pkg.price.toLocaleString()}</p>
                ) : (
                  <p className="text-[#C9A227] font-bold text-lg">Custom Pricing</p>
                )}
              </div>
            )}
            <p className="text-gray-500 text-sm mt-4">
              <strong>{agent?.fullName}</strong> will be in touch with you shortly!
            </p>

            <div className="mt-6 space-y-3">
              {pkg?.enrollUrl && (
                <a
                  href={pkg.enrollUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-gradient-to-r from-[#A88620] to-[#C9A227] py-3 rounded-lg font-semibold text-white hover:opacity-90 transition-opacity text-center"
                >
                  Enroll Now
                </a>
              )}
              <a
                href={COMPANY.contactUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full border-2 border-[#C9A227] py-3 rounded-lg font-semibold text-[#C9A227] hover:bg-[#C9A227]/5 transition-colors text-center"
              >
                Schedule a Consultation
              </a>
            </div>
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
          <Image
            src="/images/logo/sasa-logo-color.png"
            alt="SASA Worldwide"
            width={160}
            height={53}
            className="mx-auto mb-3"
          />
          <h1 className="font-heading text-xl font-bold text-[#0D4785]">Sales Training &amp; Certification</h1>
          <p className="text-gray-600 mt-1">
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
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{pkg.name}</h3>
                    <p className="text-gray-400 text-xs mt-0.5">{pkg.fullName}</p>
                    <p className="text-gray-500 text-sm mt-1">{pkg.description}</p>
                  </div>
                  <span className="text-[#C9A227] font-bold text-lg ml-3 whitespace-nowrap">
                    {pkg.price > 0 ? `AED ${pkg.price.toLocaleString()}` : 'Custom'}
                  </span>
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
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#C9A227] transition-colors"
                  placeholder="John"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#C9A227] transition-colors"
                  placeholder="Doe"
                  required
                />
              </div>
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
                placeholder="+971 50 123 4567"
                required
              />
            </div>

            {isCorporate && (
              <>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">Company Name</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#C9A227] transition-colors"
                    placeholder="Your Company"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">Team Size</label>
                  <select
                    value={teamSize}
                    onChange={(e) => setTeamSize(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:border-[#C9A227] transition-colors"
                    required
                  >
                    <option value="">Select team size</option>
                    <option value="2-5">2-5 people</option>
                    <option value="6-10">6-10 people</option>
                    <option value="11-20">11-20 people</option>
                    <option value="20+">20+ people</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">Preferred Contact Method</label>
              <div className="flex gap-4">
                {['email', 'phone', 'whatsapp'].map((method) => (
                  <label key={method} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="preferredContact"
                      value={method}
                      checked={preferredContact === method}
                      onChange={(e) => setPreferredContact(e.target.value)}
                      className="accent-[#C9A227]"
                    />
                    <span className="text-sm text-gray-700">
                      {method === 'whatsapp' ? 'WhatsApp' : method.charAt(0).toUpperCase() + method.slice(1)}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">Best Time to Contact</label>
              <select
                value={bestTime}
                onChange={(e) => setBestTime(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:border-[#C9A227] transition-colors"
              >
                <option value="">Select a time</option>
                <option value="morning">Morning (9AM - 12PM)</option>
                <option value="afternoon">Afternoon (12PM - 5PM)</option>
                <option value="evening">Evening (5PM - 8PM)</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">Additional Notes (optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#C9A227] transition-colors"
                placeholder="Any questions or specific topics you're interested in?"
                rows={3}
              />
            </div>

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
                  <label className="block text-gray-700 text-sm font-medium mb-1">Meeting Notes (optional)</label>
                  <textarea
                    value={meetingNotes}
                    onChange={(e) => setMeetingNotes(e.target.value)}
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

        <div className="text-center mt-6">
          <p className="text-gray-400 text-xs">
            {COMPANY.name}
          </p>
          <p className="text-gray-400 text-xs mt-1">
            <a href={COMPANY.website} target="_blank" rel="noopener noreferrer" className="text-[#C9A227] hover:underline">
              {COMPANY.website}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
