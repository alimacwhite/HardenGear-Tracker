import React from 'react';
import { Wrench, LayoutDashboard, Users, Settings, ShoppingBag, Package, LogOut, ChevronDown } from 'lucide-react';
import { UserRole } from '../types';
import { useAuth } from '../context/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
  currentView: string;
  onNavigate: (view: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentView, onNavigate }) => {
  const { user, logout } = useAuth();
  
  if (!user) return null;

  // Define permission for Client Dashboard
  const showClientDashboard = [UserRole.MANAGER, UserRole.ADMIN, UserRole.OWNER].includes(user.role);

  const navItems = [
    { id: 'dashboard', label: 'Workshop Dashboard', icon: LayoutDashboard },
    { id: 'sale', label: 'New Machine Sale', icon: ShoppingBag },
    { id: 'parts_sale', label: 'Parts Sale', icon: Package },
    ...(showClientDashboard ? [{ id: 'clients', label: 'Contact Dashboard', icon: Users }] : []),
    { id: 'control_panel', label: 'Control Panel', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Mobile-first Header */}
      <header className="bg-brand-700 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="bg-white/20 p-2 rounded-full">
                <Wrench size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">HardenEquipment</h1>
              <p className="text-[10px] text-brand-200 uppercase tracking-wider font-semibold leading-none">Service Tracker</p>
            </div>
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-3 bg-brand-800/50 pl-3 pr-4 py-1.5 rounded-full border border-brand-600/30">
                 <img 
                    src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.name}&background=random`} 
                    alt={user.name} 
                    className="w-8 h-8 rounded-full border-2 border-brand-400"
                 />
                 <div className="flex flex-col">
                     <span className="text-xs font-bold text-white leading-tight">{user.name}</span>
                     <span className="text-[10px] text-brand-300 font-medium uppercase">{user.role}</span>
                 </div>
             </div>
             
             <button 
                onClick={logout}
                className="p-2 text-brand-200 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                title="Sign Out"
             >
                <LogOut size={18} />
             </button>
          </div>
        </div>
      </header>

      {/* Navigation Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-[70px] sm:top-[66px] z-40 shadow-sm">
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
        <p>&copy; {new Date().getFullYear()} HardenEquipment. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Layout;