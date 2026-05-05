"use client";

import { useState } from "react";
import { addLab } from "./actions";

export function AddLabClient() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [building, setBuilding] = useState("");
  const [room, setRoom] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addLab({ name, building, room });
      setIsOpen(false);
      setName("");
      setBuilding("");
      setRoom("");
    } catch (err) {
      alert("Failed to add lab.");
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
        + Add New Lab
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl overflow-hidden max-w-md w-full max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-[#f2f2f2]">
              <h3 className="font-bold text-lg font-slab tracking-tight">Add New Lab</h3>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 mb-1">Space Name</label>
                <input 
                  required 
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ncsu-red" 
                  placeholder="e.g. Graduate Student Space"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 mb-1">Building</label>
                <input 
                  required 
                  type="text" 
                  value={building} 
                  onChange={e => setBuilding(e.target.value)} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ncsu-red" 
                  placeholder="e.g. Hunt Library"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 mb-1">Room Number</label>
                <input 
                  required 
                  type="text" 
                  value={room} 
                  onChange={e => setRoom(e.target.value)} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ncsu-red" 
                  placeholder="e.g. 402B"
                />
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
                  {loading ? "Saving..." : "Save Lab"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
