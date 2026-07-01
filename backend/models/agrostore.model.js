const mongoose = require("mongoose");
const { Schema } = mongoose;

const PRODUCT_AVAILABILITY = ["Available", "Out of Stock"];

const storeProductSchema = new Schema(
  {
    product: {
      type: String,
      required: true,
      trim: true,
    },

    availability: {
      type: String,
      enum: PRODUCT_AVAILABILITY,
      default: "Available",
    },
  },
  { _id: false }
);

const agroStoreSchema = new Schema(
  {
    logo: {
      type: String,
      default: null,
    },

    storeName: {
      type: String,
      required: true,
      trim: true,
    },

    ownerName: {
      type: String,
      required: true,
      trim: true,
    },

    mobile: {
      type: String,
      required: true,
      trim: true,
      match: [/^[0-9]{10}$/, "Enter a valid 10-digit mobile number"],
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Enter a valid email"],
    },

    licenseNumber: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    state: {
      type: String,
      required: true,
      trim: true,
    },

    district: {
      type: String,
      required: true,
      trim: true,
    },

    taluka: {
      type: String,
      required: true,
      trim: true,
    },

    place: {
      type: String,
      required: true,
      trim: true,
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },

      coordinates: {
        type: [Number],
        default: [0, 0],
      },
    },

    openingTime: {
      type: String,
      required: true,
    },

    closingTime: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      trim: true,
    },

    products: {
      type: [storeProductSchema],
      default: [],
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

agroStoreSchema.index({
  location: "2dsphere",
});

agroStoreSchema.index({
  "products.product": 1,
  "products.availability": 1,
});

agroStoreSchema.index({
  storeName: "text",
  description: "text",
});

agroStoreSchema.statics.AVAILABILITY =
  PRODUCT_AVAILABILITY;

module.exports = mongoose.model(
  "AgroStore",
  agroStoreSchema
);