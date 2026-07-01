import React, { useState, useRef, useMemo } from "react";
import { Upload, User, Phone, Mail, Sprout, MapPin, Building2, Map, Home, BadgeCheck, FileText, RotateCcw, Save } from "lucide-react";
import { locationData } from "../data/locationData";

const BACKEND_API = import.meta.env.VITE_BACKEND_API;

type Option = { value: string; label: string };

// ---------------------------------------------------------------------------
// CROP_OPTIONS — still static for now since locationData.ts only covers
// State/District/Taluka. Replace this with your real crop list/source.
// ---------------------------------------------------------------------------
const CROP_OPTIONS: Option[] = [
  { value: "wheat", label: "Wheat" },
  { value: "cotton", label: "Cotton" },
  { value: "sugarcane", label: "Sugarcane" },
];

type FormState = {
  name: string;
  phone: string;
  email: string;
  crop: string;
  state: string;
  district: string;
  taluka: string;
  place: string;
  experience: string;
  description: string;
};

type LabelProps = {
  children: React.ReactNode;
  required?: boolean;
};

type FieldShellProps = {
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  required?: boolean;
  children: React.ReactNode;
};

function Label({ children, required }: LabelProps) {
  return (
    <label className="block text-sm font-semibold text-slate-700 mb-1.5 tracking-wide">
      {children}
      {required && <span className="text-red-600 ml-0.5">*</span>}
    </label>
  );
}

function FieldShell({ icon: Icon, label, required, children }: FieldShellProps) {
  return (
    <div>
      <Label required={required}>{label}</Label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
        )}
        {children}
      </div>
    </div>
  );
}

const inputBase =
  "w-full h-12 rounded-md border border-slate-300 bg-white text-slate-800 text-[15px] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-700/40 focus:border-green-700 transition-colors disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed";

