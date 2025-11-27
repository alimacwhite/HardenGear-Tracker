import React, { useState } from 'react';
import { JobRecord, JobStatus, UserRole } from '../types';
import { Calendar, User, FileText, AlertCircle, ChevronDown, ChevronUp, Building2, ClipboardList, HardHat } from 'lucide-react';
import { getMechanics } from '../services/userService';

interface JobCardProps {
  job: JobRecord;
  currentUserRole: UserRole;
  onStatusChange: (id: string, newStatus: JobStatus) => void;
  onAssignMechanic: (id: string, mechanicId: string) => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, currentUserRole, onStatusChange, onAssignMechanic }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const statusColors = {
    [JobStatus.INTAKE]: 'bg-blue-100 text-blue-800 border-blue-200',
    [JobStatus.IN_PROGRESS]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    [JobStatus.WAITING_FOR_PARTS]: 'bg-orange-100 text-orange-800 border-orange-200',
    [JobStatus.COMPLETED]: 'bg-green-100 text-green-800 border-green-200',
  };

  const hasAdditionalNotes = job.machine.conditionNotes || job.service.customerRequirements || job.service.suggestedRepairPlan;
  const isBusiness = job.customer.accountType === 'Business';
  const mechanics = getMechanics();

  // Permissions
  const canAssign = currentUserRole === UserRole.MANAGER;
  const canChangeStatus = currentUserRole === UserRole.MANAGER || currentUserRole === UserRole.MECHANIC;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row">
        {/* Image Section */}
        <div className="sm:w-32 h-32 sm:h-auto relative bg-gray-100 shrink-0 overflow-hidden group">
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
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 gap-2">
              <h3 className="font-bold text-gray-900 text-lg">
                {job.machine.make} {job.machine.model}
              </h3>
              
              <div className={`relative inline-flex items-center rounded-full border ${statusColors[job.status]} w-full sm:w-auto`}>
                <select 
                    value={job.status}
                    onChange={(e) => onStatusChange(job.id, e.target.value as JobStatus)}
                    disabled={!canChangeStatus}
                    className={`appearance-none bg-transparent pl-3 pr-7 py-0.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-1 rounded-full w-full sm:w-auto ${!canChangeStatus ? 'opacity-80 cursor-not-allowed' : 'cursor-pointer'}`}
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
              
              {/* Mechanic Assignment */}
              <div className="flex items-center sm:col-span-2 mt-2">
                  <HardHat size={14} className="mr-2 text-brand-600" />
                  {canAssign ? (
                      <div className="flex items-center w-full">
                        <span className="text-xs font-semibold text-gray-500 mr-2 whitespace-nowrap">Assign Mechanic:</span>
                        <select 
                            value={job.assignedMechanic || ''}
                            onChange={(e) => onAssignMechanic(job.id, e.target.value)}
                            className="flex-grow text-xs border-gray-300 rounded shadow-sm focus:ring-brand-500 focus:border-brand-500 py-1.5 px-2 bg-white text-gray-700"
                        >
                            <option value="">-- Unassigned --</option>
                            {mechanics.map(m => (
                                <option key={m.id} value={m.name}>{m.name}</option>
                            ))}
                        </select>
                      </div>
                  ) : (
                      <span className={`text-xs ${job.assignedMechanic ? 'text-gray-900 font-medium' : 'text-gray-400 italic'}`}>
                          {job.assignedMechanic ? `Assigned to: ${job.assignedMechanic}` : 'Unassigned'}
                      </span>
                  )}
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
                    {isExpanded ? 'Hide' : 'Show'} Details & Repair Plan
                  </span>
                  {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                
                {isExpanded && (
                  <div className="mt-2 space-y-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg animate-in slide-in-from-top-2 fade-in duration-200">
                     {job.machine.conditionNotes && (
                       <div>
                         <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Condition</p>
                         <p className="text-gray-800 text-xs sm:text-sm whitespace-pre-line">{job.machine.conditionNotes}</p>
                       </div>
                     )}
                     
                     {job.service.customerRequirements && (
                       <div className={job.machine.conditionNotes ? "border-t border-gray-200 pt-2" : ""}>
                         <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Requirements</p>
                         <p className="text-gray-800 text-xs sm:text-sm whitespace-pre-line">{job.service.customerRequirements}</p>
                       </div>
                     )}

                     {job.service.suggestedRepairPlan && (
                        <div className={(job.machine.conditionNotes || job.service.customerRequirements) ? "border-t border-gray-200 pt-2" : ""}>
                            <p className="text-xs font-semibold text-brand-600 uppercase tracking-wider mb-1 flex items-center">
                                <ClipboardList size={12} className="mr-1" />
                                Suggested Repair Plan (AI)
                            </p>
                            <div className="bg-white border border-gray-200 p-2 rounded text-xs sm:text-sm text-gray-800 font-mono whitespace-pre-line">
                                {job.service.suggestedRepairPlan}
                            </div>
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