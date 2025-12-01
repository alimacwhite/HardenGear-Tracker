
import { MachineProduct } from '../types';

// Mock Product Database (PostgreSQL Simulation)
// Contains both Whole Machines and Spare Parts
const MOCK_INVENTORY: MachineProduct[] = [
  // Machines
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
  // Parts
  {
    code: 'NGK-BPR6ES',
    make: 'NGK',
    model: 'BPR6ES',
    type: 'Spark Plug',
    price: 4.50,
    warrantyYears: '0'
  },
  {
    code: 'HON-FILTER',
    make: 'Honda',
    model: '17210-ZE1',
    type: 'Air Filter',
    price: 12.99,
    warrantyYears: '0'
  },
  {
    code: 'JD-BLADE',
    make: 'John Deere',
    model: 'M1459',
    type: 'Mower Blade (42")',
    price: 24.50,
    warrantyYears: '0'
  },
  {
    code: 'OIL-10W30',
    make: 'Generic',
    model: '1L Bottle',
    type: 'Engine Oil 10W-30',
    price: 8.99,
    warrantyYears: '0'
  }
];

export const getProductByCode = async (code: string): Promise<MachineProduct | null> => {
  // Simulate DB network latency
  await new Promise(resolve => setTimeout(resolve, 500));
  
  if (!code) return null;
  const normalizedCode = code.trim().toUpperCase();
  return MOCK_INVENTORY.find(p => p.code === normalizedCode) || null;
};
