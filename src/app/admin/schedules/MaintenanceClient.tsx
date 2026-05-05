"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminScheduleMaintenance } from "../equipment/actions";

export function MaintenanceClient({ equipmentId }: { equipmentId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("17:00");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const startIso = new Date(`${startDate}T${startTime}`).toISOString();
      const endIso = new Date(`${endDate}T${endTime}`).toISOString();
      
      await adminScheduleMaintenance(equipmentId, startIso, endIso);
      
      alert("Maintenance Scheduled successfully.");
      setShowForm(false);
      router.refresh();
      
      // Reset form
      setStartDate("");
      setEndDate("");
      
    } catch (e) {
      alert("Failed to schedule maintenance: " + (e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (!showForm) {
    return (
      <button 
        onClick={() => setShowForm(true)}
        className="bg-ncsu-red text-white px-4 py-2 rounded font-bold text-sm hover:bg-red-700 transition-colors shadow-sm"
      >
        + Schedule Maintenance
      </button>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm text-left relative z-10 w-full max-w-lg mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-900">Schedule Maintenance Block</h3>
        <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">✕</button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Start Date</label>
            <input type="date" required value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-ncsu-red focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Start Time</label>
            <input type="time" required value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-ncsu-red focus:outline-none" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">End Date</label>
            <input type="date" required value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-ncsu-red focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">End Time</label>
            <input type="time" required value={endTime} onChange={e => setEndTime(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-ncsu-red focus:outline-none" />
          </div>
        </div>
        <div className="pt-2">
          <button type="submit" disabled={loading} className="w-full bg-ncsu-red text-white py-2 px-4 rounded text-sm font-bold hover:bg-red-700 focus:ring-2 focus:ring-offset-2 focus:ring-ncsu-red disabled:opacity-50 transition-colors">
            {loading ? "Scheduling..." : "Confirm Maintenance Block"}
          </button>
        </div>
      </form>
    </div>
  );
}
