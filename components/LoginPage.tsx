
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Loader2, Lock, Mail, Wrench, ArrowRight, CheckCircle } from 'lucide-react';

const LoginPage: React.FC = () => {
  const { login, ssoLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'login' | 'forgot'>('login');
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      setIsSubmitting(true);
      
      try {
          if (mode === 'login') {
            await login(email, password);
          } else {
             // Mock reset
             await new Promise(r => setTimeout(r, 1500));
             setResetSent(true);
          }
      } catch (err: any) {
          setError(err.message || 'Authentication failed. Use "password" for demo.');
      } finally {
          setIsSubmitting(false);
      }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
       {/* Left Side - Brand / Image */}
       <div className="hidden lg:flex lg:w-1/2 bg-brand-800 relative overflow-hidden flex-col justify-between p-12 text-white">
          <div className="z-10">
              <div className="flex items-center space-x-3 mb-8">
                <div className="bg-white/20 p-2.5 rounded-full">
                    <Wrench size={32} className="text-white" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight">HardenGear</h1>
              </div>
              <h2 className="text-4xl font-extrabold leading-tight mb-6">
                  Manage your workshop <br/> with precision.
              </h2>
              <p className="text-brand-100 text-lg max-w-md">
                  Secure, AI-powered repair tracking for modern service centers.
              </p>
          </div>
          
          <div className="z-10 grid grid-cols-2 gap-6 text-sm text-brand-200">
             <div className="flex items-center"><CheckCircle size={16} className="mr-2 text-brand-400" /> AI Diagnostics</div>
             <div className="flex items-center"><CheckCircle size={16} className="mr-2 text-brand-400" /> Client Portal</div>
             <div className="flex items-center"><CheckCircle size={16} className="mr-2 text-brand-400" /> Parts Inventory</div>
             <div className="flex items-center"><CheckCircle size={16} className="mr-2 text-brand-400" /> Secure Cloud</div>
          </div>

          {/* Decorative Pattern */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-brand-700 opacity-50 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-brand-600 opacity-30 blur-3xl"></div>
       </div>

       {/* Right Side - Login Form */}
       <div className="flex-1 flex flex-col justify-center items-center p-4 sm:p-12">
           <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
               
               <div className="text-center lg:text-left">
                   <div className="lg:hidden flex justify-center mb-4">
                        <div className="bg-brand-600 p-2 rounded-full text-white">
                            <Wrench size={24} />
                        </div>
                   </div>
                   <h2 className="text-2xl font-bold text-gray-900">
                       {mode === 'login' ? 'Sign in to your account' : 'Reset Password'}
                   </h2>
                   <p className="mt-2 text-sm text-gray-500">
                       {mode === 'login' 
                        ? 'Welcome back! Please enter your details.' 
                        : 'Enter your email to receive reset instructions.'}
                   </p>
               </div>

               {resetSent ? (
                   <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-center">
                       <CheckCircle size={48} className="text-green-500 mx-auto mb-2" />
                       <h3 className="text-green-800 font-bold">Check your email</h3>
                       <p className="text-green-700 text-sm mt-1">We've sent a reset link to {email}</p>
                       <button 
                         onClick={() => { setResetSent(false); setMode('login'); }}
                         className="mt-4 text-green-700 font-medium hover:underline text-sm"
                       >
                           Return to login
                       </button>
                   </div>
               ) : (
                   <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                       <div className="space-y-4">
                           <div>
                               <label className="block text-sm font-medium text-gray-700">Email address</label>
                               <div className="mt-1 relative rounded-md shadow-sm">
                                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                       <Mail size={18} className="text-gray-400" />
                                   </div>
                                   <input
                                       type="email"
                                       required
                                       value={email}
                                       onChange={(e) => setEmail(e.target.value)}
                                       className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                                       placeholder="name@company.com"
                                   />
                               </div>
                           </div>

                           {mode === 'login' && (
                               <div>
                                   <label className="block text-sm font-medium text-gray-700">Password</label>
                                   <div className="mt-1 relative rounded-md shadow-sm">
                                       <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                           <Lock size={18} className="text-gray-400" />
                                       </div>
                                       <input
                                           type="password"
                                           required
                                           value={password}
                                           onChange={(e) => setPassword(e.target.value)}
                                           className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                                           placeholder="••••••••"
                                       />
                                   </div>
                               </div>
                           )}
                       </div>

                       {error && (
                           <div className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-100">
                               {error}
                           </div>
                       )}

                       {mode === 'login' && (
                           <div className="flex items-center justify-between">
                               <div className="flex items-center">
                                   <input
                                       id="remember-me"
                                       name="remember-me"
                                       type="checkbox"
                                       className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300 rounded"
                                   />
                                   <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                                       Remember me
                                   </label>
                               </div>

                               <button
                                   type="button"
                                   onClick={() => setMode('forgot')}
                                   className="text-sm font-medium text-brand-600 hover:text-brand-500"
                               >
                                   Forgot password?
                               </button>
                           </div>
                       )}

                       <button
                           type="submit"
                           disabled={isSubmitting}
                           className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-colors disabled:opacity-70"
                       >
                           {isSubmitting ? (
                               <Loader2 size={18} className="animate-spin" />
                           ) : (
                               <>
                                   {mode === 'login' ? 'Sign in' : 'Send Reset Link'}
                                   <ArrowRight size={18} className="ml-2 opacity-80" />
                               </>
                           )}
                       </button>
                   </form>
               )}
               
               {mode === 'login' && (
                   <div>
                       <div className="relative mt-6">
                           <div className="absolute inset-0 flex items-center">
                               <div className="w-full border-t border-gray-200" />
                           </div>
                           <div className="relative flex justify-center text-sm">
                               <span className="px-2 bg-white text-gray-500">Or continue with</span>
                           </div>
                       </div>

                       <div className="mt-6 grid grid-cols-3 gap-3">
                           <button onClick={() => ssoLogin('google')} className="flex justify-center items-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                               <span className="sr-only">Sign in with Google</span>
                               <svg className="h-5 w-5" viewBox="0 0 24 24">
                                   <path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z" fill="currentColor" />
                               </svg>
                           </button>

                           <button onClick={() => ssoLogin('microsoft')} className="flex justify-center items-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                               <span className="sr-only">Sign in with Microsoft</span>
                               <svg className="h-5 w-5" viewBox="0 0 23 23">
                                   <path fill="#f3f3f3" d="M0 0h23v23H0z"/><path fill="#f35325" d="M1 1h10v10H1z"/><path fill="#81bc06" d="M12 1h10v10H12z"/><path fill="#05a6f0" d="M1 12h10v10H1z"/><path fill="#ffba08" d="M12 12h10v10H12z"/>
                               </svg>
                           </button>

                           <button onClick={() => ssoLogin('apple')} className="flex justify-center items-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                               <span className="sr-only">Sign in with Apple</span>
                               <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                   <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12c0-5.523-4.477-10-10-10z" />
                               </svg>
                           </button>
                       </div>
                   </div>
               )}

               {mode === 'forgot' && (
                    <div className="text-center mt-4">
                        <button 
                            onClick={() => setMode('login')}
                            className="text-sm font-medium text-brand-600 hover:text-brand-500"
                        >
                            Back to Sign In
                        </button>
                    </div>
               )}
           </div>
       </div>
    </div>
  );
};

export default LoginPage;
