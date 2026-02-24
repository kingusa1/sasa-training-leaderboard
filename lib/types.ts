export interface Agent {
  agentId: string;
  fullName: string;
  email: string;
  phone: string;
  hashedPassword: string;
  createdAt: string;
}

export interface Lead {
  leadId: string;
  agentId: string;
  agentName: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  package: string;
  submittedAt: string;
  meetingDone: boolean;
  paymentReceived: boolean;
  rowIndex?: number;
}

export interface MeetingRequest {
  requestId: string;
  leadId: string;
  agentId: string;
  clientName: string;
  clientEmail: string;
  preferredDate: string;
  preferredTime: string;
  notes: string;
  createdAt: string;
}

export interface JWTPayload {
  agentId: string;
  email: string;
  fullName: string;
}

export interface Package {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
}

export interface AgentLeaderboardStats {
  agentId: string;
  fullName: string;
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
