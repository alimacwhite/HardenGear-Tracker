import React, { useState, useRef } from 'react';
import { Camera, Check, ChevronRight, ChevronLeft, Loader2, Search, Building2, User } from 'lucide-react';
import { JobRecord, JobStatus, CustomerDetails } from '../types';
import { generateJobId } from '../utils/idGenerator';
import { analyzeMachineImage, fileToGenerativePart } from '../services/geminiService';
import { searchCustomers } from '../services/customerService';

interface IntakeFormProps {
  onSave: (job: JobRecord) => void;
  onCancel: () => void;
}

const STEPS = ['Photos', 'Machine', 'Customer', 'Service'];

const IntakeForm: React.FC<IntakeFormProps> = ({ onSave, onCancel }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Form State
  const [photos, setPhotos] = useState<string[]>([]);
  const [machineDetails, setMachineDetails] = useState({
    make: '',
    model: '',
    serialNumber: '',
    type: '',
    conditionNotes: ''
  });
  
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails>({
    accountType: 'Personal',
    name: '',
    companyName: '',
    address: '',
    postcode: '',
    email: '',
    phone: ''
  });

  const [serviceDetails, setServiceDetails] = useState({
    knownIssues: '',
    customerRequirements: '',
    bookingDate: new Date().toISOString().split('T')[0]
  });

  // Customer Search State
  const [customerQuery, setCustomerQuery] = useState('');
  const [isSearchingCustomer, setIsSearchingCustomer] = useState(false);
  const [customerResults, setCustomerResults] = useState<CustomerDetails[]>([]);
  const [showResults, setShowResults] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const exampleRequirements = "Full service, sharpen blades, replace spark plug";

  const handlePhotoCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      try {
        setIsAnalyzing(true);
        const base64 = await fileToGenerativePart(file);
        
        // Add photo to state
        setPhotos(prev => [...prev, base64]);

        // Trigger AI analysis on the first photo if machine details are empty
        if (photos.length === 0 && !machineDetails.make) {
           const analysis = await analyzeMachineImage(base64);
           setMachineDetails(prev => ({
             ...prev,
             make: analysis.make,
             type: analysis.type,
             conditionNotes: analysis.observedCondition
           }));
        }
      } catch (error) {
        console.error("Error processing photo", error);
        alert("Failed to process image.");
      } finally {
        setIsAnalyzing(false);
      }
    }
  };

  const handleCustomerSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerQuery.trim()) return;

    setIsSearchingCustomer(true);
    setShowResults(true);
    try {
        const results = await searchCustomers(customerQuery);
        setCustomerResults(results);
    } catch (error) {
        console.error("Search failed", error);
    } finally {
        setIsSearchingCustomer(false);
    }
  };

  const selectCustomer = (customer: CustomerDetails) => {
      setCustomerDetails(customer);
      setShowResults(false);
      setCustomerQuery('');
  };

  const handleNext = () => {
    if (activeStep < STEPS.length - 1) setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    if (activeStep > 0) setActiveStep(prev => prev - 1);
  };

  const handleSubmit = () => {
    const newJob: JobRecord = {
      id: generateJobId(),
      photos,
      machine: machineDetails,
      customer: customerDetails,
      service: serviceDetails,
      status: JobStatus.INTAKE,
      createdAt: Date.now()
    };
    onSave(newJob);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 flex flex-col h-full">
      {/* Header / Stepper */}
      <div className="p-4 border-b border-gray-100 bg-gray-50 rounded-t-xl">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800">New Service Intake</h2>
            <button onClick={onCancel} className="text-sm text-gray-500 hover:text-gray-800">Cancel</button>
        </div>
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => (
            <div key={step} className="flex flex-col items-center flex-1 relative">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors duration-300 ${
                  index <= activeStep ? 'bg-brand-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}
              >
                {index + 1}
              </div>
              <span className={`text-[10px] mt-1 font-medium ${index <= activeStep ? 'text-brand-700' : 'text-gray-400'}`}>
                {step}
              </span>
              {index < STEPS.length - 1 && (
                <div className={`absolute top-4 left-1/2 w-full h-0.5 -z-10 ${index < activeStep ? 'bg-brand-600' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="p-6 flex-grow overflow-y-auto">
        
        {/* Step 1: Photos */}
        {activeStep === 0 && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">Capture Machine Photos</h3>
              <p className="text-sm text-gray-500">Take clear photos of the machine. The AI will attempt to identify it.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {photos.map((p, i) => (
                <div key={i} className="aspect-square relative rounded-lg overflow-hidden border border-gray-200">
                   <img src={`data:image/jpeg;base64,${p}`} className="w-full h-full object-cover" alt="Captured" />
                </div>
              ))}
              
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isAnalyzing}
                className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-500 hover:border-brand-500 hover:bg-brand-50 hover:text-brand-600 transition-all disabled:opacity-50"
              >
                 {isAnalyzing ? (
                   <>
                    <Loader2 className="animate-spin mb-2" />
                    <span className="text-xs">Analyzing...</span>
                   </>
                 ) : (
                   <>
                    <Camera size={32} className="mb-2" />
                    <span className="text-xs font-medium">Add Photo</span>
                   </>
                 )}
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                capture="environment" // Forces rear camera on mobile
                onChange={handlePhotoCapture}
              />
            </div>
            {photos.length > 0 && isAnalyzing === false && (
                <div className="bg-blue-50 text-blue-800 p-3 rounded-md text-sm">
                    <strong>AI Analysis:</strong> We've pre-filled some details based on your photo. Please verify them in the next step.
                </div>
            )}
          </div>
        )}

        {/* Step 2: Machine Details */}
        {activeStep === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Machine Details</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <input 
                type="text" 
                value={machineDetails.type}
                onChange={(e) => setMachineDetails({...machineDetails, type: e.target.value})}
                placeholder="e.g. Lawnmower"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 p-2 border"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                <label className="block text-sm font-medium text-gray-700">Make</label>
                <input 
                    type="text" 
                    value={machineDetails.make}
                    onChange={(e) => setMachineDetails({...machineDetails, make: e.target.value})}
                    placeholder="e.g. Honda"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 p-2 border"
                />
                </div>
                <div>
                <label className="block text-sm font-medium text-gray-700">Model</label>
                <input 
                    type="text" 
                    value={machineDetails.model}
                    onChange={(e) => setMachineDetails({...machineDetails, model: e.target.value})}
                    placeholder="e.g. HRX537"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 p-2 border"
                />
                </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Serial Number</label>
              <input 
                type="text" 
                value={machineDetails.serialNumber}
                onChange={(e) => setMachineDetails({...machineDetails, serialNumber: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 p-2 border"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Initial Condition Notes</label>
              <textarea 
                rows={3}
                value={machineDetails.conditionNotes}
                onChange={(e) => setMachineDetails({...machineDetails, conditionNotes: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 p-2 border"
              />
            </div>
          </div>
        )}

        {/* Step 3: Customer Details */}
        {activeStep === 2 && (
           <div className="space-y-4">
           
           {/* Account Lookup Section */}
           <div className="bg-brand-50 p-4 rounded-lg border border-brand-100">
             <h4 className="text-sm font-semibold text-brand-800 mb-2 flex items-center">
                <Search size={14} className="mr-2" />
                Find Existing Account
             </h4>
             <form onSubmit={handleCustomerSearch} className="relative">
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        value={customerQuery}
                        onChange={(e) => setCustomerQuery(e.target.value)}
                        placeholder="Name, Phone, Email, Postcode..."
                        className="flex-grow rounded-md border-brand-200 shadow-sm focus:border-brand-500 focus:ring-brand-500 text-sm p-2 border"
                    />
                    <button 
                        type="submit"
                        disabled={isSearchingCustomer}
                        className="bg-brand-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-brand-700 disabled:opacity-50"
                    >
                        {isSearchingCustomer ? <Loader2 size={16} className="animate-spin" /> : 'Search'}
                    </button>
                </div>
                
                {showResults && (
                   <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-md shadow-lg border border-gray-200 max-h-48 overflow-y-auto z-20">
                      {customerResults.length === 0 ? (
                          <div className="p-3 text-sm text-gray-500 text-center">No accounts found.</div>
                      ) : (
                          <ul>
                              {customerResults.map(res => (
                                  <li 
                                    key={res.id} 
                                    onClick={() => selectCustomer(res)}
                                    className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-0 border-gray-100"
                                  >
                                      <div className="flex justify-between items-start">
                                          <div>
                                              <p className="text-sm font-bold text-gray-800">
                                                {res.companyName ? res.companyName : res.name}
                                              </p>
                                              {res.companyName && <p className="text-xs text-gray-500">Contact: {res.name}</p>}
                                              <p className="text-xs text-gray-400">{res.postcode} • {res.phone}</p>
                                          </div>
                                          <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                                              res.accountType === 'Business' 
                                              ? 'bg-purple-100 text-purple-700' 
                                              : 'bg-green-100 text-green-700'
                                          }`}>
                                              {res.accountType}
                                          </span>
                                      </div>
                                  </li>
                              ))}
                          </ul>
                      )}
                      <div className="p-2 bg-gray-50 border-t border-gray-200 text-center">
                          <button 
                            type="button" 
                            onClick={() => setShowResults(false)}
                            className="text-xs text-gray-500 hover:text-gray-700"
                          >
                            Close Results
                          </button>
                      </div>
                   </div>
                )}
             </form>
           </div>

           <div className="h-px bg-gray-200 my-2"></div>

           <h3 className="text-lg font-semibold text-gray-900">Account Details</h3>

           {/* Account Type Selector */}
           <div className="flex space-x-4 mb-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                    <input 
                        type="radio" 
                        checked={customerDetails.accountType === 'Personal'}
                        onChange={() => setCustomerDetails({...customerDetails, accountType: 'Personal'})}
                        className="text-brand-600 focus:ring-brand-500"
                    />
                    <span className="text-sm font-medium flex items-center text-gray-700">
                        <User size={14} className="mr-1" /> Personal
                    </span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                    <input 
                        type="radio" 
                        checked={customerDetails.accountType === 'Business'}
                        onChange={() => setCustomerDetails({...customerDetails, accountType: 'Business'})}
                        className="text-brand-600 focus:ring-brand-500"
                    />
                    <span className="text-sm font-medium flex items-center text-gray-700">
                        <Building2 size={14} className="mr-1" /> Business
                    </span>
                </label>
           </div>
           
           {customerDetails.accountType === 'Business' && (
               <div>
                <label className="block text-sm font-medium text-gray-700">Company Name</label>
                <input 
                    type="text" 
                    value={customerDetails.companyName || ''}
                    onChange={(e) => setCustomerDetails({...customerDetails, companyName: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 p-2 border"
                />
               </div>
           )}

           <div>
             <label className="block text-sm font-medium text-gray-700">
                {customerDetails.accountType === 'Business' ? 'Contact Name' : 'Full Name'}
             </label>
             <input 
               type="text" 
               value={customerDetails.name}
               onChange={(e) => setCustomerDetails({...customerDetails, name: e.target.value})}
               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 p-2 border"
             />
           </div>

           <div>
             <label className="block text-sm font-medium text-gray-700">Email</label>
             <input 
               type="email" 
               value={customerDetails.email}
               onChange={(e) => setCustomerDetails({...customerDetails, email: e.target.value})}
               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 p-2 border"
             />
           </div>

           <div>
             <label className="block text-sm font-medium text-gray-700">Phone</label>
             <input 
               type="tel" 
               value={customerDetails.phone}
               onChange={(e) => setCustomerDetails({...customerDetails, phone: e.target.value})}
               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 p-2 border"
             />
           </div>

            <div className="grid grid-cols-3 gap-4">
               <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Address</label>
                    <textarea 
                        rows={2}
                        value={customerDetails.address}
                        onChange={(e) => setCustomerDetails({...customerDetails, address: e.target.value})}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 p-2 border"
                    />
               </div>
               <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700">Postcode</label>
                    <input 
                        type="text" 
                        value={customerDetails.postcode}
                        onChange={(e) => setCustomerDetails({...customerDetails, postcode: e.target.value})}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 p-2 border h-[62px]"
                    />
               </div>
            </div>
         </div>
        )}

        {/* Step 4: Service Request */}
        {activeStep === 3 && (
            <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Request</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Booking Date</label>
              <input 
                type="date" 
                value={serviceDetails.bookingDate}
                onChange={(e) => setServiceDetails({...serviceDetails, bookingDate: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 p-2 border"
              />
            </div>
 
            <div>
              <label className="block text-sm font-medium text-gray-700">Known Issues / Faults</label>
              <textarea 
                 rows={3}
                value={serviceDetails.knownIssues}
                onChange={(e) => setServiceDetails({...serviceDetails, knownIssues: e.target.value})}
                placeholder="e.g. Engine won't start, excessive vibration..."
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 p-2 border"
              />
            </div>
 
            <div>
              <div className="flex justify-between items-center mb-1">
                 <label className="block text-sm font-medium text-gray-700">Customer Service Requirements</label>
                 <button 
                    type="button"
                    onClick={() => setServiceDetails({...serviceDetails, customerRequirements: exampleRequirements})}
                    className="text-xs font-medium text-brand-600 bg-brand-50 hover:bg-brand-100 px-2 py-0.5 rounded border border-brand-200 transition-colors"
                 >
                    Use Example
                 </button>
              </div>
              <textarea 
                 rows={3}
                value={serviceDetails.customerRequirements}
                onChange={(e) => setServiceDetails({...serviceDetails, customerRequirements: e.target.value})}
                placeholder={`e.g. ${exampleRequirements}...`}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 p-2 border"
              />
            </div>
          </div>
        )}

      </div>

      {/* Footer / Actions */}
      <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-xl flex justify-between">
        <button
          onClick={handleBack}
          disabled={activeStep === 0}
          className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
            activeStep === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200'
          }`}
        >
          <ChevronLeft size={18} className="mr-1" />
          Back
        </button>

        {activeStep === STEPS.length - 1 ? (
          <button
            onClick={handleSubmit}
            className="flex items-center px-6 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 shadow-md transition-transform active:scale-95 font-medium"
          >
            <Check size={18} className="mr-2" />
            Complete Intake
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="flex items-center px-6 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 shadow-md transition-transform active:scale-95 font-medium"
          >
            Next
            <ChevronRight size={18} className="ml-1" />
          </button>
        )}
      </div>
    </div>
  );
};

export default IntakeForm;