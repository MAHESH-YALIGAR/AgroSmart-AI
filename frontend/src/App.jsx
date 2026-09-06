import React from "react";
import AgricultureExperts from "./components/add_experts";
import ProductSearchSelect from "./components/add_agrostores";
import AddSchemasPage from "./components/addSchemas";
import AllSchemas from "./components/allschemas";
import AllStores from "./components/allstores";
import ExpertManagement from "./components/ExpertManagement";

import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
} from "react-router-dom";
import { ClipboardList, LayoutDashboard, Sprout, Store, UsersRound } from "lucide-react";

const navigationItems = [
  { label: "Add Expert", path: "/", icon: UsersRound, end: true },
  { label: "Agro Stores", path: "/addagrostores", icon: Store },
  { label: "All Stores", path: "/allagrostores", icon: Store },
  { label: "Schemes", path: "/addschema", icon: ClipboardList },
  { label: "All Schemes", path: "/allschemas", icon: ClipboardList },
  { label: "Expert Management", path: "/expert-management", icon: LayoutDashboard },
];

function AdminNavigation() {
  return (
    <header className="border-b-4 border-amber-500 bg-green-900 shadow-sm">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-4 py-3 sm:px-6">
        <NavLink to="/" className="mr-auto flex items-center gap-2 text-lg font-bold text-white">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500">
            <Sprout className="h-5 w-5 text-green-900" />
          </span>
          <span>AgroSmart Admin</span>
        </NavLink>

        <nav aria-label="Admin pages" className="flex w-full flex-wrap gap-2 sm:w-auto">
          {navigationItems.map(({ label, path, icon: Icon, end }) => (
            <NavLink
              key={path}
              to={path}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-amber-500 text-green-950"
                    : "text-green-100 hover:bg-green-800 hover:text-white"
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AdminNavigation />
      <Routes>

        <Route
          path="/"
          element={<AgricultureExperts />}
        />

        <Route
          path="/addagrostores"
          element={<ProductSearchSelect />}
        />
        <Route
          path="/allagrostores"
          element={<AllStores />}
        />
  <Route
          path="/addschema"
          element={<AddSchemasPage />}
        />
        <Route
          path="/allschemas"
          element={<AllSchemas />}
        />
       <Route
          path="/expert-management"
          element={<ExpertManagement/>}
        />
        <Route
          path="/ExpertManegement"
          element={<ExpertManagement/>}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;