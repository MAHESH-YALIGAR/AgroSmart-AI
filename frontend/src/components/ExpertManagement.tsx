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

type ExpertFeedback = {
  _id?: string;
  id?: string;
  expertId?: string;
  userId?: string;
  adviceId?: string;
  rating?: number;
  feedbackText?: string;
  category?: string;
  sentiment?: string;
  createdAt?: string;
};

type FeedbackSummary = {
  averageRating: number;
  totalReviews: number;
  sentimentCounts: {
    positive: number;
    neutral: number;
    negative: number;
  };
  categoryCounts: Record<string, number>;
};

type AgricultureExpert = {
  id: string;
  _id?: string;
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
  feedbackSummary?: FeedbackSummary;
};

const BACKEND_API = (import.meta as ImportMeta & {
  env: { VITE_BACKEND_API?: string; VITE_PYTHON_BACKEND_API?: string };
}).env.VITE_BACKEND_API || "http://localhost:9008";
const PYTHON_BACKEND_API = (import.meta as ImportMeta & {
  env: { VITE_PYTHON_BACKEND_API?: string };
}).env.VITE_PYTHON_BACKEND_API || "http://localhost:8000";

const createEmptyFeedbackSummary = (): FeedbackSummary => ({
  averageRating: 0,
  totalReviews: 0,
  sentimentCounts: {
    positive: 0,
    neutral: 0,
    negative: 0,
  },
  categoryCounts: {},
});

const buildFeedbackSummary = (feedbacks: ExpertFeedback[] = []): FeedbackSummary => {
  const summary = createEmptyFeedbackSummary();

  if (!feedbacks.length) {
    return summary;
  }

  let totalRating = 0;

  feedbacks.forEach((feedback) => {
    const rating = typeof feedback.rating === "number" ? feedback.rating : 0;
    totalRating += rating;

    const category = feedback.category || "general_feedback";
    summary.categoryCounts[category] = (summary.categoryCounts[category] || 0) + 1;

    const sentiment = (feedback.sentiment || "neutral").toLowerCase();

    if (sentiment === "positive") {
      summary.sentimentCounts.positive += 1;
    } else if (sentiment === "negative") {
      summary.sentimentCounts.negative += 1;
    } else {
      summary.sentimentCounts.neutral += 1;
    }
  });

  summary.averageRating = totalRating / feedbacks.length;
  summary.totalReviews = feedbacks.length;

  return summary;
};

const getCategoryLabel = (category: string) => {
  const labelMap: Record<string, string> = {
    treatment_effective: "Treatment Effective",
    treatment_not_effective: "Treatment Not Effective",
    general_feedback: "General Feedback",
  };

  return labelMap[category] ||
    category.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
};

