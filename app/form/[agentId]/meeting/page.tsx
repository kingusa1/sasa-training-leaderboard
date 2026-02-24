'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { PACKAGES, COMPANY } from '@/lib/constants';

interface AgentInfo {
  agentId: string;
  fullName: string;
}

function generateTimeSlots() {
  const slots: string[] = [];
  for (let h = 9; h < 18; h++) {
    slots.push(`${h.toString().padStart(2, '0')}:00`);
    slots.push(`${h.toString().padStart(2, '0')}:30`);
  }
  return slots;
}

function formatTime(time: string) {
  const [h, m] = time.split(':');
  const hour = parseInt(h);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${h12}:${m} ${ampm}`;
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function MeetingSchedulerPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const agentId = params.agentId as string;

  const clientFirstName = searchParams.get('firstName') || '';
  const clientLastName = searchParams.get('lastName') || '';
  const clientEmail = searchParams.get('email') || '';
  const clientPhone = searchParams.get('phone') || '';
  const packageId = searchParams.get('package') || '';

  const [agent, setAgent] = useState<AgentInfo | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [meetingNotes, setMeetingNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState('');

  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());

  const pkg = PACKAGES.find((p) => p.id === packageId);
  const timeSlots = useMemo(() => generateTimeSlots(), []);

  useEffect(() => {
    if (!agentId) return;
    fetch(`/api/agent/${agentId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.agent) setAgent(data.agent);
      })
      .catch(() => {});
  }, [agentId]);

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  function isDateAvailable(day: number) {
    const date = new Date(viewYear, viewMonth, day);
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    // Available if date is today or in the future and not a weekend
    return date >= todayStart && date.getDay() !== 0 && date.getDay() !== 6;
  }

  function formatSelectedDate() {
    if (!selectedDate) return '';
    const d = new Date(selectedDate);
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  }

  function prevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  }

  async function handleConfirm() {
    if (!selectedDate || !selectedTime) return;
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId,
          clientName: `${clientFirstName} ${clientLastName}`,
          clientEmail,
          clientPhone,
          packageId,
          preferredDate: selectedDate,
          preferredTime: selectedTime,
          notes: meetingNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to schedule meeting');
        return;
      }

      setConfirmed(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (confirmed) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f8f6f3] to-white flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-3xl shadow-lg p-10 border border-gray-100 text-center">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-[#002E59]">Meeting Scheduled!</h1>
            <p className="text-gray-500 mt-3">A confirmation email has been sent to your inbox.</p>

            <div className="mt-6 bg-[#f8f6f3] rounded-2xl p-5 text-left space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#004686]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-[#004686]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Date</p>
                  <p className="text-[#002E59] font-semibold">{formatSelectedDate()}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#004686]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-[#004686]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Time</p>
                  <p className="text-[#002E59] font-semibold">{formatTime(selectedTime)}</p>
                </div>
              </div>
              {pkg && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#004686]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-[#004686]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Package</p>
                    <p className="text-[#002E59] font-semibold">{pkg.name}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#004686]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-[#004686]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Consultant</p>
                  <p className="text-[#002E59] font-semibold">{agent?.fullName}</p>
                </div>
              </div>
            </div>

            <p className="text-gray-400 text-xs mt-6">{COMPANY.name}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8f6f3] to-white">
      {/* Header */}
      <div className="bg-[#002E59] text-white">
        <div className="max-w-2xl mx-auto px-6 py-6 text-center">
          <Image
            src="/images/logo/sasa-logo-color.png"
            alt="SASA Worldwide"
            width={120}
            height={40}
            className="mx-auto mb-3 brightness-0 invert"
          />
          <h1 className="text-xl sm:text-2xl font-bold">Schedule Your Meeting</h1>
          <p className="text-[#CCE0EB] mt-1 text-sm">
            with <strong>{agent?.fullName || 'your consultant'}</strong>
            {pkg && <> &middot; {pkg.name} Package</>}
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Calendar */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h3 className="text-[#002E59] font-bold text-lg">{MONTH_NAMES[viewMonth]} {viewYear}</h3>
              <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {DAY_NAMES.map((d) => (
                <div key={d} className="text-center text-xs font-semibold text-gray-400 py-2">{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {/* Empty cells for days before month starts */}
              {Array.from({ length: firstDay }, (_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1;
                const dateStr = `${viewYear}-${(viewMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                const available = isDateAvailable(day);
                const isSelected = selectedDate === dateStr;
                const isToday = day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();

                return (
                  <button
                    key={day}
                    onClick={() => available && setSelectedDate(dateStr)}
                    disabled={!available}
                    className={`aspect-square rounded-xl text-sm font-medium transition-all ${
                      isSelected
                        ? 'bg-[#004686] text-white shadow-md'
                        : available
                          ? 'hover:bg-[#004686]/10 text-[#002E59]'
                          : 'text-gray-300 cursor-not-allowed'
                    } ${isToday && !isSelected ? 'ring-2 ring-[#004686]/30' : ''}`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Selection */}
          {selectedDate && (
            <div className="border-t border-gray-100 p-6">
              <h3 className="text-[#002E59] font-bold mb-1">Select a Time</h3>
              <p className="text-gray-400 text-sm mb-4">{formatSelectedDate()}</p>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-[240px] overflow-y-auto pr-1">
                {timeSlots.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`py-2.5 rounded-xl text-sm font-medium transition-all border ${
                      selectedTime === time
                        ? 'bg-[#004686] text-white border-[#004686] shadow-md'
                        : 'border-gray-200 text-gray-600 hover:border-[#004686] hover:text-[#004686]'
                    }`}
                  >
                    {formatTime(time)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Notes & Confirm */}
          {selectedDate && selectedTime && (
            <div className="border-t border-gray-100 p-6 space-y-4">
              <div>
                <label className="block text-[#002E59] text-sm font-semibold mb-2">
                  Meeting Notes <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  value={meetingNotes}
                  onChange={(e) => setMeetingNotes(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#004686] focus:ring-2 focus:ring-[#004686]/10 transition-all resize-none"
                  placeholder="Any topics you'd like to discuss?"
                  rows={3}
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handleConfirm}
                disabled={submitting}
                className="w-full bg-[#004686] py-4 rounded-xl font-bold text-white text-lg hover:bg-[#002E59] transition-all disabled:opacity-50 shadow-lg shadow-[#004686]/20 active:scale-[0.99]"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Scheduling...
                  </span>
                ) : (
                  `Confirm Meeting — ${formatTime(selectedTime)}, ${formatSelectedDate()}`
                )}
              </button>
            </div>
          )}
        </div>

        <div className="text-center py-6">
          <p className="text-gray-400 text-xs">{COMPANY.name}</p>
        </div>
      </div>
    </div>
  );
}
