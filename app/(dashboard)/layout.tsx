'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

interface AgentInfo {
  agentId: string;
  fullName: string;
  email: string;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [agent, setAgent] = useState<AgentInfo | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.agent) setAgent(data.agent);
      })
      .catch(() => {});
  }, []);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/my-leads', label: 'My Leads', icon: '👥' },
    { href: '/qr-code', label: 'QR Code', icon: '📱' },
    { href: '/connect-email', label: 'Email', icon: '📧' },
  ];

  const initials = agent?.fullName
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '??';

  return (
    <div className="min-h-screen bg-navy-900">
      {/* Top Nav */}
      <nav className="bg-navy-800 border-b border-navy-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center gap-2">
              <Image
                src="/images/logo/sasa-logo-color.png"
                alt="SASA Worldwide"
                width={100}
                height={33}
              />
              <span className="font-heading text-sm font-bold text-gold hidden sm:inline">Training</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === item.href
                      ? 'bg-gold/10 text-gold'
                      : 'text-gray-400 hover:text-white hover:bg-navy-700'
                  }`}
                >
                  <span className="mr-1.5">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>

            {/* User Menu */}
            <div className="hidden md:flex items-center gap-3">
              <div className="text-right">
                <p className="text-white text-sm font-medium">{agent?.fullName || 'Loading...'}</p>
                <p className="text-gray-500 text-xs">{agent?.email || ''}</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gold-dark to-gold flex items-center justify-center">
                <span className="text-navy-900 text-xs font-bold">{initials}</span>
              </div>
              <button
                onClick={handleLogout}
                className="ml-2 text-gray-400 hover:text-red-400 transition-colors text-sm"
              >
                Logout
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-gray-400 hover:text-white p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-navy-700 bg-navy-800">
            <div className="px-4 py-3 border-b border-navy-700 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gold-dark to-gold flex items-center justify-center">
                <span className="text-navy-900 text-xs font-bold">{initials}</span>
              </div>
              <div>
                <p className="text-white text-sm font-medium">{agent?.fullName}</p>
                <p className="text-gray-500 text-xs">{agent?.email}</p>
              </div>
            </div>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-3 text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? 'bg-gold/10 text-gold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-navy-700 transition-colors"
            >
              🚪 Logout
            </button>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">{children}</main>
    </div>
  );
}
