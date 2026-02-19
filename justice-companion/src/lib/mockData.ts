export type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
export type CaseStatus = "OPEN" | "IN_PROGRESS" | "ESCALATED" | "RESOLVED" | "CLOSED";
export type AuthorityLevel = "POLICE" | "SUPERIOR" | "JUDICIARY";

export interface CaseItem {
  id: string;
  caseNumber: string;
  crimeType: string;
  description: string;
  location: string;
  severity: Severity;
  status: CaseStatus;
  currentAuthority: AuthorityLevel;
  slaDeadline: Date;
  slaBreached: boolean;
  escalationCount: number;
  createdAt: Date;
  reporterName: string;
  assignedOfficer?: string;
}

const now = Date.now();
const hr = 3600000;

export const mockCases: CaseItem[] = [
  {
    id: "1", caseNumber: "CR-2026-0041", crimeType: "Armed Robbery", description: "Armed robbery at Central Market",
    location: "Central Market, Sector 17", severity: "CRITICAL", status: "OPEN", currentAuthority: "POLICE",
    slaDeadline: new Date(now + 2 * hr), slaBreached: false, escalationCount: 0,
    createdAt: new Date(now - 4 * hr), reporterName: "Amit Sharma", assignedOfficer: "Insp. R. Kumar",
  },
  {
    id: "2", caseNumber: "CR-2026-0040", crimeType: "Burglary", description: "Home break-in at night",
    location: "Green Park, Block C", severity: "HIGH", status: "IN_PROGRESS", currentAuthority: "POLICE",
    slaDeadline: new Date(now + 8 * hr), slaBreached: false, escalationCount: 0,
    createdAt: new Date(now - 6 * hr), reporterName: "Priya Patel", assignedOfficer: "SI V. Singh",
  },
  {
    id: "3", caseNumber: "CR-2026-0039", crimeType: "Assault", description: "Physical assault near bus stop",
    location: "MG Road, Bus Stop 5", severity: "HIGH", status: "ESCALATED", currentAuthority: "SUPERIOR",
    slaDeadline: new Date(now - 1 * hr), slaBreached: true, escalationCount: 1,
    createdAt: new Date(now - 18 * hr), reporterName: "Ravi Teja", assignedOfficer: "Insp. M. Das",
  },
  {
    id: "4", caseNumber: "CR-2026-0038", crimeType: "Cyber Fraud", description: "Online banking fraud",
    location: "Online / IP Traced to Sector 22", severity: "MEDIUM", status: "IN_PROGRESS", currentAuthority: "POLICE",
    slaDeadline: new Date(now + 16 * hr), slaBreached: false, escalationCount: 0,
    createdAt: new Date(now - 8 * hr), reporterName: "Neha Gupta", assignedOfficer: "SI A. Khan",
  },
  {
    id: "5", caseNumber: "CR-2026-0037", crimeType: "Theft", description: "Bicycle stolen from parking",
    location: "Railway Station Parking", severity: "LOW", status: "RESOLVED", currentAuthority: "POLICE",
    slaDeadline: new Date(now + 20 * hr), slaBreached: false, escalationCount: 0,
    createdAt: new Date(now - 22 * hr), reporterName: "Sanjay Mehra", assignedOfficer: "Const. P. Roy",
  },
  {
    id: "6", caseNumber: "CR-2026-0036", crimeType: "Kidnapping", description: "Child missing from school",
    location: "DPS School, Sector 8", severity: "CRITICAL", status: "ESCALATED", currentAuthority: "JUDICIARY",
    slaDeadline: new Date(now - 3 * hr), slaBreached: true, escalationCount: 2,
    createdAt: new Date(now - 30 * hr), reporterName: "Kavita Reddy", assignedOfficer: "DSP J. Rao",
  },
];

export const dashboardStats = {
  totalCases: 142,
  openCases: 38,
  resolvedCases: 89,
  slaBreaches: 15,
  criticalCases: 8,
  escalatedCases: 12,
};
