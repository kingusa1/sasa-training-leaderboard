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
    range: `'${SHEET_TABS.AGENTS}'!A:F`,
  });
  const rows = res.data.values || [];
  // Skip header row
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row[AGENT_COLS.EMAIL]?.toLowerCase() === email.toLowerCase()) {
      return {
        agentId: row[AGENT_COLS.AGENT_ID] || '',
        fullName: row[AGENT_COLS.FULL_NAME] || '',
        email: row[AGENT_COLS.EMAIL] || '',
        phone: row[AGENT_COLS.PHONE] || '',
        hashedPassword: row[AGENT_COLS.HASHED_PASSWORD] || '',
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
    range: `'${SHEET_TABS.AGENTS}'!A:F`,
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
        createdAt: row[AGENT_COLS.CREATED_AT] || '',
      };
    }
  }
  return null;
}

export async function createAgent(agent: Omit<Agent, 'createdAt'>): Promise<void> {
  const sheets = getSheets();
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID(),
    range: `'${SHEET_TABS.AGENTS}'!A:F`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[
        agent.agentId,
        agent.fullName,
        agent.email,
        agent.phone,
        agent.hashedPassword,
        new Date().toISOString(),
      ]],
    },
  });
}

// ============ LEAD OPERATIONS ============

export async function getLeadsByAgent(agentId: string): Promise<Lead[]> {
  const sheets = getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID(),
    range: `'${SHEET_TABS.LEADS}'!A:J`,
  });
  const rows = res.data.values || [];
  const leads: Lead[] = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row[LEAD_COLS.AGENT_ID] === agentId) {
      leads.push({
        leadId: row[LEAD_COLS.LEAD_ID] || '',
        agentId: row[LEAD_COLS.AGENT_ID] || '',
        agentName: row[LEAD_COLS.AGENT_NAME] || '',
        clientName: row[LEAD_COLS.CLIENT_NAME] || '',
        clientEmail: row[LEAD_COLS.CLIENT_EMAIL] || '',
        clientPhone: row[LEAD_COLS.CLIENT_PHONE] || '',
        package: row[LEAD_COLS.PACKAGE] || '',
        submittedAt: row[LEAD_COLS.SUBMITTED_AT] || '',
        meetingDone: row[LEAD_COLS.MEETING_DONE]?.toUpperCase() === 'TRUE',
        paymentReceived: row[LEAD_COLS.PAYMENT_RECEIVED]?.toUpperCase() === 'TRUE',
        rowIndex: i + 1, // 1-indexed for Sheets API (row 1 = header)
      });
    }
  }
  return leads.sort((a, b) => {
    const dateA = new Date(a.submittedAt).getTime() || 0;
    const dateB = new Date(b.submittedAt).getTime() || 0;
    return dateB - dateA;
  });
}

export async function createLead(lead: Omit<Lead, 'meetingDone' | 'paymentReceived' | 'rowIndex'>): Promise<void> {
  const sheets = getSheets();
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID(),
    range: `'${SHEET_TABS.LEADS}'!A:J`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[
        lead.leadId,
        lead.agentId,
        lead.agentName,
        lead.clientName,
        lead.clientEmail,
        lead.clientPhone,
        lead.package,
        lead.submittedAt,
        'FALSE',
        'FALSE',
      ]],
    },
  });
  // Invalidate cache
  cachedLeaderboard = null;
  cacheTimestamp = 0;
}

export async function toggleLeadField(
  rowIndex: number,
  field: 'meetingDone' | 'paymentReceived',
  value: boolean
): Promise<void> {
  const sheets = getSheets();
  const col = field === 'meetingDone' ? 'I' : 'J'; // Column I = MeetingDone, J = PaymentReceived
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID(),
    range: `'${SHEET_TABS.LEADS}'!${col}${rowIndex}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[value ? 'TRUE' : 'FALSE']],
    },
  });
  // Invalidate cache
  cachedLeaderboard = null;
  cacheTimestamp = 0;
}

// ============ MEETING REQUEST OPERATIONS ============

export async function createMeetingRequest(meeting: Omit<MeetingRequest, 'createdAt'>): Promise<void> {
  const sheets = getSheets();
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID(),
    range: `'${SHEET_TABS.MEETINGS}'!A:I`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[
        meeting.requestId,
        meeting.leadId,
        meeting.agentId,
        meeting.clientName,
        meeting.clientEmail,
        meeting.preferredDate,
        meeting.preferredTime,
        meeting.notes,
        new Date().toISOString(),
      ]],
    },
  });
}

// ============ LEADERBOARD ============

export async function getLeaderboardData(): Promise<LeaderboardData> {
  // Check cache
  if (cachedLeaderboard && Date.now() - cacheTimestamp < CACHE_TTL) {
    return cachedLeaderboard;
  }

  const sheets = getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID(),
    range: `'${SHEET_TABS.LEADS}'!A:J`,
  });
  const rows = res.data.values || [];

  const agentMap = new Map<string, AgentLeaderboardStats>();

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const agentId = row[LEAD_COLS.AGENT_ID] || '';
    const agentName = row[LEAD_COLS.AGENT_NAME] || '';
    if (!agentId) continue;

    if (!agentMap.has(agentId)) {
      agentMap.set(agentId, {
        agentId,
        fullName: agentName,
        totalLeads: 0,
        meetingsDone: 0,
        paymentReceived: 0,
        revenue: 0,
        leads: [],
      });
    }

    const stats = agentMap.get(agentId)!;
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
      leadId: row[LEAD_COLS.LEAD_ID] || '',
      agentId,
      agentName,
      clientName: row[LEAD_COLS.CLIENT_NAME] || '',
      clientEmail: row[LEAD_COLS.CLIENT_EMAIL] || '',
      clientPhone: row[LEAD_COLS.CLIENT_PHONE] || '',
      package: packageId,
      submittedAt: row[LEAD_COLS.SUBMITTED_AT] || '',
      meetingDone,
      paymentReceived,
    });
  }

  const leaderboard = Array.from(agentMap.values()).sort(
    (a, b) => b.revenue - a.revenue || b.totalLeads - a.totalLeads
  );

  // Recent leads (last 50)
  const allLeads: Omit<Lead, 'rowIndex'>[] = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row[LEAD_COLS.AGENT_ID]) continue;
    allLeads.push({
      leadId: row[LEAD_COLS.LEAD_ID] || '',
      agentId: row[LEAD_COLS.AGENT_ID] || '',
      agentName: row[LEAD_COLS.AGENT_NAME] || '',
      clientName: row[LEAD_COLS.CLIENT_NAME] || '',
      clientEmail: row[LEAD_COLS.CLIENT_EMAIL] || '',
      clientPhone: row[LEAD_COLS.CLIENT_PHONE] || '',
      package: row[LEAD_COLS.PACKAGE] || '',
      submittedAt: row[LEAD_COLS.SUBMITTED_AT] || '',
      meetingDone: row[LEAD_COLS.MEETING_DONE]?.toUpperCase() === 'TRUE',
      paymentReceived: row[LEAD_COLS.PAYMENT_RECEIVED]?.toUpperCase() === 'TRUE',
    });
  }

  allLeads.sort((a, b) => {
    const dateA = new Date(a.submittedAt).getTime() || 0;
    const dateB = new Date(b.submittedAt).getTime() || 0;
    return dateB - dateA;
  });

  const data: LeaderboardData = {
    leaderboard,
    recentLeads: allLeads.slice(0, 50),
  };

  // Update cache
  cachedLeaderboard = data;
  cacheTimestamp = Date.now();

  return data;
}
