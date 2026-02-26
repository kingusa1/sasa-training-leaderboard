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

// Training course packages (single source of truth)
export const PACKAGES: Package[] = [
  {
    id: 'online-sales-training',
    name: 'Online Sales Training',
    fullName: 'Sales Performance Programme',
    price: 999,
    currency: 'AED',
    priceLabel: '~£220',
    priceSuffix: 'per employee',
    description: 'A comprehensive online programme designed to sharpen your sales skills with proven frameworks, advanced techniques, and real-world accountability.',
    features: [
      'Advanced closing techniques and strategies',
      'Objection handling frameworks that convert',
      'Structured sales conversation methodology',
      'Real-world application and accountability',
      'Complete 4-Foundation Sales Mastery System',
      'Lifetime access to all course materials',
    ],
    enrollUrl: 'https://sasa-worldwide.app.clientclub.net/courses/offers/bb29ead7-f9a0-42ad-b07f-481ee4a97cfb',
  },
  {
    id: 'foundation-partnership',
    name: 'Foundation Partnership',
    fullName: 'Weekly Training & Core Frameworks',
    price: 3000,
    currency: 'AED',
    priceSuffix: '/month',
    description: 'Ideal for teams getting started — build a solid sales foundation with weekly training sessions, proven scripts, and ongoing expert support.',
    features: [
      'Weekly live sales training sessions',
      'Core scripts and proven sales frameworks',
      'Ongoing coaching and support',
      'Access to the 4-Foundation Sales System',
      'Performance tracking and progress reviews',
    ],
    enrollUrl: null,
    meetingOnly: true,
    discount: '50% OFF',
  },
  {
    id: 'performance-partnership',
    name: 'Performance Partnership',
    fullName: 'Advanced Coaching & KPI Systems',
    price: 5000,
    currency: 'AED',
    priceSuffix: '/month',
    description: 'Our most popular package — advanced coaching, custom scripts, and full KPI systems designed to accelerate team performance and develop strong sales managers.',
    features: [
      'Everything in Foundation Partnership',
      'Advanced training and 1-on-1 coaching',
      'Custom scripts tailored to your business',
      'KPI systems, dashboards, and reporting',
      'Manager development and leadership training',
      'Priority support and strategy sessions',
    ],
    enrollUrl: null,
    meetingOnly: true,
    recommended: true,
  },
  {
    id: 'elite-revenue-system',
    name: 'Elite Revenue System',
    fullName: 'Full Sales System Implementation',
    price: 9000,
    currency: 'AED',
    priceSuffix: '/month',
    description: 'A complete sales system overhaul — from daily accountability structures and hiring systems to strategic mentoring that drives consistent, scalable revenue.',
    features: [
      'Everything in Performance Partnership',
      'Full sales system design and implementation',
      'Daily accountability and performance structures',
      'Hiring, onboarding, and team-building systems',
      'Strategic mentoring from senior consultants',
      'Revenue forecasting and growth planning',
    ],
    enrollUrl: null,
    meetingOnly: true,
    discount: '50% OFF',
  },
  {
    id: 'enterprise',
    name: 'Enterprise Solution',
    fullName: 'Complete Sales Department Build',
    price: 0,
    currency: 'AED',
    description: 'A fully bespoke enterprise engagement — we build, integrate, and scale your entire sales operation with CRM, AI, and a custom growth strategy.',
    features: [
      'Full sales department design and build',
      'CRM and AI integration for your workflow',
      'Scaling and long-term growth strategy',
      'Custom enterprise solutions and playbooks',
      'Dedicated account manager and support team',
      'Executive-level strategic consulting',
    ],
    enrollUrl: null,
    meetingOnly: true,
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
