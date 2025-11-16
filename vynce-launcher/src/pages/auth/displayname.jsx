import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function SetupDisplayName() {
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');

  const bannedWords = [
    'sex', 's3x', 'sx', 'xxx', 'porn', 'slut', 'fuck',
    'bitch', 'nazi', 'hitler', 'dick', 'pussy', 'cock',
    'whore', 'cunt', 'fag', 'nigger', 'rape', 'anal',
    '69', '420', 'cum', 'penis', 'vagina', 'hentai',
    'nude', 'naked', 'horny', 'masturbat', 'orgasm'
  ];

  const fuzzyPatterns = [
    /(s[\W_]*e[\W_]*x|s[\W_]*x)/i,
    /(f[\W_]*u[\W_]*c[\W_]*k)/i,
    /(p[\W_]*o[\W_]*r[\W_]*n)/i,
    /(n[\W_]*a[\W_]*z[\W_]*i)/i
  ];

  const cleanInput = (value) => {
    return value
      .replace(/\s+/g, ' ')
      .replace(/[\u200B-\u200D\uFEFF]/g, '')
      .replace(/[^\w\s.\-_,\u{1F300}-\u{1F9FF}]/gu, '')
      .trimStart();
  };

  const validateDisplayName = (value) => {
    const trimmed = value.trim();
    const lowered = trimmed.toLowerCase();

    if (trimmed.length < 3) return 'Must be at least 3 characters';
    if (trimmed.length > 30) return 'Cannot exceed 30 characters';

    if (/[^a-zA-Z0-9\s.\-_,\u{1F300}-\u{1F9FF}]/u.test(trimmed)) {
      return 'Only letters, numbers, spaces, and basic punctuation allowed';
    }

    if (/[.\-_,]{2,}/.test(trimmed)) {
      return 'Cannot have consecutive special characters';
    }

    for (const word of bannedWords) {
      if (lowered.includes(word)) {
        return 'This name contains inappropriate content';
      }
    }

    for (const pattern of fuzzyPatterns) {
      if (pattern.test(lowered)) {
        return 'This name contains inappropriate content';
      }
    }

    if (/^\s|\s$/.test(value)) {
      return 'Cannot start or end with spaces';
    }

    return '';
  };

  const handleChange = (e) => {
    const cleaned = cleanInput(e.target.value);
    setDisplayName(cleaned);
    
    if (cleaned.length > 0) {
      const validationError = validateDisplayName(cleaned);
      setError(validationError);
    } else {
      setError('');
    }
  };

  const handleContinue = () => {
    const finalValue = displayName.trim();
    if (!error && finalValue) {
      console.log('Display name set:', finalValue);
    }
  };

  const isValid = displayName.trim().length >= 3 && !error;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-slate-900">Set your display name</h1>
            <p className="text-slate-600">This will appear on your profile</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="displayName" className="text-sm font-medium text-slate-700">
                Display Name
              </label>
              <Input
                id="displayName"
                type="text"
                placeholder="Enter your display name"
                value={displayName}
                onChange={handleChange}
                className="w-full"
                maxLength={30}
              />
              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}
              <p className="text-xs text-slate-500">
                {displayName.trim().length}/30 characters
              </p>
            </div>

            <Button
              onClick={handleContinue}
              disabled={!isValid}
              className="w-full"
              size="lg"
            >
              Continue
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
