export interface Agent {
  agentId: string;
  fullName: string;
  email: string;
  phone: string;
  hashedPassword: string;
  emailPassword?: string;
  emailConnected?: boolean;
  createdAt: string;
}

export interface Lead {
  timestamp: string;
  agentName: string;
  agentEmail: string;
  firstName: string;
  lastName: string;
  clientEmail: string;
  clientPhone: string;
  package: string;
  companyName?: string;
  teamSize?: string;
  preferredContact?: string;
  bestTime?: string;
  notes?: string;
  meetingDone: boolean;
  paymentReceived: boolean;
  status?: string;
  leadSource?: string;
  rowIndex?: number;
}

export interface MeetingRequest {
  timestamp: string;
  agentName: string;
  agentEmail: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  packageInterest: string;
  preferredDate: string;
  preferredTime: string;
  meetingType: string;
  notes: string;
  status: string;
}

export interface JWTPayload {
  agentId: string;
  email: string;
  fullName: string;
}

export interface Package {
  id: string;
  name: string;
  fullName: string;
  price: number;
  currency: string;
  description: string;
  features: string[];
  enrollUrl: string | null;
}

export interface AgentLeaderboardStats {
  agentId: string;
  fullName: string;
  email: string;
  totalLeads: number;
  meetingsDone: number;
  paymentReceived: number;
  revenue: number;
  leads: Lead[];
}

export interface LeaderboardData {
  leaderboard: AgentLeaderboardStats[];
  recentLeads: Omit<Lead, 'rowIndex'>[];
}
