
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import JobCard from './components/JobCard';
import IntakeForm from './components/IntakeForm';
import { JobRecord, JobStatus, UserRole, User, JobHistoryEntry } from './types';
import { Plus, Search, Filter } from 'lucide-react';
import { MOCK_USERS } from './services/userService';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User>(MOCK_USERS[0]); 
  const [view, setView] = useState<'dashboard' | 'intake'>('dashboard');
  const [jobs, setJobs] = useState<JobRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<JobStatus | 'ALL'>('ALL');

  // Load jobs from local storage on mount
  useEffect(() => {
    const savedJobs = localStorage.getItem('garden_gear_jobs');
    if (savedJobs) {
      try {
        setJobs(JSON.parse(savedJobs));
      } catch (e) {
        console.error("Failed to parse jobs", e);
      }
    }
  }, []);

  // Save jobs whenever they change
  useEffect(() => {
    localStorage.setItem('garden_gear_jobs', JSON.stringify(jobs));
  }, [jobs]);

  const handleSaveJob = (newJob: JobRecord) => {
    // Add initial history entry for creation
    const jobWithHistory: JobRecord = {
        ...newJob,
        history: [{
            timestamp: Date.now(),
            action: 'Job Created',
            userId: currentUser.id,
            userName: currentUser.name
        }]
    };
    setJobs(prev => [jobWithHistory, ...prev]);
    setView('dashboard');
  };

  const handleStatusChange = (id: string, newStatus: JobStatus) => {
    setJobs(prevJobs => prevJobs.map(job => {
      if (job.id === id) {
          const newHistoryItem: JobHistoryEntry = {
              timestamp: Date.now(),
              action: `Status updated to ${newStatus}`,
              userId: currentUser.id,
              userName: currentUser.name
          };
          return { 
              ...job, 
              status: newStatus,
              history: [...(job.history || []), newHistoryItem]
          };
      }
      return job;
    }));
  };

  const handleAssignMechanic = (jobId: string, mechanicName: string) => {
    setJobs(prevJobs => prevJobs.map(job => {
        if (job.id === jobId) {
            const newHistoryItem: JobHistoryEntry = {
                timestamp: Date.now(),
                action: mechanicName ? `Assigned to mechanic: ${mechanicName}` : `Mechanic unassigned`,
                userId: currentUser.id,
                userName: currentUser.name
            };
            return { 
                ...job, 
                assignedMechanic: mechanicName,
                history: [...(job.history || []), newHistoryItem]
            };
        }
        return job;
    }));
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = 
      job.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.customer.companyName && job.customer.companyName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (job.customer.accountNumber && job.customer.accountNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      job.machine.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'ALL' || job.status === filterStatus;
    
    // Role-based filtering
    let matchesRole = true;
    if (currentUser.role === UserRole.MECHANIC) {
        // Mechanics primarily see jobs assigned to them
        matchesRole = job.assignedMechanic === currentUser.name;
    } 
    // Counter, Managers, Admin, and Owner see all jobs.

    return matchesSearch && matchesStatus && matchesRole;
  });

  const canCreateBooking = [UserRole.COUNTER, UserRole.MANAGER, UserRole.ADMIN, UserRole.OWNER].includes(currentUser.role);

  return (
    <Layout currentUser={currentUser} onSwitchUser={setCurrentUser}>
      {view === 'dashboard' ? (
        <div className="space-y-6">
          {/* Welcome Message */}
          <div className="flex justify-between items-center">
             <h2 className="text-lg font-bold text-gray-800">
                {currentUser.role === UserRole.MECHANIC ? 'My Assigned Jobs' : 'Workshop Dashboard'}
             </h2>
             {canCreateBooking && (
                 <button
                  onClick={() => setView('intake')}
                  className="flex items-center justify-center px-4 py-2 bg-brand-600 text-white rounded-lg shadow-md hover:bg-brand-700 transition-colors font-medium text-sm"
                 >
                   <Plus size={16} className="mr-2" />
                   New Booking
                 </button>
             )}
          </div>

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
             <div className="flex flex-col sm:flex-row gap-2 w-full">
               <div className="relative flex-grow">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={16} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search jobs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 block w-full rounded-lg border-gray-300 bg-gray-50 border shadow-sm focus:border-brand-500 focus:ring-brand-500 py-2 text-sm"
                  />
               </div>

               <div className="relative w-full sm:w-48">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Filter size={16} className="text-gray-400" />
                 </div>
                 <select
                   value={filterStatus}
                   onChange={(e) => setFilterStatus(e.target.value as JobStatus | 'ALL')}
                   className="pl-10 block w-full rounded-lg border-gray-300 bg-gray-50 border shadow-sm focus:border-brand-500 focus:ring-brand-500 py-2 text-sm appearance-none"
                 >
                   <option value="ALL">All Statuses</option>
                   {Object.values(JobStatus).map((status) => (
                     <option key={status} value={status}>{status}</option>
                   ))}
                 </select>
               </div>
             </div>
          </div>

          {/* Job List */}
          {filteredJobs.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl border border-gray-200 border-dashed">
              <h3 className="text-gray-500 font-medium">No jobs found</h3>
              <p className="text-gray-400 text-sm mt-1">
                {currentUser.role === UserRole.MECHANIC 
                    ? "You have no assigned jobs." 
                    : "Try adjusting your search or filters."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredJobs.map(job => (
                <JobCard 
                  key={job.id} 
                  job={job} 
                  currentUserRole={currentUser.role}
                  onStatusChange={handleStatusChange}
                  onAssignMechanic={handleAssignMechanic}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="max-w-2xl mx-auto h-[calc(100vh-140px)]">
            <IntakeForm 
              onSave={handleSaveJob} 
              onCancel={() => setView('dashboard')} 
            />
        </div>
      )}
    </Layout>
  );
};

export default App;
