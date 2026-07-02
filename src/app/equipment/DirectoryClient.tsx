"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Search, Lock, CheckCircle, Clock } from "lucide-react";
import { requestLabAccess } from "@/app/equipment/[id]/access-actions";

interface LabData {
  id: string;
  name: string;
  building: string;
  room: string;
  equipmentCount: number;
  hasAccess: boolean;
  hasPendingRequest: boolean;
}

function LabAccessForm({ labId }: { labId: string }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  if (submitted) {
    return (
      <div className="mt-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2 text-center">
        Request submitted. The admin will review it shortly.
      </div>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-3 w-full text-sm font-bold py-2 px-3 rounded-md border border-ncsu-red text-ncsu-red bg-white hover:bg-red-50 transition-colors"
      >
        Request Lab Access
      </button>
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await requestLabAccess(labId, message);
      if (result.success) {
        setSubmitted(true);
      } else {
        setError(result.error || "Failed to submit request.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-2">
      <textarea
        rows={2}
        value={message}
        onChange={e => setMessage(e.target.value)}
        placeholder="Briefly describe your research or reason for needing access..."
        className="w-full text-xs border border-gray-300 rounded px-2 py-1.5 resize-none focus:outline-none focus:ring-1 focus:ring-ncsu-red placeholder-gray-400"
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 text-sm font-bold py-2 px-3 rounded-md bg-ncsu-red text-white hover:opacity-90 transition-opacity disabled:opacity-60"
        >
          {isPending ? "Submitting…" : "Submit Request"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-sm text-gray-500 hover:text-gray-700 px-3"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function LabCard({
  lab,
  isLoggedIn,
}: {
  lab: LabData;
  isLoggedIn: boolean;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
      <div className="bg-ncsu-red px-5 py-4 text-white">
        <h2 className="font-slab font-bold text-lg leading-snug">{lab.name}</h2>
        <p className="text-white/75 text-xs mt-1 font-medium uppercase tracking-wide">
          {lab.building} &middot; Room {lab.room}
        </p>
      </div>

      <div className="p-5 flex flex-col flex-1 gap-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">
            {lab.equipmentCount} instrument{lab.equipmentCount !== 1 ? "s" : ""}
          </span>

          {lab.hasAccess ? (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
              <CheckCircle size={11} /> Access Granted
            </span>
          ) : lab.hasPendingRequest ? (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
              <Clock size={11} /> Request Pending
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-gray-500 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-full">
              <Lock size={11} /> No Access
            </span>
          )}
        </div>

        <div className="mt-auto pt-1">
          {lab.hasAccess ? (
            <Link
              href={`/labs/${lab.id}`}
              className="block w-full text-center text-sm font-bold py-2 px-4 rounded-md bg-ncsu-red text-white hover:opacity-90 transition-opacity"
            >
              View Equipment →
            </Link>
          ) : !isLoggedIn ? (
            <p className="text-xs text-gray-500 text-center py-2">
              Sign in to request access to this lab.
            </p>
          ) : lab.hasPendingRequest ? (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2 text-center">
              Your request is awaiting admin review.
            </p>
          ) : (
            <LabAccessForm labId={lab.id} />
          )}
        </div>
      </div>
    </div>
  );
}

export function LabsDirectoryClient({
  labs,
  isLoggedIn,
  isAdmin,
}: {
  labs: LabData[];
  isLoggedIn: boolean;
  isAdmin: boolean;
}) {
  const [search, setSearch] = useState("");

  const filtered = search
    ? labs.filter(
        l =>
          l.name.toLowerCase().includes(search.toLowerCase()) ||
          l.building.toLowerCase().includes(search.toLowerCase())
      )
    : labs;

  return (
    <div>
      <div className="mb-8 border-b border-gray-200 pb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-slab font-bold text-gray-900">
            Labs Directory
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Select a lab to browse its equipment. Request access if you have not been authorized yet.
          </p>
        </div>
        <div className="relative w-full md:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search labs or buildings..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ncsu-red"
          />
        </div>
      </div>

      {!isLoggedIn && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded shadow-sm text-sm font-medium">
          Sign in with your university account to request lab access and book equipment.
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No labs found.</div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(lab => (
            <LabCard key={lab.id} lab={lab} isLoggedIn={isLoggedIn} />
          ))}
        </div>
      )}
    </div>
  );
}
