import React, { useEffect, useMemo, useState } from "react";
import {
	ActivityIndicator,
	Linking,
	Pressable,
	RefreshControl,
	ScrollView,
	Text,
	View,
} from "react-native";
import axios from "axios";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Dropdown } from "react-native-element-dropdown";
import { cropData } from "../data/cropData";
import { locationData } from "../data/locationData";

const BACKEND = process.env.EXPO_PUBLIC_BACKEND_API || "";

type AgricultureScheme = {
	_id: string;
	schemeName: string;
	schemeType: string;
	shortDescription: string;
	benefits: string;
	eligibilitySummary: string;
	targetLocation?: {
		level?: string;
		state?: string;
		district?: string;
		taluka?: string;
	};
	targetCrop?: string[];
	applicationStartDate: string;
	applicationLastDate: string;
	officialApplicationLink: string;
};

type DropdownOption = {
	label: string;
	value: string;
};

const schemeTypes = [
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
];

const dropdownStyle = {
	borderWidth: 1,
	borderColor: "#bbf7d0",
	borderRadius: 12,
	paddingHorizontal: 12,
	paddingVertical: 12,
	backgroundColor: "white",
};

const formatDate = (date: string) => {
	const parsedDate = new Date(date);
	if (Number.isNaN(parsedDate.getTime())) return "Date unavailable";
	return parsedDate.toLocaleDateString(undefined, {
		day: "numeric",
		month: "short",
		year: "numeric",
	});
};

const formatLocation = (location?: AgricultureScheme["targetLocation"]) => {
	if (!location) return "All India";
	const values = [location.taluka, location.district, location.state].filter(Boolean);
	return values.length ? values.join(", ") : location.level || "All India";
};

