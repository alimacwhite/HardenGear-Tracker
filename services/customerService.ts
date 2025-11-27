import { CustomerDetails } from '../types';

// Mock database simulating records in a PostgreSQL DB
const MOCK_DB: CustomerDetails[] = [
  {
    id: 'CUST-001',
    accountType: 'Personal',
    name: 'John Smith',
    address: '12 Oak Lane, Harden',
    postcode: 'HD1 2AB',
    email: 'john.smith@email.com',
    phone: '07700 900123'
  },
  {
    id: 'CUST-002',
    accountType: 'Business',
    companyName: 'Green Fingers Landscaping',
    name: 'Sarah Jones',
    address: 'Unit 5, Industrial Estate',
    postcode: 'HD4 5XY',
    email: 'accounts@greenfingers.co.uk',
    phone: '01484 555666'
  },
  {
    id: 'CUST-003',
    accountType: 'Personal',
    name: 'Alice Cooper',
    address: '42 High Street',
    postcode: 'HD2 3CD',
    email: 'alice.c@example.com',
    phone: '07700 900456'
  },
  {
    id: 'CUST-004',
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
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 600));

  if (!query || query.trim().length < 2) return [];

  const lowerQuery = query.toLowerCase().trim();

  return MOCK_DB.filter(customer => {
    return (
      customer.name.toLowerCase().includes(lowerQuery) ||
      customer.email.toLowerCase().includes(lowerQuery) ||
      customer.phone.replace(/\s/g, '').includes(lowerQuery.replace(/\s/g, '')) ||
      customer.postcode.toLowerCase().replace(/\s/g, '').includes(lowerQuery.replace(/\s/g, '')) ||
      (customer.companyName && customer.companyName.toLowerCase().includes(lowerQuery))
    );
  });
};