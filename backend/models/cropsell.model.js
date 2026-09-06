const mongoose = require("mongoose");

const { Schema } = mongoose;

const cropSellSchema = new Schema(
	{
		imageUri: {
			type: String,
			trim: true,
			default: "",
		},

		cropName: {
			type: String,
			required: true,
			trim: true,
		},

		cropVariety: {
			type: String,
			trim: true,
			default: "",
		},

		quantity: {
			type: Number,
			required: true,
			min: 0.01,
		},

		quantityUnit: {
			type: String,
			required: true,
			enum: ["kg", "quintal", "ton"],
		},

		expectedPrice: {
			type: Number,
			required: true,
			min: 0.01,
		},

		readyDate: {
			type: Date,
			required: true,
		},

		farmerName: {
			type: String,
			required: true,
			trim: true,
		},

		mobileNumber: {
			type: String,
			required: true,
			trim: true,
			match: [/^[0-9]{10}$/, "Enter a valid 10-digit mobile number"],
		},

		email: {
			type: String,
			trim: true,
			lowercase: true,
			match: [/^$|^\S+@\S+\.\S+$/, "Enter a valid email address"],
			default: "",
		},

		description: {
			type: String,
			trim: true,
			default: "",
		},

		latitude: {
			type: Number,
			required: true,
			min: -90,
			max: 90,
		},

		longitude: {
			type: Number,
			required: true,
			min: -180,
			max: 180,
		},

		location: {
			type: {
				type: String,
				enum: ["Point"],
				default: "Point",
			},
			coordinates: {
				type: [Number],
				required: true,
			},
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

cropSellSchema.pre("validate", function () {
	if (Number.isFinite(this.longitude) && Number.isFinite(this.latitude)) {
		this.location = {
			type: "Point",
			coordinates: [this.longitude, this.latitude],
		};
	}
});

cropSellSchema.index({ location: "2dsphere" });
cropSellSchema.index({ cropName: "text", cropVariety: "text", description: "text" });

module.exports = mongoose.model("CropSell", cropSellSchema);
