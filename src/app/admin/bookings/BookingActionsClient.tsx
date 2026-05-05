"use client";

import { useState } from "react";
import { approveBooking, denyBooking } from "./actions";

export function BookingActionsClient({ bookingId }: { bookingId: string }) {
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    setLoading(true);
    try {
      await approveBooking(bookingId);
    } catch (e) {
      alert("Failed to approve");
    } finally {
      setLoading(false);
    }
  };

  const handleDeny = async () => {
    setLoading(true);
    try {
      await denyBooking(bookingId);
    } catch (e) {
      alert("Failed to deny");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      <button 
        onClick={handleApprove} 
        disabled={loading}
        className="px-3 py-1.5 bg-emerald-100 text-emerald-800 text-sm font-bold rounded hover:bg-emerald-200 transition-colors disabled:opacity-50"
      >
        Approve
      </button>
      <button 
        onClick={handleDeny} 
        disabled={loading}
        className="px-3 py-1.5 bg-rose-100 text-rose-800 text-sm font-bold rounded hover:bg-rose-200 transition-colors disabled:opacity-50"
      >
        Deny
      </button>
    </div>
  );
}
