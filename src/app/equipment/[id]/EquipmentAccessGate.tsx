'use client';

import { useState, useTransition } from 'react';
import { requestEquipmentAccess } from './access-actions';

interface Props {
  equipmentId: string;
  equipmentName: string;
  onboardingMaterials: string | null;
  hasPendingRequest: boolean;
}

export function EquipmentAccessGate({
  equipmentId,
  equipmentName,
  onboardingMaterials,
  hasPendingRequest,
}: Props) {
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(hasPendingRequest);
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();
  const [onboardingRead, setOnboardingRead] = useState(!onboardingMaterials);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await requestEquipmentAccess(equipmentId, message);
      if (result.success) {
        setSubmitted(true);
      } else {
        setError(result.error || 'Failed to submit request.');
      }
    });
  }

  return (
    <div className="space-y-4">
      {onboardingMaterials && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-blue-900">Onboarding Materials Required</h3>
              <p className="mt-1 text-sm text-blue-700 mb-4">
                Please review the following onboarding information for <strong>{equipmentName}</strong> before requesting access.
              </p>
              <div className="bg-white border border-blue-200 rounded-md p-4 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                {onboardingMaterials}
              </div>
              {!onboardingRead && (
                <button
                  onClick={() => setOnboardingRead(true)}
                  className="mt-3 text-sm font-semibold text-blue-700 underline hover:text-blue-900"
                >
                  I have read the onboarding materials →
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className={`bg-rose-50 border border-rose-200 rounded-lg p-6 ${!onboardingRead ? 'opacity-50 pointer-events-none' : ''}`}>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <svg className="w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-rose-800">Equipment Access Required</h3>
            <p className="mt-1 text-sm text-rose-700">
              You need authorization to use <strong>{equipmentName}</strong>. Submit a request and the admin will review it.
            </p>

            {submitted ? (
              <div className="mt-4 bg-white border border-rose-300 rounded-md p-4 text-sm text-rose-800">
                <span className="font-bold">Request submitted.</span> The admin will review your request and grant access when ready.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-4 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-rose-800 mb-1">
                    Message to admin <span className="font-normal text-rose-600">(optional)</span>
                  </label>
                  <textarea
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Briefly describe your intended use, project, or supervisor..."
                    className="w-full text-sm border border-rose-300 rounded-md px-3 py-2 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none"
                  />
                </div>
                {error && <p className="text-xs text-red-600">{error}</p>}
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-md transition-colors disabled:opacity-60"
                >
                  {isPending ? 'Submitting…' : 'Request Equipment Access'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
