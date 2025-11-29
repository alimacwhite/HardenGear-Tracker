
export enum JobStatus {
  INTAKE = 'Intake',
  DIAGNOSIS = 'Diagnosis',
  IN_PROGRESS = 'In Progress',
  WAITING_FOR_PARTS = 'Waiting for Parts',
  QUALITY_CHECK = 'Quality Check',
  COMPLETED = 'Completed',
  READY_FOR_PICKUP = 'Ready for Pickup',
}

export type AccountType = 'Personal' | 'Business';

export enum UserRole {
  COUNTER = 'Counter',
  MANAGER = 'Workshop Manager',
  MECHANIC = 'Mechanic',
  ADMIN = 'Admin',
  OWNER = 'Owner',
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
}

export interface MachineDetails {
  make: string;
  model: string;
  serialNumber: string;
  type: string; // e.g., Lawnmower, Chainsaw
  conditionNotes: string; // From AI or user
}

export interface CustomerDetails {
  id?: string; // Optional DB ID
  accountNumber?: string; // Customer visible Account Number
  accountType: AccountType;
  name: string; // Contact name
  companyName?: string; // Optional, for business accounts
  address: string;
  postcode: string;
  email: string;
  phone: string;
}

export interface ServiceRequest {
  knownIssues: string;
  customerRequirements: string;
  bookingDate: string;
  suggestedRepairPlan?: string;
  serviceTypes: string[]; // ['Service', 'Repair', 'Estimate first']
}

export interface JobHistoryEntry {
  timestamp: number;
  action: string;
  userId: string;
  userName: string;
}

export interface JobRecord {
  id: string; // The 4-digit alphanumeric code
  photos: string[]; // Base64 strings
  machine: MachineDetails;
  customer: CustomerDetails;
  service: ServiceRequest;
  status: JobStatus;
  assignedMechanic?: string; // ID or Name of mechanic
  history: JobHistoryEntry[];
  createdAt: number;
}

export interface GeminiAnalysisResult {
  make: string;
  model?: string;
  serialNumber?: string;
  type: string;
  observedCondition: string;
}