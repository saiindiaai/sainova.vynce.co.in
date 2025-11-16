import React, { useState, useEffect, useRef } from 'react';
import { Check, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function SetupUsername() {
  const [username, setUsername] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const debounceTimer = useRef(null);

  // Banned words list
  const bannedWords = [
    'porn', 'p0rn', 'pr0n', 'pron',
    'sex', 's3x', 'sexx', 'sx',
    'nude', 'nudes', 'naked',
    'xxx', 'xxxx',
    'pussy', 'pussi', 'pussies',
    'dick', 'd1ck', 'dicks',
    'cock', 'c0ck', 'cocks',
    'boobs', 'boob', 'tits', 'tit',
    'ass', 'arse', 'butt',
    'rape', 'rapist',
    'fuck', 'fuk', 'fucker', 'fucking',
    'shit', 'shitt', 'crap',
    'bitch', 'b1tch', 'bitches',
    'slut', 'sluts', 'whore',
    'asshole', 'a55hole',
    'cum', 'jizz',
    'penis', 'vagina',
    'masturbat', 'orgasm',
    'nazi', 'hitler',
    'nigger', 'nigga',
    'fag', 'faggot',
    'retard', 'retarded',
    'kill', 'suicide', 'die',
    'drug', 'cocaine', 'weed', 'meth',
    'anal', 'hentai', 'horny',
    'cunt',
  ];

  // Normalize username to catch leetspeak and tricks
  const normalize = (str) => {
    return str
      .toLowerCase()
      .replace(/0/g, 'o')
      .replace(/1/g, 'i')
      .replace(/3/g, 'e')
      .replace(/4/g, 'a')
      .replace(/5/g, 's')
      .replace(/7/g, 't')
      .replace(/8/g, 'b')
      .replace(/@/g, 'a')
      .replace(/\$/g, 's')
      .replace(/_/g, '')
      .replace(/-/g, '')
      .replace(/\./g, '')
      .replace(/[^a-z0-9]/g, '');
  };

  const trimmedUsername = username.trim().toLowerCase();
  const normalizedUsername = normalize(trimmedUsername);
  
  // Banned number patterns (sexual/drug references)
  const bannedPatterns = [
    '69',
    '420',
    '6969',
    'xxx',
  ];
  
  // Check for banned words
  const isBanned = bannedWords.some(word => normalizedUsername.includes(word));
  
  // Check for banned patterns in original username (before normalization)
  const hasBannedPattern = bannedPatterns.some(pattern => 
    trimmedUsername.includes(pattern)
  );
  
  // Fuzzy matching for common inappropriate words with separators
  const fuzzyPatterns = [
    /(s[\W_]*e[\W_]*x|s[\W_]*x)/i,           // sex, s3x, s*x, s_x, sx
    /(p[\W_]*o[\W_]*r[\W_]*n)/i,             // porn, p*o*r*n, p_o_r_n
    /(f[\W_]*u[\W_]*c[\W_]*k)/i,             // fuck, f*u*c*k, f_u_c_k
    /(d[\W_]*i[\W_]*c[\W_]*k)/i,             // dick, d*i*c*k, d_i_c_k
    /(a[\W_]*s[\W_]*s)/i,                    // ass, a*s*s, a_s_s
    /(n[\W_]*u[\W_]*d[\W_]*e)/i,             // nude, n*u*d*e, n_u_d_e
    /(n[\W_]*a[\W_]*z[\W_]*i)/i,             // nazi, n*a*z*i
  ];
  
  const matchesFuzzyPattern = fuzzyPatterns.some(pattern => 
    pattern.test(trimmedUsername)
  );
  
  // Combined inappropriate check
  const isInappropriate = isBanned || hasBannedPattern || matchesFuzzyPattern;
  const isClean = !isInappropriate;
  
  // Validation rules
  const isValidLength = trimmedUsername.length >= 3 && trimmedUsername.length <= 20;
  const startsWithLetter = /^[a-z]/.test(trimmedUsername);
  const endsWithValidChar = /[a-z0-9]$/.test(trimmedUsername);
  const noConsecutiveUnderscores = !/_{2,}/.test(trimmedUsername);
  const notOnlyNumbers = !/^\d+$/.test(trimmedUsername);
  const onlyValidChars = /^[a-z0-9_]+$/.test(trimmedUsername);
  const hasNoSpaces = !trimmedUsername.includes(' ');
  
  const isValid = isValidLength && startsWithLetter && endsWithValidChar && 
                  noConsecutiveUnderscores && notOnlyNumbers && onlyValidChars && 
                  hasNoSpaces && isClean;
  
  // Get error message
  const getErrorMessage = () => {
    if (!username) return null;
    if (isInappropriate) return 'Username contains inappropriate content';
    if (trimmedUsername.includes(' ')) return 'Username cannot contain spaces';
    if (username !== username.toLowerCase()) return 'Only lowercase letters allowed';
    if (trimmedUsername && !startsWithLetter) return 'Must start with a letter';
    if (trimmedUsername && !endsWithValidChar) return 'Cannot end with underscore';
    if (trimmedUsername && !noConsecutiveUnderscores) return 'No consecutive underscores allowed';
    if (trimmedUsername && notOnlyNumbers === false) return 'Cannot be only numbers';
    if (trimmedUsername && !onlyValidChars) return 'Only letters, numbers, and underscores';
    return null;
  };

  const errorMessage = getErrorMessage();

  // Debounced availability check
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Reset availability if invalid
    if (!isValid) {
      setIsAvailable(null);
      setIsChecking(false);
      return;
    }

    setIsChecking(true);
    setIsAvailable(null);

    debounceTimer.current = setTimeout(() => {
      checkUsernameAvailability(trimmedUsername);
    }, 500);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [trimmedUsername, isValid]);

  const checkUsernameAvailability = async (username) => {
    try {
      // Simulate network error 10% of the time
      if (Math.random() < 0.1) {
        throw new Error('Network error');
      }
      
      // For demo: simulate some taken usernames
      const takenUsernames = ['admin', 'vynce', 'test', 'user', 'demo'];
      const available = !takenUsernames.includes(username);
      
      setIsChecking(false);
      setIsAvailable(available);
    } catch (error) {
      setIsChecking(false);
      setIsAvailable('error');
    }
  };

  const handleUsernameChange = (e) => {
    const value = e.target.value;
    setUsername(value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleContinue();
    }
  };

  const handleContinue = async () => {
    if (!isValid || isAvailable === false) return;
    
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // In production: submit username and navigate
    console.log('Username submitted:', trimmedUsername);
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-slate-900">Choose your username</h1>
            <p className="text-slate-600">Your @username will be your profile link</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium text-slate-700">
                Username
              </label>
              <div className="relative">
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={handleUsernameChange}
                  onKeyDown={handleKeyDown}
                  placeholder="johndoe"
                  className="w-full pr-10"
                  maxLength={20}
                />
                {isValid && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {isChecking ? (
                      <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
                    ) : isAvailable === true ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : isAvailable === false ? (
                      <X className="w-4 h-4 text-red-600" />
                    ) : null}
                  </div>
                )}
              </div>
              
              {errorMessage && (
                <p className="text-sm text-red-600">{errorMessage}</p>
              )}

              {username && !isChecking && isAvailable !== null && !errorMessage && (
                <p className={`text-sm ${
                  isAvailable === true 
                    ? 'text-green-600' 
                    : isAvailable === false 
                    ? 'text-red-600' 
                    : 'text-amber-600'
                }`}>
                  {isAvailable === true 
                    ? '✓ Username is available' 
                    : isAvailable === false 
                    ? 'Username is already taken'
                    : '⚠ Unable to check username. Please try again.'}
                </p>
              )}

              <div className="text-xs text-slate-500 space-y-1">
                <p className={isValidLength ? 'text-green-600' : ''}>
                  • 3–20 characters
                </p>
                <p className={startsWithLetter || !username ? 'text-slate-500' : 'text-red-600'}>
                  • Must start with a letter
                </p>
                <p className={endsWithValidChar || !username ? 'text-slate-500' : 'text-red-600'}>
                  • Cannot end with underscore
                </p>
                <p className={onlyValidChars || !username ? 'text-slate-500' : 'text-red-600'}>
                  • Only letters, numbers, and underscores
                </p>
                <p className={noConsecutiveUnderscores || !username ? 'text-slate-500' : 'text-red-600'}>
                  • No consecutive underscores
                </p>
              </div>
            </div>

            <Button
              onClick={handleContinue}
              disabled={!isValid || isAvailable === false || isAvailable === 'error' || isSubmitting || isChecking}
              className="w-full"
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  <span>Setting up...</span>
                </>
              ) : (
                'Continue'
              )}
            </Button>
          </div>

          <p className="text-center text-slate-500 text-sm">
            You can change this later in settings
          </p>
        </div>
      </div>
    </div>
  );
}
