import { useEffect, useState } from "react";
import axios from "axios";
import {
  CalendarDays,
  CheckCircle2,
  ExternalLink,
  FileText,
  LoaderCircle,
  Pencil,
  PauseCircle,
  PlayCircle,
  Search,
  Trash2,
  X,
} from "lucide-react";

const BACKEND_API = import.meta.env.VITE_BACKEND_API;

const emptyForm = {
  schemeName: "",
  schemeType: "",
  shortDescription: "",
  benefits: "",
  eligibilitySummary: "",
  targetLocation: "All India",
  state: "",
  district: "",
  taluka: "",
  targetCrop: "",
  applicationStartDate: "",
  applicationLastDate: "",
  officialApplicationLink: "",
};

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "-"
    : date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
}

function toDateInput(value) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

function getLocationText(location = {}) {
  const parts = [location.level];
  if (location.state) parts.push(location.state);
  if (location.district) parts.push(location.district);
  if (location.taluka) parts.push(location.taluka);
  return parts.filter(Boolean).join(" / ") || "All India";
}

function normalizeSchemes(responseData) {
  if (Array.isArray(responseData)) return responseData;
  return responseData?.data || responseData?.schemes || [];
}

function formFromScheme(scheme) {
  return {
    schemeName: scheme.schemeName || "",
    schemeType: scheme.schemeType || "",
    shortDescription: scheme.shortDescription || "",
    benefits: scheme.benefits || "",
    eligibilitySummary: scheme.eligibilitySummary || "",
    targetLocation: scheme.targetLocation?.level || "All India",
    state: scheme.targetLocation?.state || "",
    district: scheme.targetLocation?.district || "",
    taluka: scheme.targetLocation?.taluka || "",
    targetCrop: Array.isArray(scheme.targetCrop) ? scheme.targetCrop.join(", ") : "",
    applicationStartDate: toDateInput(scheme.applicationStartDate),
    applicationLastDate: toDateInput(scheme.applicationLastDate),
    officialApplicationLink: scheme.officialApplicationLink || "",
  };
}

