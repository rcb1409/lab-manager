"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";

export function QRCard({ equipmentId, name }: { equipmentId: string, name: string }) {
  const [url, setUrl] = useState("");

  useEffect(() => {
    setUrl(`${window.location.origin}/equipment/${equipmentId}`);
  }, [equipmentId]);

  return (
    <div className="flex flex-col items-center bg-gray-50 border border-gray-200 p-4 rounded-xl shadow-sm">
      <div className="mb-4 bg-white p-2 rounded-lg border border-gray-100 shadow-sm">
        {url ? (
          <QRCodeSVG 
            value={url} 
            size={128} 
            bgColor={"#ffffff"}
            fgColor={"#000000"}
            level={"M"}
          />
        ) : (
          <div className="w-[128px] h-[128px] bg-gray-100 flex items-center justify-center text-xs text-gray-400">Loading...</div>
        )}
      </div>
      <p className="text-center font-bold text-gray-800 text-sm">{name}</p>
      <p className="text-center text-xs text-gray-500 mt-1 mb-3 truncate w-full px-2" title={url}>{url}</p>
      <button 
        onClick={() => window.print()}
        className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded font-semibold hover:bg-indigo-200"
      >
        Print Label
      </button>
    </div>
  );
}
