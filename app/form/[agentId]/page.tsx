'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { PACKAGES, COMPANY } from '@/lib/constants';

interface AgentInfo {
  agentId: string;
  fullName: string;
}

// Floating orb component for animated background
function FloatingOrbs() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Large orbs */}
      <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-[#004686]/20 blur-3xl" style={{ animation: 'float 8s ease-in-out infinite' }} />
      <div className="absolute top-1/3 -left-32 w-80 h-80 rounded-full bg-[#14758A]/15 blur-3xl" style={{ animation: 'float 10s ease-in-out infinite 2s' }} />
      <div className="absolute -bottom-40 right-1/4 w-96 h-96 rounded-full bg-[#004686]/10 blur-3xl" style={{ animation: 'float 12s ease-in-out infinite 4s' }} />
      <div className="absolute top-2/3 -right-20 w-64 h-64 rounded-full bg-[#14758A]/10 blur-3xl" style={{ animation: 'float 9s ease-in-out infinite 1s' }} />
      {/* Small accent orbs */}
      <div className="absolute top-20 left-1/3 w-32 h-32 rounded-full bg-white/5 blur-2xl" style={{ animation: 'float 7s ease-in-out infinite 3s' }} />
      <div className="absolute bottom-40 left-1/4 w-40 h-40 rounded-full bg-[#004686]/8 blur-2xl" style={{ animation: 'float 11s ease-in-out infinite 5s' }} />
    </div>
  );
}

