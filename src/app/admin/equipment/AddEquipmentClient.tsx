"use client";

import { useState } from "react";
import { addEquipment } from "./actions";

export function AddEquipmentClient({ labs }: { labs: any[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [labId, setLabId] = useState(labs.length > 0 ? labs[0].id : "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addEquipment({ name, type, labId });
      setIsOpen(false);
      setName("");
      setType("");
    } catch (err) {
      alert("Failed to add equipment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-ncsu-red text-white px-4 py-2 rounded-full text-sm font-medium hover:opacity-90 shadow-sm transition-opacity"
      >
        + Add New Equipment
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl overflow-hidden max-w-md w-full max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-[#f2f2f2]">
              <h3 className="font-bold text-lg font-slab tracking-tight">Add New Equipment</h3>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 mb-1">Equipment Name</label>
                <input 
                  required 
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ncsu-red" 
                  placeholder="e.g. Electron Microscope"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 mb-1">Category / Type</label>
                <input 
                  required 
                  type="text" 
                  value={type} 
                  onChange={e => setType(e.target.value)} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ncsu-red" 
                  placeholder="e.g. Imaging"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 mb-1">Assign to Lab</label>
                <select 
                  required 
                  value={labId} 
                  onChange={e => setLabId(e.target.value)} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ncsu-red bg-white"
                >
                  {labs.map((lab) => (
                    <option key={lab.id} value={lab.id}>{lab.name} ({lab.building})</option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-6">
                <button 
                  type="button" 
                  onClick={() => setIsOpen(false)} 
                  className="text-gray-600 hover:bg-gray-100 rounded-md px-4 py-2 text-sm font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loading} 
                  className="bg-ncsu-red text-white flex justify-center py-2 px-6 rounded-md text-sm font-medium hover:opacity-90 disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Save Equipment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