const sentimentMeta = {
  positive: {
    label: "Positive",
    className: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  neutral: {
    label: "Neutral",
    className: "bg-yellow-100 text-yellow-700 border-yellow-200",
  },
  negative: {
    label: "Negative",
    className: "bg-rose-100 text-rose-700 border-rose-200",
  },
};

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
        const expertList = Array.isArray(responseData)
          ? responseData
          : responseData?.data || responseData?.experts || [];

        const normalizedExperts = expertList.map(
          (expert: AgricultureExpert & { _id?: string }) => ({
            ...expert,
            id: expert.id || expert._id || crypto.randomUUID(),
            photo: expert.photo || null,
            feedbackSummary: createEmptyFeedbackSummary(),
          })
        );

        const expertsWithFeedback = await Promise.all(
          normalizedExperts.map(async (expert) => {
            if (!PYTHON_BACKEND_API) {
              return expert;
            }

            try {
              const feedbackEndpoint = `${PYTHON_BACKEND_API.replace(
                /\/$/,
                ""
              )}/expert-feedbacks/${encodeURIComponent(expert._id || expert.id)}`;

              const feedbackResponse = await axios.get(feedbackEndpoint);
              const feedbacks = Array.isArray(feedbackResponse.data?.data)
                ? feedbackResponse.data.data
                : [];

              return {
                ...expert,
                feedbackSummary: buildFeedbackSummary(feedbacks),
              };
            } catch (error) {
              console.error(
                `Error fetching feedback for expert ${expert.email}:`,
                error
              );

              return {
                ...expert,
                feedbackSummary: createEmptyFeedbackSummary(),
              };
            }
          })
        );

        setExperts(expertsWithFeedback);
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
  const endpoint = `${BACKEND_API}/api/v1/addtional/deleteexpert`;
  
  // For AXIOS.DELETE, headers and data must go together into the single config object
  const response = await axios.delete(endpoint, {
    headers: { "Content-Type": "application/json" },
    data: { email } 
  });

    console.log("this is the expert response", response.data);

    // Update your local UI state
    setExperts((prev) => prev.filter((expert) => expert.email !== email));

    alert("Expert deleted from the list");
  } catch (error) {
    console.error(error);
    alert("Failed to delete expert");
  }
};



  const handleBlock = async (email: string, isActive: boolean) => {
  const actionText = isActive ? "block" : "unblock";
  const confirmAction = window.confirm(
    `Are you sure you want to ${actionText} this expert?`
  );
  if (!confirmAction) return;

  try {
    const endpoint = `${BACKEND_API}/api/v1/addtional/acountblock`;
    
    // Send data object payload inside a POST request matching your format preference
    const response = await axios.post(endpoint, { email }, {
      headers: { "Content-Type": "application/json" }
    });

    console.log("this is the expert block response", response.data);

    // Update local UI state dynamically
    setExperts((prev) =>
      prev.map((expert) =>
        expert.email === email
          ? { ...expert, isActive: response.data.isActive }
          : expert
      )
    );

    alert(response.data.message);
  } catch (error) {
    console.error(error);
    alert(`Failed to ${actionText} expert`);
  }
};


  // ===============================
  // EDIT SAVE
  // ===============================

  const handleSaveEdit = async () => {
    if (!editingExpert) return;

    try {
      const expertId = editingExpert._id || editingExpert.id;
      const response = await axios.put(
        `${BACKEND_API}/api/v1/addtional/expertedit/${expertId}`,
        {
          photo: editingExpert.photo,
          name: editingExpert.name,
          phone: editingExpert.phone,
          email: editingExpert.email,
          crop: editingExpert.crop,
          state: editingExpert.state,
          district: editingExpert.district,
          taluka: editingExpert.taluka,
          place: editingExpert.place,
          experience: editingExpert.experience,
          description: editingExpert.description,
        }
      );

      const updatedExpert = {
        ...response.data.data,
        id: response.data.data._id || expertId,
        photo: response.data.data.photo || null,
      };

      setExperts((prev) => prev.map((expert) =>
        expert.id === editingExpert.id ? updatedExpert : expert
      ));

      setEditingExpert(null);

      alert(response.data.message || "Expert updated successfully");
    } catch (error) {
      console.error(error);
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message
        : undefined;
      alert(message || "Failed to update expert");
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
                expert.isActive
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
                    <div className="flex items-center justify-between gap-2 text-sm font-semibold text-amber-800">
                      <div className="flex items-center gap-2">
                        <MessageSquareText size={16} />
                        Feedback review
                      </div>
                      {expert.feedbackSummary && expert.feedbackSummary.totalReviews > 0 && (
                        <span className="text-xs rounded-full bg-amber-200 px-2 py-1 text-amber-800">
                          {expert.feedbackSummary.totalReviews} review{expert.feedbackSummary.totalReviews > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>

                    {expert.feedbackSummary && expert.feedbackSummary.totalReviews > 0 ? (
                      <div className="mt-3 space-y-3">
                        <div className="rounded-lg bg-white border border-amber-200 p-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <span
                                  key={star}
                                  className={
                                    star <= Math.round(expert.feedbackSummary!.averageRating)
                                      ? "text-yellow-500 text-base"
                                      : "text-gray-300 text-base"
                                  }
                                >
                                  ★
                                </span>
                              ))}
                            </div>
                            <p className="text-sm font-bold text-amber-800">
                              {expert.feedbackSummary.averageRating.toFixed(1)}/5
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-xs">
                          {Object.entries(sentimentMeta).map(([key, meta]) => (
                            <div
                              key={key}
                              className={`rounded-lg border p-2 text-center ${meta.className}`}
                            >
                              <div className="font-bold">{meta.label}</div>
                              <div className="mt-1 text-sm">
                                {expert.feedbackSummary!.sentimentCounts[key as keyof typeof expert.feedbackSummary.sentimentCounts]}
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="rounded-lg bg-white border border-amber-200 p-2">
                          <p className="text-xs font-semibold text-amber-800 mb-2">Categories</p>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(expert.feedbackSummary.categoryCounts).map(
                              ([category, count]) => (
                                <span
                                  key={category}
                                  className="rounded-full bg-amber-100 border border-amber-200 px-2 py-1 text-[10px] text-amber-800"
                                >
                                  {getCategoryLabel(category)} ({count})
                                </span>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="mt-1 text-xs text-amber-700">
                        No feedback available yet.
                      </p>
                    )}
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
                  onClick={() => handleBlock(expert.email, expert.isActive)}
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