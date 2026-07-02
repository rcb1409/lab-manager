'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateOnboardingMaterials } from '../access/actions';

interface Props {
  equipmentId: string;
  equipmentName: string;
  onboardingRequired: boolean;
  onboardingMaterials: string | null;
}

export function OnboardingEditClient({
  equipmentId,
  equipmentName,
  onboardingRequired: initialRequired,
  onboardingMaterials: initialMaterials,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [required, setRequired] = useState(initialRequired);
  const [materials, setMaterials] = useState(initialMaterials ?? '');
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    startTransition(async () => {
      await updateOnboardingMaterials(equipmentId, required, materials);
      setSaved(true);
      router.refresh();
      setTimeout(() => {
        setSaved(false);
        setOpen(false);
      }, 1200);
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-block text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors uppercase tracking-wide"
      >
        Onboarding
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Onboarding Settings</h2>
                <p className="text-sm text-gray-500">{equipmentName}</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={required}
                  onChange={(e) => setRequired(e.target.checked)}
                  className="mt-0.5 w-4 h-4 shrink-0 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="flex-1 min-w-0 text-sm font-semibold text-gray-700">
                  Require equipment-level access
                  <span className="block text-xs font-normal text-gray-500 mt-0.5">
                    Users must request and receive access before booking or starting sessions.
                  </span>
                </span>
              </label>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Onboarding Materials
                  <span className="text-gray-400 font-normal ml-1">(shown to users before they request access)</span>
                </label>
                <textarea
                  rows={8}
                  value={materials}
                  onChange={(e) => setMaterials(e.target.value)}
                  placeholder="Enter safety guidelines, training links, SOPs, or any instructions users must read before using this equipment..."
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isPending}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60"
              >
                {saved ? 'Saved!' : isPending ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
