import React, { useMemo, useState } from "react";
import {
  AlertCircle,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  FileText,
  Globe,
  Landmark,
  Link2,
  MapPin,
  Save,
  Search,
  Send,
  Sprout,
  XCircle,
} from "lucide-react";
import { cropData } from "../data/cropData";
import { locationData } from "../data/locationData";

const schemeTypeOptions = [
  "Financial Assistance",
  "Crop Subsidy",
  "Equipment Subsidy",
  "Crop Insurance",
  "Seed Subsidy",
  "Fertilizer Subsidy",
  "Irrigation",
  "Agriculture Loan",
  "Farmer Welfare",
  "Other",
];

const initialForm = {
  schemeName: "",
  schemeType: "",
  shortDescription: "",
  benefits: "",
  eligibilitySummary: "",
  targetLocation: "All India",
  state: "",
  district: "",
  taluka: "",
  targetCrop: "All Crops",
  applicationStartDate: "",
  applicationLastDate: "",
  officialApplicationLink: "",
  status: "Draft",
};

const inputBase =
  "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-green-700 focus:outline-none focus:ring-2 focus:ring-green-200 transition-all";

function FieldLabel({ label, required = false }) {
  return (
    <label className="mb-1.5 block text-sm font-semibold text-slate-700">
      {label}
      {required && <span className="ml-1 text-red-600">*</span>}
    </label>
  );
}

function formatDate(dateString) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getLocationSummary(form) {
  if (form.targetLocation === "All India") return "All India";
  if (form.targetLocation === "State") return form.state || "State";
  if (form.targetLocation === "District") {
    return `${form.state || "State"} > ${form.district || "District"}`;
  }
  return `${form.state || "State"} > ${form.district || "District"} > ${form.taluka || "Taluka"}`;
}

