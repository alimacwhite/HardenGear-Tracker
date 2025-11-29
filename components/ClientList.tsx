
import React, { useEffect, useState } from 'react';
import { CustomerDetails } from '../types';
import { getAllCustomers } from '../services/customerService';
import { Loader2, Search, Building2, User, Mail, Phone, MapPin } from 'lucide-react';

const ClientList: React.FC = () => {
  const [clients, setClients] = useState<CustomerDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const data = await getAllCustomers();
        setClients(data);
      } catch (error) {
        console.error("Failed to load clients", error);
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, []);

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.companyName?.toLowerCase().includes(search.toLowerCase()) ||
    c.accountNumber?.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
        <div className="flex items-center justify-center h-64">
            <Loader2 size={32} className="animate-spin text-brand-600" />
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-bold text-gray-900">Client Details</h2>
        <div className="relative w-full sm:w-64">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-gray-400" />
             </div>
             <input 
                type="text" 
                placeholder="Search clients..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 block w-full rounded-lg border-gray-300 bg-white shadow-sm focus:border-brand-500 focus:ring-brand-500 text-sm py-2 border"
             />
        </div>
      </div>

      <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {filteredClients.map((client) => (
                        <tr key={client.id || client.accountNumber} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${client.accountType === 'Business' ? 'bg-purple-100 text-purple-600' : 'bg-green-100 text-green-600'}`}>
                                        {client.accountType === 'Business' ? <Building2 size={16} /> : <User size={16} />}
                                    </div>
                                    <div className="ml-4">
                                        <div className="text-sm font-medium text-gray-900">
                                            {client.accountType === 'Business' ? client.companyName : client.name}
                                        </div>
                                        <div className="text-xs text-gray-500">{client.accountType}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{client.name}</div>
                                <div className="flex flex-col gap-0.5 mt-0.5">
                                    <div className="flex items-center text-xs text-gray-500">
                                        <Mail size={12} className="mr-1" /> {client.email}
                                    </div>
                                    <div className="flex items-center text-xs text-gray-500">
                                        <Phone size={12} className="mr-1" /> {client.phone}
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900 truncate max-w-[150px]" title={client.address}>{client.address}</div>
                                <div className="flex items-center text-xs text-gray-500 mt-0.5">
                                    <MapPin size={12} className="mr-1" /> {client.postcode}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 font-mono border border-gray-200">
                                    {client.accountNumber || 'N/A'}
                                </span>
                            </td>
                        </tr>
                    ))}
                    {filteredClients.length === 0 && (
                        <tr>
                            <td colSpan={4} className="px-6 py-8 text-center text-gray-500 text-sm">
                                No clients found matching your search.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default ClientList;
