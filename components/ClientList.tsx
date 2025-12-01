
import React, { useEffect, useState } from 'react';
import { CustomerDetails, User, UserRole, AccountType } from '../types';
import { getAllCustomers, updateCustomer } from '../services/customerService';
import { Loader2, Search, Building2, User as UserIcon, Mail, Phone, MapPin, Edit, Save, X } from 'lucide-react';

interface ClientListProps {
    currentUser: User;
}

const ClientList: React.FC<ClientListProps> = ({ currentUser }) => {
  const [clients, setClients] = useState<CustomerDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Edit State
  const [editingClient, setEditingClient] = useState<CustomerDetails | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchClients();
  }, []);

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

  const handleEditClick = (client: CustomerDetails) => {
      setEditingClient({ ...client });
  };

  const handleSave = async () => {
      if (!editingClient) return;
      setIsSaving(true);
      try {
          await updateCustomer(editingClient);
          await fetchClients(); // Refresh list
          setEditingClient(null);
      } catch (e) {
          alert("Failed to save client details");
      } finally {
          setIsSaving(false);
      }
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.companyName?.toLowerCase().includes(search.toLowerCase()) ||
    c.accountNumber?.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  const canEdit = [UserRole.ADMIN, UserRole.OWNER, UserRole.MANAGER].includes(currentUser.role);

  if (loading) {
    return (
        <div className="flex items-center justify-center h-64">
            <Loader2 size={32} className="animate-spin text-brand-600" />
        </div>
    );
  }

  return (
    <div className="space-y-6 relative">
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
                        {canEdit && <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {filteredClients.map((client) => (
                        <tr key={client.id || client.accountNumber} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${client.accountType === 'Business' ? 'bg-purple-100 text-purple-600' : 'bg-green-100 text-green-600'}`}>
                                        {client.accountType === 'Business' ? <Building2 size={16} /> : <UserIcon size={16} />}
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
                            {canEdit && (
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button 
                                        onClick={() => handleEditClick(client)}
                                        className="text-brand-600 hover:text-brand-900 flex items-center justify-end w-full"
                                    >
                                        <Edit size={16} />
                                    </button>
                                </td>
                            )}
                        </tr>
                    ))}
                    {filteredClients.length === 0 && (
                        <tr>
                            <td colSpan={canEdit ? 5 : 4} className="px-6 py-8 text-center text-gray-500 text-sm">
                                No clients found matching your search.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editingClient && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
                  <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                      <h3 className="text-lg font-bold text-gray-900">Edit Client Details</h3>
                      <button onClick={() => setEditingClient(null)} className="text-gray-400 hover:text-gray-600">
                          <X size={20} />
                      </button>
                  </div>
                  
                  <div className="p-6 overflow-y-auto space-y-4">
                      
                      {/* Account Type Toggle */}
                      <div className="bg-brand-50 p-3 rounded-lg border border-brand-100">
                          <label className="block text-xs font-bold text-brand-800 uppercase mb-2">Account Grouping</label>
                          <div className="flex gap-4">
                              <label className="flex items-center space-x-2 cursor-pointer">
                                  <input 
                                      type="radio" 
                                      checked={editingClient.accountType === 'Personal'}
                                      onChange={() => setEditingClient({...editingClient, accountType: 'Personal', companyName: ''})}
                                      className="text-brand-600 focus:ring-brand-500"
                                  />
                                  <span className="text-sm font-medium flex items-center text-gray-700">
                                      <UserIcon size={14} className="mr-1" /> Personal
                                  </span>
                              </label>
                              <label className="flex items-center space-x-2 cursor-pointer">
                                  <input 
                                      type="radio" 
                                      checked={editingClient.accountType === 'Business'}
                                      onChange={() => setEditingClient({...editingClient, accountType: 'Business'})}
                                      className="text-brand-600 focus:ring-brand-500"
                                  />
                                  <span className="text-sm font-medium flex items-center text-gray-700">
                                      <Building2 size={14} className="mr-1" /> Business
                                  </span>
                              </label>
                          </div>
                      </div>

                      {editingClient.accountType === 'Business' && (
                          <div>
                              <label className="block text-sm font-medium text-gray-700">Company Name</label>
                              <input 
                                  type="text" 
                                  value={editingClient.companyName || ''}
                                  onChange={(e) => setEditingClient({...editingClient, companyName: e.target.value})}
                                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 p-2 border"
                              />
                          </div>
                      )}

                      <div>
                          <label className="block text-sm font-medium text-gray-700">
                              {editingClient.accountType === 'Business' ? 'Contact Name' : 'Full Name'}
                          </label>
                          <input 
                              type="text" 
                              value={editingClient.name}
                              onChange={(e) => setEditingClient({...editingClient, name: e.target.value})}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 p-2 border"
                          />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                           <div>
                              <label className="block text-sm font-medium text-gray-700">Email</label>
                              <input 
                                  type="email" 
                                  value={editingClient.email}
                                  onChange={(e) => setEditingClient({...editingClient, email: e.target.value})}
                                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 p-2 border"
                              />
                           </div>
                           <div>
                              <label className="block text-sm font-medium text-gray-700">Phone</label>
                              <input 
                                  type="tel" 
                                  value={editingClient.phone}
                                  onChange={(e) => setEditingClient({...editingClient, phone: e.target.value})}
                                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 p-2 border"
                              />
                           </div>
                      </div>

                      <div>
                          <label className="block text-sm font-medium text-gray-700">Address</label>
                          <textarea 
                              rows={2}
                              value={editingClient.address}
                              onChange={(e) => setEditingClient({...editingClient, address: e.target.value})}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 p-2 border"
                          />
                      </div>

                      <div>
                          <label className="block text-sm font-medium text-gray-700">Postcode</label>
                          <input 
                              type="text" 
                              value={editingClient.postcode}
                              onChange={(e) => setEditingClient({...editingClient, postcode: e.target.value})}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 p-2 border"
                          />
                      </div>

                  </div>

                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                      <button 
                          onClick={() => setEditingClient(null)}
                          className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                          Cancel
                      </button>
                      <button 
                          onClick={handleSave}
                          disabled={isSaving}
                          className="px-4 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm flex items-center disabled:opacity-50"
                      >
                          {isSaving ? (
                              <Loader2 size={16} className="animate-spin mr-2" />
                          ) : (
                              <Save size={16} className="mr-2" />
                          )}
                          Save Changes
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default ClientList;
