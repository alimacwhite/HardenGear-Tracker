export enum JobStatus {
  INTAKE = 'Intake',
  IN_PROGRESS = 'In Progress',
  WAITING_FOR_PARTS = 'Waiting for Parts',
  COMPLETED = 'Completed',
}

export type AccountType = 'Personal' | 'Business';

export interface MachineDetails {
  make: string;
  model: string;
  serialNumber: string;
  type: string; // e.g., Lawnmower, Chainsaw
  conditionNotes: string; // From AI or user
}

export interface CustomerDetails {
  id?: string; // Optional DB ID
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
}

export interface JobRecord {
  id: string; // The 4-digit alphanumeric code
  photos: string[]; // Base64 strings
  machine: MachineDetails;
  customer: CustomerDetails;
  service: ServiceRequest;
  status: JobStatus;
  createdAt: number;
}

export interface GeminiAnalysisResult {
  make: string;
  type: string;
  observedCondition: string;
}