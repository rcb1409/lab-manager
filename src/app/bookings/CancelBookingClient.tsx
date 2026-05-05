"use client";

import { useState } from "react";
import { cancelBooking } from "./actions";

export function CancelBookingClient({ bookingId }: { bookingId: string }) {
  const [loading, setLoading] = useState(false);

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this booking request?")) return;
    
    setLoading(true);
    try {
      await cancelBooking(bookingId);
    } catch (e) {
      alert("Failed to cancel booking.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleCancel}
      disabled={loading}
      className="text-xs text-ncsu-gray hover:text-ncsu-red hover:underline disabled:opacity-50 font-medium tracking-wide uppercase"
    >
      Cancel Request
    </button>
  );
}
