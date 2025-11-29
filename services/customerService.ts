
import { CustomerDetails } from '../types';

// Mock database simulating records in a PostgreSQL DB
const MOCK_DB: CustomerDetails[] = [
  {
    id: 'DB-001',
    accountNumber: 'CUST-001',
    accountType: 'Personal',
    name: 'John Smith',
    address: '12 Oak Lane, Harden',
    postcode: 'HD1 2AB',
    email: 'john.smith@email.com',
    phone: '07700 900123'
  },
  {
    id: 'DB-002',
    accountNumber: 'BIZ-099',
    accountType: 'Business',
    companyName: 'Green Fingers Landscaping',
    name: 'Sarah Jones',
    address: 'Unit 5, Industrial Estate',
    postcode: 'HD4 5XY',
    email: 'accounts@greenfingers.co.uk',
    phone: '01484 555666'
  },
  {
    id: 'DB-003',
    accountNumber: 'CUST-042',
    accountType: 'Personal',
    name: 'Alice Cooper',
    address: '42 High Street',
    postcode: 'HD2 3CD',
    email: 'alice.c@example.com',
    phone: '07700 900456'
  },
  {
    id: 'DB-004',
    accountNumber: 'GOV-001',
    accountType: 'Business',
    companyName: 'City Parks Dept',
    name: 'Mike Ross',
    address: 'Civic Centre, Main Road',
    postcode: 'HD1 1AA',
    email: 'maintenance@citycouncil.gov.uk',
    phone: '01484 111222'
  }
];

export const searchCustomers = async (query: string): Promise<CustomerDetails[]> => {
  // Simulate network delay (Reduced for Live Search)
  await new Promise(resolve => setTimeout(resolve, 300));

  if (!query || query.trim().length < 2) return [];

  const lowerQuery = query.toLowerCase().trim();

  return MOCK_DB.filter(customer => {
    return (
      customer.name.toLowerCase().includes(lowerQuery) ||
      customer.email.toLowerCase().includes(lowerQuery) ||
      customer.phone.replace(/\s/g, '').includes(lowerQuery.replace(/\s/g, '')) ||
      customer.postcode.toLowerCase().replace(/\s/g, '').includes(lowerQuery.replace(/\s/g, '')) ||
      (customer.companyName && customer.companyName.toLowerCase().includes(lowerQuery)) ||
      (customer.accountNumber && customer.accountNumber.toLowerCase().includes(lowerQuery))
    );
  });
};

export const getCustomerByAccountNumber = async (accountNumber: string): Promise<CustomerDetails | null> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 400));
  
  if (!accountNumber) return null;
  const lowerAcc = accountNumber.toLowerCase().trim();

  return MOCK_DB.find(c => c.accountNumber?.toLowerCase() === lowerAcc) || null;
};

export const generateNewAccountNumber = async (name: string): Promise<string> => {
  // Simulate DB query latency
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Logic: First 2 Alpha chars + 3 digits sequential
  // 1. Extract first 2 letters
  const cleanName = name.replace(/[^a-zA-Z]/g, '');
  const prefix = (cleanName.length >= 2 ? cleanName.substring(0, 2) : cleanName.padEnd(2, 'X')).toUpperCase();

  // 2. Generate sequential number (simulated by DB length + 1)
  const nextSequence = MOCK_DB.length + 1;
  const suffix = nextSequence.toString().padStart(3, '0');

  return `${prefix}${suffix}`;
};

export const saveMockCustomer = async (customer: CustomerDetails): Promise<void> => {
  // Simulate INSERT into PostgreSQL
  const exists = MOCK_DB.some(c => c.accountNumber === customer.accountNumber);
  if (!exists) {
      MOCK_DB.push({
          ...customer,
          id: `DB-${Date.now()}` // Generate a mock internal DB ID
      });
  }
};

export const getAllCustomers = async (): Promise<CustomerDetails[]> => {
  // Simulate fetching all clients
  await new Promise(resolve => setTimeout(resolve, 300));
  return [...MOCK_DB];
};
