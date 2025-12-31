import React, { useState } from 'react';
import { User } from '../types';
import { supabase } from '../supabaseClient';

interface AuthViewProps {
  onAuth: (user: User) => void;
  t: (key: string) => string;
}

const AuthView: React.FC<AuthViewProps> = ({ onAuth, t }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState<'input' | 'verify'>('input');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [authMethod, setAuthMethod] = useState<'email' | 'phone' | 'apple'>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
    } else if (data.user) {
      onAuth({
        email: data.user.email,
        name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'User',
        authMethod: 'email'
      });
    }
    setLoading(false);
  };

  const startSignupVerification = async (method: 'email' | 'phone') => {
    if (method === 'email' && (!email || !password || !name)) {
      setError('Please fill in name, email and password');
      return;
    }
    if (method === 'phone' && !phone) {
      setError('Please enter your phone number');
      return;
    }

    setLoading(true);
    setError(null);
    setAuthMethod(method);

    if (method === 'phone') {
      const { error: phoneError } = await supabase.auth.signInWithOtp({
        phone,
      });
      if (phoneError) {
        setError(phoneError.message);
        setLoading(false);
        return;
      }
    } else {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password, // Use the user-provided password
        options: {
          data: { full_name: name }
        }
      });
      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }
    }

    setStep('verify');
    setLoading(false);
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const verificationCode = otp.join('');
    if (verificationCode.length === 6) {
      setLoading(true);
      setError(null);

      // Fix: Split OTP verification into separate calls to satisfy Supabase type definitions for discriminated unions
      const { data, error: verifyError } = authMethod === 'phone'
        ? await supabase.auth.verifyOtp({
            phone,
            token: verificationCode,
            type: 'sms'
          })
        : await supabase.auth.verifyOtp({
            email,
            token: verificationCode,
            type: 'signup'
          });

      if (verifyError) {
        setError(verifyError.message);
      } else if (data.user) {
        onAuth({
          email: data.user.email,
          phone: data.user.phone,
          name: data.user.user_metadata?.full_name || name || 'User',
          authMethod: authMethod
        });
      }
      setLoading(false);
    }
  };

  const handleAppleAuth = async () => {
    const { data, error: appleError } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
    });
    if (appleError) setError(appleError.message);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  if (step === 'verify') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-md bg-white rounded-[3.5rem] shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-300">
          <div className="p-8 md:p-12 text-center">
            <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto mb-8 text-indigo-600 shadow-inner">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
              </svg>
            </div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-3">Verify Identity</h2>
            <p className="text-slate-400 font-medium mb-6">
              We've sent a 6-digit verification code to <br/>
              <span className="text-indigo-600 font-bold">{authMethod === 'email' ? email : phone}</span>
            </p>

            {error && <div className="mb-6 p-4 bg-rose-50 text-rose-600 rounded-2xl text-xs font-bold">{error}</div>}

            <form onSubmit={handleVerify} className="space-y-10">
              <div className="flex justify-between gap-2">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`otp-${idx}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    className="w-12 h-16 text-center text-2xl font-black bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-600 focus:bg-white outline-none transition-all"
                  />
                ))}
              </div>
              
              <div className="space-y-4">
                <button 
                  type="submit"
                  disabled={otp.some(d => !d) || loading}
                  className="w-full py-5 bg-indigo-600 text-white rounded-3xl font-black uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 disabled:opacity-50 transition-all active:scale-95"
                >
                  {loading ? 'Verifying...' : 'Verify & Create Account'}
                </button>
                <button 
                  type="button"
                  onClick={() => setStep('input')}
                  className="text-xs font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600"
                >
                  Back to signup
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-md bg-white rounded-[3.5rem] shadow-2xl overflow-hidden border border-slate-100 flex flex-col transition-all">
        <div className="p-8 md:p-12 text-center bg-indigo-600 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-full"></div>
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-md relative z-10">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 14l9-5-9-5-9 5 9 5z"/><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/>
            </svg>
          </div>
          <h2 className="text-3xl font-black tracking-tight mb-2 relative z-10">
            {isLogin ? t('welcomeBack') : t('createAccount')}
          </h2>
          <p className="text-indigo-100 font-medium relative z-10">Cloud School Management System</p>
        </div>

        <div className="p-8 md:p-12 flex-1 space-y-8">
          {error && <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl text-xs font-bold animate-pulse">{error}</div>}

          {isLogin ? (
            <form onSubmit={handleEmailLogin} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('email')}</label>
                <input 
                  required
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 ring-indigo-50 font-bold transition-all"
                  placeholder="admin@school.com"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('password')}</label>
                <input 
                  required
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 ring-indigo-50 font-bold transition-all"
                  placeholder="••••••••"
                />
              </div>
              <button 
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-indigo-600 text-white rounded-3xl font-black uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all mt-4 disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : t('login')}
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                  <input 
                    required
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 ring-indigo-50 font-bold transition-all"
                    placeholder="Enter your name"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('password')}</label>
                  <input 
                    required
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 ring-indigo-50 font-bold transition-all"
                    placeholder="Set a password"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('email')}</label>
                    <div className="flex gap-2">
                      <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="flex-1 p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 ring-indigo-50 font-bold transition-all"
                        placeholder="name@example.com"
                      />
                      <button 
                        type="button"
                        disabled={loading}
                        onClick={() => startSignupVerification('email')}
                        className="px-6 bg-white border-2 border-indigo-600 text-indigo-600 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-indigo-50 transition-all disabled:opacity-50"
                      >
                        {t('signup')}
                      </button>
                    </div>
                  </div>

                  <div className="relative flex items-center justify-center py-2">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
                    <span className="relative bg-white px-4 text-[10px] font-black text-slate-300 uppercase tracking-widest">{t('or')}</span>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('phone')}</label>
                    <div className="flex gap-2">
                      <input 
                        type="tel" 
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="flex-1 p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 ring-indigo-50 font-bold transition-all"
                        placeholder="+91 00000 00000"
                      />
                      <button 
                        type="button"
                        disabled={loading}
                        onClick={() => startSignupVerification('phone')}
                        className="px-6 bg-emerald-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-50 disabled:opacity-50"
                      >
                        Verify
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative flex items-center justify-center py-2">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
                <span className="relative bg-white px-4 text-[10px] font-black text-slate-300 uppercase tracking-widest">{t('or')}</span>
              </div>

              <button 
                onClick={handleAppleAuth}
                className="w-full py-5 bg-black text-white rounded-3xl font-black uppercase tracking-widest shadow-xl shadow-slate-200 hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 384 512"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg>
                {t('appleId')}
              </button>
            </div>
          )}

          <div className="pt-6 text-center border-t border-slate-50">
            <button 
              onClick={() => { setIsLogin(!isLogin); setStep('input'); setError(null); }}
              className="text-xs font-black text-indigo-600 uppercase tracking-widest hover:underline transition-all"
            >
              {isLogin ? t('dontHaveAccount') : t('alreadyHaveAccount')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthView;
