"use client";

import { useState, useMemo } from "react";
import { MaintenanceClient } from "./MaintenanceClient";
import { AdminRescheduleClient } from "./AdminRescheduleClient";
import Link from "next/link";
import {
  CalendarDays,
  LayoutGrid,
  Layers,
  Activity,
  Clock,
  Wrench,
  ChevronDown,
  Radio,
  Eye,
  Filter,
  CheckSquare,
  Square,
} from "lucide-react";

type EquipmentData = {
  id: string;
  name: string;
  type: string;
  status: string;
  googleCalendarId: string | null;
  lab: { id: string; name: string };
};

type ActiveLog = {
  id: string;
  equipmentId: string;
  startTime: string;
  user: { name: string | null; email: string };
};

type UpcomingBooking = {
  id: string;
  equipmentId: string;
  requestedStart: string;
  requestedEnd: string;
  reason: string | null;
  user: { name: string | null; email: string };
};

type Props = {
  equipments: EquipmentData[];
  activeLogs: ActiveLog[];
  upcomingBookings: UpcomingBooking[];
  multiCalendarUrl: string;
};

export function ScheduleMonitorClient({
  equipments,
  activeLogs,
  upcomingBookings,
  multiCalendarUrl,
}: Props) {
  const [view, setView] = useState<"unified" | "individual">("individual");
  const [selectedLab, setSelectedLab] = useState<string>("all");
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [showCalendarFilter, setShowCalendarFilter] = useState(false);

  // Track which calendars are selected for unified view (default: all)
  const allCalendarIds = useMemo(
    () => equipments.filter((eq) => eq.googleCalendarId).map((eq) => eq.id),
    [equipments]
  );
  const [selectedCalendarIds, setSelectedCalendarIds] = useState<Set<string>>(
    () => new Set(allCalendarIds)
  );

  // Derive unique labs
  const labs = useMemo(() => {
    const labMap = new Map<string, string>();
    equipments.forEach((eq) => labMap.set(eq.lab.id, eq.lab.name));
    return Array.from(labMap, ([id, name]) => ({ id, name }));
  }, [equipments]);

  // Filter equipment by lab
  const filteredEquipments = useMemo(() => {
    if (selectedLab === "all") return equipments;
    return equipments.filter((eq) => eq.lab.id === selectedLab);
  }, [equipments, selectedLab]);

  // Equipment with calendar only (for individual view)
  const equipmentsWithCalendar = filteredEquipments.filter(
    (eq) => eq.googleCalendarId
  );

  // Stats
  const totalWithCalendar = equipments.filter(
    (eq) => eq.googleCalendarId
  ).length;
  const totalActiveSessions = activeLogs.length;
  const totalUpcomingBookings = upcomingBookings.length;
  const maintenanceBookings = upcomingBookings.filter(
    (b) => b.reason === "MAINTENANCE"
  ).length;

  // Build dynamic unified calendar URL from selected equipment
  const dynamicUnifiedUrl = useMemo(() => {
    const selectedEquipments = equipments.filter(
      (eq) => eq.googleCalendarId && selectedCalendarIds.has(eq.id)
    );
    if (selectedEquipments.length === 0) return "";
    const calIds = selectedEquipments.map((eq) => eq.googleCalendarId as string);
    return `https://calendar.google.com/calendar/embed?mode=WEEK&showNav=1&showPrint=0&showTabs=1&showCalendars=1&showTz=1&${calIds.map((id) => `src=${encodeURIComponent(id)}`).join("&")}`;
  }, [equipments, selectedCalendarIds]);

  const toggleCalendar = (eqId: string) => {
    setSelectedCalendarIds((prev) => {
      const next = new Set(prev);
      if (next.has(eqId)) {
        next.delete(eqId);
      } else {
        next.add(eqId);
      }
      return next;
    });
  };

  const selectAllCalendars = () =>
    setSelectedCalendarIds(new Set(allCalendarIds));
  const deselectAllCalendars = () => setSelectedCalendarIds(new Set());

  const getLogsForEquipment = (eqId: string) =>
    activeLogs.filter((l) => l.equipmentId === eqId);
  const getBookingsForEquipment = (eqId: string) =>
    upcomingBookings.filter((b) => b.equipmentId === eqId);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return "bg-emerald-500";
      case "IN_USE":
        return "bg-amber-500";
      case "MAINTENANCE":
        return "bg-rose-500";
      default:
        return "bg-gray-400";
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "IN_USE":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "MAINTENANCE":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="schedule-stat-card">
          <div className="flex items-center gap-2 mb-1">
            <CalendarDays size={14} className="text-indigo-500" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Calendars
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {totalWithCalendar}
            <span className="text-sm font-medium text-gray-400 ml-1">
              / {equipments.length}
            </span>
          </p>
        </div>
        <div className="schedule-stat-card">
          <div className="flex items-center gap-2 mb-1">
            <Activity size={14} className="text-emerald-500" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Live Sessions
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {totalActiveSessions}
          </p>
        </div>
        <div className="schedule-stat-card">
          <div className="flex items-center gap-2 mb-1">
            <Clock size={14} className="text-blue-500" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Upcoming
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {totalUpcomingBookings}
          </p>
        </div>
        <div className="schedule-stat-card">
          <div className="flex items-center gap-2 mb-1">
            <Wrench size={14} className="text-amber-500" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Maintenance
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {maintenanceBookings}
          </p>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm">
        {/* View Toggle */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setView("individual")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wide transition-all ${
              view === "individual"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <LayoutGrid size={14} />
            Individual
          </button>
          <button
            onClick={() => setView("unified")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wide transition-all ${
              view === "unified"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Layers size={14} />
            Unified
          </button>
        </div>

        {/* Lab Filter */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
            Lab:
          </span>
          <div className="relative">
            <select
              value={selectedLab}
              onChange={(e) => setSelectedLab(e.target.value)}
              className="appearance-none bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 pr-8 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 cursor-pointer"
            >
              <option value="all">All Labs</option>
              {labs.map((lab) => (
                <option key={lab.id} value={lab.id}>
                  {lab.name}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>
        </div>
      </div>

      {/* === UNIFIED VIEW === */}
      {view === "unified" && (
        <div className="animate-fadeIn space-y-4">
          {/* Calendar Filter Panel */}
          <div className="schedule-card-unified">
            <button
              onClick={() => setShowCalendarFilter(!showCalendarFilter)}
              className="w-full px-5 py-3 flex items-center justify-between hover:bg-gray-50/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Filter size={14} className="text-indigo-500" />
                <span className="text-sm font-bold text-gray-700">
                  Filter Calendars
                </span>
                <span className="text-xs text-gray-400 font-medium">
                  ({selectedCalendarIds.size} of {allCalendarIds.length} selected)
                </span>
              </div>
              <ChevronDown
                size={14}
                className={`text-gray-400 transition-transform ${showCalendarFilter ? "rotate-180" : ""}`}
              />
            </button>

            {showCalendarFilter && (
              <div className="px-5 pb-4 border-t border-gray-100 pt-3 animate-fadeIn">
                <div className="flex items-center gap-3 mb-3">
                  <button
                    onClick={selectAllCalendars}
                    className="text-[11px] font-bold uppercase tracking-wide text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    Select All
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    onClick={deselectAllCalendars}
                    className="text-[11px] font-bold uppercase tracking-wide text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    Deselect All
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {equipments
                    .filter((eq) => eq.googleCalendarId)
                    .map((eq) => {
                      const isChecked = selectedCalendarIds.has(eq.id);
                      const logs = getLogsForEquipment(eq.id);
                      return (
                        <button
                          key={eq.id}
                          onClick={() => toggleCalendar(eq.id)}
                          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border text-left transition-all ${
                            isChecked
                              ? "border-indigo-200 bg-indigo-50/60 shadow-sm"
                              : "border-gray-200 bg-gray-50/50 opacity-60 hover:opacity-80"
                          }`}
                        >
                          {isChecked ? (
                            <CheckSquare size={16} className="text-indigo-500 shrink-0" />
                          ) : (
                            <Square size={16} className="text-gray-300 shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`w-1.5 h-1.5 rounded-full shrink-0 ${getStatusColor(eq.status)}`}
                              ></span>
                              <span className="text-xs font-bold text-gray-800 truncate">
                                {eq.name}
                              </span>
                              {logs.length > 0 && (
                                <span className="text-[9px] font-bold text-rose-500 animate-pulse">●</span>
                              )}
                            </div>
                            <p className="text-[10px] text-gray-400 truncate ml-3">
                              {eq.lab.name}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                </div>
              </div>
            )}
          </div>

          {/* Calendar Embed */}
          <div className="schedule-card-unified">
            <div className="px-5 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
              <h2 className="text-base font-bold text-gray-900 font-slab flex items-center gap-2">
                <Layers size={18} className="text-indigo-500" />
                All Equipment Calendars — Unified View
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Showing {selectedCalendarIds.size} of {totalWithCalendar} calendars. Color-coded by equipment.
              </p>
            </div>
            {dynamicUnifiedUrl ? (
              <div className="p-2">
                <div className="gcal-wrapper-large">
                  <iframe
                    key={dynamicUnifiedUrl}
                    src={dynamicUnifiedUrl}
                    className="gcal-iframe-large"
                    frameBorder="0"
                    scrolling="no"
                  ></iframe>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-gray-400">
                <CalendarDays size={48} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">
                  {allCalendarIds.length === 0
                    ? "No equipment has Google Calendar attached yet."
                    : "No calendars selected. Use the filter above to choose which calendars to display."}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* === INDIVIDUAL VIEW === */}
      {view === "individual" && (
        <div className="space-y-6 animate-fadeIn">
          {equipmentsWithCalendar.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl p-12 text-center shadow-sm">
              <CalendarDays size={48} className="mx-auto mb-3 text-gray-300" />
              <p className="text-sm font-medium text-gray-400">
                No equipment with calendars found
                {selectedLab !== "all" && " in this lab"}.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {equipmentsWithCalendar.map((equipment) => {
                const logs = getLogsForEquipment(equipment.id);
                const bookings = getBookingsForEquipment(equipment.id);
                const isExpanded = expandedCard === equipment.id;

                return (
                  <div
                    key={equipment.id}
                    className="schedule-equipment-card group"
                  >
                    {/* Card Header */}
                    <div className="px-5 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span
                              className={`w-2 h-2 rounded-full ${getStatusColor(equipment.status)} shrink-0`}
                            ></span>
                            <h3 className="text-sm font-bold text-gray-900 font-slab truncate">
                              {equipment.name}
                            </h3>
                            {logs.length > 0 && (
                              <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-rose-600 bg-rose-100 px-1.5 py-0.5 rounded animate-pulse shrink-0">
                                <Radio size={8} />
                                Live
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 truncate">
                            {equipment.type} · {equipment.lab.name}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${getStatusBg(equipment.status)}`}
                          >
                            {equipment.status.replace("_", " ")}
                          </span>
                        </div>
                      </div>

                      {/* Quick stats row */}
                      <div className="flex items-center gap-4 mt-2 pt-2 border-t border-gray-100">
                        <span className="text-[11px] text-gray-500 flex items-center gap-1">
                          <Activity size={10} className="text-emerald-500" />
                          {logs.length} active
                        </span>
                        <span className="text-[11px] text-gray-500 flex items-center gap-1">
                          <Clock size={10} className="text-blue-500" />
                          {bookings.length} upcoming
                        </span>
                        <div className="flex-1"></div>
                        <div className="flex items-center gap-2">
                          <Link
                            href={`https://calendar.google.com/calendar/u/0/r?cid=${equipment.googleCalendarId}`}
                            target="_blank"
                            className="text-[10px] text-gray-400 hover:text-gray-600 uppercase font-bold tracking-wide flex items-center gap-1"
                          >
                            <Eye size={10} /> GCal
                          </Link>
                          <MaintenanceClient equipmentId={equipment.id} />
                        </div>
                      </div>
                    </div>

                    {/* Calendar Embed */}
                    <div className="p-2">
                      <div className="gcal-wrapper-card rounded-lg overflow-hidden">
                        <iframe
                          src={`https://calendar.google.com/calendar/embed?src=${equipment.googleCalendarId}&mode=WEEK&showNav=1&showPrint=0&showTabs=0&showCalendars=0&showTz=0`}
                          className="gcal-iframe-card"
                          frameBorder="0"
                          scrolling="no"
                        ></iframe>
                      </div>
                    </div>

                    {/* Expandable Details */}
                    <div className="border-t border-gray-100">
                      <button
                        onClick={() =>
                          setExpandedCard(isExpanded ? null : equipment.id)
                        }
                        className="w-full px-5 py-2.5 text-left flex items-center justify-between text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-gray-600 hover:bg-gray-50/50 transition-colors"
                      >
                        <span>
                          Sessions & Bookings ({logs.length + bookings.length})
                        </span>
                        <ChevronDown
                          size={14}
                          className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}
                        />
                      </button>

                      {isExpanded && (
                        <div className="px-5 pb-4 animate-fadeIn">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Active Sessions */}
                            <div>
                              <h4 className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-2">
                                Active Sessions
                              </h4>
                              {logs.length === 0 ? (
                                <p className="text-xs text-gray-300 italic">
                                  No live usage
                                </p>
                              ) : (
                                <div className="space-y-2">
                                  {logs.map((log) => (
                                    <div
                                      key={log.id}
                                      className="border border-rose-200 bg-rose-50/40 p-2.5 rounded-lg relative"
                                    >
                                      <span className="absolute top-1.5 right-2 text-[9px] uppercase font-bold text-rose-600 bg-rose-100 px-1 py-0.5 rounded animate-pulse">
                                        Live
                                      </span>
                                      <p className="text-xs font-bold text-gray-900">
                                        {log.user.name || log.user.email}
                                      </p>
                                      <p className="text-[11px] text-gray-500 mt-0.5">
                                        Started:{" "}
                                        {new Date(
                                          log.startTime
                                        ).toLocaleTimeString()}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Upcoming Bookings */}
                            <div>
                              <h4 className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-2">
                                Upcoming Schedule
                              </h4>
                              {bookings.length === 0 ? (
                                <p className="text-xs text-gray-300 italic">
                                  No upcoming bookings
                                </p>
                              ) : (
                                <div className="space-y-2">
                                  {bookings.map((booking) => {
                                    const isMaintenance =
                                      booking.reason === "MAINTENANCE";
                                    return (
                                      <div
                                        key={booking.id}
                                        className={`border p-2.5 rounded-lg ${isMaintenance ? "border-amber-300 bg-amber-50/50" : "border-gray-200 bg-white"}`}
                                      >
                                        <div className="flex justify-between items-start">
                                          <p
                                            className={`text-xs font-bold ${isMaintenance ? "text-amber-900" : "text-gray-900"}`}
                                          >
                                            {isMaintenance
                                              ? "⚠️ Maintenance"
                                              : booking.user.name ||
                                                booking.user.email}
                                          </p>
                                        </div>
                                        <p className="text-[11px] text-gray-500 mt-0.5">
                                          {new Date(
                                            booking.requestedStart
                                          ).toLocaleString()}{" "}
                                          →{" "}
                                          {new Date(
                                            booking.requestedEnd
                                          ).toLocaleString()}
                                        </p>
                                        <div className="mt-1.5 flex justify-end">
                                          <AdminRescheduleClient
                                            bookingId={booking.id}
                                          />
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Equipment WITHOUT calendars */}
          {filteredEquipments.filter((eq) => !eq.googleCalendarId).length >
            0 && (
            <div className="bg-white/60 border border-dashed border-gray-300 rounded-xl p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1.5">
                <CalendarDays size={12} />
                Equipment without calendars
              </h3>
              <div className="flex flex-wrap gap-2">
                {filteredEquipments
                  .filter((eq) => !eq.googleCalendarId)
                  .map((eq) => (
                    <span
                      key={eq.id}
                      className="inline-flex items-center gap-1.5 text-xs bg-gray-100 text-gray-500 px-3 py-1.5 rounded-lg border border-gray-200"
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${getStatusColor(eq.status)}`}
                      ></span>
                      {eq.name}
                      <span className="text-gray-400">· {eq.lab.name}</span>
                    </span>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
