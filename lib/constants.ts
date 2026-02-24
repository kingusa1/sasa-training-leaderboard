import { Package } from './types';

// Google Sheet tab names
export const SHEET_TABS = {
  AGENTS: 'Agent Credentials',
  LEADS: 'Leads',
  MEETINGS: 'Meeting Requests',
} as const;

// Column mappings (0-indexed) for Agent Credentials tab
// AgentID | FullName | Email | Phone | HashedPassword | EmailPassword | EmailConnected | CreatedAt
export const AGENT_COLS = {
  AGENT_ID: 0,
  FULL_NAME: 1,
  EMAIL: 2,
  PHONE: 3,
  HASHED_PASSWORD: 4,
  EMAIL_PASSWORD: 5,
  EMAIL_CONNECTED: 6,
  CREATED_AT: 7,
} as const;

// Column mappings for Leads tab
// Timestamp | AgentName | AgentEmail | FirstName | LastName | ClientEmail | ClientPhone | Package | CompanyName | TeamSize | PreferredContact | BestTime | Notes | MeetingDone | PaymentReceived | Status | LeadSource
export const LEAD_COLS = {
  TIMESTAMP: 0,
  AGENT_NAME: 1,
  AGENT_EMAIL: 2,
  FIRST_NAME: 3,
  LAST_NAME: 4,
  CLIENT_EMAIL: 5,
  CLIENT_PHONE: 6,
  PACKAGE: 7,
  COMPANY_NAME: 8,
  TEAM_SIZE: 9,
  PREFERRED_CONTACT: 10,
  BEST_TIME: 11,
  NOTES: 12,
  MEETING_DONE: 13,
  PAYMENT_RECEIVED: 14,
  STATUS: 15,
  LEAD_SOURCE: 16,
} as const;

// Column mappings for Meeting Requests tab
export const MEETING_COLS = {
  TIMESTAMP: 0,
  AGENT_NAME: 1,
  AGENT_EMAIL: 2,
  CLIENT_NAME: 3,
  CLIENT_EMAIL: 4,
  CLIENT_PHONE: 5,
  PACKAGE_INTEREST: 6,
  PREFERRED_DATE: 7,
  PREFERRED_TIME: 8,
  MEETING_TYPE: 9,
  NOTES: 10,
  STATUS: 11,
} as const;

// Allowed email domain
export const ALLOWED_EMAIL_DOMAIN = 'sasa-worldwide.com';

// SMTP Settings
export const SMTP_CONFIG = {
  host: 'mail.sasa-worldwide.com',
  port: 465,
  secure: true, // SSL
} as const;

// Training course packages (from sasa-worldwide.com/training)
export const PACKAGES: Package[] = [
  {
    id: 'starter',
    name: 'Starter',
    fullName: 'Sales Certification + 2-Day On-Site Training',
    price: 1000,
    currency: 'AED',
    description: 'Get instant lifetime access with 2 days of practical, hands-on on-site training.',
    features: [
      'Complete 4-Foundation Sales Mastery System',
      '2 days of on-site hands-on training',
      'Lifetime access to all course materials',
      'Certificate upon completion',
    ],
    enrollUrl: 'https://sasa-worldwide.app.clientclub.net/courses/offers/bb29ead7-f9a0-42ad-b07f-481ee4a97cfb',
  },
  {
    id: 'full-immersion',
    name: 'Full Immersion',
    fullName: 'Full On-Site Certification Program',
    price: 5000,
    currency: 'AED',
    description: 'Our most popular fully immersive on-site program. Train every day until you\'re certified.',
    features: [
      'Daily on-site training until certified',
      'Face-to-face with SASA-certified trainers',
      'Real-world sales with real customers',
      'No fixed end date — train until you master it',
    ],
    enrollUrl: 'https://sasa-worldwide.app.clientclub.net/courses/offers/b3a7c0d9-d9ac-4632-96ed-5158286cba1e',
  },
  {
    id: 'corporate',
    name: 'Corporate',
    fullName: 'Corporate Sales Training Program',
    price: 0,
    currency: 'AED',
    description: 'Custom-tailored training for your entire sales team.',
    features: [
      'Custom curriculum for your team',
      'On-site at your location or SASA offices',
      'Dedicated SASA-certified corporate trainer',
      'Team performance tracking and reporting',
    ],
    enrollUrl: null,
  },
];

// Company info
export const COMPANY = {
  name: 'SASA Worldwide Management Consultancies Co. LLC',
  address: 'Prime Business Center - Tower A, Office A1201, JVC, Dubai, UAE',
  phone: '+971 458 437 77',
  website: 'https://www.sasa-worldwide.com',
  trainingUrl: 'https://www.sasa-worldwide.com/training',
  contactUrl: 'https://www.sasa-worldwide.com/contact',
  mapsUrl: 'https://maps.google.com/?q=Prime+Business+Center+Tower+A+JVC+Dubai',
} as const;