// Star rating display
function Stars() {
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <svg key={i} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-white/60 text-xs ml-1.5">4.9/5 (200+ graduates)</span>
    </div>
  );
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
  const [expandedPackage, setExpandedPackage] = useState<string | null>(null);

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

  // --- LOADING ---
  if (loadingAgent) {
    return (
      <div className="min-h-screen lux-bg flex items-center justify-center">
        <FloatingOrbs />
        <div className="relative z-10 text-center">
          <div className="w-16 h-16 border-4 border-white/10 border-t-white rounded-full animate-spin mx-auto" />
          <p className="text-white/50 mt-4 text-sm tracking-widest uppercase">Loading</p>
        </div>
      </div>
    );
  }

  // --- AGENT NOT FOUND ---
  if (agentNotFound) {
    return (
      <div className="min-h-screen lux-bg flex items-center justify-center p-4">
        <FloatingOrbs />
        <div className="relative z-10 text-center lux-glass rounded-3xl p-12 max-w-md">
          <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">Consultant Not Found</h1>
          <p className="text-white/50 mt-3">This link appears to be invalid or expired.</p>
        </div>
      </div>
    );
  }

  // --- SUCCESS ---
  if (submitted) {
    return (
      <div className="min-h-screen lux-bg flex items-center justify-center p-4">
        <FloatingOrbs />
        <div className="relative z-10 max-w-md w-full lux-card" style={{ animationDelay: '0.1s' }}>
          <div className="lux-glass rounded-3xl p-10 text-center">
            <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 lux-glow">
              <svg className="w-12 h-12 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white mb-3">Thank You!</h1>
            <p className="text-white/60 text-lg">Your information has been submitted successfully.</p>
            <div className="mt-6 p-4 rounded-2xl bg-white/5 border border-white/10">
              <p className="text-white/40 text-sm">Your consultant</p>
              <p className="text-white font-semibold text-lg">{agent?.fullName}</p>
              <p className="text-white/50 text-sm mt-1">will be in touch with you shortly</p>
            </div>
            <a
              href={COMPANY.trainingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-block border border-white/20 px-8 py-3 rounded-xl font-semibold text-white hover:bg-white/10 transition-all"
            >
              Explore Training Programs
            </a>
          </div>
        </div>
      </div>
    );
  }

  // --- MAIN FORM ---
  return (
    <div className="min-h-screen lux-bg relative">
      <FloatingOrbs />

      {/* Subtle grid overlay */}
      <div className="fixed inset-0 z-0 opacity-[0.03]" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }} />

      <div className="relative z-10">
        {/* Hero Header */}
        <div className="relative overflow-hidden">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 pb-6">
            {/* Logo + Badge */}
            <div className="text-center lux-card" style={{ animationDelay: '0.1s' }}>
              <div className="inline-block mb-6">
                <Image
                  src="/images/logo/sasa-logo-color.png"
                  alt="SASA Worldwide"
                  width={180}
                  height={60}
                  className="brightness-0 invert opacity-90"
                  priority
                />
              </div>

              <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mb-4">
                <span className="lux-text-gradient">Sales Training</span>
                <br />
                <span className="text-white">&amp; Certification</span>
              </h1>

              <p className="text-white/50 max-w-lg mx-auto text-sm sm:text-base leading-relaxed mb-5">
                Master the art of selling with SASA&apos;s proven 4-Foundation System.
                Join 200+ certified graduates accelerating their sales careers.
              </p>

              {/* Stars */}
              <div className="flex justify-center mb-6">
                <Stars />
              </div>

              {/* Consultant Badge */}
              <div className="inline-flex items-center gap-3 lux-glass rounded-full px-5 py-2.5">
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#004686] to-[#14758A] flex items-center justify-center text-white font-bold text-sm">
                    {agent?.fullName?.charAt(0) || 'S'}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-[#002E59]" />
                </div>
                <div className="text-left">
                  <p className="text-white/40 text-[10px] uppercase tracking-widest">Your Consultant</p>
                  <p className="text-white font-semibold text-sm">{agent?.fullName}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Packages Section */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-4">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10" />
            <h2 className="text-white/40 text-xs uppercase tracking-[0.2em] font-medium">Choose Your Program</h2>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10" />
          </div>

          <div className="space-y-4">
            {PACKAGES.map((p, index) => {
              const isSelected = selectedPackage === p.id;
              const isPopular = p.id === 'full-immersion';
              const isExpanded = expandedPackage === p.id || isSelected;

              return (
                <div
                  key={p.id}
                  className="lux-card"
                  style={{ animationDelay: `${0.2 + index * 0.1}s` }}
                >
                  <button
                    onClick={() => {
                      setSelectedPackage(p.id);
                      setExpandedPackage(isExpanded && !isSelected ? null : p.id);
                    }}
                    className={`w-full text-left rounded-2xl transition-all duration-500 overflow-hidden relative group ${
                      isSelected
                        ? 'lux-glass lux-border-glow ring-1 ring-white/20'
                        : 'lux-glass hover:bg-white/[0.08]'
                    }`}
                  >
                    {/* Popular ribbon */}
                    {isPopular && (
                      <div className="absolute top-0 right-0 z-10">
                        <div className="bg-gradient-to-r from-amber-500 to-amber-400 text-[#002E59] text-[10px] font-extrabold uppercase tracking-wider px-4 py-1 rounded-bl-xl rounded-tr-2xl shadow-lg">
                          Most Popular
                        </div>
                      </div>
                    )}

                    {/* Shimmer on hover */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 lux-shimmer rounded-2xl" />

                    <div className="relative p-4 sm:p-6">
                      <div className="flex items-start gap-3 sm:gap-4">
                        {/* Selection indicator */}
                        <div className={`flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 mt-0.5 flex items-center justify-center transition-all duration-300 ${
                          isSelected
                            ? 'border-[#14758A] bg-[#14758A]'
                            : 'border-white/20 group-hover:border-white/40'
                        }`}>
                          {isSelected && (
                            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-3">
                            <div>
                              <h3 className={`font-bold text-base sm:text-lg transition-colors ${isSelected ? 'text-white' : 'text-white/80'}`}>
                                {p.name}
                              </h3>
                              <p className="text-white/30 text-[11px] sm:text-xs mt-0.5">{p.fullName}</p>
                            </div>
                            <div className="sm:text-right flex-shrink-0 mt-1 sm:mt-0">
                              {p.price > 0 ? (
                                <div className="flex sm:flex-col items-baseline sm:items-end gap-2 sm:gap-0">
                                  <p className={`font-bold text-lg sm:text-2xl transition-colors ${isSelected ? 'text-white' : 'text-white/70'}`}>
                                    AED {p.price.toLocaleString()}
                                  </p>
                                  <p className="text-white/30 text-[10px] uppercase tracking-wider">one-time</p>
                                </div>
                              ) : (
                                <div className="flex sm:flex-col items-baseline sm:items-end gap-2 sm:gap-0">
                                  <p className={`font-bold text-lg sm:text-xl transition-colors ${isSelected ? 'text-white' : 'text-white/70'}`}>Custom</p>
                                  <p className="text-white/30 text-[10px] uppercase tracking-wider">tailored</p>
                                </div>
                              )}
                            </div>
                          </div>

                          <p className="text-white/40 text-xs sm:text-sm mt-2 sm:mt-2.5 leading-relaxed">{p.description}</p>

                          {/* Expandable Features */}
                          <div className={`overflow-hidden transition-all duration-500 ease-out ${isExpanded ? 'max-h-80 opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
                            <div className="pt-4 border-t border-white/10">
                              <div className="grid grid-cols-1 gap-2.5">
                                {p.features.map((f, i) => (
                                  <div key={i} className="flex items-start gap-2.5">
                                    <div className="w-5 h-5 rounded-full bg-[#14758A]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                      <svg className="w-3 h-3 text-[#14758A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                      </svg>
                                    </div>
                                    <span className="text-white/60 text-sm">{f}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Contact Form */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
          <div className="lux-glass-white rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/20 lux-card" style={{ animationDelay: '0.5s' }}>
            <div className="flex items-center gap-3 mb-7">
              <div className="w-10 h-10 rounded-xl bg-[#002E59] flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#002E59]">Your Information</h2>
                <p className="text-gray-400 text-xs">All fields are secured and encrypted</p>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-red-600 text-sm mb-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                {error}
              </div>
            )}

            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="group">
                  <label className="block text-[#002E59] text-xs font-semibold mb-2 uppercase tracking-wider">First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full border-2 border-gray-100 rounded-xl px-4 py-3.5 text-gray-800 placeholder-gray-300 focus:outline-none focus:border-[#004686] focus:ring-4 focus:ring-[#004686]/5 transition-all bg-gray-50/50 focus:bg-white"
                    placeholder="John"
                    required
                  />
                </div>
                <div className="group">
                  <label className="block text-[#002E59] text-xs font-semibold mb-2 uppercase tracking-wider">Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full border-2 border-gray-100 rounded-xl px-4 py-3.5 text-gray-800 placeholder-gray-300 focus:outline-none focus:border-[#004686] focus:ring-4 focus:ring-[#004686]/5 transition-all bg-gray-50/50 focus:bg-white"
                    placeholder="Doe"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#002E59] text-xs font-semibold mb-2 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    className="w-full border-2 border-gray-100 rounded-xl pl-12 pr-4 py-3.5 text-gray-800 placeholder-gray-300 focus:outline-none focus:border-[#004686] focus:ring-4 focus:ring-[#004686]/5 transition-all bg-gray-50/50 focus:bg-white"
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#002E59] text-xs font-semibold mb-2 uppercase tracking-wider">Phone Number</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <input
                    type="tel"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="w-full border-2 border-gray-100 rounded-xl pl-12 pr-4 py-3.5 text-gray-800 placeholder-gray-300 focus:outline-none focus:border-[#004686] focus:ring-4 focus:ring-[#004686]/5 transition-all bg-gray-50/50 focus:bg-white"
                    placeholder="+971 50 123 4567"
                    required
                  />
                </div>
              </div>

              {/* Enterprise Fields */}
              {isEnterprise && (
                <div className="space-y-4 p-5 bg-gradient-to-br from-[#f8f6f3] to-[#f0ede8] rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-2 mb-1">
                    <svg className="w-4 h-4 text-[#004686]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <p className="text-sm font-bold text-[#002E59]">Enterprise Details</p>
                  </div>
                  <div>
                    <label className="block text-[#002E59] text-xs font-semibold mb-2 uppercase tracking-wider">Company Name</label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full border-2 border-gray-100 rounded-xl px-4 py-3.5 text-gray-800 placeholder-gray-300 focus:outline-none focus:border-[#004686] focus:ring-4 focus:ring-[#004686]/5 transition-all bg-white"
                      placeholder="Your Company"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[#002E59] text-xs font-semibold mb-2 uppercase tracking-wider">Team Size</label>
                    <select
                      value={teamSize}
                      onChange={(e) => setTeamSize(e.target.value)}
                      className="w-full border-2 border-gray-100 rounded-xl px-4 py-3.5 text-gray-800 focus:outline-none focus:border-[#004686] focus:ring-4 focus:ring-[#004686]/5 transition-all bg-white"
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

              {/* Preferred Contact */}
              <div>
                <label className="block text-[#002E59] text-xs font-semibold mb-3 uppercase tracking-wider">Preferred Contact Method</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'email', label: 'Email', icon: (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    )},
                    { value: 'phone', label: 'Phone', icon: (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                    )},
                    { value: 'whatsapp', label: 'WhatsApp', icon: (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                    )},
                  ].map((method) => (
                    <button
                      key={method.value}
                      type="button"
                      onClick={() => setPreferredContact(method.value)}
                      className={`flex flex-col items-center gap-1.5 py-3.5 rounded-xl text-sm font-medium transition-all duration-300 border-2 ${
                        preferredContact === method.value
                          ? 'border-[#004686] bg-[#004686] text-white shadow-lg shadow-[#004686]/20'
                          : 'border-gray-100 text-gray-400 hover:border-gray-200 hover:text-gray-500 bg-gray-50/50'
                      }`}
                    >
                      {method.icon}
                      <span className="text-xs">{method.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[#002E59] text-xs font-semibold mb-2 uppercase tracking-wider">Best Time to Contact</label>
                <select
                  value={bestTime}
                  onChange={(e) => setBestTime(e.target.value)}
                  className="w-full border-2 border-gray-100 rounded-xl px-4 py-3.5 text-gray-800 focus:outline-none focus:border-[#004686] focus:ring-4 focus:ring-[#004686]/5 transition-all bg-gray-50/50 focus:bg-white"
                >
                  <option value="">Select a time</option>
                  <option value="morning">Morning (9AM - 12PM)</option>
                  <option value="afternoon">Afternoon (12PM - 5PM)</option>
                  <option value="evening">Evening (5PM - 8PM)</option>
                </select>
              </div>

              <div>
                <label className="block text-[#002E59] text-xs font-semibold mb-2 uppercase tracking-wider">
                  Additional Notes <span className="text-gray-300 font-normal normal-case tracking-normal">(optional)</span>
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full border-2 border-gray-100 rounded-xl px-4 py-3.5 text-gray-800 placeholder-gray-300 focus:outline-none focus:border-[#004686] focus:ring-4 focus:ring-[#004686]/5 transition-all resize-none bg-gray-50/50 focus:bg-white"
                  placeholder="Any questions or specific topics you're interested in?"
                  rows={3}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 space-y-3">
              {!isEnterprise && pkg && (
                <button
                  onClick={handleBuyNow}
                  disabled={submitting || !isFormValid}
                  className="w-full relative overflow-hidden bg-gradient-to-r from-[#002E59] via-[#004686] to-[#002E59] bg-[length:200%_100%] py-4 sm:py-5 rounded-2xl font-bold text-white text-base sm:text-lg hover:shadow-2xl hover:shadow-[#004686]/30 transition-all duration-500 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.99] group"
                  style={{ backgroundPosition: 'left center' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundPosition = 'right center')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundPosition = 'left center')}
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-3">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      Enroll Now
                      <span className="bg-white/20 px-3 py-0.5 rounded-lg text-sm font-medium">
                        AED {pkg.price.toLocaleString()}
                      </span>
                      <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </span>
                  )}
                </button>
              )}

              {!isEnterprise && !pkg && (
                <button
                  disabled
                  className="w-full bg-gradient-to-r from-[#002E59] to-[#004686] py-4 sm:py-5 rounded-2xl font-bold text-white text-lg opacity-40 cursor-not-allowed"
                >
                  Select a package to continue
                </button>
              )}

              <button
                onClick={handleScheduleMeeting}
                disabled={submitting || !isFormValid}
                className={`w-full py-4 sm:py-5 rounded-2xl font-bold text-base sm:text-lg transition-all duration-500 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.99] group ${
                  isEnterprise
                    ? 'relative overflow-hidden bg-gradient-to-r from-[#002E59] via-[#004686] to-[#002E59] bg-[length:200%_100%] text-white hover:shadow-2xl hover:shadow-[#004686]/30'
                    : 'border-2 border-[#002E59]/20 text-[#002E59] hover:bg-[#002E59] hover:text-white hover:border-[#002E59] hover:shadow-lg'
                }`}
                style={isEnterprise ? { backgroundPosition: 'left center' } : undefined}
                onMouseEnter={(e) => isEnterprise && (e.currentTarget.style.backgroundPosition = 'right center')}
                onMouseLeave={(e) => isEnterprise && (e.currentTarget.style.backgroundPosition = 'left center')}
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-3">
                    <div className={`w-5 h-5 border-2 rounded-full animate-spin ${isEnterprise ? 'border-white/30 border-t-white' : 'border-[#004686]/30 border-t-[#004686]'}`} />
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Schedule a Free Consultation
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                )}
              </button>

              {!selectedPackage && (
                <p className="text-center text-gray-300 text-sm pt-1">Select a package above to continue</p>
              )}
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-10 lux-card" style={{ animationDelay: '0.7s' }}>
            {[
              { icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              ), label: 'Certified' },
              { icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              ), label: '200+ Graduates' },
              { icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              ), label: 'Dubai, UAE' },
              { icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              ), label: 'Instant Access' },
            ].map((badge, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5 text-white/30 hover:text-white/60 transition-colors">
                {badge.icon}
                <span className="text-[10px] uppercase tracking-widest font-medium">{badge.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pb-10">
          <p className="text-white/20 text-xs">{COMPANY.name}</p>
          <p className="text-white/20 text-xs mt-1">
            <a href={COMPANY.website} target="_blank" rel="noopener noreferrer" className="text-white/30 hover:text-white/60 transition-colors">
              {COMPANY.website}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
