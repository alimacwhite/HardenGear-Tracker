import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import JobCard from './components/JobCard';
import IntakeForm from './components/IntakeForm';
import { JobRecord, JobStatus } from './types';
import { Plus, Search, Filter } from 'lucide-react';

const App: React.FC = () => {
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
    setJobs(prev => [newJob, ...prev]);
    setView('dashboard');
  };

  const handleStatusChange = (id: string, newStatus: JobStatus) => {
    setJobs(prevJobs => prevJobs.map(job => 
      job.id === id ? { ...job, status: newStatus } : job
    ));
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = 
      job.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.customer.companyName && job.customer.companyName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      job.machine.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'ALL' || job.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <Layout>
      {view === 'dashboard' ? (
        <div className="space-y-6">
          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
             <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto flex-grow sm:max-w-xl">
               <div className="relative w-full sm:w-64">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={16} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search jobs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 block w-full rounded-lg border-gray-300 bg-white border shadow-sm focus:border-brand-500 focus:ring-brand-500 py-2 text-sm"
                  />
               </div>

               <div className="relative w-full sm:w-48">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Filter size={16} className="text-gray-400" />
                 </div>
                 <select
                   value={filterStatus}
                   onChange={(e) => setFilterStatus(e.target.value as JobStatus | 'ALL')}
                   className="pl-10 block w-full rounded-lg border-gray-300 bg-white border shadow-sm focus:border-brand-500 focus:ring-brand-500 py-2 text-sm appearance-none"
                 >
                   <option value="ALL">All Statuses</option>
                   {Object.values(JobStatus).map((status) => (
                     <option key={status} value={status}>{status}</option>
                   ))}
                 </select>
               </div>
             </div>
             
             <button
              onClick={() => setView('intake')}
              className="w-full sm:w-auto flex items-center justify-center px-4 py-2.5 bg-brand-600 text-white rounded-lg shadow-md hover:bg-brand-700 transition-colors font-medium whitespace-nowrap"
             >
               <Plus size={18} className="mr-2" />
               New Booking
             </button>
          </div>

          {/* Job List */}
          {filteredJobs.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl border border-gray-200 border-dashed">
              <h3 className="text-gray-500 font-medium">No jobs found</h3>
              <p className="text-gray-400 text-sm mt-1">
                {searchTerm || filterStatus !== 'ALL' 
                  ? "Try adjusting your search or filters." 
                  : "Start by adding a new service booking."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredJobs.map(job => (
                <JobCard 
                  key={job.id} 
                  job={job} 
                  onStatusChange={handleStatusChange}
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