"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { LabAvailabilityClient } from "./LabAvailabilityClient";
import { EquipmentAvailabilityClient } from "./EquipmentAvailabilityClient";
import { OnboardingEditClient } from "../equipment/OnboardingEditClient";
import { AttachCalendarClient } from "../equipment/AttachCalendarClient";
import { DetachCalendarClient } from "../equipment/DetachCalendarClient";
import { AddEquipmentToLabClient } from "./AddEquipmentToLabClient";
import { EditLabClient } from "./EditLabClient";
import { EditEquipmentClient } from "../equipment/EditEquipmentClient";
import { QRCard } from "../equipment/QRCard";

type EquipmentData = {
  id: string;
  name: string;
  type: string;
  description: string | null;
  imageUrl: string | null;
  status: string;
  googleCalendarId: string | null;
  onboardingRequired: boolean;
  onboardingMaterials: string | null;
  bookingWindowStart: string | null;
  bookingWindowEnd: string | null;
  bookingDays: string | null;
};

type LabData = {
  id: string;
  name: string;
  building: string;
  room: string;
  description: string | null;
  imageUrl: string | null;
  bookingWindowStart: string | null;
  bookingWindowEnd: string | null;
  bookingDays: string | null;
  equipment: EquipmentData[];
};

function statusDotClass(status: string) {
  return status === "AVAILABLE"
    ? "bg-emerald-500"
    : status === "IN_USE"
    ? "bg-amber-500 animate-pulse"
    : "bg-rose-500";
}

function statusBadgeClass(status: string) {
  return status === "AVAILABLE"
    ? "text-emerald-700 bg-emerald-50 border-emerald-200"
    : status === "IN_USE"
    ? "text-amber-700 bg-amber-50 border-amber-200"
    : "text-rose-700 bg-rose-50 border-rose-200";
}

function Divider() {
  return <span className="text-gray-200 select-none">|</span>;
}

function QRModal({ equipmentId, name }: { equipmentId: string; name: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-[11px] font-bold text-gray-400 hover:text-indigo-600 uppercase tracking-wide transition-colors"
      >
        QR Code
      </button>
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-900 font-slab">QR Code</h3>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                &times;
              </button>
            </div>
            <QRCard equipmentId={equipmentId} name={name} />
          </div>
        </div>
      )}
    </>
  );
}

function EquipmentRow({ eq }: { eq: EquipmentData }) {
  return (
    <div className="px-6 py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">
      {/* Name + status row */}
      <div className="flex items-center gap-2.5 flex-wrap">
        <span
          className={`w-2 h-2 rounded-full shrink-0 ${statusDotClass(eq.status)}`}
        />
        <span className="text-sm font-bold text-gray-900">{eq.name}</span>
        <span className="text-xs text-gray-400">{eq.type}</span>
        <EditEquipmentClient equipment={eq} />
        <span
          className={`ml-auto text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${statusBadgeClass(eq.status)}`}
        >
          {eq.status.replace("_", " ")}
        </span>
      </div>

      {/* Controls row */}
      <div className="mt-2.5 pl-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs">
        {/* Booking schedule */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">
            Schedule:
          </span>
          <EquipmentAvailabilityClient
            equipmentId={eq.id}
            bookingWindowStart={eq.bookingWindowStart}
            bookingWindowEnd={eq.bookingWindowEnd}
            bookingDays={eq.bookingDays}
          />
        </div>

        <Divider />

        {/* Onboarding */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">
            Onboarding:
          </span>
          {eq.onboardingRequired ? (
            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded">
              Required
            </span>
          ) : (
            <span className="text-[10px] text-gray-400">Off</span>
          )}
          <OnboardingEditClient
            equipmentId={eq.id}
            equipmentName={eq.name}
            onboardingRequired={eq.onboardingRequired}
            onboardingMaterials={eq.onboardingMaterials}
          />
        </div>

        <Divider />

        {/* Calendar */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">
            Calendar:
          </span>
          {eq.googleCalendarId ? (
            <>
              <span className="text-[10px] font-bold text-emerald-600">Attached</span>
              <DetachCalendarClient equipmentId={eq.id} />
            </>
          ) : (
            <AttachCalendarClient equipmentId={eq.id} />
          )}
        </div>

        <Divider />

        {/* QR Code */}
        <QRModal equipmentId={eq.id} name={eq.name} />
      </div>
    </div>
  );
}

function LabSection({ lab }: { lab: LabData }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-visible shadow-sm">
      {/* Lab header */}
      <div className="flex items-center gap-3 px-5 py-4 bg-gray-50 border-b border-gray-200 rounded-t-xl">
        <button
          onClick={() => setExpanded((e) => !e)}
          className="shrink-0 text-gray-400 hover:text-gray-700 transition-colors"
          aria-label={expanded ? "Collapse" : "Expand"}
        >
          {expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-gray-900 font-slab">
              {lab.name}
            </h2>
            <EditLabClient lab={lab} />
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            {lab.building} · Room {lab.room} ·{" "}
            {lab.equipment.length} instrument
            {lab.equipment.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider hidden sm:block">
              Lab hours:
            </span>
            <LabAvailabilityClient
              labId={lab.id}
              bookingWindowStart={lab.bookingWindowStart}
              bookingWindowEnd={lab.bookingWindowEnd}
              bookingDays={lab.bookingDays}
            />
          </div>
          <AddEquipmentToLabClient labId={lab.id} labName={lab.name} />
        </div>
      </div>

      {/* Equipment rows */}
      {expanded && (
        <>
          {lab.equipment.length === 0 ? (
            <div className="px-6 py-10 text-center text-gray-400 text-sm">
              No equipment yet. Click{" "}
              <span className="font-semibold text-gray-500">+ Add Equipment</span>{" "}
              to get started.
            </div>
          ) : (
            <div>{lab.equipment.map((eq) => <EquipmentRow key={eq.id} eq={eq} />)}</div>
          )}
        </>
      )}
    </div>
  );
}

export function LabsEquipmentClient({ labs }: { labs: LabData[] }) {
  if (labs.length === 0) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p className="text-lg font-medium mb-2">No labs yet</p>
        <p className="text-sm">Click &ldquo;+ Add Lab&rdquo; above to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {labs.map((lab) => (
        <LabSection key={lab.id} lab={lab} />
      ))}
    </div>
  );
}
