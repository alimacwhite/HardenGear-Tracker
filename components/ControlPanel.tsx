
import React, { useState } from 'react';
import { Settings, Shield, Database, Bell, Users, Wrench, Trash2, Edit, Plus, Lock } from 'lucide-react';
import { User, UserRole } from '../types';
import { MOCK_USERS } from '../services/userService';

interface ControlPanelProps {
    currentUser: User;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ currentUser }) => {
  const [showUserList, setShowUserList] = useState(false);

  // Permission Logic
  const canManageUsers = [UserRole.ADMIN, UserRole.OWNER].includes(currentUser.role);
  const canViewUsers = [UserRole.ADMIN, UserRole.OWNER, UserRole.MANAGER].includes(currentUser.role);
  const canConfigureSystem = [UserRole.ADMIN, UserRole.OWNER].includes(currentUser.role);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">Control Panel</h2>
        <span className="px-3 py-1 bg-brand-100 text-brand-800 rounded-full text-xs font-semibold">
            v1.0.5-beta
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* System Status Card - Visible to all */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center mb-4">
                <div className="p-2 bg-green-100 text-green-600 rounded-lg mr-3">
                    <Database size={20} />
                </div>
                <h3 className="font-bold text-gray-800">System Status</h3>
            </div>
            <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Database Connection</span>
                    <span className="text-green-600 font-medium flex items-center"><span className="w-2 h-2 bg-green-500 rounded-full mr-1.5"></span>Active</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">API Latency</span>
                    <span className="text-gray-800 font-medium">45ms</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">AI Service</span>
                    <span className="text-green-600 font-medium">Operational</span>
                </div>
            </div>
        </div>

        {/* User Management Card - Permission Based */}
        {canViewUsers ? (
            <div className={`bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col ${showUserList ? 'lg:col-span-2' : ''} transition-all duration-300`}>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg mr-3">
                            <Users size={20} />
                        </div>
                        <h3 className="font-bold text-gray-800">User Profiles</h3>
                    </div>
                    {!canManageUsers && (
                        <div className="flex items-center text-xs text-gray-400" title="View Only Permission">
                            <Lock size={12} className="mr-1" /> View Only
                        </div>
                    )}
                </div>
                
                <p className="text-sm text-gray-500 mb-4">
                    {canManageUsers ? "Manage staff access, roles, and system permissions." : "View active staff members and roles."}
                </p>

                {!showUserList ? (
                     <div className="flex gap-2 mt-auto">
                        <button 
                            onClick={() => setShowUserList(true)}
                            className="flex-1 px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-medium rounded border border-gray-200 transition-colors"
                        >
                            View Staff List
                        </button>
                        {canManageUsers && (
                            <button className="flex-1 px-3 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded shadow-sm transition-colors flex items-center justify-center">
                                <Plus size={16} className="mr-1" /> Add User
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="mt-2 animate-in fade-in slide-in-from-top-2">
                         <div className="overflow-x-auto border border-gray-200 rounded-lg">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                                        {canManageUsers && <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {MOCK_USERS.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-2 text-sm text-gray-900 font-medium">{user.name}</td>
                                            <td className="px-4 py-2 text-sm text-gray-500">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium 
                                                    ${user.role === UserRole.ADMIN || user.role === UserRole.OWNER ? 'bg-purple-100 text-purple-800' : 
                                                      user.role === UserRole.MANAGER ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            {canManageUsers && (
                                                <td className="px-4 py-2 text-right text-sm">
                                                    <button className="text-gray-400 hover:text-brand-600 mr-2"><Edit size={14} /></button>
                                                    <button className="text-gray-400 hover:text-red-600"><Trash2 size={14} /></button>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                         </div>
                         <div className="mt-4 flex justify-end">
                            <button 
                                onClick={() => setShowUserList(false)}
                                className="text-xs text-gray-500 hover:text-gray-700 underline"
                            >
                                Close List
                            </button>
                         </div>
                    </div>
                )}
            </div>
        ) : (
             // Placeholder for permission denied or hidden
             <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 border-dashed flex flex-col items-center justify-center text-center opacity-60">
                 <Shield size={24} className="text-gray-400 mb-2" />
                 <h3 className="font-bold text-gray-500">User Management</h3>
                 <p className="text-xs text-gray-400 mt-1">Access Restricted to Administrators</p>
             </div>
        )}

        {/* Configuration */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center mb-4">
                <div className="p-2 bg-orange-100 text-orange-600 rounded-lg mr-3">
                    <Settings size={20} />
                </div>
                <h3 className="font-bold text-gray-800">Configuration</h3>
            </div>
            {canConfigureSystem ? (
                <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center cursor-pointer hover:text-brand-600 transition-colors py-1">
                        <Shield size={14} className="mr-2" /> Security Settings
                    </li>
                    <li className="flex items-center cursor-pointer hover:text-brand-600 transition-colors py-1">
                        <Bell size={14} className="mr-2" /> Notifications
                    </li>
                    <li className="flex items-center cursor-pointer hover:text-brand-600 transition-colors py-1">
                        <Wrench size={14} className="mr-2" /> Workflow Types
                    </li>
                </ul>
            ) : (
                <div className="text-sm text-gray-400 italic">
                    <p>System configuration is restricted to Admin users.</p>
                </div>
            )}
        </div>
      </div>
      
      {/* Reporting - Visible to Managers+ */}
      {canViewUsers && (
        <div className="bg-brand-50 border border-brand-100 rounded-xl p-6 text-center">
            <p className="text-brand-800 font-medium">Advanced Reporting Module</p>
            <p className="text-brand-600 text-sm mt-1">Generate monthly workshop performance reports.</p>
            <button className="mt-4 px-4 py-2 bg-white text-brand-700 border border-brand-200 rounded-lg shadow-sm text-sm font-medium hover:bg-brand-50 hover:border-brand-300 transition-all">
                Generate Report
            </button>
        </div>
      )}
    </div>
  );
};

export default ControlPanel;
