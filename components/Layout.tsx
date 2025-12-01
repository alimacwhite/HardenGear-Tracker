
import React from 'react';
import { Wrench, UserCircle, LayoutDashboard, Users, Settings, ShoppingBag, Package } from 'lucide-react';
import { UserRole, User } from '../types';
import { MOCK_USERS } from '../services/userService';

interface LayoutProps {
  children: React.ReactNode;
  currentUser: User;
  onSwitchUser: (user: User) => void;
  currentView: string;
  onNavigate: (view: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentUser, onSwitchUser, currentView, onNavigate }) => {
  
  // Define permission for Client Dashboard
  const showClientDashboard = [UserRole.MANAGER, UserRole.ADMIN, UserRole.OWNER].includes(currentUser.role);

  const navItems = [
    { id: 'dashboard', label: 'Workshop Dashboard', icon: LayoutDashboard },
    { id: 'sale', label: 'New Machine Sale', icon: ShoppingBag },
    { id: 'parts_sale', label: 'Parts Sale', icon: Package },
    // Only show Client Dashboard if user has permission
    ...(showClientDashboard ? [{ id: 'clients', label: 'Contact Dashboard', icon: Users }] : []),
    { id: 'control_panel', label: 'Control Panel', icon: Settings },
  ];

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

      {/* Navigation Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-[72px] sm:top-[76px] z-40 shadow-sm">
        <div className="max-w-5xl mx-auto px-4">
            <nav className="flex space-x-6 sm:space-x-8 overflow-x-auto" aria-label="Tabs">
                {navItems.map((item) => {
                     const Icon = item.icon;
                     const isActive = currentView === item.id || (currentView === 'intake' && item.id === 'dashboard');
                     
                     return (
                        <button
                          key={item.id}
                          onClick={() => onNavigate(item.id)}
                          className={`
                            group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors duration-200
                            ${isActive 
                               ? 'border-brand-500 text-brand-600'
                               : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }
                          `}
                        >
                           <Icon size={16} className={`mr-2 ${isActive ? 'text-brand-500' : 'text-gray-400 group-hover:text-gray-500'}`} />
                           {item.label}
                        </button>
                     )
                })}
            </nav>
        </div>
      </div>

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
