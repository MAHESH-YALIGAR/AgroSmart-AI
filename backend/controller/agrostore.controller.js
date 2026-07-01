const AgroStore = require("../models/agrostore.model");
const { resolveLocationFromPlace } = require("../services/geocode");

/**
 * @desc   Create a new agro store
 * @route  POST /api/agro-stores
 * @access Officer
 *
 * Expected req.body.products: [{ product: "<productId>", availability: "Available" }, ...]
 */
exports.createAgroStore = async (req, res) => {
  try {
    const {
      logo,
      storeName,
      ownerName,
      mobile,
      email,
      licenseNumber,
      state,
      district,
      taluka,
      place,
      address,
      openingTime,
      closingTime,
      description,
      products,
    } = req.body;

    // Backend resolves lat/lng from the selected Place — never sent by the client.
    const location = await resolveLocationFromPlace(state,district,taluka,place);

    const agroStore = await AgroStore.create({
      logo,
      storeName,
      ownerName,
      mobile,
      email,
      licenseNumber,
      state,
      district,
      taluka,
      place,
      address,
      location,
      openingTime,
      closingTime,
      description,
      products: products || [],
      createdBy: req.user?._id, // set by auth middleware
    });

    res.status(201).json({ success: true, data: agroStore });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * @desc   Get all agro stores (with optional location filters)
 * @route  GET /api/agro-stores
 * @access Officer / AI service
 */
exports.getAllAgroStores = async (req, res) => {
  try {
    const { state, district, taluka, place, search, page = 1, limit = 20 } = req.query;

    const filter = { isActive: true };
    if (state) filter.state = state;
    if (district) filter.district = district;
    if (taluka) filter.taluka = taluka;
    if (place) filter.place = place;
    if (search) filter.$text = { $search: search };

    const stores = await AgroStore.find(filter)
      .populate("state district taluka place products.product")
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await AgroStore.countDocuments(filter);

    res.status(200).json({ success: true, total, data: stores });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc   Get a single agro store by ID
 * @route  GET /api/agro-stores/:id
 * @access Officer / AI service
 */
exports.getAgroStoreById = async (req, res) => {
  try {
    const store = await AgroStore.findById(req.params.id).populate(
      "state district taluka place products.product"
    );

    if (!store) {
      return res.status(404).json({ success: false, message: "Agro store not found" });
    }

    res.status(200).json({ success: true, data: store });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc   Update an agro store (including replacing its product list)
 * @route  PUT /api/agro-stores/:id
 * @access Officer
 */
exports.updateAgroStore = async (req, res) => {
  try {
    const updates = { ...req.body };

    // If the place changed, re-resolve coordinates instead of trusting client input.
    if (updates.place) {
      updates.location = await resolveLocationFromPlace(updates.place);
    }

    const store = await AgroStore.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!store) {
      return res.status(404).json({ success: false, message: "Agro store not found" });
    }

    res.status(200).json({ success: true, data: store });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * @desc   Delete (deactivate) an agro store
 * @route  DELETE /api/agro-stores/:id
 * @access Officer
 */
exports.deleteAgroStore = async (req, res) => {
  try {
    const store = await AgroStore.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!store) {
      return res.status(404).json({ success: false, message: "Agro store not found" });
    }

    res.status(200).json({ success: true, message: "Agro store deactivated" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc   Add a single product to an existing store (used by the
 *         "Add Product" action on the Available Products section).
 * @route  POST /api/agro-stores/:id/products
 * @access Officer
 */
exports.addProductToStore = async (req, res) => {
  try {
    const { product, availability = "Available" } = req.body;

    const store = await AgroStore.findById(req.params.id);
    if (!store) {
      return res.status(404).json({ success: false, message: "Agro store not found" });
    }

    const alreadyExists = store.products.some(
      (p) => p.product.toString() === product
    );
    if (alreadyExists) {
      return res
        .status(400)
        .json({ success: false, message: "Product already added to this store" });
    }

    store.products.push({ product, availability });
    await store.save();

    res.status(200).json({ success: true, data: store });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * @desc   Remove a product from a store
 * @route  DELETE /api/agro-stores/:id/products/:productId
 * @access Officer
 */
exports.removeProductFromStore = async (req, res) => {
  try {
    const store = await AgroStore.findByIdAndUpdate(
      req.params.id,
      { $pull: { products: { product: req.params.productId } } },
      { new: true }
    );

    if (!store) {
      return res.status(404).json({ success: false, message: "Agro store not found" });
    }

    res.status(200).json({ success: true, data: store });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc   Find stores that sell a given product, nearest first.
 *         Powers AI queries like "Where can I buy Urea?" or
 *         "Which nearby store has Ridomil Gold?"
 * @route  GET /api/agro-stores/search-by-product
 *         ?productId=<id>&lng=<n>&lat=<n>&maxDistanceKm=<n>&onlyAvailable=true
 * @access AI service
 */
exports.findStoresByProduct = async (req, res) => {
  try {
    const {
      productId,
      lng,
      lat,
      maxDistanceKm = 25,
      onlyAvailable = "true",
    } = req.query;

    if (!productId) {
      return res
        .status(400)
        .json({ success: false, message: "productId is required" });
    }

    const filter = {
      isActive: true,
      "products.product": productId,
    };
    if (onlyAvailable === "true") {
      filter.products = {
        $elemMatch: { product: productId, availability: "Available" },
      };
    }

    // Geospatial sort when the user's location is known; otherwise plain match.
    if (lng && lat) {
      filter.location = {
        $near: {
          $geometry: { type: "Point", coordinates: [Number(lng), Number(lat)] },
          $maxDistance: Number(maxDistanceKm) * 1000, // metres
        },
      };
    }

    const stores = await AgroStore.find(filter)
      .populate("state district taluka place products.product")
      .limit(10);

    res.status(200).json({ success: true, data: stores });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc   Find the single nearest store carrying a product — used for the
 *         "Show the nearest store that has this medicine" / Google Maps flow.
 * @route  GET /api/agro-stores/nearest-with-product
 *         ?productId=<id>&lng=<n>&lat=<n>
 * @access AI service
 */
exports.findNearestStoreWithProduct = async (req, res) => {
  try {
    const { productId, lng, lat } = req.query;

    if (!productId || !lng || !lat) {
      return res.status(400).json({
        success: false,
        message: "productId, lng and lat are required",
      });
    }

    const store = await AgroStore.findOne({
      isActive: true,
      products: { $elemMatch: { product: productId, availability: "Available" } },
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: [Number(lng), Number(lat)] },
        },
      },
    }).populate("state district taluka place products.product");

    if (!store) {
      return res
        .status(404)
        .json({ success: false, message: "No nearby store has this product in stock" });
    }

    // Frontend can build a Google Maps link directly from this, e.g.:
    // https://www.google.com/maps/search/?api=1&query=<lat>,<lng>
    const [storeLng, storeLat] = store.location.coordinates;

    res.status(200).json({
      success: true,
      data: store,
      mapsUrl: `https://www.google.com/maps/search/?api=1&query=${storeLat},${storeLng}`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};