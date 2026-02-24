# SASA Training Course Leaderboard

A competitive sales leaderboard for SASA training course agents. Agents sign up, get a unique QR code, share it with clients, and track their leads on a real-time leaderboard.

## Features

- **Agent Authentication** - Signup/Login with JWT-based auth
- **Competitive Leaderboard** - Top 3 podium + full rankings table with time filters
- **QR Code Generation** - Each agent gets a unique QR code linking to their client form
- **Client Submission Form** - Public form where clients choose a training package and submit their info
- **Lead Tracking** - Toggle switches for Meeting Done / Payment Received
- **Email Notifications** - Automatic emails to both client and agent via Resend
- **Activity Feed** - Real-time feed of recent leads across all agents

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Google Sheets API (via service account)
- **Auth**: bcryptjs + JWT (jose for Edge Runtime)
- **Email**: Resend API
- **QR Codes**: qrcode library

## Training Packages

| Package | Price |
|---------|-------|
| Starter Course | $500 |
| Professional Course | $1,500 |
| Enterprise Course | $3,000 |

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
| `RESEND_API_KEY` | Resend API key for emails |
| `NEXT_PUBLIC_APP_URL` | App URL |

## Pages

| Route | Description |
|-------|-------------|
| `/login` | Agent login |
| `/signup` | Agent registration |
| `/dashboard` | Leaderboard with podium + rankings |
| `/my-leads` | Agent's leads with toggle switches |
| `/qr-code` | QR code generator + download |
| `/form/[agentId]` | Public client submission form |
