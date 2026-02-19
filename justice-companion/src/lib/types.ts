// Shared TypeScript types matching backend models

export type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
export type CaseStatus = "PENDING" | "IN_PROGRESS" | "RESOLVED";
export type AuthorityLevel = "POLICE" | "SUPERIOR" | "JUDICIARY";
export type UserRole = "CITIZEN" | "POLICE" | "SUPERIOR" | "JUDICIARY";
export type PoliceRank = "INSPECTOR" | "SI" | "DSP" | "SP";

export interface SeverityInfo {
  label: Severity;
  score_estimate: number;
  confidence: number;
  label_probabilities: Record<string, number>;
  model_used: string;
  recommendation: string;
}

export interface SLAInfo {
  hours: number;
  deadline: string; // ISO date string from backend
  breached: boolean;
}

export interface PoliceAction {
  acceptedAt?: string;
  attendedAt?: string;
  remarks?: string;
  actionTaken?: string;
}

export interface Case {
  _id: string;
  reporter: string;
  reporter_name: string;
  crime_type: string;
  location: string;
  description: string;
  incident_datetime: string;
  severity: SeverityInfo;
  current_authority: AuthorityLevel;
  sla: SLAInfo;
  assignedPolice?: string;
  policeAction?: PoliceAction;
  status: CaseStatus;
  confirmed_by_citizen: boolean;
  confirmed_by_police: boolean;
  escalationCount: number;
  createdAt: string;
}

export interface Notification {
  _id: string;
  caseId: string;
  recipientRole: string;
  recipientId?: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface Station {
  _id: string;
  name: string;
  location: string;
  address: string;
  officers: Array<{ _id: string; name: string; email: string; role: string }>;
  createdAt: string;
}

export interface DashboardStats {
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  resolved: number;
}

export interface DashboardResponse {
  stats: DashboardStats;
  cases: Case[];
}

export interface LoginResponse {
  token: string;
  role: UserRole;
}

export interface PoliceLoginResponse {
  success: boolean;
  message: string;
  token: string;
  police: {
    id: string;
    policeId: string;
    name: string;
    role: string;
    stationName: string;
    rank: string;
  };
}
