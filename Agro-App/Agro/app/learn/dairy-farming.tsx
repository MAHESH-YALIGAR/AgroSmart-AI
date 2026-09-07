import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import { useRouter } from "expo-router";

type Language = "en" | "kn";
type DairyKey = "gir" | "jersey" | "hf" | "murrah" | "sahiwal";

type DairyOption = {
  key: DairyKey;
  name: string;
  kannada: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  color: string;
  summary: string;
  kannadaSummary: string;
  cost: string;
  kannadaCost: string;
  profit: string;
  kannadaProfit: string;
  steps: string[];
  kannadaSteps: string[];
};

const dairyOptions: DairyOption[] = [
  {
    key: "gir",
    name: "Gir Cow",
    kannada: "ಗಿರ್ ಹಸು",
    icon: "cow",
    color: "#FFF1E6",
    summary: "A hardy indigenous breed that can suit hot conditions when selected from a healthy, recorded line.",
    kannadaSummary: "ಆರೋಗ್ಯಕರ ದಾಖಲೆ ಇರುವ ಸಾಲಿನಿಂದ ಆಯ್ಕೆ ಮಾಡಿದರೆ ಬಿಸಿಲಿನ ಪ್ರದೇಶಗಳಿಗೆ ಹೊಂದಿಕೊಳ್ಳುವ ಗಟ್ಟಿಯಾದ ದೇಶಿ ತಳಿ.",
    cost: "Indicative monthly cost: ₹4,500–₹7,000 per cow",
    kannadaCost: "ಅಂದಾಜು ಮಾಸಿಕ ವೆಚ್ಚ: ಒಂದು ಹಸುವಿಗೆ ₹4,500–₹7,000",
    profit: "Indicative net: ₹2,000–₹5,000 per cow/month after feed and routine care",
    kannadaProfit: "ಅಂದಾಜು ನಿವ್ವಳ ಲಾಭ: ಆಹಾರ ಮತ್ತು ಸಾಮಾನ್ಯ ಆರೈಕೆ ನಂತರ ತಿಂಗಳಿಗೆ ಒಂದು ಹಸುವಿಗೆ ₹2,000–₹5,000",
    steps: [
      "Buy from a trusted farm and check health, vaccination, udder, and previous milk records.",
      "Give clean water, green fodder, dry fodder, and concentrate according to milk yield.",
      "Keep the shed dry, shaded, well ventilated, and easy to clean.",
      "Follow a fixed milking routine and keep utensils clean to protect milk quality.",
      "Record feed, milk, medicine, and sale price before calculating profit.",
    ],
    kannadaSteps: [
      "ವಿಶ್ವಾಸಾರ್ಹ ಫಾರ್ಮ್‌ನಿಂದ ಖರೀದಿಸಿ; ಆರೋಗ್ಯ, ಲಸಿಕೆ, ಕೆಚ್ಚಲು ಮತ್ತು ಹಾಲಿನ ದಾಖಲೆ ಪರಿಶೀಲಿಸಿ.",
      "ಹಾಲಿನ ಪ್ರಮಾಣಕ್ಕೆ ತಕ್ಕಂತೆ ಸ್ವಚ್ಛ ನೀರು, ಹಸಿರು ಮೇವು, ಒಣ ಮೇವು ಮತ್ತು ಸಾಂದ್ರ ಆಹಾರ ನೀಡಿ.",
      "ಕೊಟ್ಟಿಗೆ ಒಣ, ನೆರಳು, ಗಾಳಿ ಸಂಚಾರ ಇರುವ ಮತ್ತು ಸ್ವಚ್ಛಗೊಳಿಸಲು ಸುಲಭವಾಗಿರಲಿ.",
      "ನಿಗದಿತ ಸಮಯದಲ್ಲಿ ಹಾಲು ಹಿಂಡಿ ಮತ್ತು ಪಾತ್ರೆಗಳನ್ನು ಸ್ವಚ್ಛವಾಗಿಡಿ.",
      "ಲಾಭ ಲೆಕ್ಕಿಸಲು ಆಹಾರ, ಹಾಲು, ಔಷಧಿ ಮತ್ತು ಮಾರಾಟದ ಬೆಲೆ ದಾಖಲಿಸಿ.",
    ],
  },
  {
    key: "jersey",
    name: "Jersey Cross",
    kannada: "ಜರ್ಸಿ ಕ್ರಾಸ್",
    icon: "cow",
    color: "#EAF4FF",
    summary: "A common crossbred option with good milk potential, but it needs shade, cooling, and reliable nutrition.",
    kannadaSummary: "ಉತ್ತಮ ಹಾಲಿನ ಸಾಮರ್ಥ್ಯ ಇರುವ ಸಾಮಾನ್ಯ ಕ್ರಾಸ್‌ಬ್ರೀಡ್; ನೆರಳು, ತಂಪು ಮತ್ತು ನಿಯಮಿತ ಪೋಷಣೆಯ ಅಗತ್ಯವಿದೆ.",
    cost: "Indicative monthly cost: ₹6,000–₹9,500 per cow",
    kannadaCost: "ಅಂದಾಜು ಮಾಸಿಕ ವೆಚ್ಚ: ಒಂದು ಹಸುವಿಗೆ ₹6,000–₹9,500",
    profit: "Indicative net: ₹3,000–₹8,000 per cow/month when milk price and feed are favourable",
    kannadaProfit: "ಅಂದಾಜು ನಿವ್ವಳ ಲಾಭ: ಹಾಲಿನ ಬೆಲೆ ಮತ್ತು ಆಹಾರ ವೆಚ್ಚ ಅನುಕೂಲಕರವಾಗಿದ್ದರೆ ತಿಂಗಳಿಗೆ ₹3,000–₹8,000",
    steps: [
      "Choose an animal adapted to your local climate instead of buying only by appearance.",
      "Provide shade, fans or sprinklers in hot weather and always keep water available.",
      "Balance ration with fodder, protein source, minerals, and salt as advised locally.",
      "Watch for mastitis, heat stress, lameness, and reduced appetite every day.",
      "Sell milk through a reliable buyer and review the margin every week.",
    ],
    kannadaSteps: [
      "ರೂಪವನ್ನು ಮಾತ್ರ ನೋಡಿ ಖರೀದಿಸದೆ ಸ್ಥಳೀಯ ಹವಾಮಾನಕ್ಕೆ ಹೊಂದಿಕೊಂಡ ಪ್ರಾಣಿಯನ್ನು ಆರಿಸಿ.",
      "ಬಿಸಿಲಿನಲ್ಲಿ ನೆರಳು, ಫ್ಯಾನ್ ಅಥವಾ ನೀರಿನ ಸಿಂಪಡಣೆ ನೀಡಿ ಮತ್ತು ಸದಾ ನೀರು ಇರಲಿ.",
      "ಸ್ಥಳೀಯ ಸಲಹೆಯಂತೆ ಮೇವು, ಪ್ರೋಟೀನ್, ಖನಿಜ ಮತ್ತು ಉಪ್ಪಿನ ಸಮತೋಲನ ಆಹಾರ ನೀಡಿ.",
      "ಪ್ರತಿದಿನ ಸ್ತನದ ಉರಿಯೂತ, ಬಿಸಿಗಾಳಿ ಒತ್ತಡ, ಕುಂಟುತನ ಮತ್ತು ಹಸಿವು ಕಡಿಮೆಯಾಗುವುದನ್ನು ಗಮನಿಸಿ.",
      "ವಿಶ್ವಾಸಾರ್ಹ ಖರೀದಿದಾರರಿಗೆ ಹಾಲು ಮಾರಾಟ ಮಾಡಿ, ವಾರಕ್ಕೊಮ್ಮೆ ಲಾಭ ಪರಿಶೀಲಿಸಿ.",
    ],
  },
  {
    key: "hf",
    name: "HF Cross",
    kannada: "ಎಚ್‌ಎಫ್ ಕ್ರಾಸ್",
    icon: "cow",
    color: "#F2EDFF",
    summary: "A higher-yield crossbred option for farms that can provide strong feeding, cooling, housing, and veterinary support.",
    kannadaSummary: "ಹೆಚ್ಚು ಹಾಲು ನೀಡುವ ಕ್ರಾಸ್‌ಬ್ರೀಡ್; ಉತ್ತಮ ಆಹಾರ, ತಂಪು, ಕೊಟ್ಟಿಗೆ ಮತ್ತು ಪಶುವೈದ್ಯ ಸಹಾಯ ಬೇಕಾಗುತ್ತದೆ.",
    cost: "Indicative monthly cost: ₹8,000–₹13,000 per cow",
    kannadaCost: "ಅಂದಾಜು ಮಾಸಿಕ ವೆಚ್ಚ: ಒಂದು ಹಸುವಿಗೆ ₹8,000–₹13,000",
    profit: "Indicative net: ₹4,000–₹10,000 per cow/month; losses rise quickly if feed or cooling fails",
    kannadaProfit: "ಅಂದಾಜು ನಿವ್ವಳ ಲಾಭ: ತಿಂಗಳಿಗೆ ₹4,000–₹10,000; ಆಹಾರ ಅಥವಾ ತಂಪು ಸರಿಯಾಗದಿದ್ದರೆ ನಷ್ಟ ಬೇಗ ಹೆಚ್ಚಾಗಬಹುದು",
    steps: [
      "Confirm feed and water capacity before purchasing a high-yield animal.",
      "Use a ventilated shed with shade, drainage, and a comfortable resting area.",
      "Increase feed gradually after calving and take a veterinarian's ration advice.",
      "Track body condition, milk yield, heat signs, and breeding dates.",
      "Keep an emergency fund for veterinary treatment and dry-period expenses.",
    ],
    kannadaSteps: [
      "ಹೆಚ್ಚು ಹಾಲು ನೀಡುವ ಪ್ರಾಣಿಯನ್ನು ಖರೀದಿಸುವ ಮೊದಲು ಆಹಾರ ಮತ್ತು ನೀರಿನ ಸಾಮರ್ಥ್ಯ ಪರಿಶೀಲಿಸಿ.",
      "ನೆರಳು, ನೀರು ಹರಿವು ಮತ್ತು ಆರಾಮದಾಯಕ ವಿಶ್ರಾಂತಿ ಇರುವ ಗಾಳಿ ಸಂಚಾರದ ಕೊಟ್ಟಿಗೆ ಬಳಸಿ.",
      "ಕರು ಹಾಕಿದ ನಂತರ ಆಹಾರವನ್ನು ನಿಧಾನವಾಗಿ ಹೆಚ್ಚಿಸಿ, ಪಶುವೈದ್ಯರ ಆಹಾರ ಸಲಹೆ ಪಡೆಯಿರಿ.",
      "ದೇಹದ ಸ್ಥಿತಿ, ಹಾಲಿನ ಪ್ರಮಾಣ, ಹೀಟ್ ಲಕ್ಷಣ ಮತ್ತು ಸಂತಾನೋತ್ಪತ್ತಿ ದಿನಾಂಕ ದಾಖಲಿಸಿ.",
      "ಪಶುವೈದ್ಯ ಚಿಕಿತ್ಸೆ ಮತ್ತು ಒಣ ಅವಧಿಯ ಖರ್ಚಿಗೆ ತುರ್ತು ನಿಧಿ ಇರಲಿ.",
    ],
  },
  {
    key: "murrah",
    name: "Murrah Buffalo",
    kannada: "ಮುರ್ರಾ ಎಮ್ಮೆ",
    icon: "cow",
    color: "#E8F6F3",
    summary: "A popular buffalo option with high-fat milk; it needs good fodder, clean water, and heat management.",
    kannadaSummary: "ಹೆಚ್ಚು ಕೊಬ್ಬಿನ ಹಾಲಿಗೆ ಪ್ರಸಿದ್ಧ ಎಮ್ಮೆ ತಳಿ; ಉತ್ತಮ ಮೇವು, ಸ್ವಚ್ಛ ನೀರು ಮತ್ತು ಬಿಸಿಲಿನ ನಿರ್ವಹಣೆ ಅಗತ್ಯ.",
    cost: "Indicative monthly cost: ₹7,000–₹11,000 per buffalo",
    kannadaCost: "ಅಂದಾಜು ಮಾಸಿಕ ವೆಚ್ಚ: ಒಂದು ಎಮ್ಮೆಗೆ ₹7,000–₹11,000",
    profit: "Indicative net: ₹3,500–₹9,000 per buffalo/month, depending on fat-based milk pricing",
    kannadaProfit: "ಅಂದಾಜು ನಿವ್ವಳ ಲಾಭ: ಕೊಬ್ಬಿನ ಆಧಾರದ ಹಾಲಿನ ಬೆಲೆಗೆ ಅನುಗುಣವಾಗಿ ತಿಂಗಳಿಗೆ ₹3,500–₹9,000",
    steps: [
      "Check breed characteristics, pregnancy history, teeth, udder, and milk fat record.",
      "Provide clean drinking water and bathing or cooling access in hot weather.",
      "Use good-quality green fodder and mineral mixture to support production.",
      "Keep a clean milking area and test milk quality before choosing a buyer.",
      "Plan dry-period feed and healthcare costs before the animal stops milking.",
    ],
    kannadaSteps: [
      "ತಳಿಯ ಲಕ್ಷಣ, ಗರ್ಭಧಾರಣೆಯ ಇತಿಹಾಸ, ಹಲ್ಲು, ಕೆಚ್ಚಲು ಮತ್ತು ಹಾಲಿನ ಕೊಬ್ಬಿನ ದಾಖಲೆ ಪರಿಶೀಲಿಸಿ.",
      "ಸ್ವಚ್ಛ ಕುಡಿಯುವ ನೀರು ನೀಡಿ, ಬಿಸಿಲಿನಲ್ಲಿ ಸ್ನಾನ ಅಥವಾ ತಂಪಾಗುವ ವ್ಯವಸ್ಥೆ ಇರಲಿ.",
      "ಉತ್ಪಾದನೆಗೆ ಉತ್ತಮ ಹಸಿರು ಮೇವು ಮತ್ತು ಖನಿಜ ಮಿಶ್ರಣ ಬಳಸಿ.",
      "ಸ್ವಚ್ಛ ಹಾಲು ಹೀರುವ ಸ್ಥಳ ಇರಲಿ ಮತ್ತು ಖರೀದಿದಾರರನ್ನು ಆಯ್ಕೆ ಮಾಡುವ ಮೊದಲು ಹಾಲಿನ ಗುಣಮಟ್ಟ ಪರೀಕ್ಷಿಸಿ.",
      "ಹಾಲು ನಿಲ್ಲಿಸುವ ಅವಧಿಯ ಮೇವು ಮತ್ತು ಆರೋಗ್ಯ ವೆಚ್ಚವನ್ನು ಮುಂಚಿತವಾಗಿ ಯೋಜಿಸಿ.",
    ],
  },
  {
    key: "sahiwal",
    name: "Sahiwal Cow",
    kannada: "ಸಾಹಿವಾಲ್ ಹಸು",
    icon: "cow",
    color: "#FFF7E6",
    summary: "A heat-tolerant indigenous dairy breed that can be suitable for farmers seeking lower climate stress.",
    kannadaSummary: "ಬಿಸಿಲನ್ನು ಸಹಿಸುವ ದೇಶಿ ಹಾಲು ತಳಿ; ಹವಾಮಾನ ಒತ್ತಡ ಕಡಿಮೆ ಬಯಸುವ ರೈತರಿಗೆ ಸೂಕ್ತವಾಗಬಹುದು.",
    cost: "Indicative monthly cost: ₹4,500–₹7,500 per cow",
    kannadaCost: "ಅಂದಾಜು ಮಾಸಿಕ ವೆಚ್ಚ: ಒಂದು ಹಸುವಿಗೆ ₹4,500–₹7,500",
    profit: "Indicative net: ₹2,000–₹6,000 per cow/month after normal costs",
    kannadaProfit: "ಅಂದಾಜು ನಿವ್ವಳ ಲಾಭ: ಸಾಮಾನ್ಯ ವೆಚ್ಚಗಳ ನಂತರ ತಿಂಗಳಿಗೆ ₹2,000–₹6,000",
    steps: [
      "Buy only with reliable identity, vaccination, and milk records.",
      "Maintain a regular fodder schedule and provide minerals during production.",
      "Keep calves clean, warm, and fed with colostrum promptly after birth.",
      "Call a veterinarian early for fever, diarrhoea, mastitis, or difficult calving.",
      "Compare income per litre with feed cost before expanding the herd.",
    ],
    kannadaSteps: [
      "ವಿಶ್ವಾಸಾರ್ಹ ಗುರುತು, ಲಸಿಕೆ ಮತ್ತು ಹಾಲಿನ ದಾಖಲೆ ಇರುವ ಪ್ರಾಣಿಯನ್ನು ಮಾತ್ರ ಖರೀದಿಸಿ.",
      "ನಿಯಮಿತ ಮೇವು ವೇಳಾಪಟ್ಟಿ ಕಾಪಾಡಿ, ಹಾಲು ಕೊಡುವ ಅವಧಿಯಲ್ಲಿ ಖನಿಜ ನೀಡಿ.",
      "ಕರುಗಳನ್ನು ಸ್ವಚ್ಛವಾಗಿ, ಬೆಚ್ಚಗೆ ಇಟ್ಟು, ಹುಟ್ಟಿದ ತಕ್ಷಣ ಕೊಲೊಸ್ಟ್ರಮ್ ನೀಡಿ.",
      "ಜ್ವರ, ಅತಿಸಾರ, ಸ್ತನದ ಉರಿಯೂತ ಅಥವಾ ಕಷ್ಟದ ಹೆರಿಗೆ ಕಂಡರೆ ಬೇಗ ಪಶುವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಿ.",
      "ಹಿಂಡನ್ನು ಹೆಚ್ಚಿಸುವ ಮೊದಲು ಪ್ರತಿ ಲೀಟರ್ ಆದಾಯವನ್ನು ಆಹಾರ ವೆಚ್ಚದೊಂದಿಗೆ ಹೋಲಿಸಿ.",
    ],
  },
];

