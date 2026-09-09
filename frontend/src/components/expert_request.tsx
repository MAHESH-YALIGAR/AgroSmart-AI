import { useEffect, useState } from "react";
import axios from "axios";
import { CheckCircle, PauseCircle, RefreshCcw, UserRound, MapPin, Phone, Mail, Sprout } from "lucide-react";

const BACKEND_API = (import.meta as ImportMeta & {
  env: { VITE_BACKEND_API?: string };
}).env.VITE_BACKEND_API || "http://localhost:9008";

type ExpertRequestItem = {
  _id: string;
  name: string;
  phone: string;
  email: string;
  crop: string;
  state: string;
  district: string;
  taluka: string;
  place: string;
  experience: number;
  description?: string;
  photo?: string | null;
  status: "pending" | "approved" | "paused";
  createdAt?: string;
  updatedAt?: string;
};

const ExpertRequests = () => {
  const [requests, setRequests] = useState<ExpertRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${BACKEND_API}/api/v1/webrouter/getExpertRequests`
      );

      const data = Array.isArray(response.data?.data)
        ? response.data.data
        : [];

      setRequests(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load expert requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      const response = await axios.patch(
        `${BACKEND_API}/api/v1/webrouter/approveExpertRequest/${id}`
      );

      if (response.data?.success) {
        alert("Expert approved and added to expert database.");
        fetchRequests();
      }
    } catch (err) {
      console.error(err);
      alert("Failed to approve expert.");
    }
  };

  const handlePause = async (id: string) => {
    try {
      const response = await axios.patch(
        `${BACKEND_API}/api/v1/webrouter/pauseExpertRequest/${id}`
      );

      if (response.data?.success) {
        alert("Expert request paused and kept in the request list.");
        fetchRequests();
      }
    } catch (err) {
      console.error(err);
      alert("Failed to pause expert request.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Expert Requests</h1>
            <p className="text-slate-500 mt-1">
              Review, approve, or pause expert requests before they are added to the expert database.
            </p>
          </div>

          <button
            onClick={fetchRequests}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <RefreshCcw size={16} />
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="rounded-2xl bg-white p-6 text-slate-600 shadow-sm border border-slate-200">
            Loading expert requests...
          </div>
        ) : error ? (
          <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-red-700">
            {error}
          </div>
        ) : requests.length === 0 ? (
          <div className="rounded-2xl bg-white p-6 text-slate-600 shadow-sm border border-slate-200">
            No expert requests found.
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {requests.map((request) => (
              <div
                key={request._id}
                className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden"
              >
                <div className="p-5 border-b border-slate-200 bg-slate-50">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {request.photo ? (
                        <img
                          src={request.photo}
                          alt={request.name}
                          className="h-14 w-14 rounded-full object-cover border border-slate-200"
                        />
                      ) : (
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-200 text-slate-600">
                          <UserRound size={26} />
                        </div>
                      )}

                      <div>
                        <h2 className="text-xl font-bold text-slate-900">{request.name}</h2>
                        <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                          <Sprout size={14} className="text-green-600" />
                          <span>{request.crop}</span>
                        </div>
                      </div>
                    </div>

                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        request.status === "approved"
                          ? "bg-emerald-100 text-emerald-700"
                          : request.status === "paused"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {request.status}
                    </span>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-700">
                    <div className="flex items-center gap-2">
                      <Phone size={15} className="text-slate-400" />
                      <span>{request.phone}</span>
                    </div>

                    <div className="flex items-center gap-2 break-all">
                      <Mail size={15} className="text-slate-400" />
                      <span>{request.email}</span>
                    </div>

                    <div className="flex items-center gap-2 sm:col-span-2">
                      <MapPin size={15} className="text-slate-400" />
                      <span>
                        {request.place}, {request.taluka}, {request.district}, {request.state}
                      </span>
                    </div>

                    <div className="sm:col-span-2">
                      <span className="text-slate-400">Experience:</span>{" "}
                      <span className="font-medium">{request.experience} years</span>
                    </div>
                  </div>

                  {request.description && (
                    <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-sm text-slate-600">
                      {request.description}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3 pt-2">
                    <button
                      onClick={() => handleApprove(request._id)}
                      className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                    >
                      <CheckCircle size={16} />
                      Approve
                    </button>

                    <button
                      onClick={() => handlePause(request._id)}
                      className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600"
                    >
                      <PauseCircle size={16} />
                      Pause
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpertRequests;
