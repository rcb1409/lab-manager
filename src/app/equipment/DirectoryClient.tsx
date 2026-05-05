"use client";

import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";

export function DirectoryClient({ labs, hasSession }: { labs: any[], hasSession: boolean }) {
  const [selectedBuilding, setSelectedBuilding] = useState<string>("");
  const [selectedLabId, setSelectedLabId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  const buildings = Array.from(new Set(labs.map(lab => lab.building))).sort();
  
  const filteredLabs = selectedBuilding ? labs.filter(lab => lab.building === selectedBuilding).sort((a,b) => a.name.localeCompare(b.name)) : [];
  
  let filteredEquipment: any[] = [];
  if (selectedLabId) {
    const lab = filteredLabs.find(l => l.id === selectedLabId);
    if (lab) filteredEquipment = lab.equipment;
  } else if (selectedBuilding) {
    filteredEquipment = filteredLabs.flatMap(l => l.equipment);
  } else {
    filteredEquipment = labs.flatMap(l => l.equipment);
  }

  if (searchQuery) {
    filteredEquipment = labs.flatMap(l => l.equipment).filter(e => 
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      e.type.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  filteredEquipment.sort((a, b) => a.name.localeCompare(b.name));

  const handleBuildingSelect = (building: string) => {
    setSelectedBuilding(building);
    setSelectedLabId("");
    setSearchQuery("");
  }

  return (
    <div>
      <div className="mb-8 border-b border-gray-200 pb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-slab font-bold text-gray-900">Lab Equipment Directory</h1>
          <p className="text-sm text-gray-500 mt-2">Browse available tools across all facilities.</p>
        </div>
        <div className="relative w-full md:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-gray-400" />
          </div>
          <input 
            type="text" 
            placeholder="Search all equipment..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ncsu-red"
          />
        </div>
      </div>
      
      {!hasSession && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded shadow-sm text-sm font-medium">
          Note: You must log in to record usage or request reservations.
        </div>
      )}

      {!searchQuery && (
        <div className="mb-8 space-y-6 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div>
            <p className="text-sm text-gray-700 mb-4">Select a building:</p>
            <div className="flex flex-wrap gap-6">
              {buildings.map(building => (
                <label key={building} className="flex items-center gap-2 cursor-pointer text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  <input 
                    type="radio" 
                    name="building" 
                    value={building} 
                    checked={selectedBuilding === building} 
                    onChange={() => handleBuildingSelect(building)}
                    className="accent-ncsu-red w-4 h-4 cursor-pointer"
                  />
                  {building}
                </label>
              ))}
              <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  <input 
                    type="radio" 
                    name="building" 
                    value="" 
                    checked={selectedBuilding === ""} 
                    onChange={() => handleBuildingSelect("")}
                    className="accent-ncsu-red w-4 h-4 cursor-pointer"
                  />
                  All Buildings
                </label>
            </div>
          </div>

          {selectedBuilding && filteredLabs.length > 0 && (
            <div className="pt-6 mt-2 border-t border-gray-100">
              <p className="text-sm text-gray-700 mb-4">Select a type of space or workstation:</p>
              <div className="flex flex-wrap gap-6">
                {filteredLabs.map(lab => (
                  <label key={lab.id} className="flex items-center gap-2 cursor-pointer text-sm text-gray-600 hover:text-gray-900 transition-colors">
                    <input 
                      type="radio" 
                      name="lab" 
                      value={lab.id} 
                      checked={selectedLabId === lab.id} 
                      onChange={() => setSelectedLabId(lab.id)}
                      className="accent-ncsu-red w-4 h-4 cursor-pointer"
                    />
                    {lab.name}
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {filteredEquipment.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No equipment found for the selected criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredEquipment.map((item: any) => {
             const lab = labs.find(l => l.id === item.labId);
             
             return (
              <Link 
                key={item.id} 
                href={`/equipment/${item.id}`} 
                className="block relative bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md hover:border-ncsu-red/40 transition-shadow duration-200 p-4"
              >
                <div className="pb-3 border-b border-gray-100 mb-3">
                  <h3 className="text-base md:text-lg font-bold text-gray-900 truncate">{item.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{item.type}</p>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700 text-xs truncate max-w-[55%]">
                    📍 {lab ? lab.name : 'Unknown'}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide border ${
                    item.status === 'AVAILABLE' ? 'bg-green-50 text-green-700 border-green-200' : 
                    item.status === 'IN_USE' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 
                    'bg-red-50 text-red-700 border-red-200'
                  }`}>
                    {item.status.replace('_', ' ')}
                  </span>
                </div>
              </Link>
             );
          })}
        </div>
      )}
    </div>
  );
}
