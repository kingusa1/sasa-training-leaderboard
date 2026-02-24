'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { PACKAGES, COMPANY } from '@/lib/constants';

interface AgentInfo {
  agentId: string;
  fullName: string;
}

export default function ClientFormPage() {
  const params = useParams();
  const router = useRouter();
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

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const isEnterprise = selectedPackage === 'enterprise';
  const pkg = PACKAGES.find((p) => p.id === selectedPackage);

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

  async function submitLead(action: 'buy' | 'meeting') {
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
          companyName: isEnterprise ? companyName : '',
          teamSize: isEnterprise ? teamSize : '',
          preferredContact,
          bestTime,
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Something went wrong');
        setSubmitting(false);
        return;
      }

      if (action === 'buy' && pkg?.enrollUrl) {
        window.location.href = pkg.enrollUrl;
      } else if (action === 'meeting') {
        router.push(`/form/${agentId}/meeting?firstName=${encodeURIComponent(firstName)}&lastName=${encodeURIComponent(lastName)}&email=${encodeURIComponent(clientEmail)}&phone=${encodeURIComponent(clientPhone)}&package=${encodeURIComponent(selectedPackage)}`);
      } else {
        setSubmitted(true);
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  function handleBuyNow(e: React.FormEvent) {
    e.preventDefault();
    submitLead('buy');
  }

  function handleScheduleMeeting(e: React.FormEvent) {
    e.preventDefault();
    submitLead('meeting');
  }

  const isFormValid = firstName && lastName && clientEmail && clientPhone && selectedPackage &&
    (!isEnterprise || (companyName && teamSize));

  if (loadingAgent) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f8f6f3] to-white flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#004686]/20 border-t-[#004686] rounded-full animate-spin" />
      </div>
    );
  }

  if (agentNotFound) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f8f6f3] to-white flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-6xl mb-4">😕</p>
          <h1 className="text-2xl font-bold text-gray-800">Agent Not Found</h1>
          <p className="text-gray-500 mt-2">This link appears to be invalid.</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f8f6f3] to-white flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-3xl shadow-lg p-10 border border-gray-100">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-[#002E59]">Thank You!</h1>
            <p className="text-gray-500 mt-3 text-lg">
              Your information has been submitted successfully.
            </p>
            <p className="text-gray-400 text-sm mt-4">
              <strong className="text-[#004686]">{agent?.fullName}</strong> will be in touch with you shortly.
            </p>
            <div className="mt-8">
              <a
                href={COMPANY.contactUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block border-2 border-[#004686] px-8 py-3 rounded-xl font-semibold text-[#004686] hover:bg-[#004686] hover:text-white transition-all"
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
    <div className="min-h-screen bg-gradient-to-b from-[#f8f6f3] to-white">
      {/* Premium Header */}
      <div className="bg-[#002E59] text-white">
        <div className="max-w-2xl mx-auto px-6 py-8 text-center">
          <Image
            src="/images/logo/sasa-logo-color.png"
            alt="SASA Worldwide"
            width={160}
            height={53}
            className="mx-auto mb-4 brightness-0 invert"
          />
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Sales Training & Certification
          </h1>
          <p className="text-[#CCE0EB] mt-2 text-sm sm:text-base">
            Transform your sales career with world-class training
          </p>
          <div className="mt-4 inline-flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-sm text-white/90">
              Your consultant: <strong>{agent?.fullName}</strong>
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 -mt-4">
        {/* Package Selection */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-[#002E59] mb-4 px-2">Select Your Package</h2>
          <div className="space-y-4">
            {PACKAGES.map((p) => {
              const isSelected = selectedPackage === p.id;
              const isPopular = p.id === 'full-immersion';
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedPackage(p.id)}
                  className={`w-full text-left rounded-2xl border-2 transition-all duration-300 overflow-hidden ${
                    isSelected
                      ? 'border-[#004686] shadow-lg shadow-[#004686]/10 scale-[1.01]'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  {isPopular && (
                    <div className="bg-[#004686] text-white text-xs font-bold text-center py-1.5 tracking-wider uppercase">
                      Most Popular
                    </div>
                  )}
                  <div className={`p-5 ${isSelected ? 'bg-white' : ''}`}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-[#002E59] text-lg">{p.name}</h3>
                          {isSelected && (
                            <div className="w-5 h-5 bg-[#004686] rounded-full flex items-center justify-center">
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <p className="text-gray-400 text-xs mt-0.5">{p.fullName}</p>
                        <p className="text-gray-500 text-sm mt-2 leading-relaxed">{p.description}</p>
                      </div>
                      <div className="text-right ml-4 flex-shrink-0">
                        {p.price > 0 ? (
                          <>
                            <p className="text-[#004686] font-bold text-2xl">AED {p.price.toLocaleString()}</p>
                            <p className="text-gray-400 text-xs">one-time payment</p>
                          </>
                        ) : (
                          <>
                            <p className="text-[#004686] font-bold text-xl">Custom</p>
                            <p className="text-gray-400 text-xs">tailored pricing</p>
                          </>
                        )}
                      </div>
                    </div>

                    {isSelected && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {p.features.map((f, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <svg className="w-4 h-4 text-[#14758A] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span className="text-gray-600 text-sm">{f}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white rounded-3xl shadow-lg p-6 sm:p-8 border border-gray-100 mb-8">
          <h2 className="text-lg font-bold text-[#002E59] mb-6">Your Information</h2>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-sm mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[#002E59] text-sm font-semibold mb-2">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#004686] focus:ring-2 focus:ring-[#004686]/10 transition-all"
                  placeholder="John"
                  required
                />
              </div>
              <div>
                <label className="block text-[#002E59] text-sm font-semibold mb-2">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#004686] focus:ring-2 focus:ring-[#004686]/10 transition-all"
                  placeholder="Doe"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[#002E59] text-sm font-semibold mb-2">Email Address</label>
              <input
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#004686] focus:ring-2 focus:ring-[#004686]/10 transition-all"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-[#002E59] text-sm font-semibold mb-2">Phone Number</label>
              <input
                type="tel"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#004686] focus:ring-2 focus:ring-[#004686]/10 transition-all"
                placeholder="+971 50 123 4567"
                required
              />
            </div>

            {isEnterprise && (
              <div className="space-y-4 p-4 bg-[#f8f6f3] rounded-xl border border-gray-100">
                <p className="text-sm font-semibold text-[#002E59]">Enterprise Details</p>
                <div>
                  <label className="block text-[#002E59] text-sm font-semibold mb-2">Company Name</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#004686] focus:ring-2 focus:ring-[#004686]/10 transition-all bg-white"
                    placeholder="Your Company"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[#002E59] text-sm font-semibold mb-2">Team Size</label>
                  <select
                    value={teamSize}
                    onChange={(e) => setTeamSize(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:border-[#004686] focus:ring-2 focus:ring-[#004686]/10 transition-all bg-white"
                    required
                  >
                    <option value="">Select team size</option>
                    <option value="2-5">2-5 people</option>
                    <option value="6-10">6-10 people</option>
                    <option value="11-20">11-20 people</option>
                    <option value="20+">20+ people</option>
                  </select>
                </div>
              </div>
            )}

            <div>
              <label className="block text-[#002E59] text-sm font-semibold mb-3">Preferred Contact Method</label>
              <div className="flex gap-3">
                {[
                  { value: 'email', label: 'Email', icon: '📧' },
                  { value: 'phone', label: 'Phone', icon: '📞' },
                  { value: 'whatsapp', label: 'WhatsApp', icon: '💬' },
                ].map((method) => (
                  <button
                    key={method.value}
                    type="button"
                    onClick={() => setPreferredContact(method.value)}
                    className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all border-2 ${
                      preferredContact === method.value
                        ? 'border-[#004686] bg-[#004686]/5 text-[#004686]'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    <span className="block text-lg mb-0.5">{method.icon}</span>
                    {method.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[#002E59] text-sm font-semibold mb-2">Best Time to Contact</label>
              <select
                value={bestTime}
                onChange={(e) => setBestTime(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:border-[#004686] focus:ring-2 focus:ring-[#004686]/10 transition-all"
              >
                <option value="">Select a time</option>
                <option value="morning">Morning (9AM - 12PM)</option>
                <option value="afternoon">Afternoon (12PM - 5PM)</option>
                <option value="evening">Evening (5PM - 8PM)</option>
              </select>
            </div>

            <div>
              <label className="block text-[#002E59] text-sm font-semibold mb-2">
                Additional Notes <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#004686] focus:ring-2 focus:ring-[#004686]/10 transition-all resize-none"
                placeholder="Any questions or specific topics you're interested in?"
                rows={3}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 space-y-3">
            {!isEnterprise && (
              <button
                onClick={handleBuyNow}
                disabled={submitting || !isFormValid}
                className="w-full bg-[#004686] py-4 rounded-xl font-bold text-white text-lg hover:bg-[#002E59] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-[#004686]/20 active:scale-[0.99]"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </span>
                ) : (
                  <>Buy Now{pkg ? ` — AED ${pkg.price.toLocaleString()}` : ''}</>
                )}
              </button>
            )}

            <button
              onClick={handleScheduleMeeting}
              disabled={submitting || !isFormValid}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.99] ${
                isEnterprise
                  ? 'bg-[#004686] text-white hover:bg-[#002E59] shadow-lg shadow-[#004686]/20'
                  : 'border-2 border-[#004686] text-[#004686] hover:bg-[#004686] hover:text-white'
              }`}
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className={`w-5 h-5 border-2 rounded-full animate-spin ${isEnterprise ? 'border-white/30 border-t-white' : 'border-[#004686]/30 border-t-[#004686]'}`} />
                  Processing...
                </span>
              ) : (
                'Schedule a Meeting'
              )}
            </button>

            {!selectedPackage && (
              <p className="text-center text-gray-400 text-sm">Please select a package above to continue</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pb-8">
          <p className="text-gray-400 text-xs">{COMPANY.name}</p>
          <p className="text-gray-400 text-xs mt-1">
            <a href={COMPANY.website} target="_blank" rel="noopener noreferrer" className="text-[#004686] hover:underline">
              {COMPANY.website}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