function buildUrlSafe(value) {
  const trimmed = value.trim();
  if (!trimmed) return "#";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export default function AddSchemasPage() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [cropSearch, setCropSearch] = useState("");
  const [cropMenuOpen, setCropMenuOpen] = useState(false);

  const stateOptions = useMemo(
    () => locationData.states.map((state) => ({ value: state, label: state })),
    []
  );

  const districtOptions = useMemo(() => {
    if (!form.state) return [];
    const normalizedState = form.state.toLowerCase().replace(/[^a-z]/g, "");
    const stateBlock = locationData[normalizedState];
    if (!stateBlock) return [];
    return Object.keys(stateBlock).map((item) => ({ value: item, label: item }));
  }, [form.state]);

  const talukaOptions = useMemo(() => {
    if (!form.state || !form.district) return [];
    const normalizedState = form.state.toLowerCase().replace(/[^a-z]/g, "");
    const stateBlock = locationData[normalizedState];
    const districtList = stateBlock?.[form.district];
    if (!Array.isArray(districtList)) return [];
    return districtList.map((taluka) => ({ value: taluka, label: taluka }));
  }, [form.state, form.district]);

  const cropOptions = useMemo(() => {
    const allOptions = ["All Crops", ...cropData];
    const query = cropSearch.trim().toLowerCase();
    if (!query) return allOptions;
    return allOptions.filter((crop) => crop.toLowerCase().includes(query));
  }, [cropSearch]);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
    setMessage({ type: "", text: "" });
  };

  const validateForm = (requireFullValidation = true) => {
    const nextErrors = {};

    if (requireFullValidation) {
      if (!form.schemeName.trim()) nextErrors.schemeName = "Scheme name is required.";
      if (!form.schemeType.trim()) nextErrors.schemeType = "Scheme type is required.";
      if (!form.shortDescription.trim()) nextErrors.shortDescription = "Short description is required.";
      if (!form.benefits.trim()) nextErrors.benefits = "Benefits are required.";
      if (!form.eligibilitySummary.trim()) nextErrors.eligibilitySummary = "Eligibility summary is required.";
      if (!form.applicationStartDate) nextErrors.applicationStartDate = "Start date is required.";
      if (!form.applicationLastDate) nextErrors.applicationLastDate = "Last date is required.";
      if (
        form.applicationStartDate &&
        form.applicationLastDate &&
        new Date(form.applicationLastDate) < new Date(form.applicationStartDate)
      ) {
        nextErrors.applicationLastDate = "Last date cannot be before the start date.";
      }

      if (!form.officialApplicationLink.trim()) {
        nextErrors.officialApplicationLink = "Official application link is required.";
      } else if (!/^https?:\/\//i.test(form.officialApplicationLink.trim())) {
        nextErrors.officialApplicationLink = "Enter a valid official URL starting with http:// or https://";
      }
    }

    if (form.targetLocation === "State" && !form.state.trim()) {
      nextErrors.state = "State is required for this target location.";
    }

    if (form.targetLocation === "District") {
      if (!form.state.trim()) nextErrors.state = "State is required.";
      if (!form.district.trim()) nextErrors.district = "District is required.";
    }

    if (form.targetLocation === "Taluka") {
      if (!form.state.trim()) nextErrors.state = "State is required.";
      if (!form.district.trim()) nextErrors.district = "District is required.";
      if (!form.taluka.trim()) nextErrors.taluka = "Taluka is required.";
    }

    return nextErrors;
  };

  const handleLocationChange = (field) => (event) => {
    const value = event.target.value;
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "state") {
        next.district = "";
        next.taluka = "";
      }
      if (field === "district") {
        next.taluka = "";
      }
      return next;
    });
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleSubmit = async (action = "draft") => {
    const requireFullValidation = action === "publish";
    const validationErrors = validateForm(requireFullValidation);

    if (requireFullValidation && Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setMessage({ type: "error", text: "Please fix the highlighted fields before publishing." });
      return;
    }

    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 700));
      const nextStatus = action === "publish" ? "Published" : "Draft";
      setForm((prev) => ({ ...prev, status: nextStatus }));
      setMessage({
        type: "success",
        text:
          action === "publish"
            ? "Scheme published successfully. It is now ready for farmers to view."
            : "Scheme saved as draft successfully.",
      });
      setErrors({});
    } catch (error) {
      setMessage({ type: "error", text: "Something went wrong. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-white text-slate-800">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 rounded-3xl bg-gradient-to-r from-green-700 via-emerald-600 to-lime-500 px-6 py-6 text-white shadow-lg shadow-green-900/10">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-white/15 p-3 ring-1 ring-white/20">
              <Landmark className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold sm:text-3xl">Release Government Scheme</h1>
              <p className="mt-1 text-sm text-green-50">Publish agriculture-focused government schemes for farmers.</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.6fr_0.9fr]">
          <div className="rounded-3xl border border-green-100 bg-white p-5 shadow-sm shadow-green-100 sm:p-6">
            <div className="mb-5 flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-700" />
              <h2 className="text-lg font-bold text-slate-800">Scheme Details</h2>
            </div>

            <div className="space-y-5">
              <div>
                <FieldLabel label="Scheme Name" required />
                <input
                  type="text"
                  value={form.schemeName}
                  onChange={(e) => updateField("schemeName", e.target.value)}
                  placeholder="e.g. PM-KISAN"
                  className={`${inputBase} ${errors.schemeName ? "border-red-400 focus:border-red-500 focus:ring-red-200" : ""}`}
                />
                {errors.schemeName && <p className="mt-1 text-xs text-red-600">{errors.schemeName}</p>}
              </div>

              <div>
                <FieldLabel label="Scheme Type" required />
                <div className="relative">
                  <select
                    value={form.schemeType}
                    onChange={(e) => updateField("schemeType", e.target.value)}
                    className={`${inputBase} appearance-none pr-10 ${errors.schemeType ? "border-red-400 focus:border-red-500 focus:ring-red-200" : ""}`}
                  >
                    <option value="">Select scheme type</option>
                    {schemeTypeOptions.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                </div>
                {errors.schemeType && <p className="mt-1 text-xs text-red-600">{errors.schemeType}</p>}
              </div>

              <div>
                <FieldLabel label="Short Description" required />
                <textarea
                  value={form.shortDescription}
                  onChange={(e) => updateField("shortDescription", e.target.value)}
                  rows={3}
                  placeholder="Short explanation of the scheme"
                  className={`${inputBase} resize-none ${errors.shortDescription ? "border-red-400 focus:border-red-500 focus:ring-red-200" : ""}`}
                />
                {errors.shortDescription && <p className="mt-1 text-xs text-red-600">{errors.shortDescription}</p>}
              </div>

              <div>
                <FieldLabel label="Benefits" required />
                <textarea
                  value={form.benefits}
                  onChange={(e) => updateField("benefits", e.target.value)}
                  rows={3}
                  placeholder="Up to 50% subsidy on agricultural equipment"
                  className={`${inputBase} resize-none ${errors.benefits ? "border-red-400 focus:border-red-500 focus:ring-red-200" : ""}`}
                />
                {errors.benefits && <p className="mt-1 text-xs text-red-600">{errors.benefits}</p>}
              </div>

              <div>
                <FieldLabel label="Eligibility Summary" required />
                <textarea
                  value={form.eligibilitySummary}
                  onChange={(e) => updateField("eligibilitySummary", e.target.value)}
                  rows={3}
                  placeholder="Eligible landholding farmer families"
                  className={`${inputBase} resize-none ${errors.eligibilitySummary ? "border-red-400 focus:border-red-500 focus:ring-red-200" : ""}`}
                />
                {errors.eligibilitySummary && <p className="mt-1 text-xs text-red-600">{errors.eligibilitySummary}</p>}
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <FieldLabel label="Target Location" required />
                  <div className="relative">
                    <select
                      value={form.targetLocation}
                      onChange={(e) => updateField("targetLocation", e.target.value)}
                      className={`${inputBase} appearance-none pr-10`}
                    >
                      <option value="All India">All India</option>
                      <option value="State">State</option>
                      <option value="District">District</option>
                      <option value="Taluka">Taluka</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  </div>
                </div>

                <div>
                  <FieldLabel label="Target Crop" />
                  <div className="relative">
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={cropSearch}
                        onChange={(e) => {
                          setCropSearch(e.target.value);
                          setCropMenuOpen(true);
                        }}
                        onFocus={() => setCropMenuOpen(true)}
                        placeholder="Search crop"
                        className={`${inputBase} pl-9`}
                      />
                    </div>

                    {cropMenuOpen && (
                      <div className="absolute z-20 mt-2 max-h-48 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg">
                        {cropOptions.map((crop) => (
                          <button
                            key={crop}
                            type="button"
                            onClick={() => {
                              updateField("targetCrop", crop);
                              setCropSearch("");
                              setCropMenuOpen(false);
                            }}
                            className="block w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-green-50"
                          >
                            {crop}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-slate-500">Current selection: {form.targetCrop}</p>
                </div>
              </div>

              {form.targetLocation !== "All India" && (
                <div className="grid gap-5 md:grid-cols-3">
                  <div>
                    <FieldLabel label="State" required={form.targetLocation !== "All India"} />
                    <div className="relative">
                      <select
                        value={form.state}
                        onChange={handleLocationChange("state")}
                        className={`${inputBase} appearance-none pr-10 ${errors.state ? "border-red-400 focus:border-red-500 focus:ring-red-200" : ""}`}
                      >
                        <option value="">Select state</option>
                        {stateOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    </div>
                    {errors.state && <p className="mt-1 text-xs text-red-600">{errors.state}</p>}
                  </div>

                  {(form.targetLocation === "District" || form.targetLocation === "Taluka") && (
                    <div>
                      <FieldLabel label="District" required />
                      <div className="relative">
                        <select
                          value={form.district}
                          onChange={handleLocationChange("district")}
                          className={`${inputBase} appearance-none pr-10 ${errors.district ? "border-red-400 focus:border-red-500 focus:ring-red-200" : ""}`}
                          disabled={!form.state}
                        >
                          <option value="">Select district</option>
                          {districtOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      </div>
                      {errors.district && <p className="mt-1 text-xs text-red-600">{errors.district}</p>}
                    </div>
                  )}

                  {form.targetLocation === "Taluka" && (
                    <div>
                      <FieldLabel label="Taluka" required />
                      <div className="relative">
                        <select
                          value={form.taluka}
                          onChange={handleLocationChange("taluka")}
                          className={`${inputBase} appearance-none pr-10 ${errors.taluka ? "border-red-400 focus:border-red-500 focus:ring-red-200" : ""}`}
                          disabled={!form.district}
                        >
                          <option value="">Select taluka</option>
                          {talukaOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      </div>
                      {errors.taluka && <p className="mt-1 text-xs text-red-600">{errors.taluka}</p>}
                    </div>
                  )}
                </div>
              )}

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <FieldLabel label="Application Start Date" required />
                  <input
                    type="date"
                    value={form.applicationStartDate}
                    onChange={(e) => updateField("applicationStartDate", e.target.value)}
                    className={`${inputBase} ${errors.applicationStartDate ? "border-red-400 focus:border-red-500 focus:ring-red-200" : ""}`}
                  />
                  {errors.applicationStartDate && <p className="mt-1 text-xs text-red-600">{errors.applicationStartDate}</p>}
                </div>

                <div>
                  <FieldLabel label="Application Last Date" required />
                  <input
                    type="date"
                    value={form.applicationLastDate}
                    onChange={(e) => updateField("applicationLastDate", e.target.value)}
                    className={`${inputBase} ${errors.applicationLastDate ? "border-red-400 focus:border-red-500 focus:ring-red-200" : ""}`}
                  />
                  {errors.applicationLastDate && <p className="mt-1 text-xs text-red-600">{errors.applicationLastDate}</p>}
                </div>
              </div>

              <div>
                <FieldLabel label="Official Application Link" required />
                <div className="relative">
                  <Link2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="url"
                    value={form.officialApplicationLink}
                    onChange={(e) => updateField("officialApplicationLink", e.target.value)}
                    placeholder="https://example.gov.in/scheme"
                    className={`${inputBase} pl-9 ${errors.officialApplicationLink ? "border-red-400 focus:border-red-500 focus:ring-red-200" : ""}`}
                  />
                </div>
                {errors.officialApplicationLink && <p className="mt-1 text-xs text-red-600">{errors.officialApplicationLink}</p>}
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => handleSubmit("draft")}
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-green-600 bg-white px-4 py-3 text-sm font-semibold text-green-700 transition hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save className="h-4 w-4" />
                {isSubmitting ? "Saving..." : "Save as Draft"}
              </button>

              <button
                type="button"
                onClick={() => handleSubmit("publish")}
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Send className="h-4 w-4" />
                {isSubmitting ? "Publishing..." : "Publish Scheme"}
              </button>
            </div>

            {message.text && (
              <div
                className={`mt-5 flex items-start gap-2 rounded-2xl border px-4 py-3 text-sm ${
                  message.type === "success"
                    ? "border-green-200 bg-green-50 text-green-800"
                    : "border-red-200 bg-red-50 text-red-700"
                }`}
              >
                {message.type === "success" ? <CheckCircle2 className="mt-0.5 h-4 w-4" /> : <XCircle className="mt-0.5 h-4 w-4" />}
                <span>{message.text}</span>
              </div>
            )}
          </div>

         
        </div>
      </div>
    </div>
  );
}