export default function AddExpertPage() {
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [form, setForm] = useState<FormState>({
    name: "",
    phone: "",
    email: "",
    crop: "",
    state: "",
    district: "",
    taluka: "",
    place: "",
    experience: "",
    description: "",
  });

  // -------------------------------------------------------------------------
  // STATE dropdown — comes straight from locationData.states (array of names).
  // -------------------------------------------------------------------------
  const stateOptions: Option[] = useMemo(
    () => locationData.states.map((s: string) => ({ value: s, label: s })),
    []
  );

  // -------------------------------------------------------------------------
  // DISTRICT dropdown — once a state is picked, look up locationData[stateKey]
  // (lowercase state name, e.g. "karnataka") and list its keys (district names).
  // -------------------------------------------------------------------------
  const districtOptions: Option[] = useMemo(() => {
    if (!form.state) return [];
    const stateKey = form.state.toLowerCase();
    const stateBlock = (locationData as any)[stateKey];
    if (!stateBlock) return [];
    return Object.keys(stateBlock).map((district) => ({
      value: district,
      label: district,
    }));
  }, [form.state]);

  // -------------------------------------------------------------------------
  // TALUKA dropdown — the array stored under locationData[stateKey][district].
  //
  // ASSUMPTION: this array is the list of taluka names, e.g.
  //   karnataka: { Bagalkot: ["Badami", "Jamkhandi", ...] }
  //
  // If your real file actually stores villages directly here (skipping
  // taluka), tell me and I'll move this logic down one level instead.
  // -------------------------------------------------------------------------
  const talukaOptions: Option[] = useMemo(() => {
    if (!form.state || !form.district) return [];
    const stateKey = form.state.toLowerCase();
    const stateBlock = (locationData as any)[stateKey];
    const list = stateBlock?.[form.district];
    if (!Array.isArray(list)) return [];
    return list.map((taluka: string) => ({ value: taluka, label: taluka }));
  }, [form.state, form.district]);

  // -------------------------------------------------------------------------
  // PLACE / VILLAGE dropdown — PLACEHOLDER.
  //
  // locationData.ts as shown doesn't go one level deeper than Taluka, so
  // there's currently nowhere to pull actual villages from. Until that's
  // confirmed, this just re-lists the selected taluka as a single option
  // so the form remains usable. Replace with the real lookup once you
  // confirm where village data lives.
  // -------------------------------------------------------------------------
  const placeOptions: Option[] = useMemo(() => {
    if (!form.taluka) return [];
    return [{ value: form.taluka, label: form.taluka }];
  }, [form.taluka]);

  const handleChange =
    (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  // Picking a new State/District/Taluka must clear any downstream selection,
  // otherwise you could end up with a stale Taluka/Place that doesn't
  // actually belong to the newly chosen parent.
  const handleLocationChange =
    (field: "state" | "district" | "taluka") =>
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value;
      setForm((prev) => {
        const next = { ...prev, [field]: value };
        if (field === "state") {
          next.district = "";
          next.taluka = "";
          next.place = "";
        } else if (field === "district") {
          next.taluka = "";
          next.place = "";
        } else if (field === "taluka") {
          next.place = "";
        }
        return next;
      });
    };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        if (typeof result === "string") {
          setPhotoPreview(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReset = () => {
    setForm({
      name: "",
      phone: "",
      email: "",
      crop: "",
      state: "",
      district: "",
      taluka: "",
      place: "",
      experience: "",
      description: "",
    });
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage("");

    const endpoint = BACKEND_API
      ? `${BACKEND_API}/api/v1/webrouter/createExpert`
      : "/api/v1/webrouter/createExpert";

    const payload = {
      photo: photoPreview,
      ...form,
      experience: Number(form.experience) || 0,
    };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to save expert.");
      }

      setSubmitMessage("Expert saved successfully.");
      handleReset();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Something went wrong while saving the expert.";
      setSubmitMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-green-900 border-b-4 border-amber-500">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-full bg-amber-500 flex items-center justify-center shrink-0">
            <Sprout className="w-6 h-6 text-green-900" />
          </div>
          <div>
            <p className="text-white font-semibold text-lg leading-tight tracking-wide">
              Department of Agriculture &amp; Farmers Welfare
            </p>
            <p className="text-green-200 text-xs sm:text-sm leading-tight">
              Agriculture Expert Registration Portal
            </p>
          </div>
        </div>
      </header>

      {/* Sub-header / breadcrumb strip */}
      <div className="bg-green-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-2">
          <p className="text-green-100 text-xs sm:text-sm font-medium">
            Officer Dashboard &nbsp;/&nbsp; Experts &nbsp;/&nbsp;{" "}
            <span className="text-white">Add New Expert</span>
          </p>
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Add Agriculture Expert</h1>
          <p className="text-slate-500 text-sm mt-1">
            Fill in the details below to register a new agriculture expert in the system.
          </p>
        </div>

        <form onSubmit={handleSave}>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Card header strip */}
            <div className="bg-green-50 border-b border-green-100 px-6 sm:px-8 py-3 flex items-center gap-2">
              <BadgeCheck className="w-5 h-5 text-green-800" />
              <span className="text-green-900 font-semibold text-sm tracking-wide">
                EXPERT INFORMATION
              </span>
            </div>

            <div className="p-6 sm:p-8 space-y-8">
              {/* Photo upload */}
              <div>
                <Label>Expert Photo</Label>
                <div className="flex items-center gap-5">
                  <div className="w-24 h-24 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden shrink-0">
                    {photoPreview ? (
                      <img
                        src={photoPreview}
                        alt="Expert preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-10 h-10 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                      id="expert-photo-input"
                    />
                    <label
                      htmlFor="expert-photo-input"
                      className="inline-flex items-center gap-2 h-11 px-4 rounded-md border border-green-700 text-green-800 font-semibold text-sm cursor-pointer hover:bg-green-50 transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                      Upload Photo
                    </label>
                    <p className="text-xs text-slate-400 mt-2">
                      JPG or PNG. Recommended size 300×300px.
                    </p>
                  </div>
                </div>
              </div>

              {/* Name / Phone */}
              <div className="grid sm:grid-cols-2 gap-6">
                <FieldShell icon={User} label="Expert Name" required>
                  <input
                    type="text"
                    value={form.name}
                    onChange={handleChange("name")}
                    placeholder="Enter full name"
                    className={`${inputBase} pl-10`}
                  />
                </FieldShell>

                <FieldShell icon={Phone} label="Phone Number" required>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={handleChange("phone")}
                    placeholder="Enter 10-digit mobile number"
                    className={`${inputBase} pl-10`}
                  />
                </FieldShell>
              </div>

              {/* Email / Crop */}
              <div className="grid sm:grid-cols-2 gap-6">
                <FieldShell icon={Mail} label="Email Address">
                  <input
                    type="email"
                    value={form.email}
                    onChange={handleChange("email")}
                    placeholder="Enter email address"
                    className={`${inputBase} pl-10`}
                  />
                </FieldShell>

                <FieldShell icon={Sprout} label="Crop" required>
                  <select
                    value={form.crop}
                    onChange={handleChange("crop")}
                    className={`${inputBase} pl-10 appearance-none`}
                  >
                    <option value="">Select crop</option>
                    {CROP_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </FieldShell>
              </div>

              {/* Location cascade: State / District */}
              <div className="grid sm:grid-cols-2 gap-6">
                <FieldShell icon={MapPin} label="State" required>
                  <select
                    value={form.state}
                    onChange={handleLocationChange("state")}
                    className={`${inputBase} pl-10 appearance-none`}
                  >
                    <option value="">Select state</option>
                    {stateOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </FieldShell>

                <FieldShell icon={Building2} label="District" required>
                  <select
                    value={form.district}
                    onChange={handleLocationChange("district")}
                    disabled={!form.state}
                    className={`${inputBase} pl-10 appearance-none`}
                  >
                    <option value="">
                      {!form.state ? "Select a state first" : "Select district"}
                    </option>
                    {districtOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </FieldShell>
              </div>

              {/* Taluka / Place */}
              <div className="grid sm:grid-cols-2 gap-6">
                <FieldShell icon={Map} label="Taluka" required>
                  <select
                    value={form.taluka}
                    onChange={handleLocationChange("taluka")}
                    disabled={!form.district}
                    className={`${inputBase} pl-10 appearance-none`}
                  >
                    <option value="">
                      {!form.district ? "Select a district first" : "Select taluka"}
                    </option>
                    {talukaOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </FieldShell>

                <FieldShell icon={Home} label="Place / Village" required>
                  <select
                    value={form.place}
                    onChange={handleChange("place")}
                    disabled={!form.taluka}
                    className={`${inputBase} pl-10 appearance-none`}
                  >
                    <option value="">
                      {!form.taluka ? "Select a taluka first" : "Select place / village"}
                    </option>
                    {placeOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </FieldShell>
              </div>
              <p className="text-xs text-slate-400 -mt-2">
                Location coordinates will be fetched automatically once a place / village is selected.
              </p>

              {/* Experience */}
              <div className="grid sm:grid-cols-2 gap-6">
                <FieldShell icon={BadgeCheck} label="Experience (Years)" required>
                  <input
                    type="number"
                    min="0"
                    value={form.experience}
                    onChange={handleChange("experience")}
                    placeholder="Enter years of experience"
                    className={`${inputBase} pl-10`}
                  />
                </FieldShell>
              </div>

              {/* Description */}
              <div>
                <Label>Description</Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3.5 w-5 h-5 text-slate-400 pointer-events-none" />
                  <textarea
                    rows={4}
                    value={form.description}
                    onChange={handleChange("description")}
                    placeholder="Brief background, specialization, or notes about the expert"
                    className="w-full rounded-md border border-slate-300 bg-white text-slate-800 text-[15px] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-700/40 focus:border-green-700 transition-colors pl-10 pt-3 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="border-t border-slate-200 bg-slate-50 px-6 sm:px-8 py-5 flex flex-col sm:flex-row justify-end gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-md bg-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-300 transition-colors order-2 sm:order-1"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-md bg-green-700 text-white font-semibold text-sm hover:bg-green-800 transition-colors order-1 sm:order-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                {isSubmitting ? "Saving..." : "Save Expert"}
              </button>
            </div>

            {submitMessage && (
              <div className="px-6 sm:px-8 pb-5">
                <p className={`text-sm ${submitMessage.includes("success") ? "text-green-700" : "text-red-600"}`}>
                  {submitMessage}
                </p>
              </div>
            )}
          </div>
        </form>

        <p className="text-center text-xs text-slate-400 mt-6">
          Government of India · Ministry of Agriculture &amp; Farmers Welfare
        </p>
      </main>
    </div>
  );
}