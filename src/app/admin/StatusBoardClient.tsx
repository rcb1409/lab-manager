"use client";

import { useState, useTransition } from "react";
import { setEquipmentStatus } from "./equipment/actions";

type ActiveLog = {
  id: string;
  startTime: string;
  user: { name: string | null; email: string };
};

type UpcomingBooking = {
  id: string;
  requestedStart: string;
  requestedEnd: string;
  user: { name: string | null; email: string };
};

type EquipmentData = {
  id: string;
  name: string;
  type: string;
  status: string;
  activeLog: ActiveLog | null;
  upcomingBookings: UpcomingBooking[];
};

type LabData = {
  id: string;
  name: string;
  building: string;
  room: string;
  bookingWindowStart: string | null;
  bookingWindowEnd: string | null;
  bookingDays: string | null;
  equipment: EquipmentData[];
};

function elapsed(startIso: string): string {
  const mins = Math.floor((Date.now() - new Date(startIso).getTime()) / 60000);
  const h = Math.floor(mins / 60);
  return h > 0 ? `${h}h ${mins % 60}m` : `${mins}m`;
}

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function fmtDateTime(iso: string): string {
  return new Date(iso).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function bookingWindowLabel(
  start: string | null,
  end: string | null,
  days: string | null
): string {
  if (!start || !end) return "No booking restrictions";
  const DAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dayStr = days ? days.split(",").map((d) => DAY[+d]).join(", ") : "All days";
  const fmt = (t: string) => {
    const [h, m] = t.split(":");
    const hr = +h;
    return `${hr > 12 ? hr - 12 : hr || 12}:${m} ${hr >= 12 ? "PM" : "AM"}`;
  };
  return `${dayStr} · ${fmt(start)} – ${fmt(end)}`;
}

function EquipmentRow({ eq }: { eq: EquipmentData }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function changeStatus(newStatus: "AVAILABLE" | "MAINTENANCE") {
    startTransition(async () => {
      try {
        await setEquipmentStatus(eq.id, newStatus);
        setError("");
      } catch (e) {
        setError((e as Error).message);
      }
    });
  }

  const dotClass =
    eq.status === "AVAILABLE"
      ? "bg-emerald-500"
      : eq.status === "IN_USE"
      ? "bg-amber-500 animate-pulse"
      : "bg-rose-500";

  const badgeClass =
    eq.status === "AVAILABLE"
      ? "text-emerald-700 bg-emerald-50 border-emerald-200"
      : eq.status === "IN_USE"
      ? "text-amber-700 bg-amber-50 border-amber-200"
      : "text-rose-700 bg-rose-50 border-rose-200";

  return (
    <div
      className={`flex items-start gap-3 px-5 py-3.5 transition-opacity ${
        isPending ? "opacity-50 pointer-events-none" : ""
      }`}
    >
      <span className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${dotClass}`} />

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate">{eq.name}</p>
            <p className="text-xs text-gray-500">{eq.type}</p>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
            <span
              className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${badgeClass}`}
            >
              {eq.status.replace("_", " ")}
            </span>

            {eq.status === "IN_USE" && (
              <>
                <button
                  onClick={() => changeStatus("MAINTENANCE")}
                  className="text-[11px] font-bold px-2.5 py-1 rounded border border-rose-300 text-rose-700 bg-white hover:bg-rose-50 transition-colors"
                >
                  → Out of Service
                </button>
                <button
                  onClick={() => changeStatus("AVAILABLE")}
                  className="text-[11px] font-bold px-2.5 py-1 rounded border border-gray-300 text-gray-600 bg-white hover:bg-gray-50 transition-colors"
                >
                  Force End
                </button>
              </>
            )}
            {eq.status === "AVAILABLE" && (
              <button
                onClick={() => changeStatus("MAINTENANCE")}
                className="text-[11px] font-bold px-2.5 py-1 rounded border border-rose-300 text-rose-700 bg-white hover:bg-rose-50 transition-colors"
              >
                → Out of Service
              </button>
            )}
            {eq.status === "MAINTENANCE" && (
              <button
                onClick={() => changeStatus("AVAILABLE")}
                className="text-[11px] font-bold px-2.5 py-1 rounded border border-emerald-300 text-emerald-700 bg-white hover:bg-emerald-50 transition-colors"
              >
                → Mark Available
              </button>
            )}
          </div>
        </div>

        {eq.status === "IN_USE" && eq.activeLog && (
          <p className="text-xs text-amber-700 mt-1">
            <span className="font-semibold">
              {eq.activeLog.user.name || eq.activeLog.user.email}
            </span>
            {" · "}started at {fmtTime(eq.activeLog.startTime)}
            {" · "}
            <span className="font-medium">{elapsed(eq.activeLog.startTime)} elapsed</span>
          </p>
        )}

        {eq.status === "AVAILABLE" && eq.upcomingBookings.length > 0 && (
          <p className="text-xs text-gray-500 mt-1">
            Next:{" "}
            <span className="font-medium">
              {fmtDateTime(eq.upcomingBookings[0].requestedStart)}
            </span>
            {" — "}
            {eq.upcomingBookings[0].user.name || eq.upcomingBookings[0].user.email}
          </p>
        )}

        {eq.status === "MAINTENANCE" && (
          <p className="text-xs text-rose-600 mt-1">
            Out of service — not visible for booking
          </p>
        )}

        {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
      </div>
    </div>
  );
}

export function StatusBoardClient({ labs }: { labs: LabData[] }) {
  const [filterLab, setFilterLab] = useState("all");

  const allEquipment = labs.flatMap((l) => l.equipment);
  const inUseCount = allEquipment.filter((e) => e.status === "IN_USE").length;
  const maintenanceCount = allEquipment.filter((e) => e.status === "MAINTENANCE").length;
  const availableCount = allEquipment.filter((e) => e.status === "AVAILABLE").length;

  const filtered = filterLab === "all" ? labs : labs.filter((l) => l.id === filterLab);

  return (
    <div className="space-y-4">
      {/* Summary strip */}
      <div className="flex items-center gap-6 text-sm flex-wrap">
        <span className="flex items-center gap-1.5 font-medium text-amber-700">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          {inUseCount} in use
        </span>
        <span className="flex items-center gap-1.5 font-medium text-emerald-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          {availableCount} available
        </span>
        <span className="flex items-center gap-1.5 font-medium text-rose-700">
          <span className="w-2 h-2 rounded-full bg-rose-500" />
          {maintenanceCount} out of service
        </span>

        <div className="ml-auto flex items-center gap-2">
          <label className="text-xs font-bold uppercase text-gray-400 tracking-wider">
            Lab:
          </label>
          <select
            value={filterLab}
            onChange={(e) => setFilterLab(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          >
            <option value="all">All Labs</option>
            {labs.map((lab) => (
              <option key={lab.id} value={lab.id}>
                {lab.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Lab sections */}
      {filtered.map((lab) => (
        <div
          key={lab.id}
          className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm"
        >
          <div className="px-5 py-3.5 bg-gray-50 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
            <div>
              <h2 className="text-sm font-bold text-gray-900 font-slab">{lab.name}</h2>
              <p className="text-xs text-gray-500">
                {lab.building} · Room {lab.room}
              </p>
            </div>
            <p className="text-[11px] text-gray-400 font-medium">
              {bookingWindowLabel(
                lab.bookingWindowStart,
                lab.bookingWindowEnd,
                lab.bookingDays
              )}
            </p>
          </div>

          {lab.equipment.length === 0 ? (
            <p className="px-5 py-4 text-sm text-gray-400 italic">
              No equipment in this lab.
            </p>
          ) : (
            <div className="divide-y divide-gray-100">
              {lab.equipment.map((eq) => (
                <EquipmentRow key={eq.id} eq={eq} />
              ))}
            </div>
          )}
        </div>
      ))}

      {filtered.length === 0 && (
        <p className="text-center text-gray-400 py-12">No labs found.</p>
      )}
    </div>
  );
}
