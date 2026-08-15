import React from "react";
import AgricultureExperts from "./components/add_experts";
import ProductSearchSelect from "./components/add_agrostores";
import AddSchemasPage from "./components/addSchemas";

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
          path="/ProductSearchSelect"
          element={<ProductSearchSelect />}
        />
  <Route
          path="/addschema"
          element={<AddSchemasPage />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;