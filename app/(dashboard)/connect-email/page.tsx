'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SMTP_CONFIG } from '@/lib/constants';

export default function ConnectEmailPage() {
  const router = useRouter();
  const [emailPassword, setEmailPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState('');
  const [alreadyConnected, setAlreadyConnected] = useState(false);

  useEffect(() => {
    fetch('/api/auth/connect-email')
      .then((res) => res.json())
      .then((data) => {
        if (data.email) setEmail(data.email);
        if (data.emailConnected) setAlreadyConnected(true);
      })
      .catch(() => {})
      .finally(() => setChecking(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/connect-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to connect email');
        return;
      }

      setAlreadyConnected(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-navy-200 border-t-navy-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (alreadyConnected) {
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-2xl p-8 border border-gray-200 text-center shadow-card">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✅</span>
          </div>
          <h1 className="text-xl font-bold text-navy-700 mb-2">Email Connected!</h1>
          <p className="text-gray-500 text-sm mb-1">
            Your email <strong className="text-navy-700">{email}</strong> is connected.
          </p>
          <p className="text-gray-400 text-xs mb-6">
            Emails will be sent from your account when new leads come in.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-navy-500 px-6 py-2.5 rounded-lg font-semibold text-white hover:bg-navy-600 transition-colors shadow-navy"
          >
            Go to Dashboard
          </button>
          <button
            onClick={() => setAlreadyConnected(false)}
            className="block mx-auto mt-3 text-gray-400 text-sm hover:text-navy-700 transition-colors"
          >
            Update password
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-card">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-navy-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">📧</span>
          </div>
          <h1 className="text-xl font-bold text-navy-700">Connect Your Email</h1>
          <p className="text-gray-500 text-sm mt-2">
            Connect your SASA email to send automated emails to leads from your own account.
          </p>
        </div>

        <div className="bg-cream-100 rounded-xl p-4 mb-6 border border-gray-100">
          <p className="text-gray-500 text-xs mb-1">SMTP Server</p>
          <p className="text-navy-700 text-sm font-medium">{SMTP_CONFIG.host}:{SMTP_CONFIG.port} (SSL)</p>
          <p className="text-gray-500 text-xs mt-2 mb-1">Your Email</p>
          <p className="text-navy-700 text-sm font-medium">{email}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-navy-700 text-sm font-medium mb-2">Email Password</label>
            <input
              type="password"
              value={emailPassword}
              onChange={(e) => setEmailPassword(e.target.value)}
              className="w-full bg-cream-50 border border-gray-200 rounded-lg px-4 py-3 text-navy-800 placeholder-gray-400 focus:outline-none focus:border-navy-500 focus:ring-1 focus:ring-navy-500 transition-colors"
              placeholder="Your SASA email password"
              required
            />
            <p className="text-gray-400 text-xs mt-1.5">
              This is the password for your {email} email account. It will be stored securely.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-navy-500 py-3 rounded-lg font-semibold text-white hover:bg-navy-600 transition-colors disabled:opacity-50 shadow-navy"
          >
            {loading ? 'Testing Connection...' : 'Connect Email'}
          </button>
        </form>
      </div>
    </div>
  );
}
