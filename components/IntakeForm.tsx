import React, { useState, useRef, useEffect } from 'react';
import { Camera, Check, ChevronRight, ChevronLeft, Loader2, Search, Building2, User, Hash, MapPin, Wand2, Bot, Layers, Pencil, X, Sparkles } from 'lucide-react';
import { JobRecord, JobStatus, CustomerDetails } from '../types';
import { generateJobId } from '../utils/idGenerator';
import { analyzeMachineImage, fileToGenerativePart, generateRepairPlan, lookupAddressFromPostcode } from '../services/geminiService';
import { searchCustomers, getCustomerByAccountNumber, generateNewAccountNumber, saveMockCustomer } from '../services/customerService';

interface IntakeFormProps {
  onSave: (job: JobRecord) => void;
  onCancel: () => void;
}

const STEPS = ['Photos', 'Machine', 'Customer', 'Service'];

const MACHINE_TYPES = [
  "Lawnmower", "Ride-on Mower", "Chainsaw", "Strimmer", 
  "Hedge Trimmer", "Leaf Blower", "Rotavator", "Garden Shredder", 
  "Pressure Washer", "Generator", "Scarifier", "Compact Tractor", 
  "Pole Saw", "Brush Cutter", "Robot Mower", "Tiller", "Aerator", "Log Splitter"
];

