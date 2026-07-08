"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Lock, CheckCircle, Clock } from "lucide-react";

interface LabData {
  id: string;
  name: string;
  building: string;
  room: string;
  description: string | null;
  imageUrl: string | null;
  equipmentCount: number;
  hasAccess: boolean;
  hasPendingRequest: boolean;
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
      {lab.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={lab.imageUrl} alt="" className="h-32 w-full object-cover" onError={(e) => (e.currentTarget.style.display = "none")} />
      )}
      <div className="bg-ncsu-red px-5 py-4 text-white">
        <h2 className="font-slab font-bold text-lg leading-snug">{lab.name}</h2>
        <p className="text-white/75 text-xs mt-1 font-medium uppercase tracking-wide">
          {lab.building} &middot; Room {lab.room}
        </p>
      </div>

      <div className="p-5 flex flex-col flex-1 gap-3">
        {lab.description && (
          <p className="text-sm text-gray-600 line-clamp-2">{lab.description}</p>
        )}
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
          {isLoggedIn ? (
            <Link
              href={`/labs/${lab.id}`}
              className="block w-full text-center text-sm font-bold py-2 px-4 rounded-md bg-ncsu-red text-white hover:opacity-90 transition-opacity"
            >
              View Equipment →
            </Link>
          ) : (
            <p className="text-xs text-gray-500 text-center py-2">
              Sign in to view equipment and request access.
            </p>
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