const baseSources = [
  {
    type: "Article",
    icon: "file-document-outline" as const,
    title: "Department of Animal Husbandry",
    kannadaTitle: "ಪಶುಸಂಗೋಪನಾ ಇಲಾಖೆ",
    subtitle: "Government livestock schemes, services, and advisories",
    kannadaSubtitle: "ಸರ್ಕಾರಿ ಪಶುಸಂಗೋಪನಾ ಯೋಜನೆಗಳು, ಸೇವೆಗಳು ಮತ್ತು ಸಲಹೆಗಳು",
    url: "https://dahd.gov.in/",
  },
  {
    type: "Article",
    icon: "school-outline" as const,
    title: "ICAR Dairy Research",
    kannadaTitle: "ICAR ಹೈನುಗಾರಿಕೆ ಸಂಶೋಧನೆ",
    subtitle: "Research-based livestock and dairy information",
    kannadaSubtitle: "ಸಂಶೋಧನೆ ಆಧಾರಿತ ಪಶು ಮತ್ತು ಹೈನುಗಾರಿಕೆ ಮಾಹಿತಿ",
    url: "https://icar.gov.in/",
  },
];

export default function DairyFarmingScreen() {
  const router = useRouter();
  const [language, setLanguage] = useState<Language>("en");
  const [selected, setSelected] = useState<DairyKey>("gir");
  const option = dairyOptions.find((item) => item.key === selected) ?? dairyOptions[0];
  const isKannada = language === "kn";
  const videoUrl = isKannada
    ? "https://www.youtube.com/results?search_query=Kannada+dairy+farming+Karnataka"
    : "https://www.youtube.com/results?search_query=scientific+dairy+farming+India";

  const openSource = async (url: string) => {
    await WebBrowser.openBrowserAsync(url, {
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
      controlsColor: "#1D4ED8",
    });
  };

  const sources = [
    ...baseSources,
    {
      type: "Video",
      icon: "play-circle-outline" as const,
      title: isKannada ? "ಕನ್ನಡ ಹೈನುಗಾರಿಕೆ ವಿಡಿಯೋಗಳು" : "Dairy farming videos",
      kannadaTitle: "ಕನ್ನಡ ಹೈನುಗಾರಿಕೆ ವಿಡಿಯೋಗಳು",
      subtitle: isKannada ? "ಕರ್ನಾಟಕ ರೈತರಿಗೆ ಕನ್ನಡದಲ್ಲಿ ವಿಡಿಯೋ ಹುಡುಕಾಟ" : "Practical dairy video search for farmers",
      kannadaSubtitle: "ಕರ್ನಾಟಕ ರೈತರಿಗೆ ಕನ್ನಡದಲ್ಲಿ ವಿಡಿಯೋ ಹುಡುಕಾಟ",
      url: videoUrl,
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="bg-blue-900 px-5 pb-6 pt-3">
          <View className="flex-row items-center justify-between">
            <Pressable accessibilityLabel="Go back" onPress={() => router.back()} className="h-11 w-11 items-center justify-center rounded-full bg-blue-800">
              <MaterialCommunityIcons name="arrow-left" size={23} color="white" />
            </Pressable>
            <View className="flex-1 px-4">
              <Text className="text-xs font-semibold uppercase tracking-widest text-blue-200">{isKannada ? "ಪಶುಸಂಗೋಪನೆ" : "LIVESTOCK"}</Text>
              <Text className="mt-1 text-2xl font-bold text-white">{isKannada ? "ಹೈನುಗಾರಿಕೆ" : "Dairy Farming"}</Text>
            </View>
            <View className="h-11 w-11 items-center justify-center rounded-full bg-blue-800"><MaterialCommunityIcons name="cow" size={25} color="#BFDBFE" /></View>
          </View>
          <Text className="mt-5 text-sm leading-5 text-blue-100">
            {isKannada ? "ತಳಿಯನ್ನು ಆರಿಸಿ, ಆಹಾರ ಮತ್ತು ಆರೋಗ್ಯ ನಿರ್ವಹಿಸಿ, ನಂತರ ನಿಜವಾದ ವೆಚ್ಚ ಮತ್ತು ಆದಾಯ ದಾಖಲಿಸಿ." : "Choose carefully, manage feed and health, then track real costs and income."}
          </Text>
        </View>

        <View className="px-5 pt-5">
          <View className="flex-row items-center justify-between">
            <Text className="text-base font-bold text-gray-800">{isKannada ? "ಭಾಷೆ ಆಯ್ಕೆ ಮಾಡಿ" : "Choose language"}</Text>
            <View className="flex-row rounded-xl bg-gray-200 p-1">
              <Pressable onPress={() => setLanguage("en")} className={`rounded-lg px-4 py-2 ${!isKannada ? "bg-white" : ""}`}><Text className={`text-sm font-bold ${!isKannada ? "text-blue-800" : "text-gray-500"}`}>English</Text></Pressable>
              <Pressable onPress={() => setLanguage("kn")} className={`rounded-lg px-4 py-2 ${isKannada ? "bg-white" : ""}`}><Text className={`text-sm font-bold ${isKannada ? "text-blue-800" : "text-gray-500"}`}>ಕನ್ನಡ</Text></Pressable>
            </View>
          </View>

          <Text className="mt-7 text-xl font-bold text-gray-900">{isKannada ? "ತಳಿ ಆಯ್ಕೆ ಮಾಡಿ" : "Select a breed"}</Text>
          <Text className="mt-1 text-sm text-gray-500">{isKannada ? "ನಿಮ್ಮ ಮೇವು, ಹವಾಮಾನ ಮತ್ತು ಮಾರುಕಟ್ಟೆಗೆ ತಕ್ಕಂತೆ" : "Match the breed to your feed, climate, and market"}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-4 -mr-5">
            {dairyOptions.map((item) => {
              const active = item.key === selected;
              return <Pressable key={item.key} onPress={() => setSelected(item.key)} className={`mr-3 min-w-[118px] rounded-2xl border p-3 ${active ? "border-blue-800 bg-blue-800" : "border-transparent"}`} style={!active ? { backgroundColor: item.color } : undefined}>
                <MaterialCommunityIcons name={item.icon} size={26} color={active ? "white" : "#1E40AF"} />
                <Text className={`mt-2 text-sm font-bold ${active ? "text-white" : "text-gray-800"}`}>{isKannada ? item.kannada : item.name}</Text>
              </Pressable>;
            })}
          </ScrollView>

          <View className="mt-6 rounded-3xl bg-white p-5 shadow-sm">
            <View className="flex-row items-center"><View className="h-14 w-14 items-center justify-center rounded-2xl bg-blue-100"><MaterialCommunityIcons name={option.icon} size={31} color="#1D4ED8" /></View><View className="ml-4 flex-1"><Text className="text-2xl font-bold text-gray-900">{isKannada ? option.kannada : option.name}</Text><Text className="mt-1 text-xs font-semibold uppercase tracking-wide text-blue-700">{isKannada ? "ತಳಿ ಮಾರ್ಗದರ್ಶಿ" : "Breed guide"}</Text></View></View>
            <Text className="mt-5 text-sm leading-6 text-gray-600">{isKannada ? option.kannadaSummary : option.summary}</Text>
            <View className="mt-5 flex-row"><View className="mr-3 flex-1 rounded-2xl bg-orange-50 p-3"><MaterialCommunityIcons name="cash-minus" size={21} color="#C2410C" /><Text className="mt-2 text-xs font-bold uppercase text-orange-700">{isKannada ? "ವೆಚ್ಚ" : "Cost"}</Text><Text className="mt-1 text-xs leading-4 text-orange-950">{isKannada ? option.kannadaCost : option.cost}</Text></View><View className="ml-1 flex-1 rounded-2xl bg-emerald-50 p-3"><MaterialCommunityIcons name="chart-line" size={21} color="#047857" /><Text className="mt-2 text-xs font-bold uppercase text-emerald-700">{isKannada ? "ಲಾಭ" : "Profit"}</Text><Text className="mt-1 text-xs leading-4 text-emerald-950">{isKannada ? option.kannadaProfit : option.profit}</Text></View></View>
            <Text className="mt-6 text-lg font-bold text-gray-900">{isKannada ? "ದಿನನಿತ್ಯದ ನಿರ್ವಹಣೆ" : "Daily management"}</Text>
            <View className="mt-3">{(isKannada ? option.kannadaSteps : option.steps).map((step, index) => <View key={step} className="mb-4 flex-row"><View className="mr-3 h-7 w-7 items-center justify-center rounded-full bg-blue-100"><Text className="text-sm font-bold text-blue-800">{index + 1}</Text></View><Text className="flex-1 text-sm leading-5 text-gray-700">{step}</Text></View>)}</View>
          </View>

          <Text className="mt-7 text-xl font-bold text-gray-900">{isKannada ? "ವಿಶ್ವಾಸಾರ್ಹ ಮೂಲಗಳು" : "Trusted resources"}</Text>
          <Text className="mt-1 text-sm text-gray-500">{isKannada ? "ಲೇಖನಗಳು ಮತ್ತು ಕನ್ನಡ ವಿಡಿಯೋ ಹುಡುಕಾಟ" : "Articles and language-matched video search"}</Text>
          {sources.map((source) => <Pressable key={source.title} onPress={() => openSource(source.url)} className="mt-3 flex-row items-center rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"><View className="h-11 w-11 items-center justify-center rounded-xl bg-blue-100"><MaterialCommunityIcons name={source.icon} size={23} color="#1D4ED8" /></View><View className="ml-3 flex-1"><View className="flex-row items-center"><Text className="mr-2 text-xs font-bold uppercase tracking-wide text-blue-700">{isKannada ? (source.type === "Article" ? "ಲೇಖನ" : "ವಿಡಿಯೋ") : source.type}</Text><MaterialCommunityIcons name="shield-check-outline" size={14} color="#16A34A" /></View><Text className="mt-1 text-base font-bold text-gray-800">{isKannada ? source.kannadaTitle : source.title}</Text><Text className="mt-1 text-xs leading-4 text-gray-500">{isKannada ? source.kannadaSubtitle : source.subtitle}</Text></View><MaterialCommunityIcons name="chevron-right" size={22} color="#9CA3AF" /></Pressable>)}

          <View className="mt-5 flex-row rounded-2xl bg-amber-50 p-4"><MaterialCommunityIcons name="information-outline" size={20} color="#A16207" /><Text className="ml-3 flex-1 text-xs leading-5 text-amber-900">{isKannada ? "ಇವು ಸ್ಥಳೀಯ ಬೆಲೆಗಳಲ್ಲ. ನಿಮ್ಮ ಹಾಲಿನ ಬೆಲೆ, ಮೇವು, ಕಾರ್ಮಿಕ ಮತ್ತು ಪಶುವೈದ್ಯ ವೆಚ್ಚವನ್ನು ದಾಖಲಿಸಿ ನಿಜವಾದ ಲಾಭ ಲೆಕ್ಕಿಸಿ." : "These are not local price quotes. Record your milk price, feed, labour, and veterinary costs to calculate your real profit."}</Text></View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
