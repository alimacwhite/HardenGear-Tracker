
import React, { useState, useEffect } from 'react';
import { Search, Loader2, User, Building2, MapPin, Check, ShoppingCart, Tag, CreditCard } from 'lucide-react';
import { CustomerDetails } from '../types';
import { searchCustomers } from '../services/customerService';

const NewMachineSale: React.FC = () => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [customerQuery, setCustomerQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<CustomerDetails[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDetails | null>(null);
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  
  // Sale Form State
  const [saleDetails, setSaleDetails] = useState({
      make: '',
      model: '',
      type: '',
      serialNumber: '',
      price: '',
      warrantyYears: '2',
      notes: ''
  });

  // Debounced Search
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (customerQuery.trim().length >= 2 && !selectedCustomer && !isNewCustomer) {
        setIsSearching(true);
        try {
          const results = await searchCustomers(customerQuery);
          setSearchResults(results);
        } catch (error) {
          console.error("Search failed", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [customerQuery, selectedCustomer, isNewCustomer]);

  const handleSelectCustomer = (customer: CustomerDetails) => {
      setSelectedCustomer(customer);
      setCustomerQuery('');
      setSearchResults([]);
  };

  const handleClearCustomer = () => {
      setSelectedCustomer(null);
      setIsNewCustomer(false);
      setCustomerQuery('');
  };

  const handleSubmitSale = () => {
      // Logic to save sale would go here
      alert("Sale processed successfully! Invoice #INV-" + Math.floor(Math.random() * 10000));
      // Reset
      setStep(1);
      handleClearCustomer();
      setSaleDetails({ make: '', model: '', type: '', serialNumber: '', price: '', warrantyYears: '2', notes: '' });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
       <div className="flex items-center justify-between mb-2">
           <h2 className="text-xl font-bold text-gray-900 flex items-center">
               <ShoppingCart className="mr-2 text-brand-600" />
               New Machine Sale
           </h2>
           <div className="flex space-x-2">
               <span className={`px-3 py-1 rounded-full text-xs font-bold ${step >= 1 ? 'bg-brand-600 text-white' : 'bg-gray-200 text-gray-500'}`}>1. Customer</span>
               <span className={`px-3 py-1 rounded-full text-xs font-bold ${step >= 2 ? 'bg-brand-600 text-white' : 'bg-gray-200 text-gray-500'}`}>2. Equipment</span>
               <span className={`px-3 py-1 rounded-full text-xs font-bold ${step >= 3 ? 'bg-brand-600 text-white' : 'bg-gray-200 text-gray-500'}`}>3. Confirm</span>
           </div>
       </div>

       <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
           
           {/* Step 1: Customer Selection */}
           {step === 1 && (
               <div className="p-6 space-y-6">
                   {!selectedCustomer ? (
                       <div className="space-y-4">
                           <h3 className="text-lg font-medium text-gray-800">Identify Customer</h3>
                           
                           {/* Search Input */}
                           <div className="relative">
                               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                   <Search size={18} className="text-gray-400" />
                               </div>
                               <input 
                                   type="text"
                                   className="pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-brand-500 focus:border-brand-500 p-3 border"
                                   placeholder="Search existing client by Name, Phone or Email..."
                                   value={customerQuery}
                                   onChange={(e) => setCustomerQuery(e.target.value)}
                                   disabled={isNewCustomer}
                               />
                               {isSearching && (
                                   <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                       <Loader2 size={18} className="text-brand-500 animate-spin" />
                                   </div>
                               )}
                           </div>

                           {/* Results List */}
                           {searchResults.length > 0 && (
                               <div className="border border-gray-200 rounded-lg overflow-hidden divide-y divide-gray-100 bg-gray-50 max-h-60 overflow-y-auto">
                                   {searchResults.map(customer => (
                                       <div 
                                           key={customer.id} 
                                           onClick={() => handleSelectCustomer(customer)}
                                           className="p-3 hover:bg-white cursor-pointer transition-colors flex justify-between items-center group"
                                       >
                                           <div>
                                               <p className="font-medium text-gray-900 group-hover:text-brand-600">
                                                   {customer.companyName || customer.name}
                                               </p>
                                               <p className="text-xs text-gray-500 flex items-center gap-2">
                                                   {customer.accountNumber && <span className="font-mono bg-white border px-1 rounded">{customer.accountNumber}</span>}
                                                   <span>{customer.address}</span>
                                               </p>
                                           </div>
                                           <div className="text-xs text-gray-400 group-hover:text-brand-500">Select</div>
                                       </div>
                                   ))}
                               </div>
                           )}

                           {/* Or Create New */}
                           <div className="relative flex py-2 items-center">
                               <div className="flex-grow border-t border-gray-200"></div>
                               <span className="flex-shrink-0 mx-4 text-gray-400 text-xs uppercase font-semibold">Or</span>
                               <div className="flex-grow border-t border-gray-200"></div>
                           </div>

                           <div className="bg-gray-50 p-4 rounded-lg border border-dashed border-gray-300 text-center">
                               <p className="text-sm text-gray-600 mb-3">Customer not in database?</p>
                               <button 
                                   onClick={() => {
                                       setIsNewCustomer(true);
                                       setSelectedCustomer({
                                           name: 'New Walk-in Customer',
                                           accountType: 'Personal',
                                           address: 'Counter Sale',
                                           postcode: '',
                                           email: '',
                                           phone: ''
                                       });
                                   }}
                                   className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg shadow-sm hover:bg-gray-50"
                               >
                                   Process as New / Guest
                               </button>
                           </div>
                       </div>
                   ) : (
                       <div className="bg-brand-50 rounded-xl p-4 border border-brand-100 flex justify-between items-center">
                           <div className="flex items-start gap-3">
                               <div className="p-2 bg-brand-100 rounded-full text-brand-600">
                                   {selectedCustomer.accountType === 'Business' ? <Building2 size={24} /> : <User size={24} />}
                               </div>
                               <div>
                                   <p className="text-xs text-brand-500 font-bold uppercase tracking-wider mb-0.5">Customer Selected</p>
                                   <h3 className="font-bold text-gray-900 text-lg">{selectedCustomer.companyName || selectedCustomer.name}</h3>
                                   <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-gray-600">
                                       <span className="flex items-center"><MapPin size={14} className="mr-1" /> {selectedCustomer.postcode || 'N/A'}</span>
                                       {selectedCustomer.accountNumber && <span className="font-mono bg-white px-1 rounded border border-brand-200 text-xs flex items-center">{selectedCustomer.accountNumber}</span>}
                                   </div>
                               </div>
                           </div>
                           <button 
                               onClick={handleClearCustomer}
                               className="text-sm text-gray-500 hover:text-red-600 underline"
                           >
                               Change
                           </button>
                       </div>
                   )}
                   
                   {selectedCustomer && (
                       <div className="flex justify-end pt-4 border-t border-gray-100">
                           <button 
                               onClick={() => setStep(2)}
                               className="px-6 py-2 bg-brand-600 text-white rounded-lg font-medium shadow hover:bg-brand-700 flex items-center"
                           >
                               Next: Equipment Details
                           </button>
                       </div>
                   )}
               </div>
           )}

           {/* Step 2: Equipment Details */}
           {step === 2 && (
               <div className="p-6 space-y-6">
                   <h3 className="text-lg font-medium text-gray-800">Equipment Details</h3>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div>
                           <label className="block text-sm font-medium text-gray-700">Machine Type</label>
                           <input 
                               type="text"
                               value={saleDetails.type}
                               onChange={e => setSaleDetails({...saleDetails, type: e.target.value})}
                               placeholder="e.g. Lawn Tractor"
                               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-brand-500 focus:border-brand-500 border p-2"
                           />
                       </div>
                       <div>
                           <label className="block text-sm font-medium text-gray-700">Serial Number</label>
                           <input 
                               type="text"
                               value={saleDetails.serialNumber}
                               onChange={e => setSaleDetails({...saleDetails, serialNumber: e.target.value})}
                               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-brand-500 focus:border-brand-500 border p-2"
                           />
                       </div>
                       <div>
                           <label className="block text-sm font-medium text-gray-700">Make</label>
                           <input 
                               type="text"
                               value={saleDetails.make}
                               onChange={e => setSaleDetails({...saleDetails, make: e.target.value})}
                               placeholder="e.g. John Deere"
                               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-brand-500 focus:border-brand-500 border p-2"
                           />
                       </div>
                       <div>
                           <label className="block text-sm font-medium text-gray-700">Model</label>
                           <input 
                               type="text"
                               value={saleDetails.model}
                               onChange={e => setSaleDetails({...saleDetails, model: e.target.value})}
                               placeholder="e.g. X350"
                               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-brand-500 focus:border-brand-500 border p-2"
                           />
                       </div>
                   </div>

                   <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div>
                           <label className="block text-sm font-medium text-gray-700 flex items-center">
                               <Tag size={16} className="mr-1 text-gray-400" /> Sale Price (£)
                           </label>
                           <input 
                               type="number"
                               value={saleDetails.price}
                               onChange={e => setSaleDetails({...saleDetails, price: e.target.value})}
                               placeholder="0.00"
                               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-brand-500 focus:border-brand-500 border p-2 text-lg font-semibold text-gray-900"
                           />
                       </div>
                       <div>
                           <label className="block text-sm font-medium text-gray-700">Warranty Period</label>
                           <select 
                               value={saleDetails.warrantyYears}
                               onChange={e => setSaleDetails({...saleDetails, warrantyYears: e.target.value})}
                               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-brand-500 focus:border-brand-500 border p-2"
                           >
                               <option value="1">1 Year Manufacturer</option>
                               <option value="2">2 Years Manufacturer</option>
                               <option value="3">3 Years Extended</option>
                               <option value="5">5 Years Extended</option>
                           </select>
                       </div>
                   </div>

                   <div className="flex justify-between pt-4 border-t border-gray-100">
                       <button 
                           onClick={() => setStep(1)}
                           className="text-gray-600 font-medium hover:text-gray-900"
                       >
                           Back
                       </button>
                       <button 
                           onClick={() => setStep(3)}
                           disabled={!saleDetails.make || !saleDetails.price}
                           className="px-6 py-2 bg-brand-600 text-white rounded-lg font-medium shadow hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed"
                       >
                           Next: Review Sale
                       </button>
                   </div>
               </div>
           )}

           {/* Step 3: Review */}
           {step === 3 && (
               <div className="p-6 space-y-6">
                    <div className="text-center py-4">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 text-green-600">
                            <CreditCard size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Confirm Sale</h3>
                        <p className="text-gray-500">Please review details before processing payment.</p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 space-y-3 text-sm border border-gray-200">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Customer</span>
                            <span className="font-medium text-gray-900">{selectedCustomer?.companyName || selectedCustomer?.name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Machine</span>
                            <span className="font-medium text-gray-900">{saleDetails.make} {saleDetails.model}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Serial No.</span>
                            <span className="font-mono text-gray-900">{saleDetails.serialNumber || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Warranty</span>
                            <span className="font-medium text-gray-900">{saleDetails.warrantyYears} Years</span>
                        </div>
                        <div className="border-t border-gray-200 pt-2 flex justify-between items-center">
                            <span className="font-bold text-gray-800">Total Price</span>
                            <span className="font-bold text-xl text-brand-700">£{parseFloat(saleDetails.price).toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="flex justify-between pt-4">
                       <button 
                           onClick={() => setStep(2)}
                           className="text-gray-600 font-medium hover:text-gray-900"
                       >
                           Back
                       </button>
                       <button 
                           onClick={handleSubmitSale}
                           className="px-8 py-3 bg-brand-600 text-white rounded-lg font-bold shadow-lg hover:bg-brand-700 flex items-center"
                       >
                           <Check size={20} className="mr-2" />
                           Process Sale
                       </button>
                   </div>
               </div>
           )}
       </div>
    </div>
  );
};

export default NewMachineSale;