export default function ShowAllSchemas() {
	const [schemas, setSchemas] = useState<AgricultureScheme[]>([]);
	const [cropFilter, setCropFilter] = useState("All Crops");
	const [locationFilter, setLocationFilter] = useState("All Locations");
	const [typeFilter, setTypeFilter] = useState("All Types");
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [error, setError] = useState("");

	const fetchSchemas = async (isRefresh = false) => {
		try {
			setError("");
			if (isRefresh) setRefreshing(true);
			else setLoading(true);

			const response = await axios.get(`${BACKEND}/api/v1/addtional/getallexpert`);
			const data = Array.isArray(response.data)
				? response.data
				: response.data?.data || [];
			setSchemas(data);
		} catch (requestError) {
			console.error("Unable to fetch agriculture schemes", requestError);
			setError("Unable to load schemes. Please try again.");
		} finally {
			setLoading(false);
			setRefreshing(false);
		}
	};

	useEffect(() => {
		fetchSchemas();
	}, []);

	const cropOptions = useMemo<DropdownOption[]>(() => {
		return ["All Crops", ...cropData].map((crop) => ({ label: crop, value: crop }));
	}, []);

	const locationOptions = useMemo<DropdownOption[]>(() => {
		const locations = [
			...locationData.states,
			...Object.entries(locationData.karnataka).flatMap(([district, talukas]) => [
				district,
				...talukas,
			]),
		];
		return [
			"All Locations",
			...Array.from(new Set(locations)).sort((first, second) => first.localeCompare(second)),
		].map((location) => ({ label: location, value: location }));
	}, []);

	const typeOptions = useMemo<DropdownOption[]>(() => {
		return ["All Types", ...schemeTypes].map((type) => ({ label: type, value: type }));
	}, []);

	const filteredSchemas = useMemo(() => {
		return schemas.filter((schema) => {
			const crops = schema.targetCrop || ["All Crops"];
			const location = schema.targetLocation;
			const locationValues = [
				location?.level,
				location?.state,
				location?.district,
				location?.taluka,
			].filter(Boolean).map((value) => value!.toLowerCase());
			const cropMatches =
				cropFilter === "All Crops" ||
				crops.some((crop) => crop.toLowerCase() === "all crops" || crop.toLowerCase() === cropFilter.toLowerCase());
			const locationMatches =
				locationFilter === "All Locations" ||
				locationValues.includes("all india") ||
				locationValues.includes(locationFilter.toLowerCase());
			const typeMatches = typeFilter === "All Types" || schema.schemeType === typeFilter;
			return cropMatches && locationMatches && typeMatches;
		});
	}, [cropFilter, locationFilter, schemas, typeFilter]);

	const resetFilters = () => {
		setCropFilter("All Crops");
		setLocationFilter("All Locations");
		setTypeFilter("All Types");
	};

	if (loading) {
		return (
			<View className="flex-1 items-center justify-center bg-green-50">
				<ActivityIndicator size="large" color="#15803d" />
				<Text className="mt-3 text-gray-600">Loading agriculture schemes...</Text>
			</View>
		);
	}

	return (
		<View className="flex-1 bg-green-50">
			<View className="bg-green-700 px-5 pb-6 pt-5">
				<Text className="text-3xl font-bold text-white">Government Schemes</Text>
				<Text className="mt-1 text-green-100">
					Support and benefits available for farmers
				</Text>
			</View>

			<ScrollView
				className="flex-1"
				contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={() => fetchSchemas(true)}
						tintColor="#15803d"
					/>
				}
				showsVerticalScrollIndicator={false}
			>
				{!error && schemas.length > 0 && (
					<View className="mb-5 rounded-2xl bg-white p-4">
						<View className="mb-3 flex-row items-center justify-between">
							<View className="flex-row items-center">
								<MaterialCommunityIcons name="filter-variant" size={20} color="#166534" />
								<Text className="ml-2 text-lg font-bold text-gray-900">Find a scheme</Text>
							</View>
							{(cropFilter !== "All Crops" || locationFilter !== "All Locations" || typeFilter !== "All Types") && (
								<Pressable onPress={resetFilters}>
									<Text className="font-semibold text-green-700">Reset</Text>
								</Pressable>
							)}
						</View>

						<Text className="mb-1 text-sm font-semibold text-gray-700">Crop</Text>
						<Dropdown
							data={cropOptions}
							labelField="label"
							valueField="value"
							value={cropFilter}
							placeholder="Select crop"
							search
							searchPlaceholder="Search crop"
							maxHeight={220}
							onChange={(item) => setCropFilter(item.value)}
							style={dropdownStyle}
						/>

						<Text className="mb-1 mt-4 text-sm font-semibold text-gray-700">Location</Text>
						<Dropdown
							data={locationOptions}
							labelField="label"
							valueField="value"
							value={locationFilter}
							placeholder="Select location"
							search
							searchPlaceholder="Search state, district or taluka"
							maxHeight={220}
							onChange={(item) => setLocationFilter(item.value)}
							style={dropdownStyle}
						/>

						<Text className="mb-1 mt-4 text-sm font-semibold text-gray-700">Scheme type</Text>
						<Dropdown
							data={typeOptions}
							labelField="label"
							valueField="value"
							value={typeFilter}
							placeholder="Select scheme type"
							search
							searchPlaceholder="Search scheme type"
							maxHeight={220}
							onChange={(item) => setTypeFilter(item.value)}
							style={dropdownStyle}
						/>

						<Text className="mt-3 text-sm text-gray-500">
							Showing {filteredSchemas.length} of {schemas.length} schemes
						</Text>
					</View>
				)}
				{error ? (
					<View className="rounded-2xl bg-red-50 p-5">
						<Text className="font-semibold text-red-700">{error}</Text>
						<Pressable
							className="mt-4 self-start rounded-xl bg-red-700 px-4 py-3"
							onPress={() => fetchSchemas()}
						>
							<Text className="font-semibold text-white">Try again</Text>
						</Pressable>
					</View>
				) : schemas.length === 0 ? (
					<View className="items-center rounded-2xl bg-white p-8">
						<MaterialCommunityIcons name="file-search-outline" size={48} color="#15803d" />
						<Text className="mt-3 text-center text-lg font-semibold text-gray-800">
							No schemes available
						</Text>
						<Text className="mt-1 text-center text-gray-500">
							Check back later for new agriculture schemes.
						</Text>
					</View>
				) : filteredSchemas.length === 0 ? (
					<View className="items-center rounded-2xl bg-white p-8">
						<MaterialCommunityIcons name="filter-remove-outline" size={48} color="#15803d" />
						<Text className="mt-3 text-center text-lg font-semibold text-gray-800">
							No matching schemes
						</Text>
						<Text className="mt-1 text-center text-gray-500">
							Try changing your crop, location, or scheme type filters.
						</Text>
					</View>
				) : (
					filteredSchemas.map((schema) => (
						<View key={schema._id} className="mb-4 rounded-2xl bg-white p-5 shadow-sm">
							<View className="flex-row items-start justify-between">
								<Text className="mr-3 flex-1 text-xl font-bold text-gray-900">
									{schema.schemeName}
								</Text>
								<MaterialCommunityIcons name="sprout" size={25} color="#15803d" />
							</View>

							<View className="mt-3 self-start rounded-full bg-green-100 px-3 py-1">
								<Text className="text-xs font-semibold text-green-800">{schema.schemeType}</Text>
							</View>
							<Text className="mt-4 leading-6 text-gray-700">{schema.shortDescription}</Text>

							<View className="mt-4 border-t border-gray-100 pt-4">
								<Text className="font-semibold text-gray-800">Benefits</Text>
								<Text className="mt-1 leading-6 text-gray-600">{schema.benefits}</Text>
								<Text className="mt-4 font-semibold text-gray-800">Eligibility</Text>
								<Text className="mt-1 leading-6 text-gray-600">{schema.eligibilitySummary}</Text>
							</View>

							<View className="mt-4 rounded-xl bg-gray-50 p-3">
								<Text className="text-sm text-gray-600">
									<Text className="font-semibold text-gray-800">Location: </Text>
									{formatLocation(schema.targetLocation)}
								</Text>
								<Text className="mt-2 text-sm text-gray-600">
									<Text className="font-semibold text-gray-800">Crops: </Text>
									{(schema.targetCrop || ["All Crops"]).join(", ")}
								</Text>
								<Text className="mt-2 text-sm text-gray-600">
									<Text className="font-semibold text-gray-800">Application period: </Text>
									{formatDate(schema.applicationStartDate)} - {formatDate(schema.applicationLastDate)}
								</Text>
							</View>

							<Pressable
								className="mt-4 flex-row items-center justify-center rounded-xl bg-green-700 px-4 py-3"
								onPress={() => Linking.openURL(schema.officialApplicationLink)}
							>
								<MaterialCommunityIcons name="open-in-new" size={18} color="white" />
								<Text className="ml-2 font-semibold text-white">Apply on official website</Text>
							</Pressable>
						</View>
					))
				)}
			</ScrollView>
		</View>
	);
}
