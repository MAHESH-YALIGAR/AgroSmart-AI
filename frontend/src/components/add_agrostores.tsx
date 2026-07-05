import React, { useState, useRef, useMemo } from "react";
import agroProducts from "../data/products";
import {
  Upload,
  Store,
  User,
  Phone,
  Mail,
  FileBadge2,
  MapPin,
  Building2,
  Map,
  Home,
  Clock,
  FileText,
  Search,
  X,
  Plus,
  RotateCcw,
  Save,
  CheckCircle2,
  XCircle,
  Sprout,
} from "lucide-react";
import { locationData } from "../data/locationData";
// const BACKEND_API = import.meta.env.VITE_BACKEND_API;
const BACKEND_API = import.meta.env.VITE_BACKEND_API;

// ---------------------------------------------------------------------------
// Master data sources
// PRODUCT_MASTER_LIST is sourced from the local product catalog so officers can
// only choose from approved product names in the system.
// Location dropdowns follow the same State -> District -> Taluka -> Place
// cascade used elsewhere in the system.
// ---------------------------------------------------------------------------
type Product = {
  id: string;
  name: string;
  category?: string;
};

type Option = {
  value: string;
  label: string;
};

const PRODUCT_MASTER_LIST: Product[] = agroProducts.map((productName) => ({
  id: productName,
  name: productName,
}));

const AVAILABILITY = {
  AVAILABLE: "Available",
  OUT_OF_STOCK: "Out of Stock",
};

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-sm font-semibold text-slate-700 mb-1.5 tracking-wide">
      {children}
      {required && <span className="text-red-600 ml-0.5">*</span>}
    </label>
  );
}

