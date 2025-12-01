
import React, { useState, useEffect } from 'react';
import { Search, Loader2, User, Building2, MapPin, Check, Package, Trash2, Plus, CreditCard } from 'lucide-react';
import { CustomerDetails } from '../types';
import { searchCustomers } from '../services/customerService';

interface PartItem {
    id: string;
    partNumber: string;
    description: string;
    quantity: number;
    unitPrice: number;
}

const PartsSale: React.FC = () => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [customerQuery, setCustomerQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<CustomerDetails[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDetails | null>(null);
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  
  // Basket State
  const [basket, setBasket] = useState<PartItem[]>([]);
  const [newItem, setNewItem] = useState<Omit<PartItem, 'id'>>({
      partNumber: '',
      description: '',
      quantity: 1,
      unitPrice: 0
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

  const handleAddItem = () => {
      if (!newItem.partNumber || !newItem.description) return;
      
      const item: PartItem = {
          ...newItem,
          id: Math.random().toString(36).substr(2, 9),
          unitPrice: Number(newItem.unitPrice) // Ensure number
      };

      setBasket([...basket, item]);
      setNewItem({ partNumber: '', description: '', quantity: 1, unitPrice: 0 });
  };

  const handleRemoveItem = (id: string) => {
      setBasket(basket.filter(item => item.id !== id));
  };

  const calculateTotal = () => {
      return basket.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
  };

  const handleSubmitSale = () => {
      alert(`Parts Sale Processed! Invoice #PRT-${Math.floor(Math.random() * 10000)} for £${calculateTotal().toFixed(2)}`);
      setStep(1);
      handleClearCustomer();
      setBasket([]);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
       <div className="flex items-center justify-between mb-2">
           <h2 className="text-xl font-bold text-gray-900 flex items-center">
               <Package className="mr-2 text-brand-600" />
               Parts Sale
           </h2>
           <div className="flex space-x-2">
               <span className={`px-3 py-1 rounded-full text-xs font-bold ${step >= 1 ? 'bg-brand-600 text-white' : 'bg-gray-200 text-gray-500'}`}>1. Customer</span>
               <span className={`px-3 py-1 rounded-full text-xs font-bold ${step >= 2 ? 'bg-brand-600 text-white' : 'bg-gray-200 text-gray-500'}`}>2. Basket</span>
               <span className={`px-3 py-1 rounded-full text-xs font-bold ${step >= 3 ? 'bg-brand-600 text-white' : 'bg-gray-200 text-gray-500'}`}>3. Confirm</span>
           </div>
       </div>

       <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
           
           {/* Step 1: Customer Selection (Reused UX) */}
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
                                           name: 'Counter Sale / Guest',
                                           accountType: 'Personal',
                                           address: 'Counter Sale',
                                           postcode: '',
                                           email: '',
                                           phone: ''
                                       });
                                   }}
                                   className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg shadow-sm hover:bg-gray-50"
                               >
                                   Process as Guest
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
                               Next: Add Parts
                           </button>
                       </div>
                   )}
               </div>
           )}

           {/* Step 2: Parts Basket */}
           {step === 2 && (
               <div className="p-6 space-y-6">
                   <h3 className="text-lg font-medium text-gray-800">Parts Basket</h3>
                   
                   {/* Add Item Form */}
                   <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 grid grid-cols-12 gap-3 items-end">
                       <div className="col-span-12 sm:col-span-3">
                           <label className="block text-xs font-medium text-gray-700 mb-1">Part Number</label>
                           <input 
                               type="text"
                               value={newItem.partNumber}
                               onChange={e => setNewItem({...newItem, partNumber: e.target.value})}
                               className="block w-full rounded border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 text-sm p-2 border"
                               placeholder="123-ABC"
                           />
                       </div>
                       <div className="col-span-12 sm:col-span-4">
                           <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                           <input 
                               type="text"
                               value={newItem.description}
                               onChange={e => setNewItem({...newItem, description: e.target.value})}
                               className="block w-full rounded border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 text-sm p-2 border"
                               placeholder="Oil Filter"
                           />
                       </div>
                       <div className="col-span-4 sm:col-span-2">
                           <label className="block text-xs font-medium text-gray-700 mb-1">Qty</label>
                           <input 
                               type="number"
                               min="1"
                               value={newItem.quantity}
                               onChange={e => setNewItem({...newItem, quantity: parseInt(e.target.value) || 1})}
                               className="block w-full rounded border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 text-sm p-2 border"
                           />
                       </div>
                       <div className="col-span-4 sm:col-span-2">
                           <label className="block text-xs font-medium text-gray-700 mb-1">Unit Price (£)</label>
                           <input 
                               type="number"
                               min="0"
                               step="0.01"
                               value={newItem.unitPrice}
                               onChange={e => setNewItem({...newItem, unitPrice: parseFloat(e.target.value) || 0})}
                               className="block w-full rounded border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 text-sm p-2 border"
                           />
                       </div>
                       <div className="col-span-4 sm:col-span-1">
                           <button 
                               onClick={handleAddItem}
                               disabled={!newItem.partNumber || !newItem.description}
                               className="w-full h-[38px] bg-brand-600 text-white rounded shadow-sm hover:bg-brand-700 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                               title="Add to Basket"
                           >
                               <Plus size={20} />
                           </button>
                       </div>
                   </div>

                   {/* Basket Table */}
                   <div className="border border-gray-200 rounded-lg overflow-hidden">
                       <table className="min-w-full divide-y divide-gray-200">
                           <thead className="bg-gray-50">
                               <tr>
                                   <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Part #</th>
                                   <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                                   <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Qty</th>
                                   <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                                   <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
                               </tr>
                           </thead>
                           <tbody className="bg-white divide-y divide-gray-200">
                               {basket.length === 0 ? (
                                   <tr>
                                       <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500 italic">
                                           Basket is empty. Add parts above.
                                       </td>
                                   </tr>
                               ) : (
                                   basket.map((item) => (
                                       <tr key={item.id} className="hover:bg-gray-50">
                                           <td className="px-4 py-3 text-sm font-mono text-gray-900">{item.partNumber}</td>
                                           <td className="px-4 py-3 text-sm text-gray-700">{item.description}</td>
                                           <td className="px-4 py-3 text-sm text-gray-700 text-right">{item.quantity}</td>
                                           <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">
                                               £{(item.quantity * item.unitPrice).toFixed(2)}
                                           </td>
                                           <td className="px-4 py-3 text-center">
                                               <button 
                                                   onClick={() => handleRemoveItem(item.id)}
                                                   className="text-gray-400 hover:text-red-600 transition-colors"
                                               >
                                                   <Trash2 size={16} />
                                               </button>
                                           </td>
                                       </tr>
                                   ))
                               )}
                           </tbody>
                           {basket.length > 0 && (
                               <tfoot className="bg-gray-50">
                                   <tr>
                                       <td colSpan={3} className="px-4 py-3 text-right text-sm font-bold text-gray-700">Grand Total:</td>
                                       <td className="px-4 py-3 text-right text-sm font-bold text-brand-700 border-t-2 border-brand-200">
                                           £{calculateTotal().toFixed(2)}
                                       </td>
                                       <td></td>
                                   </tr>
                               </tfoot>
                           )}
                       </table>
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
                           disabled={basket.length === 0}
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
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 text-blue-600">
                            <CreditCard size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Confirm Parts Sale</h3>
                        <p className="text-gray-500">Please review details before processing payment.</p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm border border-gray-200">
                        <div className="flex justify-between pb-2 border-b border-gray-200">
                            <span className="text-gray-500">Customer</span>
                            <span className="font-medium text-gray-900">{selectedCustomer?.companyName || selectedCustomer?.name}</span>
                        </div>
                        <div className="py-2">
                             <p className="text-xs text-gray-400 uppercase font-bold mb-2">Items</p>
                             <ul className="space-y-1">
                                 {basket.map(item => (
                                     <li key={item.id} className="flex justify-between text-gray-700">
                                         <span>{item.quantity}x {item.description} <span className="text-gray-400 text-xs">({item.partNumber})</span></span>
                                         <span>£{(item.quantity * item.unitPrice).toFixed(2)}</span>
                                     </li>
                                 ))}
                             </ul>
                        </div>
                        <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
                            <span className="font-bold text-gray-800">Total Amount Due</span>
                            <span className="font-bold text-xl text-brand-700">£{calculateTotal().toFixed(2)}</span>
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
                           Process Payment
                       </button>
                   </div>
               </div>
           )}
       </div>
    </div>
  );
};

export default PartsSale;
