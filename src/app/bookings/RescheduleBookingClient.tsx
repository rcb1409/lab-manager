"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { rescheduleBooking } from "./actions";

export function RescheduleBookingClient({ bookingId }: { bookingId: string }) {
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
      
      await rescheduleBooking(bookingId, startIso, endIso);
      
      alert("Booking rescheduled successfully.");
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
        className="text-xs text-ncsu-red hover:text-red-700 hover:underline disabled:opacity-50 font-medium tracking-wide uppercase"
      >
        Reschedule
      </button>
    );
  }

  return (
    <div className="mt-3 bg-white border border-gray-200 rounded p-3 shadow-sm text-left relative z-10 w-full sm:min-w-[300px]">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-bold text-gray-900">Reschedule</h3>
        <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-xs">✕</button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex gap-2">
          <input type="date" required value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-ncsu-red focus:outline-none" />
          <input type="time" required value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-ncsu-red focus:outline-none" />
        </div>
        <div className="flex gap-2">
          <input type="date" required value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-ncsu-red focus:outline-none" />
          <input type="time" required value={endTime} onChange={e => setEndTime(e.target.value)} className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-ncsu-red focus:outline-none" />
        </div>
        <button type="submit" disabled={loading} className="w-full bg-ncsu-red text-white py-1.5 px-2 rounded text-xs font-medium mt-1 hover:opacity-90">
          {loading ? "Saving..." : "Confirm Reschedule"}
        </button>
      </form>
    </div>
  );
}
