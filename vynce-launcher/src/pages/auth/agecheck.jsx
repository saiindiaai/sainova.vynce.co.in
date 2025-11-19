import React, { useState } from 'react';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { AlertCircle, Check } from 'lucide-react';

export default function AgeCheck() {
  const [age, setAge] = useState('');

  const handleAgeChange = (e) => {
    const value = e.target.value;
    if (value === '' || (Number(value) >= 0 && Number(value) <= 150)) {
      setAge(value);
    }
  };

  const isAdult = age !== '' && Number(age) >= 18;
  const isChildAccount = age !== '' && Number(age) < 18;

  const handleContinue = () => {
    if (age !== '') {
      alert(isChildAccount ? 'Child account created - Parental verification required' : 'Age verified!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          
          {/* HEADER */}
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold text-slate-900">Verify your age</h1>
            <p className="text-slate-600">We need this for your safety</p>
          </div>

          {/* AGE INPUT */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="age" className="text-sm font-medium text-slate-700">
                How old are you?
              </Label>
              <div className="relative">
                <Input
                  id="age"
                  type="number"
                  placeholder="Enter your age"
                  value={age}
                  onChange={handleAgeChange}
                  min="0"
                  max="150"
                  className="pr-10"
                />

                {age !== '' && (
                  <Check className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" size={20} />
                )}
              </div>
            </div>

            {/* STANDARD ALERT - Age 18+ */}
            {(age === '' || isAdult) && (
              <Alert className="border-amber-200 bg-amber-50">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800 text-sm">
                  You must be 13+ to continue
                </AlertDescription>
              </Alert>
            )}

            {/* CHILD ACCOUNT WARNING - Age < 18 */}
            {isChildAccount && (
              <Alert className="border-amber-200 bg-amber-50">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800 text-sm space-y-2">
                  <p>Your account will be created as a Child Account (Age: {age}).</p>
                  <p>You must connect a Parental Passkey to your account within the next 10 days.</p>
                  <p>If parental approval is not completed within 10 days, your account will be permanently disabled and removed for safety reasons.</p>
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* CONTINUE BUTTON */}
          {isAdult ? (
            <Button
              onClick={handleContinue}
              disabled={age === ''}
              size="lg"
              className="w-full"
            >
              Continue
            </Button>
          ) : (
            <Button
              onClick={handleContinue}
              disabled={age === ''}
              size="lg"
              className="w-full"
            >
              Add Parental Passkey Now
            </Button>
          )}

        </div>

        <p className="text-center mt-6 text-sm text-slate-600">
          By continuing, you agree to our Terms of Service
        </p>
      </div>
    </div>
  );
}
