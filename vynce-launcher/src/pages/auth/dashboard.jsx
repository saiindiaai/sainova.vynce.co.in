import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { CheckCircle2, XCircle, Mail, Lock, User, Calendar, Shield, Key, Edit2, AlertCircle } from 'lucide-react';

export default function VynceVerificationDashboard({ 
  credentials,
  onEdit,
  onCreateAccount,
  onGoBack
}) {
  const [showWarning, setShowWarning] = useState(false);
  const [warningType, setWarningType] = useState('');
  const [childConfirmed, setChildConfirmed] = useState(false);
  const [teenConfirmed, setTeenConfirmed] = useState(false);
  const [validationError, setValidationError] = useState('');

  const credentialGroups = [
    {
      title: 'Login Security',
      icon: Lock,
      items: [
        {
          label: 'Email',
          value: credentials?.email,
          field: 'email',
          icon: Mail,
          sensitive: false
        },
        {
          label: 'Password',
          value: credentials?.password ? '••••••••••••' : '',
          field: 'password',
          icon: Lock,
          sensitive: true
        }
      ]
    },
    {
      title: 'Social Identity',
      icon: User,
      items: [
        {
          label: 'Username',
          value: credentials?.username,
          field: 'username',
          icon: User,
          sensitive: false
        },
        {
          label: 'Display Name',
          value: credentials?.displayName,
          field: 'displayName',
          icon: User,
          sensitive: false
        },
        {
          label: 'Age',
          value: credentials?.age,
          field: 'age',
          icon: Calendar,
          sensitive: false
        }
      ]
    },
    {
      title: 'Parental Controls',
      icon: Shield,
      items: [
        {
          label: 'Parent Account Email',
          value: credentials?.parentEmail,
          field: 'parentEmail',
          icon: Shield,
          sensitive: false
        },
        {
          label: 'Parental Passkey',
          value: credentials?.parentalPasskey ? '••••••' : '',
          field: 'parentalPasskey',
          icon: Key,
          sensitive: true
        }
      ]
    }
  ];

  const handleCreateAccount = () => {
    setWarningType('create');
    setShowWarning(true);
    setValidationError('');
  };

  const handleGoBack = () => {
    setWarningType('goback');
    setShowWarning(true);
  };

  const confirmAction = () => {
    // Validate child account requirements before proceeding
    if (isChildAccount) {
      if (!credentials?.parentEmail || !credentials?.parentalPasskey) {
        setValidationError('Child accounts require both Parent Email and Parental Passkey to be provided.');
        return;
      }
    }

    // Validate teen account requirements before proceeding
    if (isTeenAccount) {
      if (!credentials?.parentEmail || !credentials?.parentalPasskey) {
        setValidationError('Teen accounts require both Parent Email and Parental Passkey to be provided.');
        return;
      }
    }

    if (warningType === 'create') {
      onCreateAccount?.();
    } else {
      onGoBack?.();
    }
    setShowWarning(false);
    setChildConfirmed(false);
    setTeenConfirmed(false);
    setValidationError('');
  };

  const cancelAction = () => {
    setShowWarning(false);
    setWarningType('');
    setChildConfirmed(false);
    setTeenConfirmed(false);
    setValidationError('');
  };

  const isChildAccount = credentials?.age && Number(credentials.age) < 13;
  const isTeenAccount = credentials?.age && Number(credentials.age) >= 13 && Number(credentials.age) < 18;
  const mustWarnChild = warningType === 'create' && isChildAccount;
  const mustWarnTeen = warningType === 'create' && isTeenAccount;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        {/* Warning Modal with Animation */}
        {showWarning && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in duration-200">
              <div className="flex items-start gap-3">
                {warningType === 'create' ? (
                  <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    {warningType === 'create' ? 'Confirm Account Creation' : 'Confirm Go Back'}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {warningType === 'create' 
                      ? 'Your account will be created. You cannot revert this change. (You can delete your account from settings)'
                      : 'Your filled data will be lost. You cannot revert this change.'}
                  </p>
                  
                  {/* Child Account Additional Warning in Modal */}
                  {mustWarnChild && (
                    <div className="p-3 bg-red-50 border-2 border-red-300 rounded-lg mt-3">
                      <p className="text-sm text-red-900 font-medium leading-relaxed">
                        As a child account, you must complete Parental Passkey verification within 10 days. 
                        Failure to do so will lead to automatic account deletion as required for safety.
                      </p>
                    </div>
                  )}

                  {/* Teen Account Additional Warning in Modal */}
                  {mustWarnTeen && (
                    <div className="p-3 bg-yellow-50 border-2 border-yellow-300 rounded-lg mt-3">
                      <p className="text-sm text-yellow-900 font-medium leading-relaxed">
                        You must link a Parent/Guardian account within 10 days. 
                        If verification is not completed, some features may be restricted or your account may be removed for safety compliance.
                      </p>
                    </div>
                  )}
                  
                  {/* Validation Error */}
                  {validationError && (
                    <div className="p-3 bg-red-50 border-2 border-red-400 rounded-lg mt-3 flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-900 font-medium">
                        {validationError}
                      </p>
                    </div>
                  )}
                  
                  {/* Child Account Confirmation Checkbox */}
                  {mustWarnChild && (
                    <label className="flex items-start gap-2 mt-4 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        className="h-4 w-4 mt-0.5 cursor-pointer accent-red-600"
                        checked={childConfirmed}
                        onChange={(e) => setChildConfirmed(e.target.checked)}
                      />
                      <span className="text-sm text-slate-700 font-medium group-hover:text-slate-900">
                        I understand that parental verification is mandatory.
                      </span>
                    </label>
                  )}

                  {/* Teen Account Confirmation Checkbox */}
                  {mustWarnTeen && (
                    <label className="flex items-start gap-2 mt-4 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        className="h-4 w-4 mt-0.5 cursor-pointer accent-yellow-600"
                        checked={teenConfirmed}
                        onChange={(e) => setTeenConfirmed(e.target.checked)}
                      />
                      <span className="text-sm text-slate-700 font-medium group-hover:text-slate-900">
                        I understand that parental verification is required within 10 days.
                      </span>
                    </label>
                  )}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  onClick={confirmAction}
                  disabled={(mustWarnChild && !childConfirmed) || (mustWarnTeen && !teenConfirmed)}
                  className={`flex-1 ${warningType === 'create' ? 'bg-green-600 hover:bg-green-700 disabled:bg-slate-300 disabled:cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'} text-white`}
                >
                  Confirm
                </Button>
                <Button
                  onClick={cancelAction}
                  variant="outline"
                  className="flex-1 border-2"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-3">Verify Your Information</h1>
          <p className="text-slate-600 text-lg">
            Please review all your account credentials before creating your account
          </p>
        </div>

        {/* Child Account Warning Banner (<13) - Red */}
        {isChildAccount && (
          <div className="mb-6 p-5 bg-red-50 border-2 border-red-300 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top duration-300 shadow-sm">
            <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-red-900 font-bold mb-2">
                Child Account - Parental Verification Required
              </p>
              <p className="text-sm text-red-900 leading-relaxed">
                Your account will be created as a <strong>Child Account (Age: {credentials.age})</strong>. 
                You must connect a verified Parent/Guardian account within the next <strong>10 days</strong> using a Parental Passkey. 
                If verification is not completed in time, your account will be <strong>automatically disabled and permanently removed</strong> for safety compliance.
              </p>
            </div>
          </div>
        )}

        {/* Teen Account Warning Banner (13-17) - Yellow */}
        {isTeenAccount && (
          <div className="mb-6 p-5 bg-yellow-50 border-2 border-yellow-300 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top duration-300 shadow-sm">
            <AlertCircle className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-yellow-900 font-bold mb-2">
                Additional Verification Recommended
              </p>
              <p className="text-sm text-yellow-900 leading-relaxed">
                Your account will be created with the age <strong>{credentials.age}</strong>. 
                You must link a Parent/Guardian account within the next <strong>10 days</strong>. 
                If verification is not completed, some features may be restricted or your account may be removed for safety compliance.
              </p>
            </div>
          </div>
        )}

        {/* Credentials Card with Grouped Sections */}
        <div className="bg-white rounded-2xl shadow-xl mb-6">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900">Account Credentials</h2>
            <p className="text-slate-600 mt-1">
              Review the information you provided during signup
            </p>
          </div>
          <div className="p-6 space-y-6">
            {credentialGroups.map((group, groupIndex) => {
              const GroupIcon = group.icon;
              return (
                <div key={groupIndex} className="space-y-3">
                  {/* Section Header */}
                  <div className="flex items-center gap-2 mb-3">
                    <GroupIcon className="h-5 w-5 text-slate-700" />
                    <h3 className="text-lg font-semibold text-slate-900">{group.title}</h3>
                  </div>
                  
                  {/* Section Items */}
                  <div className="space-y-3">
                    {group.items.map((credential, index) => {
                      const Icon = credential.icon;
                      return (
                        <div 
                          key={index}
                          className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
                        >
                          <div className="flex-shrink-0">
                            <div className="h-12 w-12 rounded-full bg-slate-900 flex items-center justify-center">
                              <Icon className="h-6 w-6 text-white" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-500 mb-1">
                              {credential.label}
                            </p>
                            <p className="text-lg font-semibold text-slate-900 truncate">
                              {credential.value || 'Not provided'}
                            </p>
                          </div>
                          <button
                            onClick={() => onEdit?.(credential.field)}
                            className="flex-shrink-0 flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 hover:underline font-medium transition-colors"
                          >
                            <Edit2 className="h-3 w-3" />
                            Edit
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-4">
          <button
            onClick={handleCreateAccount}
            className="w-full p-5 text-left flex items-center gap-4 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-all hover:shadow-lg border-2 border-green-700"
          >
            <CheckCircle2 className="h-7 w-7 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-base mb-1">
                I have verified all information
              </p>
              <p className="text-sm text-green-50">
                All the credentials I provided are correct and I would like to create my account
              </p>
            </div>
          </button>
          
          <button
            onClick={handleGoBack}
            className="w-full p-5 text-left flex items-center gap-4 bg-white hover:bg-red-50 rounded-xl transition-all border-2 border-red-300 hover:border-red-400"
          >
            <XCircle className="h-7 w-7 text-red-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-slate-900 text-base mb-1">
                This information is incorrect
              </p>
              <p className="text-sm text-slate-600">
                I need to go back and fill out the account credentials again
              </p>
            </div>
          </button>
        </div>

        {/* Footer Notice */}
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500">
            By creating an account, you agree to Vynce's Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}