// Helper component to highlight matching text
const HighlightedText = ({ text, highlight }: { text: string; highlight: string }) => {
  if (!text) return null;
  if (!highlight.trim()) return <>{text}</>;

  // Escape regex special characters
  const escapedHighlight = highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedHighlight})`, 'gi');
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <span key={i} className="bg-yellow-100 text-gray-900 font-semibold px-0.5 rounded-[1px]">
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
};

const IntakeForm: React.FC<IntakeFormProps> = ({ onSave, onCancel }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
    accountNumber: '',
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
    bookingDate: new Date().toISOString().split('T')[0],
    suggestedRepairPlan: ''
  });

  // UI State
  const [showTypeSuggestions, setShowTypeSuggestions] = useState(false);
  const [isAddressLocked, setIsAddressLocked] = useState(false);

  // Customer Search State
  const [customerQuery, setCustomerQuery] = useState('');
  const [isSearchingCustomer, setIsSearchingCustomer] = useState(false);
  const [isLookingUpAccount, setIsLookingUpAccount] = useState(false);
  const [isGeneratingAccount, setIsGeneratingAccount] = useState(false);
  const [isResolvingAddress, setIsResolvingAddress] = useState(false);
  const [customerResults, setCustomerResults] = useState<CustomerDetails[]>([]);
  const [showResults, setShowResults] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const exampleRequirements = "Full service, sharpen blades, replace spark plug";

  // Live Search Effect
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (customerQuery.trim().length >= 2) {
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
      } else {
        setCustomerResults([]);
        setShowResults(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(delayDebounceFn);
  }, [customerQuery]);

  const resetForm = () => {
    setActiveStep(0);
    setPhotos([]);
    setMachineDetails({
      make: '',
      model: '',
      serialNumber: '',
      type: '',
      conditionNotes: ''
    });
    setCustomerDetails({
      accountNumber: '',
      accountType: 'Personal',
      name: '',
      companyName: '',
      address: '',
      postcode: '',
      email: '',
      phone: ''
    });
    setServiceDetails({
      knownIssues: '',
      customerRequirements: '',
      bookingDate: new Date().toISOString().split('T')[0],
      suggestedRepairPlan: ''
    });
    setIsAddressLocked(false);
    setCustomerQuery('');
    setCustomerResults([]);
    setShowResults(false);
  };

  const handlePhotoCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      try {
        const base64 = await fileToGenerativePart(file);
        // Add photo to state
        setPhotos(prev => [...prev, base64]);
      } catch (error) {
        console.error("Error processing photo", error);
        alert("Failed to process image.");
      }
    }
  };

  const handleAnalyzePhotos = async () => {
    if (photos.length === 0) return;
    setIsAnalyzing(true);
    try {
        const analysis = await analyzeMachineImage(photos);
        setMachineDetails(prev => ({
             ...prev,
             make: analysis.make,
             type: analysis.type,
             conditionNotes: analysis.observedCondition
        }));
    } catch (e) {
        console.error("Analysis failed", e);
        alert("Failed to analyze images. Please try entering details manually.");
    } finally {
        setIsAnalyzing(false);
    }
  };

  const handleRemovePhoto = (indexToRemove: number) => {
    setPhotos(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleAccountNumberBlur = async () => {
    if (!customerDetails.accountNumber || customerDetails.accountNumber.trim() === '') return;
    
    setIsLookingUpAccount(true);
    try {
        const customer = await getCustomerByAccountNumber(customerDetails.accountNumber);
        if (customer) {
            setCustomerDetails(customer);
            setIsAddressLocked(!!customer.address);
        } 
    } catch (e) {
        console.error("Account lookup failed", e);
    } finally {
        setIsLookingUpAccount(false);
    }
  };

  const handlePostcodeBlur = async () => {
      const pc = customerDetails.postcode;
      if (!pc || pc.trim().length < 3) return;

      if (customerDetails.address && customerDetails.address.length > 5) return;

      setIsResolvingAddress(true);
      try {
          const addressFound = await lookupAddressFromPostcode(pc);
          if (addressFound) {
              setCustomerDetails(prev => ({
                  ...prev,
                  address: addressFound
              }));
              setIsAddressLocked(true);
          }
      } catch (e) {
          console.error("Address lookup failed", e);
      } finally {
          setIsResolvingAddress(false);
      }
  };

  const handleGenerateAccountNumber = async () => {
    const seedName = customerDetails.accountType === 'Business' ? customerDetails.companyName : customerDetails.name;
    
    if (!seedName) {
        alert("Please enter a Name or Company Name first.");
        return;
    }

    setIsGeneratingAccount(true);
    try {
        const newAccountNum = await generateNewAccountNumber(seedName);
        setCustomerDetails(prev => ({ ...prev, accountNumber: newAccountNum }));
    } catch (e) {
        console.error("Generation failed", e);
    } finally {
        setIsGeneratingAccount(false);
    }
  };

  const selectCustomer = (customer: CustomerDetails) => {
      setCustomerDetails(customer);
      setShowResults(false);
      setCustomerQuery('');
      setIsAddressLocked(!!customer.address);
  };

  const handleNext = () => {
    if (activeStep < STEPS.length - 1) setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    if (activeStep > 0) setActiveStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
        // 1. Ensure customer is saved to "DB"
        if (customerDetails.accountNumber) {
            await saveMockCustomer(customerDetails);
        }

        // 2. Automatically generate Repair Plan via AI if known issues are present
        let finalRepairPlan = serviceDetails.suggestedRepairPlan;
        if (!finalRepairPlan && serviceDetails.knownIssues) {
            try {
                finalRepairPlan = await generateRepairPlan(machineDetails, serviceDetails.knownIssues);
            } catch (err) {
                console.error("Auto-generation of repair plan failed", err);
                finalRepairPlan = "AI Generation failed. Manager please review.";
            }
        }

        // 3. Save Job
        const newJob: JobRecord = {
          id: generateJobId(),
          photos,
          machine: machineDetails,
          customer: customerDetails,
          service: {
              ...serviceDetails,
              suggestedRepairPlan: finalRepairPlan
          },
          status: JobStatus.INTAKE,
          createdAt: Date.now()
        };

        // 4. Notify parent
        onSave(newJob);

        // 5. Reset form
        resetForm();
    } catch (e) {
        console.error("Error submitting job", e);
        alert("There was an error saving the booking.");
    } finally {
        setIsSubmitting(false);
    }
  };

  // Filter machine types for suggestions
  const filteredMachineTypes = MACHINE_TYPES.filter(t => 
    t.toLowerCase().includes(machineDetails.type.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 flex flex-col h-full relative">
      {isSubmitting && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center rounded-xl">
              <Loader2 size={48} className="text-brand-600 animate-spin mb-4" />
              <h3 className="text-lg font-bold text-gray-800">Finalizing Intake...</h3>
              <p className="text-sm text-gray-500">Generating AI Repair Plan & Saving to Dashboard</p>
          </div>
      )}

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
              <p className="text-sm text-gray-500">Take 1 or 2 clear photos. Then identify the machine.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {photos.map((p, i) => (
                <div key={i} className="aspect-square relative rounded-lg overflow-hidden border border-gray-200 group">
                   <img src={`data:image/jpeg;base64,${p}`} className="w-full h-full object-cover" alt="Captured" />
                   <button
                     onClick={() => handleRemovePhoto(i)}
                     className="absolute top-2 right-2 bg-black/60 hover:bg-red-600 text-white p-1.5 rounded-full backdrop-blur-sm transition-colors shadow-sm"
                     title="Remove photo"
                   >
                     <X size={14} />
                   </button>
                </div>
              ))}
              
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isAnalyzing}
                className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-500 hover:border-brand-500 hover:bg-brand-50 hover:text-brand-600 transition-all disabled:opacity-50"
              >
                 <Camera size={32} className="mb-2" />
                 <span className="text-xs font-medium">Add Photo</span>
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

            {/* AI Action Button */}
            {photos.length > 0 && (
                <div className="mt-4">
                    <button
                        onClick={handleAnalyzePhotos}
                        disabled={isAnalyzing}
                        className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-lg shadow-md flex items-center justify-center font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isAnalyzing ? (
                            <>
                                <Loader2 className="animate-spin mr-2" />
                                Analyzing Photos...
                            </>
                        ) : (
                            <>
                                <Sparkles className="mr-2" size={18} />
                                Identify Machine
                            </>
                        )}
                    </button>
                    {machineDetails.make && !isAnalyzing && (
                        <div className="mt-3 bg-green-50 text-green-800 p-3 rounded-md text-sm border border-green-200 flex items-start">
                             <Check size={16} className="mr-2 mt-0.5 shrink-0" />
                             <div>
                                 <strong>Identified:</strong> {machineDetails.make} {machineDetails.type}.
                                 <br/>
                                 <span className="text-xs opacity-80">Proceed to next step to verify.</span>
                             </div>
                        </div>
                    )}
                </div>
            )}
          </div>
        )}

        {/* Step 2: Machine Details */}
        {activeStep === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Machine Details</h3>
            
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <input 
                type="text" 
                value={machineDetails.type}
                onChange={(e) => setMachineDetails({...machineDetails, type: e.target.value})}
                onFocus={() => setShowTypeSuggestions(true)}
                onBlur={() => setTimeout(() => setShowTypeSuggestions(false), 200)}
                placeholder="e.g. Lawnmower"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 p-2 border"
                autoComplete="off"
              />
              {showTypeSuggestions && filteredMachineTypes.length > 0 && (
                <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 shadow-lg max-h-48 overflow-y-auto">
                    {filteredMachineTypes.map((type) => (
                        <li 
                            key={type}
                            className="px-3 py-2 hover:bg-brand-50 cursor-pointer text-sm text-gray-700"
                            onMouseDown={() => {
                                setMachineDetails({...machineDetails, type});
                                setShowTypeSuggestions(false);
                            }}
                        >
                            <HighlightedText text={type} highlight={machineDetails.type} />
                        </li>
                    ))}
                </ul>
              )}
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
           <div className="bg-brand-50 p-4 rounded-lg border border-brand-100 relative">
             <h4 className="text-sm font-semibold text-brand-800 mb-2 flex items-center">
                <Search size={14} className="mr-2" />
                Find Existing Account
             </h4>
             <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={16} className="text-brand-400" />
                </div>
                <input 
                    type="text" 
                    value={customerQuery}
                    onChange={(e) => setCustomerQuery(e.target.value)}
                    onFocus={() => { if(customerQuery.length >= 2) setShowResults(true); }}
                    placeholder="Search by Name, Email, Phone, Postcode..."
                    className="block w-full pl-10 pr-10 rounded-md border-brand-200 shadow-sm focus:border-brand-500 focus:ring-brand-500 text-sm p-2.5 border placeholder-brand-300 bg-white"
                />
                {isSearchingCustomer && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <Loader2 size={16} className="animate-spin text-brand-500" />
                    </div>
                )}
             </div>
                
             {showResults && (
                <div className="absolute top-full left-0 right-0 mt-1 mx-4 bg-white rounded-md shadow-xl border border-gray-200 max-h-56 overflow-y-auto z-20">
                    {customerResults.length === 0 ? (
                        <div className="p-3 text-sm text-gray-500 text-center italic">
                            No accounts found matching "{customerQuery}"
                        </div>
                    ) : (
                        <ul>
                            {customerResults.map(res => (
                                <li 
                                key={res.id} 
                                onClick={() => selectCustomer(res)}
                                className="p-3 hover:bg-brand-50 cursor-pointer border-b last:border-0 border-gray-100 transition-colors"
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="overflow-hidden pr-2">
                                            <p className="text-sm font-bold text-gray-800 truncate">
                                            {res.companyName ? (
                                                <HighlightedText text={res.companyName} highlight={customerQuery} />
                                            ) : (
                                                <HighlightedText text={res.name} highlight={customerQuery} />
                                            )}
                                            </p>
                                            {res.companyName && (
                                                <p className="text-xs text-gray-500 truncate">
                                                Contact: <HighlightedText text={res.name} highlight={customerQuery} />
                                                </p>
                                            )}
                                            <p className="text-xs text-gray-500 truncate mt-1 flex items-center gap-2">
                                                {res.accountNumber && (
                                                    <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 text-[10px] border border-gray-200">
                                                    <HighlightedText text={res.accountNumber} highlight={customerQuery} />
                                                    </span>
                                                )}
                                                <span className="flex items-center">
                                                  <MapPin size={10} className="mr-0.5" />
                                                  <HighlightedText text={res.postcode} highlight={customerQuery} /> 
                                                </span>
                                                <span>•</span>
                                                <span><HighlightedText text={res.phone} highlight={customerQuery} /></span>
                                            </p>
                                        </div>
                                        <span className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full font-medium ${
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
                        className="text-xs text-gray-500 hover:text-gray-700 underline"
                        >
                        Close Results
                        </button>
                    </div>
                </div>
             )}
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
                    placeholder="e.g. Acme Gardening"
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
               placeholder={customerDetails.accountType === 'Business' ? "e.g. Jane Doe" : "e.g. John Smith"}
               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 p-2 border"
             />
           </div>

           {/* Account Number Field */}
           <div>
             <label className="block text-sm font-medium text-gray-700">Account Number</label>
             <div className="relative mt-1">
               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                 <Hash size={16} className="text-gray-400" />
               </div>
               <input 
                 type="text" 
                 value={customerDetails.accountNumber || ''}
                 onChange={(e) => setCustomerDetails({...customerDetails, accountNumber: e.target.value})}
                 onBlur={handleAccountNumberBlur}
                 placeholder="e.g. CUST-001"
                 className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 pl-10 pr-20 p-2 border"
               />
               <div className="absolute inset-y-0 right-0 flex items-center">
                    {isLookingUpAccount || isGeneratingAccount ? (
                        <div className="pr-3">
                             <Loader2 size={16} className="text-brand-500 animate-spin" />
                        </div>
                    ) : (
                        <button 
                            type="button"
                            onClick={handleGenerateAccountNumber}
                            className="h-full px-3 text-xs font-medium text-brand-600 bg-gray-50 hover:bg-brand-50 border-l border-gray-300 rounded-r-md flex items-center gap-1 transition-colors"
                            title="Auto-generate Account Number from Name"
                        >
                            <Wand2 size={12} />
                            Auto
                        </button>
                    )}
               </div>
             </div>
             <p className="text-[10px] text-gray-500 mt-1">Enter existing or click Auto to generate (2 Letters + 3 Digits).</p>
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
                    <label className="block text-sm font-medium text-gray-700 flex justify-between items-center">
                        <span className="flex items-center">
                            Address
                            {isResolvingAddress && <Loader2 size={12} className="ml-2 animate-spin text-brand-500" />}
                        </span>
                        {isAddressLocked && (
                            <button 
                                type="button" 
                                onClick={() => setIsAddressLocked(false)}
                                className="text-xs text-brand-600 hover:text-brand-700 flex items-center font-normal"
                            >
                                <Pencil size={12} className="mr-1" /> Edit Address
                            </button>
                        )}
                    </label>
                    
                    {isAddressLocked ? (
                        <div className="mt-1 w-full rounded-md border border-gray-200 bg-gray-50 p-2 text-sm text-gray-800 min-h-[58px] flex items-center relative group">
                             {customerDetails.address}
                        </div>
                    ) : (
                        <div className="relative">
                            <textarea 
                                rows={2}
                                value={customerDetails.address}
                                onChange={(e) => setCustomerDetails({...customerDetails, address: e.target.value})}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 p-2 border"
                                placeholder="Street address..."
                            />
                            {customerDetails.address && (
                                <button
                                    type="button"
                                    onClick={() => setIsAddressLocked(true)}
                                    className="absolute bottom-2 right-2 bg-white/80 backdrop-blur text-green-700 border border-green-200 hover:bg-green-50 rounded px-2 py-0.5 text-xs font-medium flex items-center shadow-sm"
                                    title="Save Address"
                                >
                                    <Check size={12} className="mr-1" /> Done
                                </button>
                            )}
                        </div>
                    )}
               </div>
               <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700">Postcode</label>
                    <input 
                        type="text" 
                        value={customerDetails.postcode}
                        onChange={(e) => setCustomerDetails({...customerDetails, postcode: e.target.value})}
                        onBlur={handlePostcodeBlur}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 p-2 border h-[62px]"
                        placeholder="e.g. HD1 2AB"
                    />
               </div>
            </div>

            {/* Google Map Integration Space */}
            <div className="w-full h-48 bg-[#e8eaed] rounded-lg border border-gray-200 relative overflow-hidden group mt-2">
                {/* Google Maps Grid Simulation */}
                <div className="absolute inset-0 opacity-20" 
                     style={{
                         backgroundImage: 'linear-gradient(#dadce0 1px, transparent 1px), linear-gradient(90deg, #dadce0 1px, transparent 1px)',
                         backgroundSize: '40px 40px'
                     }}>
                </div>
                
                {/* Map/Satellite Toggle Mock */}
                <div className="absolute top-2 left-2 bg-white rounded shadow-sm flex overflow-hidden border border-gray-300">
                    <div className="px-3 py-1 text-xs font-semibold text-gray-700 bg-gray-50 border-r border-gray-200 cursor-pointer">Map</div>
                    <div className="px-3 py-1 text-xs font-medium text-gray-500 hover:bg-gray-50 cursor-pointer">Satellite</div>
                </div>

                {/* Dynamic Pin */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 transition-opacity duration-300">
                    {customerDetails.address || customerDetails.postcode ? (
                        <>
                            <div className="relative mb-2">
                                <span className="flex h-3 w-3 absolute -top-1 -right-1">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
                                </span>
                                <MapPin className="text-red-600 drop-shadow-md" size={32} fill="#dc2626" stroke="#fff" />
                            </div>
                            <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-sm shadow-md text-center max-w-xs border border-gray-200">
                                <p className="text-[10px] text-gray-500 truncate max-w-[200px] font-sans">
                                    {customerDetails.address} {customerDetails.postcode}
                                </p>
                            </div>
                        </>
                    ) : (
                         <div className="flex flex-col items-center text-gray-400">
                            <MapPin className="mb-2 opacity-30 text-gray-500" size={24} />
                            <p className="text-xs font-medium text-gray-500">Address Location</p>
                         </div>
                    )}
                </div>

                {/* Google Zoom Controls */}
                <div className="absolute bottom-6 right-2 flex flex-col gap-0.5 bg-white rounded shadow-md border border-gray-300 overflow-hidden">
                    <div className="w-8 h-8 flex items-center justify-center text-gray-600 text-lg hover:bg-gray-50 cursor-pointer font-light border-b border-gray-200">+</div>
                    <div className="w-8 h-8 flex items-center justify-center text-gray-600 text-lg hover:bg-gray-50 cursor-pointer font-light">−</div>
                </div>
                
                {/* Google Attribution */}
                <div className="absolute bottom-0 right-0 px-1 py-0.5 text-[10px] text-gray-600 font-sans pointer-events-none">
                    Map data ©2025 Google
                </div>
                
                <div className="absolute bottom-1 left-2">
                     <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/2021_Facebook_icon.svg/10px-2021_Facebook_icon.svg.png" className="w-0 h-0 opacity-0" alt="hidden" /> 
                     <span className="text-gray-500 text-[10px] font-bold">Google</span>
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
                onChange={(e) => setServiceDetails({...serviceDetails,bookingDate: e.target.value})}
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
              <p className="text-[10px] text-gray-500 mt-1">An AI repair plan will be automatically generated and sent to the workshop dashboard upon completion.</p>
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
          disabled={activeStep === 0 || isSubmitting}
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
            disabled={isSubmitting}
            className="flex items-center px-6 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 shadow-md transition-transform active:scale-95 font-medium disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
                <>
                    <Loader2 size={18} className="mr-2 animate-spin" />
                    Processing...
                </>
            ) : (
                <>
                    <Check size={18} className="mr-2" />
                    Complete Intake
                </>
            )}
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