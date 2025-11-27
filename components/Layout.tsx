import React from 'react';
import { Wrench, UserCircle } from 'lucide-react';
import { UserRole, User } from '../types';
import { MOCK_USERS } from '../services/userService';

interface LayoutProps {
  children: React.ReactNode;
  currentUser: User;
  onSwitchUser: (user: User) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentUser, onSwitchUser }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Mobile-first Header */}
      <header className="bg-brand-700 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="bg-white/20 p-2 rounded-full">
                <Wrench size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">HardenGear</h1>
              <p className="text-xs text-brand-200 uppercase tracking-wider font-semibold">Service Tracker</p>
            </div>
          </div>

          {/* User Role Switcher for Demo */}
          <div className="flex items-center bg-brand-800 rounded-lg p-1 pr-3">
             <div className="bg-brand-600 p-1.5 rounded mr-2">
                <UserCircle size={16} />
             </div>
             <div className="flex flex-col">
                <label className="text-[10px] text-brand-300 uppercase font-bold">Current User</label>
                <select 
                    value={currentUser.id}
                    onChange={(e) => {
                        const user = MOCK_USERS.find(u => u.id === e.target.value);
                        if (user) onSwitchUser(user);
                    }}
                    className="bg-transparent text-sm font-medium focus:outline-none cursor-pointer text-white border-none p-0 appearance-none"
                >
                    {MOCK_USERS.map(user => (
                        <option key={user.id} value={user.id} className="text-gray-900">
                            {user.name} ({user.role})
                        </option>
                    ))}
                </select>
             </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow p-4 md:p-6 max-w-5xl mx-auto w-full">
        {children}
      </main>

      <footer className="bg-gray-800 text-gray-400 py-6 text-center text-sm">
        <p>&copy; {new Date().getFullYear()} HardenGear. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Layout;