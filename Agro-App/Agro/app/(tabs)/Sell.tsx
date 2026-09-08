import React, { useState } from "react";

import SellCrop from "../components/SellCrop";
import MyCropListings from "../components/MyCropListings";

const Sell = () => {
  const [view, setView] = useState<"create" | "listings">("create");

  return view === "create" ? (
    <SellCrop onOpenListings={() => setView("listings")} />
  ) : (
    <MyCropListings onCreate={() => setView("create")} />
  );
};

export default Sell;