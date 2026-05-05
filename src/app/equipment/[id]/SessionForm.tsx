"use client";

import { useState, useEffect } from "react";
import { startSession, endSession } from "./actions";

type SessionFormProps = {
  equipmentId: string;
  status: string;
  activeLog: {
    id: string;
    userName: string;
    isCurrentUser: boolean;
  } | null;
};

export function SessionForm({ equipmentId, status, activeLog }: SessionFormProps) {
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState("");
  const [tentativeEndTime, setTentativeEndTime] = useState<string>("");

  useEffect(() => {
    // Set default tentative end time to 1 hour from now
    const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000);
    // Format to YYYY-MM-DDThh:mm for datetime-local input
    setTentativeEndTime(
      new Date(oneHourFromNow.getTime() - oneHourFromNow.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16)
    );
  }, []);

  const handleStart = async () => {
    if (!tentativeEndTime) return alert("Please select a tentative end time");
    
    setLoading(true);
    try {
      const endIso = new Date(tentativeEndTime).toISOString();
      await startSession(equipmentId, endIso);
    } catch (e) {
      alert((e as Error).message || "Failed to start session");
    } finally {
      setLoading(false);
    }
  };

  const handleEnd = async () => {
    if (!activeLog) return;
    setLoading(true);
    try {
      await endSession(activeLog.id, equipmentId, notes);
      setNotes("");
    } catch (e) {
      alert("Failed to end session");
    } finally {
      setLoading(false);
    }
  };

  if (status === "MAINTENANCE") {
    return (
      <div className="bg-red-50 p-6 rounded-xl border border-red-100 text-center">
        <h3 className="text-red-800 font-bold text-lg mb-2">Unavailable</h3>
        <p className="text-red-600">This equipment is currently out of order for maintenance.</p>
      </div>
    );
  }

  if (status === "IN_USE" && activeLog) {
    if (activeLog.isCurrentUser) {
      return (
        <div className="bg-white p-6 rounded-lg border border-gray-200 mt-2 shadow-sm">
          <h3 className="text-gray-900 font-bold text-lg mb-4 font-slab">Active Session</h3>
          <p className="text-gray-700 mb-6 text-sm">You are currently using this equipment.</p>
          
          <div className="mb-4">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">Usage Notes / Conditions</label>
            <textarea
              id="notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ncsu-red"
              placeholder="E.g., Equipment worked nicely, left it clean."
            />
          </div>
          
          <button
            onClick={handleEnd}
            disabled={loading}
            className="w-full bg-ncsu-gray text-white rounded-md px-6 py-2.5 text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-colors"
          >
            {loading ? "Completing..." : "End Session & Save Log"}
          </button>
        </div>
      );
    } else {
      return (
        <div className="bg-[#f2f2f2] p-6 rounded-lg border border-gray-200 text-center shadow-sm">
          <h3 className="text-gray-900 font-bold text-lg mb-2 font-slab">Currently in Use</h3>
          <p className="text-gray-600">This equipment is being used by <span className="font-bold text-gray-800">{activeLog.userName}</span>.</p>
        </div>
      );
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 text-center mt-2 shadow-sm">
      <h3 className="text-gray-900 font-bold text-lg mb-2 font-slab">Equipment Available</h3>
      <p className="text-gray-600 mb-4 text-sm">You can start using this equipment immediately.</p>
      
      <div className="mb-6 text-left">
        <label htmlFor="tentativeEndTime" className="block text-sm font-medium text-gray-700 mb-1">
          Tentative End Time
        </label>
        <input 
          type="datetime-local" 
          id="tentativeEndTime"
          value={tentativeEndTime}
          onChange={(e) => setTentativeEndTime(e.target.value)}
          className="w-full text-sm p-2 border border-gray-300 rounded focus:border-ncsu-red focus:ring-1 focus:ring-ncsu-red focus:outline-none"
        />
        <p className="text-xs text-gray-500 mt-1">We will block this time on the calendar for you. You can adjust this if needed.</p>
      </div>

      <button
        onClick={handleStart}
        disabled={loading || !tentativeEndTime}
        className="w-full bg-ncsu-red text-white flex justify-center items-center rounded-full px-6 py-2.5 text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-colors shadow-sm"
      >
        {loading ? "Starting..." : "Start Using"}
      </button>
    </div>
  );
}
