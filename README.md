# SASA Training Sales

A competitive sales leaderboard and lead management system for SASA Worldwide training course agents. Agents sign up, connect their SASA email, get a unique QR code, share it with clients, and track their leads on a real-time leaderboard.

## Features

- **Agent Authentication** - Signup/Login with JWT-based auth (SASA email domain only)
- **Competitive Leaderboard** - Top 3 podium + full rankings with time filters and revenue tracking
- **QR Code Generation** - Each agent gets a unique QR code linking to their client form
- **Premium Client Form** - Luxury-styled public form with expandable package cards
- **Buy Now** - Direct enrollment redirect for Starter and Full Immersion packages
- **Meeting Scheduler** - Calendly-style calendar with date/time selection for scheduling consultations
- **Lead Tracking** - Toggle switches for Meeting Done / Payment Received with optimistic updates
- **Email Notifications** - Automatic emails via SMTP (lead confirmation, agent alerts, meeting confirmations)
- **Email Connection** - Agents connect their SASA email (SMTP) to send emails from their own account
- **Activity Feed** - Real-time feed of recent leads across all agents
- **PWA Support** - Installable as "SASA Training Sales" with app icons

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (cream/navy brand theme)
- **Database**: Google Sheets API (via service account)
- **Auth**: bcryptjs + JWT (jose for Edge Runtime middleware)
- **Email**: Nodemailer via SMTP (mail.sasa-worldwide.com:465 SSL)
- **QR Codes**: qrcode library

## Training Packages

| Package | Price (AED) | Enrollment |
|---------|-------------|------------|
| Starter — Sales Certification + 2-Day On-Site Training | 1,000 | Buy Now link |
| Full Immersion — Full On-Site Certification Program | 5,000 | Buy Now link |
| Enterprise — Corporate Sales Training Program | Custom | Schedule a Meeting |

## Getting Started

1. Clone the repo
2. `npm install`
3. Copy `.env.local.example` to `.env.local` and fill in credentials
4. Create a Google Sheet with 3 tabs: `Agent Credentials`, `Leads`, `Meeting Requests`
5. Share the sheet with your service account email
6. `npm run dev`

## Environment Variables

| Variable | Description |
|----------|-------------|
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Service account email |
| `GOOGLE_PRIVATE_KEY` | Service account private key |
| `GOOGLE_SHEET_ID` | Google Sheet ID |
| `JWT_SECRET` | Secret for JWT signing |
| `NEXT_PUBLIC_APP_URL` | App URL (e.g. https://sasa-training-leaderboard.vercel.app) |

## Pages

| Route | Description |
|-------|-------------|
| `/login` | Agent login |
| `/signup` | Agent registration |
| `/connect-email` | SMTP email connection setup |
| `/dashboard` | Leaderboard with podium + rankings |
| `/my-leads` | Agent's leads with toggle switches |
| `/qr-code` | QR code generator + download |
| `/form/[agentId]` | Public client submission form |
| `/form/[agentId]/meeting` | Calendly-style meeting scheduler |

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/auth/signup` | POST | Agent registration |
| `/api/auth/login` | POST | Agent login |
| `/api/auth/logout` | POST | Agent logout |
| `/api/auth/me` | GET | Current agent info |
| `/api/auth/connect-email` | GET/POST | Email connection setup |
| `/api/agent/[id]` | GET | Public agent info |
| `/api/leaderboard` | GET | Leaderboard data |
| `/api/leads` | GET/POST | List/create leads |
| `/api/leads/[row]` | PATCH | Toggle lead fields |
| `/api/meetings` | POST | Schedule a meeting |

## Deployment

Deployed on Vercel. Push to `master` branch triggers auto-deploy.
