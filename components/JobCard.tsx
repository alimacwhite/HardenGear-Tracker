import React, { useState } from 'react';
import { JobRecord, JobStatus } from '../types';
import { Calendar, User, FileText, AlertCircle, ChevronDown, ChevronUp, Building2 } from 'lucide-react';

interface JobCardProps {
  job: JobRecord;
  onStatusChange: (id: string, newStatus: JobStatus) => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, onStatusChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const statusColors = {
    [JobStatus.INTAKE]: 'bg-blue-100 text-blue-800 border-blue-200',
    [JobStatus.IN_PROGRESS]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    [JobStatus.WAITING_FOR_PARTS]: 'bg-orange-100 text-orange-800 border-orange-200',
    [JobStatus.COMPLETED]: 'bg-green-100 text-green-800 border-green-200',
  };

  const hasAdditionalNotes = job.machine.conditionNotes || job.service.customerRequirements;
  const isBusiness = job.customer.accountType === 'Business';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row">
        {/* Image Section */}
        <div className="sm:w-32 h-32 sm:h-auto relative bg-gray-100 shrink-0 overflow-hidden">
          {job.photos.length > 0 ? (
            <img 
              src={`data:image/jpeg;base64,${job.photos[0]}`} 
              alt={job.machine.model}
              className="w-full h-full object-cover transition-transform duration-500 ease-in-out hover:scale-110"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <FileText size={24} />
            </div>
          )}
          <div className="absolute top-2 left-2 bg-black/70 text-white text-xs font-mono px-2 py-1 rounded z-10">
            #{job.id}
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4 flex-grow flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-gray-900 text-lg">
                {job.machine.make} {job.machine.model}
              </h3>
              
              <div className={`relative inline-flex items-center rounded-full border ${statusColors[job.status]}`}>
                <select 
                    value={job.status}
                    onChange={(e) => onStatusChange(job.id, e.target.value as JobStatus)}
                    className="appearance-none bg-transparent pl-3 pr-7 py-0.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-1 rounded-full cursor-pointer w-full"
                >
                    {Object.values(JobStatus).map((status) => (
                        <option key={status} value={status} className="bg-white text-gray-900 text-sm">
                            {status}
                        </option>
                    ))}
                </select>
                <ChevronDown size={12} className="absolute right-2 pointer-events-none opacity-70" /> 
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1 gap-x-4 text-sm text-gray-600 mb-3">
              <div className="flex items-center">
                 {isBusiness ? <Building2 size={14} className="mr-2 text-gray-400" /> : <User size={14} className="mr-2 text-gray-400" />}
                 <div className="truncate">
                    <span className="font-medium">{isBusiness ? job.customer.companyName : job.customer.name}</span>
                    {isBusiness && <span className="text-gray-400 text-xs ml-1">({job.customer.name})</span>}
                 </div>
              </div>
              <div className="flex items-center">
                <Calendar size={14} className="mr-2 text-gray-400" />
                <span>{job.service.bookingDate}</span>
              </div>
            </div>

             {job.service.knownIssues && (
                <div className="flex items-start text-xs text-red-600 bg-red-50 p-2 rounded mb-2">
                    <AlertCircle size={14} className="mr-1.5 mt-0.5 shrink-0" />
                    <span className="line-clamp-2">Issue: {job.service.knownIssues}</span>
                </div>
            )}

            {/* Additional Notes Section */}
            {hasAdditionalNotes && (
              <div className="border-t border-gray-100 pt-2">
                <button 
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="flex items-center w-full text-xs font-medium text-gray-500 hover:text-brand-600 transition-colors focus:outline-none"
                >
                  <span className="flex-grow text-left">
                    {isExpanded ? 'Hide' : 'Show'} Additional Notes
                  </span>
                  {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                
                {isExpanded && (
                  <div className="mt-2 space-y-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg animate-in slide-in-from-top-2 fade-in duration-200">
                     {job.machine.conditionNotes && (
                       <div>
                         <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Condition</p>
                         <p className="text-gray-800 text-xs sm:text-sm">{job.machine.conditionNotes}</p>
                       </div>
                     )}
                     
                     {job.service.customerRequirements && (
                       <div className={job.machine.conditionNotes ? "border-t border-gray-200 pt-2" : ""}>
                         <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Requirements</p>
                         <p className="text-gray-800 text-xs sm:text-sm">{job.service.customerRequirements}</p>
                       </div>
                     )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobCard;