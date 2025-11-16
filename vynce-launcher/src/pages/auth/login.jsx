import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [shake, setShake] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    setFadeIn(true);
  }, []);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async () => {
    setError('');
    setEmailError('');
    setPasswordError('');
    
    let hasError = false;

    if (!email) {
      setEmailError('Email or username is required');
      hasError = true;
    } else if (email.includes('@') && !validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      hasError = true;
    }

    if (!password) {
      setPasswordError('Password is required');
      hasError = true;
    } else if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      hasError = true;
    }

    if (hasError) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log('Login attempted:', { email, password, rememberMe });
      setIsLoading(false);
      // Simulate error for demo
      // setError('Invalid credentials. Please try again.');
      // setShake(true);
      // setTimeout(() => setShake(false), 500);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-8px); }
          20%, 40%, 60%, 80% { transform: translateX(8px); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .shake { animation: shake 0.5s; }
        .fade-in { animation: fadeIn 0.6s ease-out; }
      `}</style>
      
      <div className="w-full max-w-md">
        <div className={`bg-white rounded-2xl shadow-xl p-8 space-y-6 ${fadeIn ? 'fade-in' : 'opacity-0'} ${shake ? 'shake' : ''}`}>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-slate-900">Welcome back to Vynce</h1>
            <p className="text-slate-600">Sign in to your account</p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4" onKeyPress={handleKeyPress}>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-slate-700 block">
                Email / Username
              </label>
              <input
                id="email"
                type="text"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError('');
                }}
                disabled={isLoading}
                className={`w-full px-4 py-3 rounded-lg border ${emailError ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-slate-900'} focus:outline-none focus:ring-2 focus:border-transparent transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed`}
                placeholder="Enter your email or username"
              />
              {emailError && (
                <p className="text-sm text-red-600">{emailError}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-slate-700 block">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordError('');
                  }}
                  disabled={isLoading}
                  className={`w-full px-4 py-3 pr-12 rounded-lg border ${passwordError ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-slate-900'} focus:outline-none focus:ring-2 focus:border-transparent transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition disabled:opacity-50"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {passwordError ? (
                <p className="text-sm text-red-600">{passwordError}</p>
              ) : (
                <p className="text-xs text-slate-500">Password must be at least 8 characters</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={isLoading}
                  className="w-4 h-4 text-slate-900 border-slate-300 rounded focus:ring-2 focus:ring-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <span className="text-sm text-slate-700">Remember me</span>
              </label>

              <button
                type="button"
                disabled={isLoading}
                className="text-sm text-slate-900 hover:text-slate-700 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="button"
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full bg-slate-900 text-white font-semibold py-3 rounded-lg hover:bg-slate-800 transition shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-slate-900"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </div>

          <div className="text-center text-sm text-slate-600">
            Don't have an account?{' '}
            <a href="/register" className="text-slate-900 hover:text-slate-700 font-medium transition">
              Sign up
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
