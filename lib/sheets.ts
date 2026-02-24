import { google } from 'googleapis';
import { Agent, Lead, MeetingRequest, AgentLeaderboardStats, LeaderboardData } from './types';
import { SHEET_TABS, AGENT_COLS, LEAD_COLS, PACKAGES } from './constants';

// Server-side cache
const CACHE_TTL = 30000; // 30 seconds
let cachedLeaderboard: LeaderboardData | null = null;
let cacheTimestamp = 0;

function getAuth() {
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

function getSheets() {
  return google.sheets({ version: 'v4', auth: getAuth() });
}

const SHEET_ID = () => process.env.GOOGLE_SHEET_ID!;

// ============ AGENT OPERATIONS ============

export async function findAgentByEmail(email: string): Promise<Agent | null> {
  const sheets = getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID(),
    range: `'${SHEET_TABS.AGENTS}'!A:H`,
  });
  const rows = res.data.values || [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row[AGENT_COLS.EMAIL]?.toLowerCase() === email.toLowerCase()) {
      return {
        agentId: row[AGENT_COLS.AGENT_ID] || '',
        fullName: row[AGENT_COLS.FULL_NAME] || '',
        email: row[AGENT_COLS.EMAIL] || '',
        phone: row[AGENT_COLS.PHONE] || '',
        hashedPassword: row[AGENT_COLS.HASHED_PASSWORD] || '',
        emailPassword: row[AGENT_COLS.EMAIL_PASSWORD] || '',
        emailConnected: row[AGENT_COLS.EMAIL_CONNECTED]?.toUpperCase() === 'TRUE',
        createdAt: row[AGENT_COLS.CREATED_AT] || '',
      };
    }
  }
  return null;
}

export async function findAgentById(agentId: string): Promise<Agent | null> {
  const sheets = getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID(),
    range: `'${SHEET_TABS.AGENTS}'!A:H`,
  });
  const rows = res.data.values || [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row[AGENT_COLS.AGENT_ID] === agentId) {
      return {
        agentId: row[AGENT_COLS.AGENT_ID] || '',
        fullName: row[AGENT_COLS.FULL_NAME] || '',
        email: row[AGENT_COLS.EMAIL] || '',
        phone: row[AGENT_COLS.PHONE] || '',
        hashedPassword: row[AGENT_COLS.HASHED_PASSWORD] || '',
        emailPassword: row[AGENT_COLS.EMAIL_PASSWORD] || '',
        emailConnected: row[AGENT_COLS.EMAIL_CONNECTED]?.toUpperCase() === 'TRUE',
        createdAt: row[AGENT_COLS.CREATED_AT] || '',
      };
    }
  }
  return null;
}

export async function createAgent(agent: Omit<Agent, 'createdAt' | 'emailPassword' | 'emailConnected'>): Promise<void> {
  const sheets = getSheets();
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID(),
    range: `'${SHEET_TABS.AGENTS}'!A:H`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[
        agent.agentId,
        agent.fullName,
        agent.email,
        agent.phone,
        agent.hashedPassword,
        '', // EmailPassword - set later via connect-email
        'FALSE', // EmailConnected
        new Date().toISOString(),
      ]],
    },
  });
}

