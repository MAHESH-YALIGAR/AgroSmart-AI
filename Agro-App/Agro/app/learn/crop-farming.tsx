import { useState } from "react";
import {
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import { useRouter } from "expo-router";

type Language = "en" | "kn";
type CropKey = "rice" | "wheat" | "maize" | "tomato" | "cotton" | "groundnut";

type Crop = {
  key: CropKey;
  name: string;
  kannada: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  color: string;
  summary: string;
  kannadaSummary: string;
  steps: string[];
  kannadaSteps: string[];
};

const crops: Crop[] = [
  {
    key: "rice",
    name: "Rice",
    kannada: "ಭತ್ತ",
    icon: "barley",
    color: "#E8F5E9",
    summary: "Choose a suitable variety, prepare a level field, manage water carefully, and monitor pests from nursery to harvest.",
    kannadaSummary: "ಸೂಕ್ತ ತಳಿಯನ್ನು ಆಯ್ಕೆ ಮಾಡಿ, ಸಮತಟ್ಟಾದ ಗದ್ದೆ ತಯಾರಿಸಿ, ನೀರನ್ನು ಸರಿಯಾಗಿ ನಿರ್ವಹಿಸಿ ಮತ್ತು ಕೀಟಗಳನ್ನು ಗಮನಿಸಿ.",
    steps: [
      "Select certified seed suited to your season and soil.",
      "Prepare a level field and keep nursery or direct-seeding spacing uniform.",
      "Irrigate as needed; avoid keeping standing water when the crop does not need it.",
      "Inspect weekly for weeds, pests, and disease before choosing any treatment.",
      "Harvest when grains are mature and dry grain properly before storage.",
    ],
    kannadaSteps: [
      "ನಿಮ್ಮ ಹಂಗಾಮು ಮತ್ತು ಮಣ್ಣಿಗೆ ಸೂಕ್ತವಾದ ಪ್ರಮಾಣಿತ ಬೀಜ ಆಯ್ಕೆ ಮಾಡಿ.",
      "ಗದ್ದೆಯನ್ನು ಸಮತಟ್ಟಾಗಿ ಮಾಡಿ, ಸಸಿಮಡಿ ಅಥವಾ ನೇರ ಬಿತ್ತನೆಯಲ್ಲಿ ಸಮ ಅಂತರ ಕಾಪಾಡಿ.",
      "ಅಗತ್ಯಕ್ಕೆ ತಕ್ಕಂತೆ ನೀರು ಕೊಡಿ; ಬೆಳೆ ಕೇಳದಾಗ ನೀರು ನಿಲ್ಲಿಸಬೇಡಿ.",
      "ಕಳೆ, ಕೀಟ ಮತ್ತು ರೋಗಗಳನ್ನು ವಾರಕ್ಕೊಮ್ಮೆ ಗಮನಿಸಿ.",
      "ಕಾಳುಗಳು ಪಕ್ವವಾದಾಗ ಕೊಯ್ಲು ಮಾಡಿ, ಸಂಗ್ರಹಿಸುವ ಮೊದಲು ಧಾನ್ಯವನ್ನು ಚೆನ್ನಾಗಿ ಒಣಗಿಸಿ.",
    ],
  },
  {
    key: "wheat",
    name: "Wheat",
    kannada: "ಗೋಧಿ",
    icon: "grass",
    color: "#FFF7E0",
    summary: "Good seed, timely sowing, balanced nutrition, and irrigation at critical growth stages support a healthy crop.",
    kannadaSummary: "ಉತ್ತಮ ಬೀಜ, ಸರಿಯಾದ ಸಮಯದ ಬಿತ್ತನೆ, ಸಮತೋಲಿತ ಪೋಷಕಾಂಶ ಮತ್ತು ಮುಖ್ಯ ಹಂತಗಳಲ್ಲಿ ನೀರಾವರಿ ಉತ್ತಮ ಬೆಳೆಗೆ ಸಹಾಯ ಮಾಡುತ್ತದೆ.",
    steps: [
      "Test the soil and select a locally recommended variety.",
      "Sow in a fine, well-drained seedbed at the recommended depth.",
      "Give irrigation at critical stages such as crown-root initiation and flowering.",
      "Keep the field weed-free during early growth and inspect for rust symptoms.",
      "Harvest when plants turn golden and grains are hard.",
    ],
    kannadaSteps: [
      "ಮಣ್ಣಿನ ಪರೀಕ್ಷೆ ಮಾಡಿ, ಸ್ಥಳೀಯವಾಗಿ ಶಿಫಾರಸು ಮಾಡಿದ ತಳಿಯನ್ನು ಆರಿಸಿ.",
      "ನುಣ್ಣನೆಯ, ನೀರು ಸರಿಯಾಗಿ ಹರಿಯುವ ಬಿತ್ತನೆ ಹಾಸಿನಲ್ಲಿ ಸೂಕ್ತ ಆಳದಲ್ಲಿ ಬಿತ್ತಿರಿ.",
      "ಕಿರೀಟ ಬೇರು ಬೆಳವಣಿಗೆ ಮತ್ತು ಹೂ ಬಿಡುವ ಹಂತಗಳಲ್ಲಿ ನೀರಾವರಿ ನೀಡಿ.",
      "ಆರಂಭಿಕ ಬೆಳವಣಿಗೆಯಲ್ಲಿ ಕಳೆ ನಿಯಂತ್ರಿಸಿ, ತುಕ್ಕು ರೋಗದ ಲಕ್ಷಣಗಳನ್ನು ಗಮನಿಸಿ.",
      "ಸಸ್ಯಗಳು ಬಂಗಾರದ ಬಣ್ಣಕ್ಕೆ ತಿರುಗಿ ಕಾಳು ಗಟ್ಟಿಯಾದಾಗ ಕೊಯ್ಲು ಮಾಡಿ.",
    ],
  },
  {
    key: "maize",
    name: "Maize",
    kannada: "ಮೆಕ್ಕೆಜೋಳ",
    icon: "corn",
    color: "#FFF3D6",
    summary: "Maize performs best with good drainage, even plant spacing, timely nutrients, and protection from stem borers.",
    kannadaSummary: "ಉತ್ತಮ ನೀರು ಹರಿವು, ಸಮ ಅಂತರ, ಸಮಯಕ್ಕೆ ಸರಿಯಾದ ಪೋಷಕಾಂಶ ಮತ್ತು ಕಾಂಡ ಕೊರೆಯುವ ಕೀಟದ ನಿಯಂತ್ರಣ ಮೆಕ್ಕೆಜೋಳಕ್ಕೆ ಮುಖ್ಯ.",
    steps: [
      "Select quality hybrid or variety recommended for your area.",
      "Plant at uniform spacing in a well-drained field.",
      "Apply nutrients based on a soil test and split nitrogen applications.",
      "Check the whorl for stem borer damage and remove weeds early.",
      "Harvest when husks dry and kernels reach safe moisture for storage.",
    ],
    kannadaSteps: [
      "ನಿಮ್ಮ ಪ್ರದೇಶಕ್ಕೆ ಶಿಫಾರಸು ಮಾಡಿದ ಉತ್ತಮ ಹೈಬ್ರಿಡ್ ಅಥವಾ ತಳಿಯನ್ನು ಆಯ್ಕೆ ಮಾಡಿ.",
      "ನೀರು ಸರಿಯಾಗಿ ಹರಿಯುವ ಗದ್ದೆಯಲ್ಲಿ ಸಮ ಅಂತರದಲ್ಲಿ ಬಿತ್ತಿರಿ.",
      "ಮಣ್ಣಿನ ಪರೀಕ್ಷೆಯ ಆಧಾರದ ಮೇಲೆ ಪೋಷಕಾಂಶ ನೀಡಿ ಮತ್ತು ಸಾರಜನಕವನ್ನು ಹಂತಗಳಲ್ಲಿ ಕೊಡಿ.",
      "ಸುಳಿಯಲ್ಲಿ ಕಾಂಡ ಕೊರೆಯುವ ಕೀಟದ ಹಾನಿ ಪರಿಶೀಲಿಸಿ, ಕಳೆಗಳನ್ನು ಬೇಗ ತೆಗೆಯಿರಿ.",
      "ಹೊದಿಕೆ ಒಣಗಿದಾಗ ಮತ್ತು ಕಾಳು ಸಂಗ್ರಹಕ್ಕೆ ಸೂಕ್ತ ತೇವಾಂಶ ಪಡೆದಾಗ ಕೊಯ್ಲು ಮಾಡಿ.",
    ],
  },
  {
    key: "tomato",
    name: "Tomato",
    kannada: "ಟೊಮೆಟೊ",
    icon: "food-apple",
    color: "#FDECEC",
    summary: "Healthy seedlings, raised beds, staking, steady irrigation, and early disease scouting improve tomato production.",
    kannadaSummary: "ಆರೋಗ್ಯಕರ ಸಸಿಗಳು, ಎತ್ತರದ ಹಾಸು, ಆಧಾರ ಕಡ್ಡಿ, ನಿಯಮಿತ ನೀರಾವರಿ ಮತ್ತು ರೋಗದ ಆರಂಭಿಕ ಪರಿಶೀಲನೆ ಮುಖ್ಯ.",
    steps: [
      "Use healthy seedlings and choose a variety for your climate and market.",
      "Plant in raised, well-drained beds with enough space for airflow.",
      "Use mulch and regular irrigation; keep water off the leaves where possible.",
      "Support plants and remove diseased leaves after cleaning your tools.",
      "Harvest fruits at the maturity stage needed for your market distance.",
    ],
    kannadaSteps: [
      "ಆರೋಗ್ಯಕರ ಸಸಿಗಳನ್ನು ಬಳಸಿ, ನಿಮ್ಮ ಹವಾಮಾನ ಮತ್ತು ಮಾರುಕಟ್ಟೆಗೆ ಸೂಕ್ತ ತಳಿ ಆಯ್ಕೆ ಮಾಡಿ.",
      "ಗಾಳಿ ಸಂಚಾರಕ್ಕೆ ಸಾಕಷ್ಟು ಅಂತರವಿರುವ ಎತ್ತರದ, ನೀರು ಹರಿಯುವ ಹಾಸಿನಲ್ಲಿ ನೆಡಿ.",
      "ಮಲ್ಚ್ ಬಳಸಿ ನಿಯಮಿತವಾಗಿ ನೀರು ಕೊಡಿ; ಸಾಧ್ಯವಾದಷ್ಟು ಎಲೆಗಳ ಮೇಲೆ ನೀರು ಬೀಳದಂತೆ ಮಾಡಿ.",
      "ಸಸ್ಯಗಳಿಗೆ ಆಧಾರ ನೀಡಿ, ಉಪಕರಣಗಳನ್ನು ಸ್ವಚ್ಛಗೊಳಿಸಿದ ನಂತರ ರೋಗಪೀಡಿತ ಎಲೆಗಳನ್ನು ತೆಗೆಯಿರಿ.",
      "ಮಾರುಕಟ್ಟೆಗೆ ಸಾಗಿಸುವ ದೂರಕ್ಕೆ ತಕ್ಕ ಪಕ್ವತೆಯಲ್ಲಿ ಹಣ್ಣು ಕೀಳಿರಿ.",
    ],
  },
  {
    key: "cotton",
    name: "Cotton",
    kannada: "ಹತ್ತಿ",
    icon: "flower",
    color: "#EEF2FF",
    summary: "Use approved seed, protect beneficial insects, scout regularly, and manage water and weeds through the season.",
    kannadaSummary: "ಅನುಮೋದಿತ ಬೀಜ ಬಳಸಿ, ಉಪಕಾರಿ ಕೀಟಗಳನ್ನು ರಕ್ಷಿಸಿ, ನಿಯಮಿತವಾಗಿ ಪರಿಶೀಲಿಸಿ ಮತ್ತು ನೀರು ಹಾಗೂ ಕಳೆ ನಿರ್ವಹಿಸಿ.",
    steps: [
      "Choose approved seed and sow only when soil moisture and temperature are suitable.",
      "Maintain recommended spacing and remove early weeds.",
      "Scout twice a week for sucking pests and bollworm symptoms.",
      "Prefer integrated pest management and follow label directions for any product.",
      "Pick clean, dry kapas in stages and store it away from moisture.",
    ],
    kannadaSteps: [
      "ಅನುಮೋದಿತ ಬೀಜವನ್ನು ಆಯ್ಕೆ ಮಾಡಿ, ಮಣ್ಣಿನ ತೇವಾಂಶ ಮತ್ತು ಉಷ್ಣತೆ ಸೂಕ್ತವಾಗಿದ್ದಾಗ ಬಿತ್ತಿರಿ.",
      "ಶಿಫಾರಸು ಮಾಡಿದ ಅಂತರ ಕಾಪಾಡಿ, ಆರಂಭಿಕ ಕಳೆಗಳನ್ನು ತೆಗೆಯಿರಿ.",
      "ರಸ ಹೀರುವ ಕೀಟ ಮತ್ತು ಕಾಯಿಕೊರೆಯುವ ಕೀಟದ ಲಕ್ಷಣಗಳನ್ನು ವಾರಕ್ಕೆ ಎರಡು ಬಾರಿ ಪರಿಶೀಲಿಸಿ.",
      "ಸಮಗ್ರ ಕೀಟ ನಿರ್ವಹಣೆಗೆ ಆದ್ಯತೆ ನೀಡಿ; ಯಾವುದೇ ಉತ್ಪನ್ನದ ಲೇಬಲ್ ಸೂಚನೆ ಪಾಲಿಸಿ.",
      "ಒಣ ಮತ್ತು ಸ್ವಚ್ಛ ಹತ್ತಿಯನ್ನು ಹಂತ ಹಂತವಾಗಿ ಕಿತ್ತು ತೇವಾಂಶದಿಂದ ದೂರ ಸಂಗ್ರಹಿಸಿ.",
    ],
  },
  {
    key: "groundnut",
    name: "Groundnut",
    kannada: "ಕಡಲೆಕಾಯಿ",
    icon: "seed",
    color: "#F3EDE3",
    summary: "Well-drained soil, quality seed, timely weeding, and careful irrigation during pegging help build good pods.",
    kannadaSummary: "ನೀರು ಹರಿಯುವ ಮಣ್ಣು, ಉತ್ತಮ ಬೀಜ, ಸಮಯಕ್ಕೆ ಕಳೆ ನಿಯಂತ್ರಣ ಮತ್ತು ಕಾಯಿ ಕಟ್ಟುವ ಸಮಯದ ನೀರಾವರಿ ಉತ್ತಮ ಇಳುವರಿ ನೀಡುತ್ತದೆ.",
    steps: [
      "Select treated, quality seed and prepare loose soil for pegging.",
      "Sow at uniform spacing and maintain a weed-free field during early growth.",
      "Irrigate carefully during flowering and pegging; avoid waterlogging.",
      "Watch leaves for disease and follow local agricultural advice before spraying.",
      "Harvest when most pods are mature and dry the pods well before storage.",
    ],
    kannadaSteps: [
      "ಸಂಸ್ಕರಿಸಿದ ಉತ್ತಮ ಬೀಜ ಆಯ್ಕೆ ಮಾಡಿ, ಕಾಯಿ ಕಟ್ಟಲು ಸಡಿಲ ಮಣ್ಣು ತಯಾರಿಸಿ.",
      "ಸಮ ಅಂತರದಲ್ಲಿ ಬಿತ್ತಿರಿ ಮತ್ತು ಆರಂಭಿಕ ಬೆಳವಣಿಗೆಯಲ್ಲಿ ಕಳೆರಹಿತವಾಗಿಡಿ.",
      "ಹೂ ಬಿಡುವ ಮತ್ತು ಕಾಯಿ ಕಟ್ಟುವ ಸಮಯದಲ್ಲಿ ಜಾಗರೂಕತೆಯಿಂದ ನೀರು ಕೊಡಿ; ನೀರು ನಿಲ್ಲದಂತೆ ಮಾಡಿ.",
      "ಎಲೆಗಳಲ್ಲಿ ರೋಗದ ಲಕ್ಷಣಗಳನ್ನು ಗಮನಿಸಿ, ಸಿಂಪಡಿಸುವ ಮೊದಲು ಸ್ಥಳೀಯ ಕೃಷಿ ಸಲಹೆ ಪಡೆಯಿರಿ.",
      "ಹೆಚ್ಚಿನ ಕಾಯಿಗಳು ಪಕ್ವವಾದಾಗ ಕೊಯ್ಲು ಮಾಡಿ, ಸಂಗ್ರಹಿಸುವ ಮೊದಲು ಚೆನ್ನಾಗಿ ಒಣಗಿಸಿ.",
    ],
  },
];

const sources = [
  {
    type: "Article",
    icon: "file-document-outline" as const,
    title: "TNAU Crop Production Guide",
    kannadaTitle: "TNAU ಬೆಳೆ ಉತ್ಪಾದನಾ ಮಾರ್ಗದರ್ಶಿ",
    subtitle: "Official crop production, irrigation, pest and harvest guidance",
    kannadaSubtitle: "ಅಧಿಕೃತ ಬೆಳೆ ಉತ್ಪಾದನೆ, ನೀರಾವರಿ, ಕೀಟ ಮತ್ತು ಕೊಯ್ಲು ಮಾರ್ಗದರ್ಶನ",
    url: "https://agritech.tnau.ac.in/agriculture/agri_index.html",
  },
  {
    type: "Video",
    icon: "play-circle-outline" as const,
    title: "TNAU Agriculture Videos",
    kannadaTitle: "TNAU ಕೃಷಿ ವಿಡಿಯೋಗಳು",
    subtitle: "University-led demonstrations and practical farming videos",
    kannadaSubtitle: "ವಿಶ್ವವಿದ್ಯಾಲಯದ ಪ್ರದರ್ಶನಗಳು ಮತ್ತು ಪ್ರಾಯೋಗಿಕ ಕೃಷಿ ವಿಡಿಯೋಗಳು",
    url: "https://www.youtube.com/@tnautv2557/videos",
  },
  {
    type: "Video",
    icon: "play-circle-outline" as const,
    title: "DD Kisan Farmer Videos",
    kannadaTitle: "DD Kisan ರೈತ ವಿಡಿಯೋಗಳು",
    subtitle: "Government agriculture programmes and farmer education",
    kannadaSubtitle: "ಸರ್ಕಾರಿ ಕೃಷಿ ಕಾರ್ಯಕ್ರಮಗಳು ಮತ್ತು ರೈತ ಶಿಕ್ಷಣ",
    url: "https://www.youtube.com/@DDKisanOfficial/videos",
  },
];

export default function CropFarmingScreen() {
  const router = useRouter();
  const [language, setLanguage] = useState<Language>("en");
  const [selectedCrop, setSelectedCrop] = useState<CropKey>("rice");
  const crop = crops.find((item) => item.key === selectedCrop) ?? crops[0];
  const isKannada = language === "kn";

  const openSource = async (url: string) => {
    await WebBrowser.openBrowserAsync(url, {
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
      controlsColor: "#166534",
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F7FAF7]">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="bg-green-800 px-5 pb-6 pt-3">
          <View className="flex-row items-center justify-between">
            <Pressable
              accessibilityLabel="Go back"
              onPress={() => router.back()}
              className="h-11 w-11 items-center justify-center rounded-full bg-green-700"
            >
              <MaterialCommunityIcons name="arrow-left" size={23} color="white" />
            </Pressable>
            <View className="flex-1 px-4">
              <Text className="text-xs font-semibold uppercase tracking-widest text-green-200">
                {isKannada ? "ಕೃಷಿ ಕಲಿಕೆ" : "FARM LEARNING"}
              </Text>
              <Text className="mt-1 text-2xl font-bold text-white">
                {isKannada ? "ಬೆಳೆ ಕೃಷಿ" : "Crop Farming"}
              </Text>
            </View>
            <View className="h-11 w-11 items-center justify-center rounded-full bg-green-700">
              <MaterialCommunityIcons name="sprout" size={24} color="#BBF7D0" />
            </View>
          </View>
          <Text className="mt-5 text-sm leading-5 text-green-100">
            {isKannada
              ? "ನಿಮ್ಮ ಬೆಳೆಯನ್ನು ಆಯ್ಕೆ ಮಾಡಿ, ಹಂತಗಳನ್ನು ಓದಿ ಮತ್ತು ವಿಶ್ವಾಸಾರ್ಹ ಮೂಲಗಳಿಂದ ಇನ್ನಷ್ಟು ಕಲಿಯಿರಿ."
              : "Choose a crop, follow the practical steps, and learn more from trusted sources."}
          </Text>
        </View>

        <View className="px-5 pt-5">
          <View className="flex-row items-center justify-between">
            <Text className="text-base font-bold text-gray-800">
              {isKannada ? "ಭಾಷೆ ಆಯ್ಕೆ ಮಾಡಿ" : "Choose language"}
            </Text>
            <View className="flex-row rounded-xl bg-gray-200 p-1">
              <Pressable
                onPress={() => setLanguage("en")}
                className={`rounded-lg px-4 py-2 ${!isKannada ? "bg-white" : ""}`}
              >
                <Text className={`text-sm font-bold ${!isKannada ? "text-green-800" : "text-gray-500"}`}>English</Text>
              </Pressable>
              <Pressable
                onPress={() => setLanguage("kn")}
                className={`rounded-lg px-4 py-2 ${isKannada ? "bg-white" : ""}`}
              >
                <Text className={`text-sm font-bold ${isKannada ? "text-green-800" : "text-gray-500"}`}>ಕನ್ನಡ</Text>
              </Pressable>
            </View>
          </View>

          <Text className="mt-7 text-xl font-bold text-gray-900">
            {isKannada ? "ಬೆಳೆ ಆಯ್ಕೆ ಮಾಡಿ" : "Select a crop"}
          </Text>
          <Text className="mt-1 text-sm text-gray-500">
            {isKannada ? "ನಿಮ್ಮ ಬೆಳೆಗೆ ಸರಳ ಮಾರ್ಗದರ್ಶನ" : "Simple guidance for your field"}
          </Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-4 -mr-5">
            {crops.map((item) => {
              const active = item.key === selectedCrop;
              return (
                <Pressable
                  key={item.key}
                  onPress={() => setSelectedCrop(item.key)}
                  className={`mr-3 min-w-[112px] rounded-2xl border p-3 ${active ? "border-green-700 bg-green-700" : "border-transparent"}`}
                  style={!active ? { backgroundColor: item.color } : undefined}
                >
                  <MaterialCommunityIcons name={item.icon} size={26} color={active ? "white" : "#166534"} />
                  <Text className={`mt-2 text-sm font-bold ${active ? "text-white" : "text-gray-800"}`}>
                    {isKannada ? item.kannada : item.name}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <View className="mt-6 rounded-3xl bg-white p-5 shadow-sm">
            <View className="flex-row items-center">
              <View className="h-14 w-14 items-center justify-center rounded-2xl bg-green-100">
                <MaterialCommunityIcons name={crop.icon} size={31} color="#166534" />
              </View>
              <View className="ml-4 flex-1">
                <Text className="text-2xl font-bold text-gray-900">
                  {isKannada ? crop.kannada : crop.name}
                </Text>
                <Text className="mt-1 text-xs font-semibold uppercase tracking-wide text-green-700">
                  {isKannada ? "ಬೆಳೆ ಮಾರ್ಗದರ್ಶಿ" : "Crop guide"}
                </Text>
              </View>
            </View>
            <Text className="mt-5 text-sm leading-6 text-gray-600">
              {isKannada ? crop.kannadaSummary : crop.summary}
            </Text>

            <Text className="mt-6 text-lg font-bold text-gray-900">
              {isKannada ? "ಹಂತ ಹಂತದ ವಿಧಾನ" : "Step-by-step method"}
            </Text>
            <View className="mt-3">
              {(isKannada ? crop.kannadaSteps : crop.steps).map((step, index) => (
                <View key={step} className="mb-4 flex-row">
                  <View className="mr-3 h-7 w-7 items-center justify-center rounded-full bg-green-100">
                    <Text className="text-sm font-bold text-green-800">{index + 1}</Text>
                  </View>
                  <Text className="flex-1 text-sm leading-5 text-gray-700">{step}</Text>
                </View>
              ))}
            </View>
          </View>

          <View className="mt-7 flex-row items-center justify-between">
            <View>
              <Text className="text-xl font-bold text-gray-900">
                {isKannada ? "ಇನ್ನಷ್ಟು ಕಲಿಯಿರಿ" : "Learn more"}
              </Text>
              <Text className="mt-1 text-sm text-gray-500">
                {isKannada ? "ವಿಶ್ವಾಸಾರ್ಹ ಲೇಖನಗಳು ಮತ್ತು ವಿಡಿಯೋಗಳು" : "Trusted articles and videos"}
              </Text>
            </View>
            <MaterialCommunityIcons name="open-in-new" size={21} color="#166534" />
          </View>

          {sources.map((source) => (
            <Pressable
              key={source.title}
              onPress={() => openSource(source.url)}
              className="mt-3 flex-row items-center rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
            >
              <View className="h-11 w-11 items-center justify-center rounded-xl bg-green-100">
                <MaterialCommunityIcons name={source.icon} size={23} color="#166534" />
              </View>
              <View className="ml-3 flex-1">
                <View className="flex-row items-center">
                  <Text className="mr-2 text-xs font-bold uppercase tracking-wide text-green-700">
                    {isKannada ? (source.type === "Article" ? "ಲೇಖನ" : "ವಿಡಿಯೋ") : source.type}
                  </Text>
                  <MaterialCommunityIcons name="shield-check-outline" size={14} color="#16A34A" />
                </View>
                <Text className="mt-1 text-base font-bold text-gray-800">{isKannada ? source.kannadaTitle : source.title}</Text>
                <Text className="mt-1 text-xs leading-4 text-gray-500">{isKannada ? source.kannadaSubtitle : source.subtitle}</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={22} color="#9CA3AF" />
            </Pressable>
          ))}

          <View className="mt-5 flex-row rounded-2xl bg-amber-50 p-4">
            <MaterialCommunityIcons name="information-outline" size={20} color="#A16207" />
            <Text className="ml-3 flex-1 text-xs leading-5 text-amber-900">
              {isKannada
                ? "ಸಿಂಪಡಣೆ ಅಥವಾ ಔಷಧಿ ಬಳಸುವ ಮೊದಲು ಸ್ಥಳೀಯ ಕೃಷಿ ಅಧಿಕಾರಿ ಅಥವಾ KVK ಸಲಹೆ ಪಡೆಯಿರಿ."
                : "Before using any spray or medicine, confirm the advice with your local agriculture officer or KVK."}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
