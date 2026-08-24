import { useEffect, useState } from "react";
import axios from "axios";
import {
  Pencil,
  Trash2,
  Ban,
  CheckCircle,
  X,
  UserRound,
  MapPin,
  MessageSquareText
} from "lucide-react";

type AgricultureExpert = {
  id: string;
  photo: string | null;
  name: string;
  phone: string;
  email: string;
  crop: string;
  state: string;
  district: string;
  taluka: string;
  place: string;
  location?: { latitude?: number; longitude?: number };
  experience: number;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

const BACKEND_API = import.meta.env.VITE_BACKEND_API;
console.log(BACKEND_API)
const ExpertManagement = () => {
  const [experts, setExperts] = useState<AgricultureExpert[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [editingExpert, setEditingExpert] =
    useState<AgricultureExpert | null>(null);

  useEffect(() => {
    const fetchExperts = async () => {
      try {
        const endpoint = `${BACKEND_API}/api/v1/addtional/govtgetexpert`;
        const response = await axios.post(endpoint);
        const responseData = response.data;
        console.log("this is the  ex[pert reponse",responseData)
        const expertList = Array.isArray(responseData)
          ? responseData
          : responseData?.data || responseData?.experts || [];

        setExperts(
          expertList.map((expert: AgricultureExpert & { _id?: string }) => ({
            ...expert,
            id: expert.id || expert._id || crypto.randomUUID(),
            photo: expert.photo || null,
          }))
        );
      } catch (error) {
        console.error("Error fetching experts:", error);
        setLoadError("Failed to load experts from the server.");
      } finally {
        setLoading(false);
      }
    };

    fetchExperts();
  }, []);

  // ===============================
  // DELETE
  // ===============================

  const handleDelete = async (email: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this expert?"
    );

    if (!confirmDelete) return;

    try {
      setExperts((prev) =>
        prev.filter((expert) => expert.email!== email)
      );

      alert("Expert deleted from the list");
    } catch (error) {
      console.error(error);
      alert("Failed to delete expert");
    }
  };

  // ===============================
  // BLOCK / UNBLOCK
  // ===============================

  const handleBlock = async (expert: AgricultureExpert) => {
    try {
      const newStatus = !expert.isActive;

      setExperts((prev) =>
        prev.map((item) =>
          item.id === expert.id ? { ...item, isActive: newStatus } : item
        )
      );
    } catch (error) {
      console.error(error);
      alert("Failed to update expert status");
    }
  };

  // ===============================
  // EDIT SAVE
  // ===============================

  const handleSaveEdit = async () => {
    if (!editingExpert) return;

    try {
      setExperts((prev) =>
        prev.map((expert) =>
          expert.id === editingExpert.id
            ? editingExpert
            : expert
        )
      );

      setEditingExpert(null);

      alert("Expert updated successfully");
    } catch (error) {
      console.error(error);
      alert("Failed to update expert");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      {/* HEADER */}

      <div className="max-w-7xl mx-auto">

        <div className="mb-6">
          <h1 className="text-3xl font-bold">
            Agriculture Experts
          </h1>

          <p className="text-gray-500 mt-1">
            Manage registered agriculture experts
          </p>
        </div>


        {loading && <p className="text-gray-500">Loading experts...</p>}
        {!loading && loadError && <p className="text-red-600">{loadError}</p>}
        {!loading && !loadError && experts.length === 0 && (
          <p className="text-gray-500">No experts found.</p>
        )}

        {/* EXPERT GRID */}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

          {experts.map((expert) => (

            <div
              key={expert.id}
              className={`bg-white rounded-2xl shadow-sm border overflow-hidden
              ${
                !expert.isActive
                  ? "opacity-60 border-red-300"
                  : "border-gray-200"
              }`}
            >

              {/* TOP SECTION */}

              <div className="p-5">

                <div className="flex justify-between items-start">

                  {/* PHOTO */}

                  <div className="flex items-center gap-3">

                    {expert.photo ? (
                      <img
                        src={expert.photo}
                        alt={expert.name}
                        className="w-14 h-14 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
                        <UserRound size={28} />
                      </div>
                    )}

                    <div>
                      <h2 className="font-bold text-lg capitalize">
                        {expert.name}
                      </h2>

                      <p className="text-sm text-gray-500">
                        {expert.experience} Years Experience
                      </p>
                    </div>

                  </div>


                  {/* STATUS */}

                  {expert.isActive ? (
                    <span className="px-3 py-1 rounded-full text-xs bg-green-100 text-green-700">
                      Active
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs bg-red-100 text-red-700">
                      Blocked
                    </span>
                  )}

                </div>


                {/* DETAILS */}

                <div className="mt-5 space-y-3 text-sm">

                  <div>
                    <span className="text-gray-400">
                      Phone
                    </span>

                    <p className="font-medium">
                      {expert.phone}
                    </p>
                  </div>


                  <div>
                    <span className="text-gray-400">
                      Email
                    </span>

                    <p className="font-medium break-all">
                      {expert.email}
                    </p>
                  </div>


                  <div>
                    <span className="text-gray-400">
                      Crop Specialization
                    </span>

                    <p className="font-medium capitalize">
                      🌱 {expert.crop}
                    </p>
                  </div>


                  <div>
                    <span className="text-gray-400">
                      Location
                    </span>

                    <div className="flex items-center gap-1 font-medium">
                      <MapPin size={15} className="text-green-600" />
                      {expert.place}, {expert.taluka}
                    </div>

                    <p className="text-gray-500">
                      {expert.district}, {expert.state}
                    </p>

                    {expert.location && (
                      <p className="text-xs text-gray-400">
                        {expert.location.latitude}, {expert.location.longitude}
                      </p>
                    )}
                  </div>


                  <div>
                    <span className="text-gray-400">
                      Description
                    </span>

                    <p className="text-gray-600 mt-1">
                      {expert.description}
                    </p>
                  </div>

                  <div className="rounded-xl border border-dashed border-amber-300 bg-amber-50 p-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-amber-800">
                      <MessageSquareText size={16} />
                      Feedback review
                    </div>
                    <p className="mt-1 text-xs text-amber-700">
                      No feedback available yet. Reviews will appear here when the feedback feature is added.
                    </p>
                  </div>

                  <div className="border-t border-gray-100 pt-3 text-xs text-gray-400">
                    <p>Created: {new Date(expert.createdAt).toLocaleString()}</p>
                    <p>Updated: {new Date(expert.updatedAt).toLocaleString()}</p>
                  </div>

                </div>

              </div>


              {/* ACTION BUTTONS */}

              <div className="border-t p-4 grid grid-cols-3 gap-3">

                {/* EDIT */}

                <button
                  onClick={() => setEditingExpert(expert)}
                  className="flex items-center justify-center gap-2
                  bg-blue-50 text-blue-600
                  py-2 rounded-lg hover:bg-blue-100"
                >
                  <Pencil size={17} />
                  Edit
                </button>


                {/* BLOCK */}

                <button
                  onClick={() => handleBlock(expert)}
                  className={`flex items-center justify-center gap-2
                  py-2 rounded-lg
                  ${
                    expert.isActive
                      ? "bg-orange-50 text-orange-600 hover:bg-orange-100"
                      : "bg-green-50 text-green-600 hover:bg-green-100"
                  }`}
                >
                  {expert.isActive ? (
                    <>
                      <Ban size={17} />
                      Block
                    </>
                  ) : (
                    <>
                      <CheckCircle size={17} />
                      Unblock
                    </>
                  )}
                </button>


                {/* DELETE */}

                <button
                  onClick={() => handleDelete(expert.email)}
                  className="flex items-center justify-center gap-2
                  bg-red-50 text-red-600
                  py-2 rounded-lg hover:bg-red-100"
                >
                  <Trash2 size={17} />
                  Delete
                </button>

              </div>

            </div>

          ))}

        </div>


        {/* EDIT MODAL */}

        {editingExpert && (

          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">

            <div className="bg-white w-full max-w-lg rounded-2xl p-6">

              <div className="flex justify-between items-center mb-5">

                <h2 className="text-xl font-bold">
                  Edit Expert
                </h2>

                <button
                  onClick={() => setEditingExpert(null)}
                >
                  <X />
                </button>

              </div>


              <div className="space-y-4">

                {/* NAME */}

                <div>

                  <label className="text-sm font-medium">
                    Name
                  </label>

                  <input
                    value={editingExpert.name}
                    onChange={(e) =>
                      setEditingExpert({
                        ...editingExpert,
                        name: e.target.value
                      })
                    }
                    className="w-full border rounded-lg p-3 mt-1"
                  />

                </div>


                {/* PHONE */}

                <div>

                  <label className="text-sm font-medium">
                    Phone
                  </label>

                  <input
                    value={editingExpert.phone}
                    onChange={(e) =>
                      setEditingExpert({
                        ...editingExpert,
                        phone: e.target.value
                      })
                    }
                    className="w-full border rounded-lg p-3 mt-1"
                  />

                </div>


                {/* EMAIL */}

                <div>

                  <label className="text-sm font-medium">
                    Email
                  </label>

                  <input
                    value={editingExpert.email}
                    onChange={(e) =>
                      setEditingExpert({
                        ...editingExpert,
                        email: e.target.value
                      })
                    }
                    className="w-full border rounded-lg p-3 mt-1"
                  />

                </div>


                {/* CROP */}

                <div>

                  <label className="text-sm font-medium">
                    Crop Specialization
                  </label>

                  <input
                    value={editingExpert.crop}
                    onChange={(e) =>
                      setEditingExpert({
                        ...editingExpert,
                        crop: e.target.value
                      })
                    }
                    className="w-full border rounded-lg p-3 mt-1"
                  />

                </div>


                {/* EXPERIENCE */}

                <div>

                  <label className="text-sm font-medium">
                    Experience
                  </label>

                  <input
                    type="number"
                    value={editingExpert.experience}
                    onChange={(e) =>
                      setEditingExpert({
                        ...editingExpert,
                        experience: Number(e.target.value)
                      })
                    }
                    className="w-full border rounded-lg p-3 mt-1"
                  />

                </div>


                {/* DESCRIPTION */}

                <div>

                  <label className="text-sm font-medium">
                    Description
                  </label>

                  <textarea
                    value={editingExpert.description}
                    onChange={(e) =>
                      setEditingExpert({
                        ...editingExpert,
                        description: e.target.value
                      })
                    }
                    className="w-full border rounded-lg p-3 mt-1"
                    rows={4}
                  />

                </div>

              </div>


              {/* MODAL BUTTONS */}

              <div className="flex gap-3 mt-6">

                <button
                  onClick={() => setEditingExpert(null)}
                  className="flex-1 border py-3 rounded-lg"
                >
                  Cancel
                </button>

                <button
                  onClick={handleSaveEdit}
                  className="flex-1 bg-green-600 text-white py-3 rounded-lg"
                >
                  Save Changes
                </button>

              </div>

            </div>

          </div>

        )}

      </div>

    </div>
  );
};

export default ExpertManagement;