export async function updateAgentEmailCredentials(
  email: string,
  emailPassword: string
): Promise<void> {
  const sheets = getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID(),
    range: `'${SHEET_TABS.AGENTS}'!A:H`,
  });
  const rows = res.data.values || [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row[AGENT_COLS.EMAIL]?.toLowerCase() === email.toLowerCase()) {
      const rowNumber = i + 1; // 1-indexed
      // Update EmailPassword (col F) and EmailConnected (col G)
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID(),
        range: `'${SHEET_TABS.AGENTS}'!F${rowNumber}:G${rowNumber}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[emailPassword, 'TRUE']],
        },
      });
      return;
    }
  }
  throw new Error('Agent not found');
}

// ============ LEAD OPERATIONS ============

export async function getLeadsByAgent(agentEmail: string): Promise<Lead[]> {
  const sheets = getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID(),
    range: `'${SHEET_TABS.LEADS}'!A:Q`,
  });
  const rows = res.data.values || [];
  const leads: Lead[] = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row[LEAD_COLS.AGENT_EMAIL]?.toLowerCase() === agentEmail.toLowerCase()) {
      leads.push({
        timestamp: row[LEAD_COLS.TIMESTAMP] || '',
        agentName: row[LEAD_COLS.AGENT_NAME] || '',
        agentEmail: row[LEAD_COLS.AGENT_EMAIL] || '',
        firstName: row[LEAD_COLS.FIRST_NAME] || '',
        lastName: row[LEAD_COLS.LAST_NAME] || '',
        clientEmail: row[LEAD_COLS.CLIENT_EMAIL] || '',
        clientPhone: row[LEAD_COLS.CLIENT_PHONE] || '',
        package: row[LEAD_COLS.PACKAGE] || '',
        companyName: row[LEAD_COLS.COMPANY_NAME] || '',
        teamSize: row[LEAD_COLS.TEAM_SIZE] || '',
        preferredContact: row[LEAD_COLS.PREFERRED_CONTACT] || '',
        bestTime: row[LEAD_COLS.BEST_TIME] || '',
        notes: row[LEAD_COLS.NOTES] || '',
        meetingDone: row[LEAD_COLS.MEETING_DONE]?.toUpperCase() === 'TRUE',
        paymentReceived: row[LEAD_COLS.PAYMENT_RECEIVED]?.toUpperCase() === 'TRUE',
        status: row[LEAD_COLS.STATUS] || 'New',
        leadSource: row[LEAD_COLS.LEAD_SOURCE] || '',
        rowIndex: i + 1,
      });
    }
  }
  return leads.sort((a, b) => {
    const dateA = new Date(a.timestamp).getTime() || 0;
    const dateB = new Date(b.timestamp).getTime() || 0;
    return dateB - dateA;
  });
}

export async function createLead(lead: {
  agentName: string;
  agentEmail: string;
  firstName: string;
  lastName: string;
  clientEmail: string;
  clientPhone: string;
  packageId: string;
  companyName?: string;
  teamSize?: string;
  preferredContact?: string;
  bestTime?: string;
  notes?: string;
  leadSource?: string;
}): Promise<void> {
  const sheets = getSheets();
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID(),
    range: `'${SHEET_TABS.LEADS}'!A:Q`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[
        new Date().toISOString(),
        lead.agentName,
        lead.agentEmail,
        lead.firstName,
        lead.lastName,
        lead.clientEmail,
        lead.clientPhone,
        lead.packageId,
        lead.companyName || '',
        lead.teamSize || '',
        lead.preferredContact || '',
        lead.bestTime || '',
        lead.notes || '',
        'FALSE', // MeetingDone
        'FALSE', // PaymentReceived
        'New', // Status
        lead.leadSource || 'QR Code',
      ]],
    },
  });
  cachedLeaderboard = null;
  cacheTimestamp = 0;
}

export async function toggleLeadField(
  rowIndex: number,
  field: 'meetingDone' | 'paymentReceived',
  value: boolean
): Promise<void> {
  const sheets = getSheets();
  // Column N = MeetingDone (col 14), O = PaymentReceived (col 15)
  const col = field === 'meetingDone' ? 'N' : 'O';
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID(),
    range: `'${SHEET_TABS.LEADS}'!${col}${rowIndex}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[value ? 'TRUE' : 'FALSE']],
    },
  });
  cachedLeaderboard = null;
  cacheTimestamp = 0;
}

// ============ MEETING REQUEST OPERATIONS ============

export async function createMeetingRequest(meeting: Omit<MeetingRequest, 'timestamp' | 'status'>): Promise<void> {
  const sheets = getSheets();
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID(),
    range: `'${SHEET_TABS.MEETINGS}'!A:L`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[
        new Date().toISOString(),
        meeting.agentName,
        meeting.agentEmail,
        meeting.clientName,
        meeting.clientEmail,
        meeting.clientPhone,
        meeting.packageInterest,
        meeting.preferredDate,
        meeting.preferredTime,
        meeting.meetingType,
        meeting.notes,
        'Pending',
      ]],
    },
  });
}

// ============ LEADERBOARD ============

