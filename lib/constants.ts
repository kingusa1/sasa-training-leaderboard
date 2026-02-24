import { Package } from './types';

// Google Sheet tab names
export const SHEET_TABS = {
  AGENTS: 'Agent Credentials',
  LEADS: 'Leads',
  MEETINGS: 'Meeting Requests',
} as const;

// Column mappings (0-indexed) for Agent Credentials tab
export const AGENT_COLS = {
  AGENT_ID: 0,
  FULL_NAME: 1,
  EMAIL: 2,
  PHONE: 3,
  HASHED_PASSWORD: 4,
  CREATED_AT: 5,
} as const;

// Column mappings for Leads tab
export const LEAD_COLS = {
  LEAD_ID: 0,
  AGENT_ID: 1,
  AGENT_NAME: 2,
  CLIENT_NAME: 3,
  CLIENT_EMAIL: 4,
  CLIENT_PHONE: 5,
  PACKAGE: 6,
  SUBMITTED_AT: 7,
  MEETING_DONE: 8,
  PAYMENT_RECEIVED: 9,
} as const;

// Column mappings for Meeting Requests tab
export const MEETING_COLS = {
  REQUEST_ID: 0,
  LEAD_ID: 1,
  AGENT_ID: 2,
  CLIENT_NAME: 3,
  CLIENT_EMAIL: 4,
  PREFERRED_DATE: 5,
  PREFERRED_TIME: 6,
  NOTES: 7,
  CREATED_AT: 8,
} as const;

// Training course packages
export const PACKAGES: Package[] = [
  {
    id: 'starter',
    name: 'Starter Course',
    price: 500,
    description: 'Perfect for beginners looking to start their journey',
    features: [
      'Basic sales fundamentals',
      'Online access for 3 months',
      'Email support',
      'Certificate of completion',
    ],
  },
  {
    id: 'professional',
    name: 'Professional Course',
    price: 1500,
    description: 'Comprehensive training for serious professionals',
    features: [
      'Advanced sales techniques',
      'Online access for 6 months',
      'Live weekly sessions',
      'Priority support',
      'Professional certificate',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise Course',
    price: 3000,
    description: 'The ultimate training package for top performers',
    features: [
      'Full curriculum access',
      'Lifetime online access',
      '1-on-1 mentorship',
      '24/7 dedicated support',
      'Executive certificate',
      'Networking events access',
    ],
  },
];

// Design tokens
export const COLORS = {
  navy900: '#0A1628',
  navy800: '#0F2340',
  navy700: '#152D50',
  navy600: '#1B3760',
  gold: '#C9A227',
  goldLight: '#D4B84A',
  goldDark: '#A88620',
} as const;