export default function AllSchemas() {
  const [schemes, setSchemes] = useState([]);
  const [heldIds, setHeldIds] = useState(() => new Set());
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingScheme, setEditingScheme] = useState(null);
  const [editForm, setEditForm] = useState(emptyForm);

  useEffect(() => {
    async function loadSchemes() {
      try {
        const response = await axios.get(`${BACKEND_API}/api/v1/addtional/getallSchemas`);
        const loadedSchemes = normalizeSchemes(response.data);
        setSchemes(loadedSchemes);
        setHeldIds(
          new Set(
            loadedSchemes
              .filter((scheme) => scheme.isActive === false)
              .map((scheme) => scheme._id)
          )
        );
      } catch (requestError) {
        console.error("Failed to load schemes:", requestError);
        setError("Unable to load schemes from the server.");
      } finally {
        setLoading(false);
      }
    }

    loadSchemes();
  }, []);

  const visibleSchemes = schemes.filter((scheme) => {
    const query = search.trim().toLowerCase();
    if (!query) return true;
    return [scheme.schemeName, scheme.schemeType, scheme.shortDescription]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(query));
  });

  function startEditing(scheme) {
    setEditingScheme(scheme);
    setEditForm(formFromScheme(scheme));
  }

  function updateForm(field, value) {
    setEditForm((current) => ({ ...current, [field]: value }));
  }

  async function saveEdit(event) {
    event.preventDefault();
    if (!editingScheme) return;

    const payload = {
      ...editForm,
      targetCrop: editForm.targetCrop
        .split(",")
        .map((crop) => crop.trim())
        .filter(Boolean),
      targetLocation: {
        level: editForm.targetLocation,
        state: editForm.state,
        district: editForm.district,
        taluka: editForm.taluka,
      },
    };

    try {
      const response = await axios.put(
        `${BACKEND_API}/api/v1/addtional/updateschema/${editingScheme._id}`,
        payload
      );
      const updatedScheme = response.data.data;

      setSchemes((current) =>
        current.map((scheme) =>
          scheme._id === updatedScheme._id ? updatedScheme : scheme
        )
      );
      setEditingScheme(null);
      alert(response.data.message || "Schema updated successfully");
    } catch (error) {
      console.error("Error updating scheme:", error);
      alert(error.response?.data?.message || "Failed to update scheme");
    }
  }

  async function deleteScheme(id) {
    // 1. Ask for confirmation
    if (!window.confirm("Are you sure you want to delete this scheme?")) return;

    try {
      const endpoint = `${BACKEND_API}/api/v1/addtional/deleteschemas/${id}`;

      const response = await axios.delete(endpoint);

      console.log("Delete scheme response:", response.data);

      // 3. Update local state variables on success
      setSchemes((current) => current.filter((scheme) => scheme._id !== id));
      setHeldIds((current) => {
        const next = new Set(current);
        next.delete(id);
        return next;
      });

      alert("Scheme deleted successfully!");

    } catch (error) {
      console.error("Error deleting scheme:", error);
      alert("Failed to delete scheme from the server.");
    }
  }

  async function toggleHold(id) {
    const isCurrentlyHeld = heldIds.has(id);
    const action = isCurrentlyHeld ? "Unhold" : "Hold";
    if (!window.confirm(`Are you sure you want to ${action.toLowerCase()} this scheme?`)) return;

    try {
      const endpoint = `${BACKEND_API}/api/v1/addtional/toggleHoldSchema`;

      // 2. Make a POST request and pass the id directly inside the body object
      const response = await axios.post(endpoint, { id }, {
        headers: { "Content-Type": "application/json" }
      });

      console.log("Toggle scheme hold response:", response.data);

      setSchemes((current) =>
        current.map((scheme) =>
          scheme._id === id
            ? { ...scheme, isActive: response.data.isActive }
            : scheme
        )
      );

      setHeldIds((current) => {
        const next = new Set(current);
        if (response.data.isActive === false) next.add(id);
        else next.delete(id);
        return next;
      });

      alert(response.data.message || `Scheme ${action.toLowerCase()}ed successfully!`);

    } catch (error) {
      console.error("Error Holding scheme:", error);
      alert(`Failed to ${action.toLowerCase()} scheme on the server.`);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-1 text-sm font-semibold uppercase tracking-widest text-green-700">Government schemes</p>
            <h1 className="text-3xl font-bold text-slate-900">All Schemes</h1>
            <p className="mt-1 text-slate-500">Review agriculture schemes available to farmers.</p>
          </div>
          <label className="relative block sm:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search schemes"
              className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
            />
          </label>
        </div>

        {loading && (
          <div className="flex items-center gap-2 text-slate-500">
            <LoaderCircle className="h-5 w-5 animate-spin" /> Loading schemes...
          </div>
        )}
        {!loading && error && <p className="rounded-lg bg-red-50 p-4 text-red-700">{error}</p>}
        {!loading && !error && visibleSchemes.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
            No schemes found.
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {visibleSchemes.map((scheme) => {
            const isHeld = heldIds.has(scheme._id);
            return (
              <article key={scheme._id} className={`overflow-hidden rounded-xl border shadow-sm ${isHeld ? "border-slate-200 bg-slate-50 opacity-70" : "border-slate-200 bg-white"}`}>
                <div className="border-b border-slate-100 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex gap-3">
                      <div className="rounded-lg bg-green-100 p-2.5 text-green-700"><FileText className="h-5 w-5" /></div>
                      <div>
                        <h2 className="font-bold text-slate-900">{scheme.schemeName}</h2>
                        <p className="mt-1 text-xs font-medium text-green-700">{scheme.schemeType}</p>
                      </div>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${isHeld ? "bg-amber-100 text-amber-800" : "bg-green-100 text-green-700"}`}>
                      {isHeld ? "On hold" : "Active"}
                    </span>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-slate-600">{scheme.shortDescription}</p>
                </div>

                <div className="space-y-4 p-5 text-sm">
                  <div><p className="font-semibold text-slate-700">Benefits</p><p className="mt-1 text-slate-600">{scheme.benefits}</p></div>
                  <div><p className="font-semibold text-slate-700">Eligibility</p><p className="mt-1 text-slate-600">{scheme.eligibilitySummary}</p></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><p className="text-xs text-slate-400">Start date</p><p className="mt-1 flex items-center gap-1 text-slate-700"><CalendarDays className="h-4 w-4 text-green-700" />{formatDate(scheme.applicationStartDate)}</p></div>
                    <div><p className="text-xs text-slate-400">Last date</p><p className="mt-1 text-slate-700">{formatDate(scheme.applicationLastDate)}</p></div>
                  </div>
                  <div><p className="text-xs text-slate-400">Location</p><p className="mt-1 text-slate-700">{getLocationText(scheme.targetLocation)}</p></div>
                  <div><p className="text-xs text-slate-400">Target crop</p><div className="mt-1 flex flex-wrap gap-1.5">{(scheme.targetCrop || ["All Crops"]).map((crop) => <span key={crop} className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">{crop}</span>)}</div></div>
                  <a href={scheme.officialApplicationLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-semibold text-green-700 hover:text-green-900">Open application link <ExternalLink className="h-4 w-4" /></a>
                </div>

                <div className="grid grid-cols-3 gap-2 border-t border-slate-100 p-4">
                  <button type="button" onClick={() => startEditing(scheme)} className="flex items-center justify-center gap-1 rounded-lg bg-blue-50 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100"><Pencil className="h-4 w-4" /> Edit</button>
                  <button type="button" onClick={() => toggleHold(scheme._id)} className="flex items-center justify-center gap-1 rounded-lg bg-amber-50 py-2 text-sm font-medium text-amber-700 hover:bg-amber-100">{isHeld ? <PlayCircle className="h-4 w-4" /> : <PauseCircle className="h-4 w-4" />}{isHeld ? "Unhold" : "Hold"}</button>
                  <button type="button" onClick={() => deleteScheme(scheme._id)} className="flex items-center justify-center gap-1 rounded-lg bg-red-50 py-2 text-sm font-medium text-red-700 hover:bg-red-100"><Trash2 className="h-4 w-4" /> Delete</button>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {editingScheme && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <form onSubmit={saveEdit} className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between"><h2 className="text-xl font-bold text-slate-900">Edit scheme</h2><button type="button" onClick={() => setEditingScheme(null)} aria-label="Close edit form"><X className="h-5 w-5" /></button></div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ["schemeName", "Scheme name"],
                ["schemeType", "Scheme type"],
                ["targetLocation", "Location level"],
                ["state", "State"],
                ["district", "District"],
                ["taluka", "Taluka"],
                ["targetCrop", "Target crop"],
                ["applicationStartDate", "Start date"],
                ["applicationLastDate", "Last date"],
                ["officialApplicationLink", "Application link"],
              ].map(([field, label]) => (
                <label key={field} className="text-sm font-medium text-slate-700">{label}<input type={field.includes("Date") ? "date" : "text"} value={editForm[field]} onChange={(event) => updateForm(field, event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100" /></label>
              ))}
              {["shortDescription", "benefits", "eligibilitySummary"].map((field) => (
                <label key={field} className="text-sm font-medium text-slate-700 sm:col-span-2">{field === "shortDescription" ? "Short description" : field === "benefits" ? "Benefits" : "Eligibility"}<textarea value={editForm[field]} onChange={(event) => updateForm(field, event.target.value)} rows={3} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100" /></label>
              ))}
            </div>
            <div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setEditingScheme(null)} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700">Cancel</button><button type="submit" className="flex items-center gap-2 rounded-lg bg-green-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-800"><CheckCircle2 className="h-4 w-4" /> Save changes</button></div>
          </form>
        </div>
      )}
    </main>
  );
}
