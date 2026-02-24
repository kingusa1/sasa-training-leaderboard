'use client';

import { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';

interface AgentInfo {
  agentId: string;
  fullName: string;
  email: string;
}

export default function QRCodePage() {
  const [agent, setAgent] = useState<AgentInfo | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const formUrl = agent
    ? `${window.location.origin}/form/${agent.agentId}`
    : '';

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.agent) setAgent(data.agent);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!formUrl) return;

    QRCode.toDataURL(formUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: '#002E59',
        light: '#FFFFFF',
      },
    }).then(setQrDataUrl);

    // Also render to canvas for high-quality download
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, formUrl, {
        width: 800,
        margin: 2,
        color: {
          dark: '#002E59',
          light: '#FFFFFF',
        },
      });
    }
  }, [formUrl]);

  function handleDownload() {
    if (!canvasRef.current || !agent) return;
    const link = document.createElement('a');
    link.download = `${agent.fullName.replace(/\s+/g, '_')}_QR_Code.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  }

  function handleCopyLink() {
    if (!formUrl) return;
    navigator.clipboard.writeText(formUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  if (!agent) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-navy-200 border-t-navy-500 rounded-full animate-spin mx-auto" />
          <p className="text-gray-500 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-navy-700 text-center">Your QR Code</h1>
      <p className="text-gray-500 text-center text-sm">
        Share this QR code with potential clients. When they scan it, they&apos;ll see your personalized sign-up form.
      </p>

      {/* QR Code Display */}
      <div className="bg-white rounded-2xl p-6 shadow-card border border-gray-100">
        <div className="text-center">
          {qrDataUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={qrDataUrl}
              alt="QR Code"
              className="w-64 h-64 mx-auto"
            />
          )}
          <p className="text-navy-700 font-semibold mt-3">{agent.fullName}</p>
          <p className="text-gray-400 text-xs mt-1">SASA Training Consultant</p>
        </div>
      </div>

      {/* Hidden canvas for high-res download */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Link Display */}
      <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-card">
        <label className="text-gray-500 text-xs font-medium">Your Personal Link</label>
        <div className="flex items-center gap-2 mt-2">
          <input
            type="text"
            value={formUrl}
            readOnly
            className="flex-1 bg-cream-100 border border-gray-200 rounded-lg px-3 py-2 text-navy-700 text-sm truncate"
          />
          <button
            onClick={handleCopyLink}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              copied
                ? 'bg-green-500 text-white'
                : 'bg-navy-500 text-white hover:bg-navy-600'
            }`}
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={handleDownload}
          className="bg-white border border-gray-200 text-navy-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors shadow-card"
        >
          📥 Download PNG
        </button>
        <button
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: `${agent.fullName} - SASA Training`,
                text: 'Check out SASA Training courses!',
                url: formUrl,
              });
            } else {
              handleCopyLink();
            }
          }}
          className="bg-navy-500 text-white py-3 rounded-xl font-semibold hover:bg-navy-600 transition-colors shadow-navy"
        >
          📤 Share Link
        </button>
      </div>

      {/* Instructions */}
      <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-card">
        <h3 className="text-navy-700 font-semibold text-sm mb-2">How to use</h3>
        <ol className="text-gray-500 text-sm space-y-2 list-decimal list-inside">
          <li>Download or screenshot the QR code</li>
          <li>Share it with potential clients (print, WhatsApp, social media)</li>
          <li>When clients scan it, they&apos;ll fill out a form with their info</li>
          <li>You&apos;ll get notified and the lead appears in &quot;My Leads&quot;</li>
        </ol>
      </div>
    </div>
  );
}
