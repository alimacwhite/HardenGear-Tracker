import React from 'react';
import { Wrench } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Mobile-first Header */}
      <header className="bg-brand-700 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-white/20 p-2 rounded-full">
                <Wrench size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">HardenGear</h1>
              <p className="text-xs text-brand-200 uppercase tracking-wider font-semibold">Service Tracker</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow p-4 md:p-6 max-w-5xl mx-auto w-full">
        {children}
      </main>

      <footer className="bg-gray-800 text-gray-400 py-6 text-center text-sm">
        <p>&copy; {new Date().getFullYear()} HardenGear Repairs. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Layout;