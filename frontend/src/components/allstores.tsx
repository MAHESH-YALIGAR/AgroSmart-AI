import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import agroProducts from "../data/products";
import {
  Ban,
  CheckCircle,
  Clock3,
  MapPin,
  Pencil,
  Search,
  Store,
  Trash2,
  X,
} from "lucide-react";

type StoreProduct = {
  product: string;
  availability: "Available" | "Out of Stock";
};

type Product = {
  id: string;
  name: string;
};

type AgroStore = {
  _id: string;
  logo?: string | null;
  storeName: string;
  ownerName: string;
  mobile: string;
  email?: string;
  licenseNumber: string;
  state: string;
  district: string;
  taluka: string;
  place: string;
  address: string;
  openingTime: string;
  closingTime: string;
  description?: string;
  products: StoreProduct[];
  isActive: boolean;
  createdAt?: string;
};

type StoreForm = Omit<AgroStore, "_id" | "isActive" | "createdAt" | "products"> & {
  products: StoreProduct[];
};

const BACKEND_API = (import.meta as ImportMeta & {
  env: { VITE_BACKEND_API?: string };
}).env.VITE_BACKEND_API;

const PRODUCT_MASTER_LIST: Product[] = agroProducts.map((productName) => ({
  id: productName,
  name: productName,
}));

const emptyForm: StoreForm = {
  logo: "",
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
  products: [],
};

function normalizeStores(data: unknown): AgroStore[] {
  if (Array.isArray(data)) return data as AgroStore[];
  if (data && typeof data === "object" && "data" in data) {
    const result = (data as { data?: unknown }).data;
    return Array.isArray(result) ? result as AgroStore[] : [];
  }
  return [];
}

function toForm(store: AgroStore): StoreForm {
  return {
    logo: store.logo || "",
    storeName: store.storeName || "",
    ownerName: store.ownerName || "",
    mobile: store.mobile || "",
    email: store.email || "",
    licenseNumber: store.licenseNumber || "",
    state: store.state || "",
    district: store.district || "",
    taluka: store.taluka || "",
    place: store.place || "",
    address: store.address || "",
    openingTime: store.openingTime || "",
    closingTime: store.closingTime || "",
    description: store.description || "",
    products: store.products || [],
  };
}

