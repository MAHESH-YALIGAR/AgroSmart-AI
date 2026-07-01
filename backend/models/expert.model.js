const mongoose = require("mongoose");
const { Schema } = mongoose;

const expertSchema = new Schema(
  {
    photo: {
      type: String,
      default: null,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
      match: [/^[0-9]{10}$/, "Enter a valid 10-digit phone number"],
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Enter a valid email address"],
    },

    crop: {
      type: String,
      required: true,
      trim: true,
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

    experience: {
      type: Number,
      required: true,
      min: 0,
    },

    description: {
      type: String,
      trim: true,
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

expertSchema.index({ location: "2dsphere" });

expertSchema.index({
  name: "text",
  crop: "text",
  description: "text",
});

module.exports = mongoose.model("Expert", expertSchema);