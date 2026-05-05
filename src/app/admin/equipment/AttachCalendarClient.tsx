"use client";

import { useState } from "react";
import { attachCalendarToEquipment } from "./actions";

export function AttachCalendarClient({ equipmentId }: { equipmentId: string }) {
  const [loading, setLoading] = useState(false);

  const handleAttach = async () => {
    if (!confirm("Are you sure you want to generate a new Google Calendar for this equipment?")) return;
    
    setLoading(true);
    try {
      await attachCalendarToEquipment(equipmentId);
      alert("Calendar successfully generated and attached!");
    } catch (e) {
      alert("Failed to generate calendar: " + (e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleAttach}
      disabled={loading}
      className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 uppercase font-bold py-1 px-2 rounded disabled:opacity-50 transition-colors"
    >
      {loading ? "Generating..." : "+ Add Calendar"}
    </button>
  );
}
