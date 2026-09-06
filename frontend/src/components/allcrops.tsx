import { useEffect, useState } from "react";
import axios from "axios";
import {
  CalendarDays,
  ExternalLink,
  Mail,
  MapPin,
  Phone,
  Search,
  Sprout,
} from "lucide-react";

type CropListing = {
  _id: string;
  imageUri?: string;
  cropName: string;
  cropVariety?: string;
  quantity: number;
  quantityUnit: string;
  expectedPrice: number;
  readyDate: string;
  farmerName: string;
  mobileNumber: string;
  email?: string;
  description?: string;
  latitude: number;
  longitude: number;
  createdAt?: string;
};

const BACKEND_API = (import.meta as ImportMeta & {
  env: { VITE_BACKEND_API?: string };
}).env.VITE_BACKEND_API;

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "-"
    : date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function isDisplayableImage(value?: string) {
  return Boolean(value && /^(https?:\/\/|data:image\/)/i.test(value));
}

export default function AllCrops() {
  const [listings, setListings] = useState<CropListing[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadListings() {
      try {
        const response = await axios.get(`${BACKEND_API}/api/v1/sellcroprouter/allcrops`);
        const data = response.data?.data;
        setListings(Array.isArray(data) ? data : []);
      } catch (requestError) {
        console.error("Failed to load crop listings:", requestError);
        setError("Unable to load crops for sale.");
      } finally {
        setLoading(false);
      }
    }

    loadListings();
  }, []);

  const visibleListings = listings.filter((listing) => {
    const query = search.trim().toLowerCase();
    if (!query) return true;
    return [listing.cropName, listing.cropVariety, listing.farmerName, listing.description]
      .filter(Boolean)
      .some((value) => value?.toLowerCase().includes(query));
  });

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-1 text-sm font-semibold uppercase tracking-widest text-green-700">Farmer marketplace</p>
            <h1 className="text-3xl font-bold text-slate-900">Crops for Sale</h1>
            <p className="mt-1 text-slate-500">Connect with farmers offering fresh crops near their listed location.</p>
          </div>
          <label className="relative block sm:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search crop or farmer" className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100" />
          </label>
        </div>

        {loading && <p className="text-slate-500">Loading crops...</p>}
        {!loading && error && <p className="rounded-lg bg-red-50 p-4 text-red-700">{error}</p>}
        {!loading && !error && visibleListings.length === 0 && <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">No crops are currently listed for sale.</div>}

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {visibleListings.map((listing) => (
            <article key={listing._id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              {isDisplayableImage(listing.imageUri) ? <img src={listing.imageUri} alt={listing.cropName} className="h-52 w-full object-cover" /> : <div className="flex h-52 items-center justify-center bg-green-50 text-green-700"><Sprout className="h-14 w-14" /></div>}
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div><h2 className="text-xl font-bold capitalize text-slate-900">{listing.cropName}</h2><p className="text-sm text-green-700">{listing.cropVariety || "Standard variety"}</p></div>
                  <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">Available</span>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                  <div><p className="text-xs text-slate-400">Quantity</p><p className="font-semibold text-slate-700">{listing.quantity} {listing.quantityUnit}</p></div>
                  <div><p className="text-xs text-slate-400">Expected price</p><p className="font-semibold text-green-700">{formatPrice(listing.expectedPrice)}</p></div>
                  <div><p className="text-xs text-slate-400">Ready date</p><p className="flex items-center gap-1 text-slate-700"><CalendarDays className="h-4 w-4" />{formatDate(listing.readyDate)}</p></div>
                  <div><p className="text-xs text-slate-400">Farmer</p><p className="font-semibold text-slate-700">{listing.farmerName}</p></div>
                </div>

                {listing.description && <p className="mt-4 text-sm leading-6 text-slate-600">{listing.description}</p>}
                <div className="mt-4 flex items-start gap-2 text-sm text-slate-600"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-green-700" /><span>{listing.latitude.toFixed(4)}, {listing.longitude.toFixed(4)}</span></div>

                <div className="mt-5 grid grid-cols-2 gap-2">
                  <a href={`tel:${listing.mobileNumber}`} className="flex items-center justify-center gap-2 rounded-lg bg-green-700 px-3 py-2.5 text-sm font-semibold text-white hover:bg-green-800"><Phone className="h-4 w-4" /> Call farmer</a>
                  {listing.email ? <a href={`mailto:${listing.email}`} className="flex items-center justify-center gap-2 rounded-lg bg-blue-50 px-3 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-100"><Mail className="h-4 w-4" /> Email</a> : <a href={`https://www.google.com/maps/search/?api=1&query=${listing.latitude},${listing.longitude}`} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-lg bg-slate-100 px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200"><ExternalLink className="h-4 w-4" /> View location</a>}
                </div>
                {listing.email && <a href={`https://www.google.com/maps/search/?api=1&query=${listing.latitude},${listing.longitude}`} target="_blank" rel="noreferrer" className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-slate-100 px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200"><MapPin className="h-4 w-4" /> View location</a>}
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
