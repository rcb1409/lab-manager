'use client';

import { useState, useTransition } from 'react';
import { requestLabAccess } from './access-actions';

interface Props {
  labId: string;
  labName: string;
  hasPendingRequest: boolean;
}

export function LabAccessGate({ labId, labName, hasPendingRequest }: Props) {
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(hasPendingRequest);
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await requestLabAccess(labId, message);
      if (result.success) {
        setSubmitted(true);
      } else {
        setError(result.error || 'Failed to submit request.');
      }
    });
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-bold text-amber-800">Lab Access Required</h3>
          <p className="mt-1 text-sm text-amber-700">
            You need authorization to use equipment in <strong>{labName}</strong> before you can book or start sessions.
          </p>

          {submitted ? (
            <div className="mt-4 bg-white border border-amber-300 rounded-md p-4 text-sm text-amber-800">
              <span className="font-bold">Request submitted.</span> The lab admin will review your request and notify you when access is granted.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-amber-800 mb-1">
                  Message to admin <span className="font-normal text-amber-600">(optional)</span>
                </label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Briefly describe your research or reason for needing access..."
                  className="w-full text-sm border border-amber-300 rounded-md px-3 py-2 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
                />
              </div>
              {error && <p className="text-xs text-red-600">{error}</p>}
              <button
                type="submit"
                disabled={isPending}
                className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-md transition-colors disabled:opacity-60"
              >
                {isPending ? 'Submitting…' : 'Request Lab Access'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
