
import { MachineProduct } from '../types';

// Mock Product Database (PostgreSQL Simulation)
const MOCK_INVENTORY: MachineProduct[] = [
  {
    code: 'JD-X350',
    make: 'John Deere',
    model: 'X350',
    type: 'Ride-on Mower',
    price: 3499.00,
    warrantyYears: '3'
  },
  {
    code: 'HON-HRX',
    make: 'Honda',
    model: 'HRX537',
    type: 'Lawnmower',
    price: 1249.00,
    warrantyYears: '5'
  },
  {
    code: 'STI-MS181',
    make: 'Stihl',
    model: 'MS 181',
    type: 'Chainsaw',
    price: 349.00,
    warrantyYears: '2'
  },
  {
    code: 'HUS-129R',
    make: 'Husqvarna',
    model: '129R',
    type: 'Brushcutter',
    price: 299.00,
    warrantyYears: '2'
  },
  {
    code: 'MTD-990',
    make: 'MTD',
    model: 'Smart RF 125',
    type: 'Ride-on Mower',
    price: 1899.00,
    warrantyYears: '2'
  }
];

export const getProductByCode = async (code: string): Promise<MachineProduct | null> => {
  // Simulate DB network latency
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const normalizedCode = code.trim().toUpperCase();
  return MOCK_INVENTORY.find(p => p.code === normalizedCode) || null;
};
