import React from "react";
import AgricultureExperts from "./components/add_experts";
import ProductSearchSelect from "./components/add_agrostores";
import AddSchemasPage from "./components/addSchemas";
import ExpertManagement from "./components/expert_crud";

import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
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
          path="/addschema"
          element={<AddSchemasPage />}
        />
       <Route
          path="/ExpertManegement"
          element={<ExpertManagement />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;