export async function getLeaderboardData(): Promise<LeaderboardData> {
  if (cachedLeaderboard && Date.now() - cacheTimestamp < CACHE_TTL) {
    return cachedLeaderboard;
  }

  const sheets = getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID(),
    range: `'${SHEET_TABS.LEADS}'!A:Q`,
  });
  const rows = res.data.values || [];

  const agentMap = new Map<string, AgentLeaderboardStats>();

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const agentEmail = row[LEAD_COLS.AGENT_EMAIL] || '';
    const agentName = row[LEAD_COLS.AGENT_NAME] || '';
    if (!agentEmail) continue;

    const key = agentEmail.toLowerCase();
    if (!agentMap.has(key)) {
      agentMap.set(key, {
        agentId: key,
        fullName: agentName,
        email: agentEmail,
        totalLeads: 0,
        meetingsDone: 0,
        paymentReceived: 0,
        revenue: 0,
        leads: [],
      });
    }

    const stats = agentMap.get(key)!;
    const packageId = row[LEAD_COLS.PACKAGE] || '';
    const meetingDone = row[LEAD_COLS.MEETING_DONE]?.toUpperCase() === 'TRUE';
    const paymentReceived = row[LEAD_COLS.PAYMENT_RECEIVED]?.toUpperCase() === 'TRUE';

    stats.totalLeads++;
    if (meetingDone) stats.meetingsDone++;
    if (paymentReceived) {
      stats.paymentReceived++;
      const pkg = PACKAGES.find((p) => p.id === packageId || p.name === packageId);
      if (pkg) stats.revenue += pkg.price;
    }

    stats.leads.push({
      timestamp: row[LEAD_COLS.TIMESTAMP] || '',
      agentName,
      agentEmail,
      firstName: row[LEAD_COLS.FIRST_NAME] || '',
      lastName: row[LEAD_COLS.LAST_NAME] || '',
      clientEmail: row[LEAD_COLS.CLIENT_EMAIL] || '',
      clientPhone: row[LEAD_COLS.CLIENT_PHONE] || '',
      package: packageId,
      companyName: row[LEAD_COLS.COMPANY_NAME] || '',
      teamSize: row[LEAD_COLS.TEAM_SIZE] || '',
      preferredContact: row[LEAD_COLS.PREFERRED_CONTACT] || '',
      bestTime: row[LEAD_COLS.BEST_TIME] || '',
      notes: row[LEAD_COLS.NOTES] || '',
      meetingDone,
      paymentReceived,
      status: row[LEAD_COLS.STATUS] || 'New',
      leadSource: row[LEAD_COLS.LEAD_SOURCE] || '',
    });
  }

  // Map agentId from Agent Credentials sheet
  try {
    const agentRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID(),
      range: `'${SHEET_TABS.AGENTS}'!A:C`,
    });
    const agentRows = agentRes.data.values || [];
    for (let i = 1; i < agentRows.length; i++) {
      const agentId = agentRows[i][AGENT_COLS.AGENT_ID] || '';
      const email = (agentRows[i][AGENT_COLS.EMAIL] || '').toLowerCase();
      if (agentMap.has(email)) {
        agentMap.get(email)!.agentId = agentId;
      }
    }
  } catch {
    // If agent lookup fails, keep email as agentId
  }

  const leaderboard = Array.from(agentMap.values()).sort(
    (a, b) => b.revenue - a.revenue || b.totalLeads - a.totalLeads
  );

  const allLeads: Omit<Lead, 'rowIndex'>[] = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row[LEAD_COLS.AGENT_EMAIL]) continue;
    allLeads.push({
      timestamp: row[LEAD_COLS.TIMESTAMP] || '',
      agentName: row[LEAD_COLS.AGENT_NAME] || '',
      agentEmail: row[LEAD_COLS.AGENT_EMAIL] || '',
      firstName: row[LEAD_COLS.FIRST_NAME] || '',
      lastName: row[LEAD_COLS.LAST_NAME] || '',
      clientEmail: row[LEAD_COLS.CLIENT_EMAIL] || '',
      clientPhone: row[LEAD_COLS.CLIENT_PHONE] || '',
      package: row[LEAD_COLS.PACKAGE] || '',
      meetingDone: row[LEAD_COLS.MEETING_DONE]?.toUpperCase() === 'TRUE',
      paymentReceived: row[LEAD_COLS.PAYMENT_RECEIVED]?.toUpperCase() === 'TRUE',
      status: row[LEAD_COLS.STATUS] || 'New',
      leadSource: row[LEAD_COLS.LEAD_SOURCE] || '',
    });
  }

  allLeads.sort((a, b) => {
    const dateA = new Date(a.timestamp).getTime() || 0;
    const dateB = new Date(b.timestamp).getTime() || 0;
    return dateB - dateA;
  });

  const data: LeaderboardData = {
    leaderboard,
    recentLeads: allLeads.slice(0, 50),
  };

  cachedLeaderboard = data;
  cacheTimestamp = Date.now();

  return data;
}
