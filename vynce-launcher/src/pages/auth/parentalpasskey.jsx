import React, { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Info, AlertTriangle } from 'lucide-react';

export default function ParentPasskeyVerification() {
  const [email, setEmail] = useState('');
  const [passkey, setPasskey] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [showSkipWarning, setShowSkipWarning] = useState(false);

  const handleVerify = () => {
    setIsVerifying(true);
    setVerificationStatus(null);

    // Simulate verification process
    setTimeout(() => {
      setIsVerifying(false);
      // This would be replaced with actual verification logic
      if (email && passkey) {
        setVerificationStatus('success');
      } else {
        setVerificationStatus('error');
      }
    }, 1500);
  };

  const handleSkip = () => {
    setShowSkipWarning(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Parent Verification</CardTitle>
          <CardDescription className="text-center">
            Verify your identity to manage your child's account
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Alert className="mb-6 border-blue-200 bg-blue-50">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-sm text-slate-700">
              Children under 18 require parental verification
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Parent Account Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="parent@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="passkey" className="text-sm font-medium">
                Parent Passkey
              </Label>
              <Input
                id="passkey"
                type="password"
                placeholder="Enter your passkey"
                value={passkey}
                onChange={(e) => setPasskey(e.target.value)}
                className="w-full"
              />
            </div>

            {verificationStatus === 'success' && (
              <Alert className="border-green-200 bg-green-50">
                <AlertDescription className="text-sm text-green-800">
                  Verification successful! Access granted.
                </AlertDescription>
              </Alert>
            )}

            {verificationStatus === 'error' && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-sm text-red-800">
                  Verification failed. Please check your credentials.
                </AlertDescription>
              </Alert>
            )}

            {showSkipWarning && (
              <Alert className="border-orange-200 bg-orange-50">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-sm text-orange-900 font-medium">
                  You must add a Parental Passkey to your Account within 10 Days or your account will be terminated due to safety reasons.
                </AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleVerify}
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={isVerifying}
            >
              {isVerifying ? 'Verifying...' : 'Verify'}
            </Button>

            <Button
              onClick={handleSkip}
              variant="outline"
              className="w-full border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              Skip For Now
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
