"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { updateLab, deleteLab } from "./actions";

type Lab = {
  id: string;
  name: string;
  building: string;
  room: string;
  description: string | null;
  imageUrl: string | null;
};

export function EditLabClient({ lab }: { lab: Lab }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [name, setName] = useState(lab.name);
  const [building, setBuilding] = useState(lab.building);
  const [room, setRoom] = useState(lab.room);
  const [description, setDescription] = useState(lab.description ?? "");
  const [imageUrl, setImageUrl] = useState(lab.imageUrl ?? "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateLab(lab.id, { name, building, room, description, imageUrl });
      setIsOpen(false);
    } catch (err) {
      alert("Failed to update lab.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        `Delete "${lab.name}"? This will permanently remove the lab and all of its equipment, bookings, and usage history. This cannot be undone.`
      )
    )
      return;
    setDeleting(true);
    try {
      await deleteLab(lab.id);
      setIsOpen(false);
    } catch (err) {
      alert("Failed to delete lab.");
      setDeleting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="shrink-0 text-gray-400 hover:text-gray-700 transition-colors"
        aria-label="Edit lab"
        title="Edit lab"
      >
        <Pencil size={15} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl overflow-hidden max-w-md w-full max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-[#f2f2f2]">
              <h3 className="font-bold text-lg font-slab tracking-tight">Edit Lab</h3>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">&times;</button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 mb-1">Space Name</label>
                <input
                  required
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ncsu-red"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 mb-1">Building</label>
                <input
                  required
                  type="text"
                  value={building}
                  onChange={e => setBuilding(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ncsu-red"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 mb-1">Room Number</label>
                <input
                  required
                  type="text"
                  value={room}
                  onChange={e => setRoom(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ncsu-red"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 mb-1">Description <span className="text-gray-400 normal-case font-normal">(optional)</span></label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ncsu-red resize-none"
                  placeholder="Short blurb about this space..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-gray-700 mb-1">Image URL <span className="text-gray-400 normal-case font-normal">(optional)</span></label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={e => setImageUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ncsu-red"
                  placeholder="https://..."
                />
                {imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imageUrl} alt="" className="mt-2 h-24 w-full object-cover rounded-md border border-gray-200" onError={(e) => (e.currentTarget.style.display = "none")} />
                )}
              </div>

              <div className="pt-4 flex justify-between items-center gap-3 border-t border-gray-100 mt-6">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting || loading}
                  className="text-rose-600 hover:bg-rose-50 rounded-md px-3 py-2 text-sm font-medium disabled:opacity-50"
                >
                  {deleting ? "Deleting..." : "Delete Lab"}
                </button>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="text-gray-600 hover:bg-gray-100 rounded-md px-4 py-2 text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || deleting}
                    className="bg-ncsu-red text-white flex justify-center py-2 px-6 rounded-md text-sm font-medium hover:opacity-90 disabled:opacity-50"
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