export default function AllStores() {
  const [stores, setStores] = useState<AgroStore[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingStore, setEditingStore] = useState<AgroStore | null>(null);
  const [editForm, setEditForm] = useState<StoreForm>(emptyForm);
  const [productQuery, setProductQuery] = useState("");

  useEffect(() => {
    async function loadStores() {
      try {
        const response = await axios.get(`${BACKEND_API}/api/v1/addtional/allagrostores`);
        setStores(normalizeStores(response.data));
      } catch (requestError) {
        console.error("Failed to load agro stores:", requestError);
        setError("Unable to load agro stores from the server.");
      } finally {
        setLoading(false);
      }
    }

    loadStores();
  }, []);

  const visibleStores = stores.filter((store) => {
    const query = search.trim().toLowerCase();
    if (!query) return true;
    return [store.storeName, store.ownerName, store.place, store.licenseNumber]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(query));
  });

  function startEditing(store: AgroStore) {
    setEditingStore(store);
    setEditForm(toForm(store));
  }

  function updateField(field: keyof StoreForm, value: string) {
    setEditForm((current) => ({ ...current, [field]: value }));
  }

  const filteredProducts = useMemo(() => {
    const query = productQuery.trim().toLowerCase();

    return PRODUCT_MASTER_LIST.filter((product) => {
      const alreadySelected = editForm.products.some(
        (item) => item.product.toLowerCase() === product.name.toLowerCase()
      );

      if (alreadySelected) return false;
      if (!query) return true;

      return product.name.toLowerCase().includes(query);
    });
  }, [editForm.products, productQuery]);

  function addProductToEdit(productName: string) {
    setEditForm((current) => ({
      ...current,
      products: [...current.products, { product: productName, availability: "Available" }],
    }));
    setProductQuery("");
  }

  function removeProductFromEdit(productName: string) {
    setEditForm((current) => ({
      ...current,
      products: current.products.filter((item) => item.product !== productName),
    }));
  }

  function updateProductAvailability(productName: string, availability: StoreProduct["availability"]) {
    setEditForm((current) => ({
      ...current,
      products: current.products.map((item) =>
        item.product === productName ? { ...item, availability } : item
      ),
    }));
  }

  async function saveEdit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingStore) return;

    try {
      const response = await axios.put(
        `${BACKEND_API}/api/v1/addtional/editagrostore/${editingStore._id}`,
        editForm
      );
      const updatedStore = response.data.data as AgroStore;
      setStores((current) => current.map((store) =>
        store._id === updatedStore._id ? updatedStore : store
      ));
      setEditingStore(null);
      alert(response.data.message || "Agro store updated successfully");
    } catch (requestError) {
      console.error("Failed to update agro store:", requestError);
      const message = axios.isAxiosError(requestError)
        ? requestError.response?.data?.message
        : undefined;
      alert(message || "Failed to update agro store");
    }
  }

  async function deleteStore(id: string) {
    if (!window.confirm("Are you sure you want to delete this agro store?")) return;

    try {
      const response = await axios.delete(
        `${BACKEND_API}/api/v1/addtional/deleteagrostore/${id}`
      );
      setStores((current) => current.filter((store) => store._id !== id));
      alert(response.data.message || "Agro store deleted successfully");
    } catch (requestError) {
      console.error("Failed to delete agro store:", requestError);
      alert("Failed to delete agro store");
    }
  }

  async function toggleBlock(store: AgroStore) {
    const action = store.isActive ? "block" : "unblock";
    if (!window.confirm(`Are you sure you want to ${action} this agro store?`)) return;

    try {
      const response = await axios.post(
        `${BACKEND_API}/api/v1/addtional/blockagrostore/${store._id}`
      );
      setStores((current) => current.map((item) =>
        item._id === store._id
          ? { ...item, isActive: response.data.isActive }
          : item
      ));
      alert(response.data.message || `Agro store ${action}ed successfully`);
    } catch (requestError) {
      console.error("Failed to change agro store status:", requestError);
      alert(`Failed to ${action} agro store`);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-1 text-sm font-semibold uppercase tracking-widest text-green-700">Agro stores</p>
            <h1 className="text-3xl font-bold text-slate-900">All Stores</h1>
            <p className="mt-1 text-slate-500">Manage registered agro stores and their availability.</p>
          </div>
          <label className="relative block sm:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search stores" className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100" />
          </label>
        </div>

        {loading && <p className="text-slate-500">Loading stores...</p>}
        {!loading && error && <p className="rounded-lg bg-red-50 p-4 text-red-700">{error}</p>}
        {!loading && !error && visibleStores.length === 0 && <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">No stores found.</div>}

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {visibleStores.map((store) => (
            <article key={store._id} className={`overflow-hidden rounded-xl border shadow-sm ${store.isActive ? "border-slate-200 bg-white" : "border-slate-200 bg-slate-50 opacity-70"}`}>
              <div className="border-b border-slate-100 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {store.logo ? <img src={store.logo} alt={store.storeName} className="h-12 w-12 rounded-lg object-cover" /> : <div className="rounded-lg bg-green-100 p-3 text-green-700"><Store className="h-6 w-6" /></div>}
                    <div><h2 className="font-bold text-slate-900">{store.storeName}</h2><p className="text-sm text-slate-500">Owner: {store.ownerName}</p></div>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${store.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{store.isActive ? "Active" : "Blocked"}</span>
                </div>
              </div>

              <div className="space-y-3 p-5 text-sm">
                <div><p className="text-xs text-slate-400">Contact</p><p className="font-medium text-slate-700">{store.mobile}{store.email ? ` • ${store.email}` : ""}</p></div>
                <div><p className="text-xs text-slate-400">License</p><p className="font-medium text-slate-700">{store.licenseNumber}</p></div>
                <div className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-green-700" /><p className="text-slate-700">{store.place}, {store.taluka}, {store.district}, {store.state}<br />{store.address}</p></div>
                <div className="flex items-center gap-2 text-slate-600"><Clock3 className="h-4 w-4 text-green-700" />{store.openingTime} - {store.closingTime}</div>
                {store.description && <p className="text-slate-600">{store.description}</p>}
                <div><p className="text-xs text-slate-400">Products</p><div className="mt-1 flex flex-wrap gap-1.5">{store.products?.length ? store.products.map((item) => <span key={`${item.product}-${item.availability}`} className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">{item.product} ({item.availability})</span>) : <span className="text-slate-500">No products listed</span>}</div></div>
              </div>

              <div className="grid grid-cols-3 gap-2 border-t border-slate-100 p-4">
                <button type="button" onClick={() => startEditing(store)} className="flex items-center justify-center gap-1 rounded-lg bg-blue-50 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100"><Pencil className="h-4 w-4" /> Edit</button>
                <button type="button" onClick={() => toggleBlock(store)} className={`flex items-center justify-center gap-1 rounded-lg py-2 text-sm font-medium ${store.isActive ? "bg-amber-50 text-amber-700 hover:bg-amber-100" : "bg-green-50 text-green-700 hover:bg-green-100"}`}>{store.isActive ? <Ban className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}{store.isActive ? "Block" : "Unblock"}</button>
                <button type="button" onClick={() => deleteStore(store._id)} className="flex items-center justify-center gap-1 rounded-lg bg-red-50 py-2 text-sm font-medium text-red-700 hover:bg-red-100"><Trash2 className="h-4 w-4" /> Delete</button>
              </div>
            </article>
          ))}
        </div>
      </div>

      {editingStore && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"><form onSubmit={saveEdit} className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl"><div className="mb-5 flex items-center justify-between"><h2 className="text-xl font-bold text-slate-900">Edit agro store</h2><button type="button" onClick={() => setEditingStore(null)} aria-label="Close edit form"><X className="h-5 w-5" /></button></div><div className="grid gap-4 sm:grid-cols-2">{(["storeName", "ownerName", "mobile", "email", "licenseNumber", "state", "district", "taluka", "place", "openingTime", "closingTime", "address"] as Array<keyof StoreForm>).map((field) => <label key={field} className="text-sm font-medium capitalize text-slate-700">{field.replace(/([A-Z])/g, " $1")}<input value={String(editForm[field] || "")} onChange={(event) => updateField(field, event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100" /></label>)}<label className="text-sm font-medium text-slate-700 sm:col-span-2">Description<textarea value={editForm.description || ""} onChange={(event) => updateField("description", event.target.value)} rows={3} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100" /></label></div><div className="mt-6 border-t border-slate-200 pt-5"><div className="mb-3 flex items-center justify-between gap-3"><h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">Products</h3></div><div className="relative"><input value={productQuery} onChange={(event) => setProductQuery(event.target.value)} placeholder="Search and add product" className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100" />{productQuery.trim() && filteredProducts.length > 0 && <div className="absolute left-0 right-0 z-20 mt-1 max-h-48 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">{filteredProducts.slice(0, 8).map((product) => <button key={product.id} type="button" onClick={() => addProductToEdit(product.name)} className="block w-full border-b border-slate-100 px-3 py-2 text-left text-sm text-slate-700 hover:bg-green-50 last:border-b-0">{product.name}</button>)}</div>}</div>{editForm.products.length === 0 ? <div className="mt-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">No products added yet. Search above to add a product.</div> : <div className="mt-4 space-y-2">{editForm.products.map((item, index) => <div key={`${item.product}-${index}`} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"><span className="flex-1 text-sm font-medium text-slate-700">{item.product}</span><select value={item.availability} onChange={(event) => updateProductAvailability(item.product, event.target.value as StoreProduct["availability"])} className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-700 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"><option value="Available">Available</option><option value="Out of Stock">Out of Stock</option></select><button type="button" onClick={() => removeProductFromEdit(item.product)} className="rounded-md border border-red-200 px-2 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50">Remove</button></div>)}</div>}</div><div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setEditingStore(null)} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700">Cancel</button><button type="submit" className="rounded-lg bg-green-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-800">Save changes</button></div></form></div>}
    </main>
  );
}
