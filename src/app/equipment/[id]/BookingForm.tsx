"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { requestBooking } from "./actions";

export function BookingForm({ equipmentId }: { equipmentId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const [reason, setReason] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const startIso = new Date(`${startDate}T${startTime}`).toISOString();
      const endIso = new Date(`${endDate}T${endTime}`).toISOString();
      
      const res = await requestBooking(equipmentId, startIso, endIso, reason);
      
      alert(res.message);
      setShowForm(false);
      setReason("");
      router.refresh();
    } catch (e) {
      alert("Failed to submit request: " + (e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (!showForm) {
    return (
      <button 
        onClick={() => setShowForm(true)}
        className="w-full mt-6 py-2 px-4 bg-white border border-gray-300 rounded text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
      >
        + Request Future Booking
      </button>
    );
  }

  return (
    <div className="mt-6 bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-base font-bold text-gray-900 font-slab">Request Booking</h3>
        <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
          ✕
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 mb-1">Start Date</label>
            <input type="date" required value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ncsu-red" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 mb-1">Start Time</label>
            <input type="time" required value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ncsu-red" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 mb-1">End Date</label>
            <input type="date" required value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ncsu-red" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 mb-1">End Time</label>
            <input type="time" required value={endTime} onChange={e => setEndTime(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ncsu-red" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 mb-1">Reason / Notes</label>
          <textarea required rows={2} value={reason} onChange={e => setReason(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ncsu-red" />
        </div>

        <button type="submit" disabled={loading} className="w-full bg-ncsu-red text-white flex justify-center py-2 px-4 rounded-md text-sm font-medium hover:opacity-90 mt-2">
          {loading ? "Submitting..." : "Submit Request"}
        </button>
      </form>
    </div>
  );
}
