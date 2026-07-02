"use client";

import { useState, useTransition } from "react";
import { updateEquipmentAvailability } from "../equipment/actions";

const DAYS = [
  { v: "1", l: "Mon" },
  { v: "2", l: "Tue" },
  { v: "3", l: "Wed" },
  { v: "4", l: "Thu" },
  { v: "5", l: "Fri" },
  { v: "6", l: "Sat" },
  { v: "0", l: "Sun" },
];

function fmt12(t: string): string {
  const [h, m] = t.split(":");
  const hr = +h;
  return `${hr > 12 ? hr - 12 : hr || 12}:${m} ${hr >= 12 ? "PM" : "AM"}`;
}

interface Props {
  equipmentId: string;
  bookingWindowStart: string | null;
  bookingWindowEnd: string | null;
  bookingDays: string | null;
}

export function EquipmentAvailabilityClient({
  equipmentId,
  bookingWindowStart,
  bookingWindowEnd,
  bookingDays,
}: Props) {
  const hasWindow = !!(bookingWindowStart && bookingWindowEnd);

  const [open, setOpen] = useState(false);
  const [restricted, setRestricted] = useState(hasWindow);
  const [start, setStart] = useState(bookingWindowStart || "09:00");
  const [end, setEnd] = useState(bookingWindowEnd || "17:00");
  const [selectedDays, setSelectedDays] = useState<Set<string>>(
    () =>
      bookingDays
        ? new Set(bookingDays.split(","))
        : new Set(["1", "2", "3", "4", "5"])
  );
  const [isPending, startTransition] = useTransition();
  const [flash, setFlash] = useState(false);
  const [error, setError] = useState("");

  function toggleDay(v: string) {
    setSelectedDays((prev) => {
      const next = new Set(prev);
      if (next.has(v)) next.delete(v);
      else next.add(v);
      return next;
    });
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (restricted && selectedDays.size === 0) {
      setError("Select at least one day.");
      return;
    }
    startTransition(async () => {
      try {
        await updateEquipmentAvailability(equipmentId, {
          bookingWindowStart: restricted ? start : null,
          bookingWindowEnd: restricted ? end : null,
          bookingDays:
            restricted && selectedDays.size < 7
              ? Array.from(selectedDays).sort().join(",")
              : null,
        });
        setFlash(true);
        setTimeout(() => setFlash(false), 2000);
        setOpen(false);
        setError("");
      } catch (e) {
        setError((e as Error).message);
      }
    });
  }

  const label = hasWindow
    ? `${fmt12(bookingWindowStart!)} – ${fmt12(bookingWindowEnd!)}`
    : "24/7";

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`text-xs font-bold px-2 py-0.5 rounded border transition-colors whitespace-nowrap ${
          hasWindow
            ? "border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100"
            : "border-gray-200 text-gray-400 bg-gray-50 hover:bg-gray-100"
        }`}
      >
        {flash ? "✓ Saved" : label}
      </button>

      {open && (
        <div className="absolute left-0 z-30 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl p-4 w-68 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-gray-900">Booking Schedule</h4>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-gray-400 hover:text-gray-600 text-xl leading-none"
            >
              &times;
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-3">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={restricted}
                onChange={(e) => setRestricted(e.target.checked)}
                className="accent-ncsu-red w-4 h-4"
              />
              <span className="font-medium text-gray-700">Restrict booking hours</span>
            </label>

            {!restricted && (
              <p className="text-xs text-gray-400">
                Bookings allowed 24/7 (or inherits lab window if set).
              </p>
            )}

            {restricted && (
              <>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">
                      From
                    </label>
                    <input
                      type="time"
                      value={start}
                      onChange={(e) => setStart(e.target.value)}
                      required
                      className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-ncsu-red"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">
                      To
                    </label>
                    <input
                      type="time"
                      value={end}
                      onChange={(e) => setEnd(e.target.value)}
                      required
                      className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-ncsu-red"
                    />
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase text-gray-500 mb-2">
                    Allowed Days
                  </p>
                  <div className="flex gap-1 flex-wrap">
                    {DAYS.map(({ v, l }) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => toggleDay(v)}
                        className={`text-xs font-bold px-2 py-1 rounded border transition-colors ${
                          selectedDays.has(v)
                            ? "bg-ncsu-red border-ncsu-red text-white"
                            : "bg-white border-gray-300 text-gray-500 hover:border-gray-400"
                        }`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {error && <p className="text-xs text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-ncsu-red text-white text-sm font-bold py-2 rounded-md hover:opacity-90 disabled:opacity-60 transition-opacity"
            >
              {isPending ? "Saving…" : "Save"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