function FieldShell({
  icon: Icon,
  label,
  required,
  children,
}: {
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
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
  "w-full h-12 rounded-md border border-slate-300 bg-white text-slate-800 text-[15px] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-700/40 focus:border-green-700 transition-colors";

function SectionHeader({ icon: Icon, title }: { icon: React.ComponentType<React.SVGProps<SVGSVGElement>>; title: string }) {
  return (
    <div className="bg-green-50 border-b border-green-100 px-6 sm:px-8 py-3 flex items-center gap-2">
      <Icon className="w-5 h-5 text-green-800" />
      <span className="text-green-900 font-semibold text-sm tracking-wide">{title}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Searchable product picker
// ---------------------------------------------------------------------------
function ProductSearchSelect({
  selectedProducts,
  onAddProduct,
}: {
  selectedProducts: Product[];
  onAddProduct: (product: Product) => void;
}) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const selectedIds = useMemo(
    () => new Set(selectedProducts.map((p) => p.id)),
    [selectedProducts]
  );

  const filteredOptions = useMemo(() => {
    return PRODUCT_MASTER_LIST.filter(
      (p) =>
        !selectedIds.has(p.id) &&
        p.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, selectedIds]);

  const handleSelect = (product: Product) => {
    onAddProduct(product);
    setQuery("");
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <Label>Search &amp; Add Product</Label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 150)}
          placeholder="Search product from master list (e.g. Urea, Ridomil Gold)"
          className={`${inputBase} pl-10`}
        />
      </div>

      {isOpen && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((product) => (
              <button
                key={product.id}
                type="button"
                onClick={() => handleSelect(product)}
                className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-green-50 flex items-center justify-between gap-3"
              >
                <span>{product.name}</span>
                {product.category && (
                  <span className="text-xs text-slate-400">{product.category}</span>
                )}
              </button>
            ))
          ) : (
            <div className="px-4 py-3 text-sm text-slate-400">
              No matching products in master list.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AddAgroStorePage() {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [form, setForm] = useState({
    storeName: "",
    ownerName: "",
    mobile: "",
    email: "",
    licenseNumber: "",
    state: "",
    district: "",
    taluka: "",
    place: "",
    address: "",
    openingTime: "",
    closingTime: "",
    description: "",
  });

  const [selectedProducts, setSelectedProducts] = useState<Array<Product & { availability: string }>>([]);

  const stateOptions: Option[] = useMemo(
    () => locationData.states.map((state: string) => ({ value: state, label: state })),
    []
  );

  const districtOptions: Option[] = useMemo(() => {
    if (!form.state) return [];
    const stateKey = form.state.toLowerCase();
    const stateBlock = (locationData as Record<string, any>)[stateKey];
    if (!stateBlock) return [];
    return Object.keys(stateBlock).map((district) => ({
      value: district,
      label: district,
    }));
  }, [form.state]);

  const talukaOptions: Option[] = useMemo(() => {
    if (!form.state || !form.district) return [];
    const stateKey = form.state.toLowerCase();
    const stateBlock = (locationData as Record<string, any>)[stateKey];
    const list = stateBlock?.[form.district];
    if (!Array.isArray(list)) return [];
    return list.map((taluka: string) => ({ value: taluka, label: taluka }));
  }, [form.state, form.district]);

  const placeOptions: Option[] = useMemo(() => {
    if (!form.taluka) return [];
    return [{ value: form.taluka, label: form.taluka }];
  }, [form.taluka]);

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleLocationChange = (field: "state" | "district" | "taluka") => (e: React.ChangeEvent<HTMLSelectElement>) => {
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

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        if (typeof result === "string") {
          setLogoPreview(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddProduct = (product: Product) => {
    setSelectedProducts((prev) => [
      ...prev,
      { ...product, availability: AVAILABILITY.AVAILABLE },
    ]);
  };

  const handleRemoveProduct = (id: string) => {
    setSelectedProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const handleAvailabilityChange = (id: string, availability: string) => {
    setSelectedProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, availability } : p))
    );
  };

  const handleReset = () => {
    setForm({
      storeName: "",
      ownerName: "",
      mobile: "",
      email: "",
      licenseNumber: "",
      state: "",
      district: "",
      taluka: "",
      place: "",
      address: "",
      openingTime: "",
      closingTime: "",
      description: "",
    });
    setSelectedProducts([]);
    setLogoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSave = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {

    e.preventDefault();

    setIsSubmitting(true);

    const endpoint = BACKEND_API
      ? `${BACKEND_API}/api/v1/webrouter/createAgroStore`
      : "/api/v1/webrouter/createAgroStore";

    const payload = {
      photo: logoPreview,
      ...form,
      products: selectedProducts.map(({ name, availability }) => ({
        name,
        availability,
      })),
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
        throw new Error(
          data?.message || "Failed to save Agro Store."
        );
      }

      setSubmitMessage("Agro Store saved successfully.");
      handleReset();

    } catch (error) {

      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong while saving the Agro Store.";

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
              AgroSmart AI
            </p>
            <p className="text-green-200 text-xs sm:text-sm leading-tight">
              Agro Store Registration Portal
            </p>
          </div>
        </div>
      </header>

      {/* Sub-header / breadcrumb strip */}
      <div className="bg-green-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-2">
          <p className="text-green-100 text-xs sm:text-sm font-medium">
            Officer Dashboard &nbsp;/&nbsp; Agro Stores &nbsp;/&nbsp;{" "}
            <span className="text-white">Add New Store</span>
          </p>
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Add Agro Store</h1>
          <p className="text-slate-500 text-sm mt-1">
            Register an agro store and its available products so the AI assistant can
            answer farmer queries and recommend the nearest store.
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* ---------------- Store Details ---------------- */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <SectionHeader icon={Store} title="STORE DETAILS" />
            <div className="p-6 sm:p-8 space-y-8">
              {/* Logo upload */}
              <div>
                <Label>Store Logo / Image</Label>
                <div className="flex items-center gap-5">
                  <div className="w-24 h-24 rounded-md bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden shrink-0">
                    {logoPreview ? (
                      <img
                        src={logoPreview}
                        alt="Store logo preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Store className="w-10 h-10 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="hidden"
                      id="store-logo-input"
                    />
                    <label
                      htmlFor="store-logo-input"
                      className="inline-flex items-center gap-2 h-11 px-4 rounded-md border border-green-700 text-green-800 font-semibold text-sm cursor-pointer hover:bg-green-50 transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                      Upload Image
                    </label>
                    <p className="text-xs text-slate-400 mt-2">
                      JPG or PNG. Recommended size 300×300px.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <FieldShell icon={Store} label="Store Name" required>
                  <input
                    type="text"
                    value={form.storeName}
                    onChange={handleChange("storeName")}
                    placeholder="Enter store name"
                    className={`${inputBase} pl-10`}
                  />
                </FieldShell>

                <FieldShell icon={User} label="Owner Name" required>
                  <input
                    type="text"
                    value={form.ownerName}
                    onChange={handleChange("ownerName")}
                    placeholder="Enter owner's full name"
                    className={`${inputBase} pl-10`}
                  />
                </FieldShell>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <FieldShell icon={Phone} label="Mobile Number" required>
                  <input
                    type="tel"
                    value={form.mobile}
                    onChange={handleChange("mobile")}
                    placeholder="Enter 10-digit mobile number"
                    className={`${inputBase} pl-10`}
                  />
                </FieldShell>

                <FieldShell icon={Mail} label="Email Address">
                  <input
                    type="email"
                    value={form.email}
                    onChange={handleChange("email")}
                    placeholder="Enter email address"
                    className={`${inputBase} pl-10`}
                  />
                </FieldShell>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <FieldShell icon={FileBadge2} label="Shop License Number" required>
                  <input
                    type="text"
                    value={form.licenseNumber}
                    onChange={handleChange("licenseNumber")}
                    placeholder="Enter shop license number"
                    className={`${inputBase} pl-10`}
                  />
                </FieldShell>
              </div>
            </div>
          </div>

          {/* ---------------- Location ---------------- */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <SectionHeader icon={MapPin} title="STORE LOCATION" />
            <div className="p-6 sm:p-8 space-y-8">
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
                    className={`${inputBase} pl-10 appearance-none`}
                  >
                    <option value="">Select district</option>
                    {districtOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </FieldShell>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <FieldShell icon={Map} label="Taluka" required>
                  <select
                    value={form.taluka}
                    onChange={handleLocationChange("taluka")}
                    className={`${inputBase} pl-10 appearance-none`}
                  >
                    <option value="">Select taluka</option>
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
                    className={`${inputBase} pl-10 appearance-none`}
                  >
                    <option value="">Select place / village</option>
                    {placeOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </FieldShell>
              </div>
              <p className="text-xs text-slate-400 -mt-2">
                Latitude and longitude will be fetched automatically once a place / village
                is selected, and used to power "nearest store" and Google Maps lookups.
              </p>

              <div>
                <Label required>Full Shop Address</Label>
                <div className="relative">
                  <Home className="absolute left-3 top-3.5 w-5 h-5 text-slate-400 pointer-events-none" />
                  <textarea
                    rows={3}
                    value={form.address}
                    onChange={handleChange("address")}
                    placeholder="Enter complete shop address with landmark"
                    className="w-full rounded-md border border-slate-300 bg-white text-slate-800 text-[15px] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-700/40 focus:border-green-700 transition-colors pl-10 pt-3 resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ---------------- Available Products ---------------- */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <SectionHeader icon={Sprout} title="AVAILABLE PRODUCTS" />
            <div className="p-6 sm:p-8 space-y-6">
              <ProductSearchSelect
                selectedProducts={selectedProducts}
                onAddProduct={handleAddProduct}
              />

              {selectedProducts.length === 0 ? (
                <div className="border border-dashed border-slate-300 rounded-md py-8 text-center">
                  <p className="text-sm text-slate-400">
                    No products added yet. Search above to add fertilizers, pesticides,
                    seeds, or other products available at this store.
                  </p>
                </div>
              ) : (
                <div className="border border-slate-200 rounded-md overflow-hidden">
                  <div className="hidden sm:grid grid-cols-[1fr_220px_56px] bg-slate-50 px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    <span>Product Name</span>
                    <span>Availability</span>
                    <span></span>
                  </div>
                  <ul className="divide-y divide-slate-100">
                    {selectedProducts.map((product) => (
                      <li
                        key={product.id}
                        className="grid sm:grid-cols-[1fr_220px_56px] gap-3 sm:gap-0 items-center px-4 py-3"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {product.availability === AVAILABILITY.AVAILABLE ? (
                            <CheckCircle2 className="w-4 h-4 text-green-700 shrink-0" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                          )}
                          <span className="text-sm font-medium text-slate-700 truncate">
                            {product.name}
                          </span>
                        </div>

                        <select
                          value={product.availability}
                          onChange={(e) =>
                            handleAvailabilityChange(product.id, e.target.value)
                          }
                          className={`h-10 rounded-md border text-sm font-medium px-3 focus:outline-none focus:ring-2 focus:ring-green-700/40 ${product.availability === AVAILABILITY.AVAILABLE
                            ? "border-green-200 text-green-700 bg-green-50"
                            : "border-red-200 text-red-600 bg-red-50"
                            }`}
                        >
                          <option value={AVAILABILITY.AVAILABLE}>Available</option>
                          <option value={AVAILABILITY.OUT_OF_STOCK}>Out of Stock</option>
                        </select>

                        <button
                          type="button"
                          onClick={() => handleRemoveProduct(product.id)}
                          aria-label={`Remove ${product.name}`}
                          className="justify-self-end sm:justify-self-center w-9 h-9 rounded-md flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <p className="text-xs text-slate-400 flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                Product names are sourced from the master product database — manual entry
                is not allowed, ensuring AI search matches exact product names.
              </p>
            </div>
          </div>

          {/* ---------------- Shop Information ---------------- */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <SectionHeader icon={Clock} title="SHOP INFORMATION" />
            <div className="p-6 sm:p-8 space-y-8">
              <div className="grid sm:grid-cols-2 gap-6">
                <FieldShell icon={Clock} label="Opening Time" required>
                  <input
                    type="time"
                    value={form.openingTime}
                    onChange={handleChange("openingTime")}
                    className={`${inputBase} pl-10`}
                  />
                </FieldShell>

                <FieldShell icon={Clock} label="Closing Time" required>
                  <input
                    type="time"
                    value={form.closingTime}
                    onChange={handleChange("closingTime")}
                    className={`${inputBase} pl-10`}
                  />
                </FieldShell>
              </div>

              <div>
                <Label>Description</Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3.5 w-5 h-5 text-slate-400 pointer-events-none" />
                  <textarea
                    rows={4}
                    value={form.description}
                    onChange={handleChange("description")}
                    placeholder="Brief note about the store, specialties, or services offered"
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
                {isSubmitting ? "Saving..." : "Save Agro Store"}
              </button>
            </div>
          </div>
        </form>

        <p className="text-center text-xs text-slate-400 mt-6">
          Government of India · Ministry of Agriculture &amp; Farmers Welfare · AgroSmart AI
        </p>
      </main>
    </div>
  );
}