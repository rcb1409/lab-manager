"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminRescheduleBooking } from "../equipment/actions";

export function AdminRescheduleClient({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const startIso = new Date(`${startDate}T${startTime}`).toISOString();
      const endIso = new Date(`${endDate}T${endTime}`).toISOString();
      
      await adminRescheduleBooking(bookingId, startIso, endIso);
      
      alert("Booking forcefully rescheduled.");
      setShowForm(false);
      router.refresh();
    } catch (e) {
      alert("Failed to reschedule: " + (e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (!showForm) {
    return (
      <button 
        onClick={() => setShowForm(true)}
        className="text-xs text-blue-600 hover:text-blue-800 hover:underline font-bold tracking-wide uppercase"
      >
        Reschedule
      </button>
    );
  }

  return (
    <div className="mt-3 bg-white border border-gray-200 rounded p-3 shadow-sm text-left relative z-10 w-full sm:min-w-[280px]">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide">Force Reschedule</h3>
        <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-xs font-bold">✕</button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex flex-col gap-1">
           <label className="text-[10px] uppercase font-bold text-gray-500">Starts</label>
           <div className="flex gap-2">
             <input type="date" required value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:ring-blue-500 focus:outline-none" />
             <input type="time" required value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:ring-blue-500 focus:outline-none" />
           </div>
        </div>
        <div className="flex flex-col gap-1">
           <label className="text-[10px] uppercase font-bold text-gray-500">Ends</label>
           <div className="flex gap-2">
             <input type="date" required value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:ring-blue-500 focus:outline-none" />
             <input type="time" required value={endTime} onChange={e => setEndTime(e.target.value)} className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:ring-blue-500 focus:outline-none" />
           </div>
        </div>
        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-1.5 px-2 rounded text-xs font-bold mt-2 hover:bg-blue-700 transition">
          {loading ? "Saving..." : "Apply Changes"}
        </button>
      </form>
    </div>
  );
}
