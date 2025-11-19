import { useState } from 'react';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Eye, EyeOff, Check, Mail } from 'lucide-react';
import { createGuestAccount } from "../../api";

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailValid, setEmailValid] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const emailDomains = ['@gmail.com', '@outlook.com', '@yahoo.com', '@icloud.com'];

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

const handleGuestAccount = async () => {
  try {
    setLoading(true);
    const res = await createGuestAccount();
    alert(`Guest account created! VUID: ${res.vuid}`);
    window.location.href = "/username";
  } catch (err) {
    alert("Failed to create guest account.");
  } finally {
    setLoading(false);
  }
};

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    setEmailValid(validateEmail(value));
    setEmailError('');
    
    if (value.includes('@') && !value.includes('.')) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const applySuggestion = (domain) => {
    const username = email.split('@')[0];
    setEmail(username + domain);
    setShowSuggestions(false);
    setEmailValid(true);
  };

  const handleSubmit = () => {
    setEmailError('');
    setPasswordError('');

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert('Registration successful! 🎉');
    }, 1500);
  };

  const isValid = 
    email.trim() && 
    emailValid && 
    password.length >= 8 && 
    password === confirmPassword;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-slate-900">Create your account</h1>
            <p className="text-slate-600">Join Vynce today</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2 relative">
              <label htmlFor="email" className="text-sm font-medium text-slate-700">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={handleEmailChange}
                  onFocus={() => email.includes('@') && !email.includes('.') && setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  className="pl-10 pr-11"
                />
                {emailValid && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                    <Check size={20} />
                  </div>
                )}
              </div>
              {emailError && (
                <p className="text-sm text-red-600">{emailError}</p>
              )}
              
              {showSuggestions && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg">
                  {emailDomains.map((domain) => (
                    <button
                      key={domain}
                      type="button"
                      onClick={() => applySuggestion(domain)}
                      className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-blue-50 transition first:rounded-t-lg last:rounded-b-lg"
                    >
                      {email.split('@')[0]}{domain}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-slate-700">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                {password.length >= 8 && (
                  <Check size={14} className="text-green-500" />
                )}
                Must be at least 8 characters
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">
                Confirm Password
              </label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {confirmPassword && (
                <p className="text-xs flex items-center gap-1">
                  {password === confirmPassword && password.length > 0 ? (
                    <>
                      <Check size={14} className="text-green-500" />
                      <span className="text-green-600">Passwords match</span>
                    </>
                  ) : (
                    <span className="text-slate-500">Passwords must match</span>
                  )}
                </p>
              )}
              {passwordError && (
                <p className="text-sm text-red-600">{passwordError}</p>
              )}
            </div>

            <Button
              onClick={handleSubmit}
              disabled={!isValid || loading}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Creating account...
                </span>
              ) : (
                'Register'
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500">or</span>
              </div>
            </div>

   <Button
  onClick={async () => {
    const res = await fetch('https://vynce-backend.onrender.com/api/auth/guest', {
      method: 'POST'
    });
    const data = await res.json();
    alert(`Guest VUID: ${data.vuid}`);
  }}
  variant="outline"
  className="w-full"
  size="lg"
>
  Make Guest Account
</Button>>
          </div>

          <div className="text-center">
            <p className="text-slate-600 text-sm">
              Already have an account?{' '}
              <a href="/login" className="text-blue-600 font-medium hover:text-blue-700 hover:underline transition">
                Sign in
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
