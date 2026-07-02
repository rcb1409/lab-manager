"use client";

import { useState } from "react";
import { detachCalendarFromEquipment } from "./actions";

export function DetachCalendarClient({ equipmentId }: { equipmentId: string }) {
  const [loading, setLoading] = useState(false);

  const handleDetach = async () => {
    if (!confirm("Are you sure you want to permanently delete this Google Calendar? This action cannot be undone.")) return;
    
    setLoading(true);
    try {
      await detachCalendarFromEquipment(equipmentId);
      alert("Calendar successfully deleted and detached!");
    } catch (e) {
      alert("Failed to delete calendar: " + (e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDetach}
      disabled={loading}
      className="text-[10px] bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 uppercase font-bold py-1 px-2 rounded disabled:opacity-50 transition-colors"
    >
      {loading ? "Deleting..." : "Delete"}
    </button>
  );
}
