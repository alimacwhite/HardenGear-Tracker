
import React from 'react';
import ClientList from './ClientList';
import { Users, FileText, PieChart } from 'lucide-react';
import { User } from '../types';

interface ClientDashboardProps {
  currentUser: User;
}

const ClientDashboard: React.FC<ClientDashboardProps> = ({ currentUser }) => {
  return (
    <div className="space-y-6">
       {/* Dashboard Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Client Dashboard</h2>
      </div>

      {/* Dashboard Metrics / Quick Stats Placeholder */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-full mr-4">
                <Users size={24} />
            </div>
            <div>
                <p className="text-sm text-gray-500 font-medium">Total Clients</p>
                <p className="text-xl font-bold text-gray-900">4</p>
            </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center">
            <div className="p-3 bg-purple-100 text-purple-600 rounded-full mr-4">
                <FileText size={24} />
            </div>
            <div>
                <p className="text-sm text-gray-500 font-medium">Active Accounts</p>
                <p className="text-xl font-bold text-gray-900">4</p>
            </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center">
            <div className="p-3 bg-green-100 text-green-600 rounded-full mr-4">
                <PieChart size={24} />
            </div>
            <div>
                <p className="text-sm text-gray-500 font-medium">Growth (MoM)</p>
                <p className="text-xl font-bold text-gray-900">+12%</p>
            </div>
        </div>
      </div>

      {/* Embedded Client Details View */}
      <div className="border-t border-gray-200 pt-6">
         <ClientList currentUser={currentUser} />
      </div>
    </div>
  );
};

export default ClientDashboard;
