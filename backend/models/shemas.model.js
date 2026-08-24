const mongoose = require("mongoose");
const agricultureSchemeSchema = new mongoose.Schema(
  {
    // 1. Scheme Name *
    schemeName: {
      type: String,
      required: true,
      trim: true,
    },

    // 2. Scheme Type *
    schemeType: {
      type: String,
      required: true,
      enum: [
        "Financial Assistance",
        "Crop Subsidy",
        "Equipment Subsidy",
        "Crop Insurance",
        "Seed Subsidy",
        "Fertilizer Subsidy",
        "Irrigation",
        "Agriculture Loan",
        "Farmer Welfare",
        "Other",
      ],
    },

    // 3. Short Description *
    shortDescription: {
      type: String,
      required: true,
      trim: true,
    },

    // 4. Benefits *
    benefits: {
      type: String,
      required: true,
      trim: true,
    },

    // 5. Eligibility Summary *
    eligibilitySummary: {
      type: String,
      required: true,
      trim: true,
    },

    // 6. Target Location *
    targetLocation: {
      level: {
        type: String,
        required: true,
        enum: ["All India", "State", "District", "Taluka"],
      },

      // Used when level = State/District/Taluka
      state: {
        type: String,
        trim: true,
      },

      district: {
        type: String,
        trim: true,
      },

      taluka: {
        type: String,
        trim: true,
      },
    },

    // 7. Target Crop
    targetCrop: {
      type: [String],
      default: ["All Crops"],
    },

    // 8. Application Start Date *
    applicationStartDate: {
      type: Date,
      required: true,
    },

    // 9. Application Last Date *
    applicationLastDate: {
      type: Date,
      required: true,
    },

    // 10. Official Application Link *
    officialApplicationLink: {
      type: String,
      required: true,
      trim: true,
    },
  },

  {
    timestamps: true,
  }
);


module.exports=mongoose.model("AgricultureScheme",agricultureSchemeSchema)