"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addEquipment } from "../equipment/actions";

export function AddEquipmentToLabClient({
  labId,
  labName,
}: {
  labId: string;
  labName: string;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await addEquipment({ name, type, labId, description, imageUrl });
      setOpen(false);
      setName("");
      setType("");
      setDescription("");
      setImageUrl("");
      router.refresh();
    } catch {
      alert("Failed to add equipment.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xs font-bold px-3 py-1.5 rounded-md border border-ncsu-red text-ncsu-red bg-white hover:bg-red-50 transition-colors whitespace-nowrap"
      >
        + Add Equipment
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full">
            <div className="px-5 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-xl">
              <div>
                <h3 className="font-bold text-base font-slab">Add Equipment</h3>
                <p className="text-xs text-gray-500 mt-0.5">{labName}</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 mb-1">
                  Equipment Name
                </label>
                <input
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Scanning Electron Microscope"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ncsu-red"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 mb-1">
                  Category / Type
                </label>
                <input
                  required
                  type="text"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  placeholder="e.g. Imaging"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ncsu-red"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 mb-1">
                  Description <span className="text-gray-400 normal-case font-normal">(optional)</span>
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short blurb about this instrument..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ncsu-red resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 mb-1">
                  Image URL <span className="text-gray-400 normal-case font-normal">(optional)</span>
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ncsu-red"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="text-sm text-gray-600 px-4 py-2 rounded-md hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-ncsu-red text-white text-sm font-bold px-5 py-2 rounded-md hover:opacity-90 disabled:opacity-50"
                >
                  {loading ? "Adding…" : "Add Equipment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
