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
        <div className="w-10 h-10 border-4 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  if (alreadyConnected) {
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-navy-800 rounded-2xl p-8 border border-navy-700 text-center">
          <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✅</span>
          </div>
          <h1 className="font-heading text-xl font-bold text-white mb-2">Email Connected!</h1>
          <p className="text-gray-400 text-sm mb-1">
            Your email <strong className="text-white">{email}</strong> is connected.
          </p>
          <p className="text-gray-500 text-xs mb-6">
            Emails will be sent from your account when new leads come in.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-gradient-to-r from-gold-dark to-gold px-6 py-2.5 rounded-lg font-semibold text-navy-900 hover:opacity-90 transition-opacity"
          >
            Go to Dashboard
          </button>
          <button
            onClick={() => setAlreadyConnected(false)}
            className="block mx-auto mt-3 text-gray-400 text-sm hover:text-white transition-colors"
          >
            Update password
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-navy-800 rounded-2xl p-8 border border-navy-700">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">📧</span>
          </div>
          <h1 className="font-heading text-xl font-bold text-white">Connect Your Email</h1>
          <p className="text-gray-400 text-sm mt-2">
            Connect your SASA email to send automated emails to leads from your own account.
          </p>
        </div>

        <div className="bg-navy-900 rounded-xl p-4 mb-6">
          <p className="text-gray-400 text-xs mb-1">SMTP Server</p>
          <p className="text-white text-sm font-medium">{SMTP_CONFIG.host}:{SMTP_CONFIG.port} (SSL)</p>
          <p className="text-gray-400 text-xs mt-2 mb-1">Your Email</p>
          <p className="text-white text-sm font-medium">{email}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Email Password</label>
            <input
              type="password"
              value={emailPassword}
              onChange={(e) => setEmailPassword(e.target.value)}
              className="w-full bg-navy-900 border border-navy-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gold transition-colors"
              placeholder="Your SASA email password"
              required
            />
            <p className="text-gray-500 text-xs mt-1.5">
              This is the password for your {email} email account. It will be stored securely.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-gold-dark to-gold py-3 rounded-lg font-heading font-semibold text-navy-900 hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Testing Connection...' : 'Connect Email'}
          </button>
        </form>
      </div>
    </div>
  );
}
