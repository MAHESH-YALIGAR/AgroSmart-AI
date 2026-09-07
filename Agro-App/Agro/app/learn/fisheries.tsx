import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import { useRouter } from "expo-router";

type Language = "en" | "kn";
type FishKey = "composite" | "tilapia" | "pangasius" | "prawn" | "ornamental";

type FishOption = {
  key: FishKey;
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

const fishOptions: FishOption[] = [
  {
    key: "composite",
    name: "Rohu-Catla-Mrigal",
    kannada: "ರೋಹು-ಕಟ್ಲಾ-ಮೃಗಲ್",
    icon: "fish",
    color: "#E5F6FB",
    summary: "A common composite culture model that uses different pond levels and can reduce competition for feed.",
    kannadaSummary: "ಕೊಳದ ಬೇರೆ ಬೇರೆ ಮಟ್ಟಗಳನ್ನು ಬಳಸುವ ಸಾಮಾನ್ಯ ಮಿಶ್ರ ಸಾಕಾಣಿಕೆ ವಿಧಾನ; ಆಹಾರಕ್ಕಾಗಿ ಸ್ಪರ್ಧೆ ಕಡಿಮೆಯಾಗಬಹುದು.",
    cost: "Indicative cost: ₹1.2–₹2.2 lakh per acre/cycle",
    kannadaCost: "ಅಂದಾಜು ವೆಚ್ಚ: ಎಕರೆಗೆ ಪ್ರತಿ ಚಕ್ರಕ್ಕೆ ₹1.2–₹2.2 ಲಕ್ಷ",
    profit: "Indicative net: ₹60,000–₹1.5 lakh per acre/cycle after harvest and operating costs",
    kannadaProfit: "ಅಂದಾಜು ನಿವ್ವಳ ಲಾಭ: ಕೊಯ್ಲು ಮತ್ತು ನಿರ್ವಹಣಾ ವೆಚ್ಚದ ನಂತರ ಎಕರೆಗೆ ಪ್ರತಿ ಚಕ್ರಕ್ಕೆ ₹60,000–₹1.5 ಲಕ್ಷ",
    steps: [
      "Test pond water and soil; repair bunds, inlet, outlet, and safe screens.",
      "Use healthy seed from a reliable hatchery and stock only after acclimatisation.",
      "Feed according to biomass and sample fish weight instead of guessing quantities.",
      "Check dissolved oxygen, water colour, fish behaviour, and mortality every day.",
      "Plan harvest size, buyer, transport, and ice before the fish reach market size.",
    ],
    kannadaSteps: [
      "ಕೊಳದ ನೀರು ಮತ್ತು ಮಣ್ಣನ್ನು ಪರೀಕ್ಷಿಸಿ; ದಂಡೆ, ಒಳಹರಿವು, ಹೊರಹರಿವು ಮತ್ತು ಜಾಲಿಗಳನ್ನು ಸರಿಪಡಿಸಿ.",
      "ವಿಶ್ವಾಸಾರ್ಹ ಹ್ಯಾಚರಿಯಿಂದ ಆರೋಗ್ಯಕರ ಮರಿಗಳನ್ನು ಪಡೆದು, ಹೊಂದಾಣಿಕೆ ಮಾಡಿದ ನಂತರ ಮಾತ್ರ ಬಿಡಿ.",
      "ಅಂದಾಜಿನಿಂದಲ್ಲ, ಮೀನುಗಳ ತೂಕ ಮತ್ತು ಒಟ್ಟು ಸಂಖ್ಯೆಗೆ ತಕ್ಕಂತೆ ಆಹಾರ ನೀಡಿ.",
      "ಕರಗಿದ ಆಮ್ಲಜನಕ, ನೀರಿನ ಬಣ್ಣ, ಮೀನುಗಳ ವರ್ತನೆ ಮತ್ತು ಸಾವುಗಳನ್ನು ಪ್ರತಿದಿನ ಗಮನಿಸಿ.",
      "ಮೀನು ಮಾರುಕಟ್ಟೆ ಗಾತ್ರ ತಲುಪುವ ಮೊದಲು ಕೊಯ್ಲು, ಖರೀದಿದಾರ, ಸಾಗಣೆ ಮತ್ತು ಐಸ್ ಯೋಜಿಸಿ.",
    ],
  },
  {
    key: "tilapia",
    name: "Tilapia",
    kannada: "ಟಿಲಾಪಿಯಾ",
    icon: "fish",
    color: "#EAF7F1",
    summary: "Fast-growing fish for suitable warm water systems, but use approved seed and follow local stocking rules.",
    kannadaSummary: "ಸೂಕ್ತ ಬಿಸಿ ನೀರಿನ ವ್ಯವಸ್ಥೆಯಲ್ಲಿ ವೇಗವಾಗಿ ಬೆಳೆಯುವ ಮೀನು; ಅನುಮೋದಿತ ಮರಿಗಳನ್ನು ಬಳಸಿ ಸ್ಥಳೀಯ ನಿಯಮ ಪಾಲಿಸಿ.",
    cost: "Indicative cost: ₹1.0–₹2.0 lakh per acre/cycle",
    kannadaCost: "ಅಂದಾಜು ವೆಚ್ಚ: ಎಕರೆಗೆ ಪ್ರತಿ ಚಕ್ರಕ್ಕೆ ₹1.0–₹2.0 ಲಕ್ಷ",
    profit: "Indicative net: ₹50,000–₹1.4 lakh per acre/cycle when survival and market price are good",
    kannadaProfit: "ಅಂದಾಜು ನಿವ್ವಳ ಲಾಭ: ಬದುಕುಳಿಕೆ ಮತ್ತು ಮಾರುಕಟ್ಟೆ ಬೆಲೆ ಉತ್ತಮವಾಗಿದ್ದರೆ ಎಕರೆಗೆ ₹50,000–₹1.4 ಲಕ್ಷ",
    steps: [
      "Confirm that the strain and farming method are permitted by your local fisheries department.",
      "Keep stocking density within the pond's aeration and water exchange capacity.",
      "Use floating feed and check feeding response to prevent waste and poor water quality.",
      "Provide aeration at night or during cloudy weather when oxygen may fall.",
      "Grade fish when sizes vary widely so smaller fish are not outcompeted.",
    ],
    kannadaSteps: [
      "ತಳಿ ಮತ್ತು ಸಾಕಾಣಿಕೆ ವಿಧಾನಕ್ಕೆ ಸ್ಥಳೀಯ ಮೀನುಗಾರಿಕೆ ಇಲಾಖೆಯ ಅನುಮತಿ ಇದೆಯೇ ಪರಿಶೀಲಿಸಿ.",
      "ಕೊಳದ ಗಾಳಿಯಂತ್ರ ಮತ್ತು ನೀರು ಬದಲಾವಣೆ ಸಾಮರ್ಥ್ಯಕ್ಕೆ ತಕ್ಕಷ್ಟು ಮಾತ್ರ ಮರಿಗಳನ್ನು ಬಿಡಿ.",
      "ತೇಲುವ ಆಹಾರ ಬಳಸಿ, ವ್ಯರ್ಥ ಮತ್ತು ನೀರಿನ ಗುಣಮಟ್ಟ ಹದಗೆಡುವುದನ್ನು ತಪ್ಪಿಸಲು ಆಹಾರದ ಪ್ರತಿಕ್ರಿಯೆ ಗಮನಿಸಿ.",
      "ರಾತ್ರಿ ಅಥವಾ ಮೋಡದ ದಿನಗಳಲ್ಲಿ ಆಮ್ಲಜನಕ ಕಡಿಮೆಯಾಗಬಹುದು; ಗಾಳಿಯಂತ್ರ ಬಳಸಿ.",
      "ಗಾತ್ರದಲ್ಲಿ ಹೆಚ್ಚು ವ್ಯತ್ಯಾಸವಿದ್ದರೆ ಮೀನುಗಳನ್ನು ಬೇರ್ಪಡಿಸಿ.",
    ],
  },
  {
    key: "pangasius",
    name: "Pangasius",
    kannada: "ಪಂಗಾಸಿಯಸ್",
    icon: "fish",
    color: "#EEF2FF",
    summary: "A commercial fast-growing option that needs strong water management, dependable feed, and a confirmed buyer.",
    kannadaSummary: "ವೇಗವಾಗಿ ಬೆಳೆಯುವ ವಾಣಿಜ್ಯ ಮೀನು; ಉತ್ತಮ ನೀರಿನ ನಿರ್ವಹಣೆ, ನಂಬಿಕಸ್ಥ ಆಹಾರ ಮತ್ತು ಖಚಿತ ಖರೀದಿದಾರ ಅಗತ್ಯ.",
    cost: "Indicative cost: ₹1.4–₹2.6 lakh per acre/cycle",
    kannadaCost: "ಅಂದಾಜು ವೆಚ್ಚ: ಎಕರೆಗೆ ಪ್ರತಿ ಚಕ್ರಕ್ಕೆ ₹1.4–₹2.6 ಲಕ್ಷ",
    profit: "Indicative net: ₹70,000–₹1.7 lakh per acre/cycle after feed and harvest costs",
    kannadaProfit: "ಅಂದಾಜು ನಿವ್ವಳ ಲಾಭ: ಆಹಾರ ಮತ್ತು ಕೊಯ್ಲು ವೆಚ್ಚದ ನಂತರ ಎಕರೆಗೆ ₹70,000–₹1.7 ಲಕ್ಷ",
    steps: [
      "Check water source, drainage, biosecurity, and local permission before stocking.",
      "Buy uniform, active fingerlings and transport them with low stress.",
      "Measure feed conversion and remove dead fish immediately and safely.",
      "Maintain water depth and exchange carefully; sudden changes can stress fish.",
      "Fix a buyer and price range before investing in a full production cycle.",
    ],
    kannadaSteps: [
      "ಮರಿಗಳನ್ನು ಬಿಡುವ ಮೊದಲು ನೀರಿನ ಮೂಲ, ಹೊರಹರಿವು, ಜೈವ ಭದ್ರತೆ ಮತ್ತು ಸ್ಥಳೀಯ ಅನುಮತಿ ಪರಿಶೀಲಿಸಿ.",
      "ಸಮಾನ ಗಾತ್ರದ ಚುರುಕು ಮರಿಗಳನ್ನು ಖರೀದಿಸಿ, ಕಡಿಮೆ ಒತ್ತಡದಲ್ಲಿ ಸಾಗಿಸಿ.",
      "ಆಹಾರ ಪರಿವರ್ತನೆ ಗಮನಿಸಿ, ಸತ್ತ ಮೀನುಗಳನ್ನು ತಕ್ಷಣ ಸುರಕ್ಷಿತವಾಗಿ ತೆಗೆದುಹಾಕಿ.",
      "ನೀರಿನ ಆಳ ಮತ್ತು ಬದಲಾವಣೆಯನ್ನು ಜಾಗರೂಕತೆಯಿಂದ ನಿರ್ವಹಿಸಿ; ಹಠಾತ್ ಬದಲಾವಣೆ ಮೀನುಗಳಿಗೆ ಒತ್ತಡ ನೀಡುತ್ತದೆ.",
      "ಪೂರ್ಣ ಚಕ್ರಕ್ಕೆ ಹೂಡಿಕೆ ಮಾಡುವ ಮೊದಲು ಖರೀದಿದಾರ ಮತ್ತು ಬೆಲೆ ವ್ಯಾಪ್ತಿ ನಿಗದಿಪಡಿಸಿ.",
    ],
  },
  {
    key: "prawn",
    name: "Freshwater Prawn",
    kannada: "ಸಿಹಿನೀರಿನ ಸೀಗಡಿ",
    icon: "fishbowl",
    color: "#FFF2E8",
    summary: "Can improve pond returns in the right market, but it is sensitive to seed quality, water, and handling.",
    kannadaSummary: "ಸರಿಯಾದ ಮಾರುಕಟ್ಟೆಯಲ್ಲಿ ಕೊಳದ ಆದಾಯ ಹೆಚ್ಚಿಸಬಹುದು; ಆದರೆ ಮರಿಗಳ ಗುಣಮಟ್ಟ, ನೀರು ಮತ್ತು ನಿರ್ವಹಣೆಗೆ ಹೆಚ್ಚು ಸೂಕ್ಷ್ಮ.",
    cost: "Indicative cost: ₹1.5–₹3.0 lakh per acre/cycle",
    kannadaCost: "ಅಂದಾಜು ವೆಚ್ಚ: ಎಕರೆಗೆ ಪ್ರತಿ ಚಕ್ರಕ್ಕೆ ₹1.5–₹3.0 ಲಕ್ಷ",
    profit: "Indicative net: ₹80,000–₹2.0 lakh per acre/cycle with good survival and premium price",
    kannadaProfit: "ಅಂದಾಜು ನಿವ್ವಳ ಲಾಭ: ಬದುಕುಳಿಕೆ ಮತ್ತು ಉತ್ತಮ ಬೆಲೆ ಇದ್ದರೆ ಎಕರೆಗೆ ₹80,000–₹2.0 ಲಕ್ಷ",
    steps: [
      "Choose a species and stocking plan with a fisheries officer or trained hatchery.",
      "Provide shelters or suitable pond structure to reduce fighting and stress.",
      "Keep water quality stable and avoid overfeeding, which can damage the pond bottom.",
      "Sample growth and health regularly; separate unusual mortalities for diagnosis.",
      "Handle gently during harvest and use ice quickly to protect quality and price.",
    ],
    kannadaSteps: [
      "ಮೀನುಗಾರಿಕೆ ಅಧಿಕಾರಿ ಅಥವಾ ತರಬೇತಿ ಪಡೆದ ಹ್ಯಾಚರಿಯ ಸಲಹೆಯೊಂದಿಗೆ ತಳಿ ಮತ್ತು ಬಿಡುವ ಯೋಜನೆ ಮಾಡಿ.",
      "ಜಗಳ ಮತ್ತು ಒತ್ತಡ ಕಡಿಮೆ ಮಾಡಲು ಆಶ್ರಯ ಅಥವಾ ಸೂಕ್ತ ಕೊಳದ ರಚನೆ ಒದಗಿಸಿ.",
      "ನೀರಿನ ಗುಣಮಟ್ಟ ಸ್ಥಿರವಾಗಿರಲಿ; ಹೆಚ್ಚು ಆಹಾರದಿಂದ ಕೊಳದ ತಳ ಹದಗೆಡದಂತೆ ಮಾಡಿ.",
      "ಬೆಳವಣಿಗೆ ಮತ್ತು ಆರೋಗ್ಯವನ್ನು ನಿಯಮಿತವಾಗಿ ಪರೀಕ್ಷಿಸಿ; ಅಸಾಮಾನ್ಯ ಸಾವುಗಳ ಮಾದರಿ ಪರೀಕ್ಷೆಗೆ ಕಳುಹಿಸಿ.",
      "ಕೊಯ್ಲಿನಲ್ಲಿ ಜಾಗರೂಕತೆಯಿಂದ ನಿರ್ವಹಿಸಿ, ಗುಣಮಟ್ಟ ಮತ್ತು ಬೆಲೆ ಉಳಿಸಲು ತಕ್ಷಣ ಐಸ್ ಬಳಸಿ.",
    ],
  },
  {
    key: "ornamental",
    name: "Ornamental Fish",
    kannada: "ಅಲಂಕಾರಿಕ ಮೀನು",
    icon: "fishbowl-outline",
    color: "#F8EFFF",
    summary: "A small-scale option for tanks and local retail, with income depending on survival, colour, breeding, and customer network.",
    kannadaSummary: "ಟ್ಯಾಂಕ್ ಮತ್ತು ಸ್ಥಳೀಯ ಚಿಲ್ಲರೆ ಮಾರಾಟಕ್ಕೆ ಸೂಕ್ತ ಸಣ್ಣ ಪ್ರಮಾಣದ ಆಯ್ಕೆ; ಬದುಕುಳಿಕೆ, ಬಣ್ಣ, ಸಂತಾನೋತ್ಪತ್ತಿ ಮತ್ತು ಗ್ರಾಹಕರ ಜಾಲ ಮುಖ್ಯ.",
    cost: "Indicative cost: ₹40,000–₹1.5 lakh for a small starter unit",
    kannadaCost: "ಅಂದಾಜು ವೆಚ್ಚ: ಸಣ್ಣ ಆರಂಭಿಕ ಘಟಕಕ್ಕೆ ₹40,000–₹1.5 ಲಕ್ಷ",
    profit: "Indicative net: ₹10,000–₹40,000 per month after the unit stabilises",
    kannadaProfit: "ಅಂದಾಜು ನಿವ್ವಳ ಲಾಭ: ಘಟಕ ಸ್ಥಿರವಾದ ನಂತರ ತಿಂಗಳಿಗೆ ₹10,000–₹40,000",
    steps: [
      "Start with a few hardy species and learn quarantine before adding expensive stock.",
      "Use clean, dechlorinated water and separate new fish before mixing them.",
      "Feed small portions and remove leftovers to protect water quality.",
      "Record breeding, mortality, electricity, feed, and customer orders.",
      "Build buyers through local shops, hobby groups, and direct orders before scaling.",
    ],
    kannadaSteps: [
      "ಕೆಲವು ಗಟ್ಟಿಯಾದ ತಳಿಗಳಿಂದ ಆರಂಭಿಸಿ, ದುಬಾರಿ ಮೀನು ಸೇರಿಸುವ ಮೊದಲು ಕ್ವಾರಂಟೈನ್ ಕಲಿಯಿರಿ.",
      "ಸ್ವಚ್ಛ, ಕ್ಲೋರಿನ್ ತೆಗೆದ ನೀರು ಬಳಸಿ ಮತ್ತು ಹೊಸ ಮೀನುಗಳನ್ನು ಸೇರಿಸುವ ಮೊದಲು ಬೇರ್ಪಡಿಸಿ.",
      "ಸ್ವಲ್ಪ ಸ್ವಲ್ಪ ಆಹಾರ ನೀಡಿ, ನೀರಿನ ಗುಣಮಟ್ಟ ಕಾಪಾಡಲು ಉಳಿದ ಆಹಾರ ತೆಗೆದುಹಾಕಿ.",
      "ಸಂತಾನೋತ್ಪತ್ತಿ, ಸಾವು, ವಿದ್ಯುತ್, ಆಹಾರ ಮತ್ತು ಗ್ರಾಹಕರ ಆರ್ಡರ್ ದಾಖಲಿಸಿ.",
      "ವಿಸ್ತರಿಸುವ ಮೊದಲು ಸ್ಥಳೀಯ ಅಂಗಡಿ, ಹವ್ಯಾಸಿ ಗುಂಪು ಮತ್ತು ನೇರ ಆರ್ಡರ್ ಮೂಲಕ ಖರೀದಿದಾರರ ಜಾಲ ನಿರ್ಮಿಸಿ.",
    ],
  },
];

const baseSources = [
  {
    type: "Article",
    icon: "file-document-outline" as const,
    title: "Department of Fisheries",
    kannadaTitle: "ಮೀನುಗಾರಿಕೆ ಇಲಾಖೆ",
    subtitle: "Government fisheries schemes, training, and advisories",
    kannadaSubtitle: "ಸರ್ಕಾರಿ ಮೀನುಗಾರಿಕೆ ಯೋಜನೆಗಳು, ತರಬೇತಿ ಮತ್ತು ಸಲಹೆಗಳು",
    url: "https://dof.gov.in/",
  },
  {
    type: "Article",
    icon: "school-outline" as const,
    title: "ICAR Fisheries Research",
    kannadaTitle: "ICAR ಮೀನುಗಾರಿಕೆ ಸಂಶೋಧನೆ",
    subtitle: "Research and technical information for aquaculture",
    kannadaSubtitle: "ಜಲಕೃಷಿಗೆ ಸಂಶೋಧನೆ ಮತ್ತು ತಾಂತ್ರಿಕ ಮಾಹಿತಿ",
    url: "https://icar.gov.in/",
  },
];

export default function FisheriesScreen() {
  const router = useRouter();
  const [language, setLanguage] = useState<Language>("en");
  const [selected, setSelected] = useState<FishKey>("composite");
  const option = fishOptions.find((item) => item.key === selected) ?? fishOptions[0];
  const isKannada = language === "kn";
  const videoUrl = isKannada
    ? "https://www.youtube.com/results?search_query=Kannada+fish+farming+Karnataka"
    : "https://www.youtube.com/results?search_query=scientific+fish+farming+India";

  const openSource = async (url: string) => {
    await WebBrowser.openBrowserAsync(url, {
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
      controlsColor: "#0369A1",
    });
  };

  const sources = [
    ...baseSources,
    {
      type: "Video",
      icon: "play-circle-outline" as const,
      title: isKannada ? "ಕನ್ನಡ ಮೀನು ಸಾಕಾಣಿಕೆ ವಿಡಿಯೋಗಳು" : "Fish farming videos",
      kannadaTitle: "ಕನ್ನಡ ಮೀನು ಸಾಕಾಣಿಕೆ ವಿಡಿಯೋಗಳು",
      subtitle: isKannada ? "ಕರ್ನಾಟಕ ರೈತರಿಗೆ ಕನ್ನಡದಲ್ಲಿ ವಿಡಿಯೋ ಹುಡುಕಾಟ" : "Practical aquaculture video search for farmers",
      kannadaSubtitle: "ಕರ್ನಾಟಕ ರೈತರಿಗೆ ಕನ್ನಡದಲ್ಲಿ ವಿಡಿಯೋ ಹುಡುಕಾಟ",
      url: videoUrl,
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-[#F5FBFC]">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="bg-cyan-900 px-5 pb-6 pt-3">
          <View className="flex-row items-center justify-between">
            <Pressable accessibilityLabel="Go back" onPress={() => router.back()} className="h-11 w-11 items-center justify-center rounded-full bg-cyan-800"><MaterialCommunityIcons name="arrow-left" size={23} color="white" /></Pressable>
            <View className="flex-1 px-4"><Text className="text-xs font-semibold uppercase tracking-widest text-cyan-200">{isKannada ? "ಜಲಕೃಷಿ" : "AQUACULTURE"}</Text><Text className="mt-1 text-2xl font-bold text-white">{isKannada ? "ಮೀನುಗಾರಿಕೆ" : "Fisheries"}</Text></View>
            <View className="h-11 w-11 items-center justify-center rounded-full bg-cyan-800"><MaterialCommunityIcons name="fish" size={25} color="#A5F3FC" /></View>
          </View>
          <Text className="mt-5 text-sm leading-5 text-cyan-100">{isKannada ? "ನೀರಿನ ಗುಣಮಟ್ಟ, ಆಹಾರ ಮತ್ತು ಮಾರುಕಟ್ಟೆ ಯೋಜನೆಯೊಂದಿಗೆ ಮೀನು ಸಾಕಾಣಿಕೆ ಕಲಿಯಿರಿ." : "Learn fish farming with water quality, feeding, and market planning."}</Text>
        </View>

        <View className="px-5 pt-5">
          <View className="flex-row items-center justify-between"><Text className="text-base font-bold text-gray-800">{isKannada ? "ಭಾಷೆ ಆಯ್ಕೆ ಮಾಡಿ" : "Choose language"}</Text><View className="flex-row rounded-xl bg-gray-200 p-1"><Pressable onPress={() => setLanguage("en")} className={`rounded-lg px-4 py-2 ${!isKannada ? "bg-white" : ""}`}><Text className={`text-sm font-bold ${!isKannada ? "text-cyan-800" : "text-gray-500"}`}>English</Text></Pressable><Pressable onPress={() => setLanguage("kn")} className={`rounded-lg px-4 py-2 ${isKannada ? "bg-white" : ""}`}><Text className={`text-sm font-bold ${isKannada ? "text-cyan-800" : "text-gray-500"}`}>ಕನ್ನಡ</Text></Pressable></View></View>
          <Text className="mt-7 text-xl font-bold text-gray-900">{isKannada ? "ಮೀನು ಆಯ್ಕೆ ಮಾಡಿ" : "Select a fish enterprise"}</Text>
          <Text className="mt-1 text-sm text-gray-500">{isKannada ? "ನಿಮ್ಮ ಕೊಳ, ನೀರು ಮತ್ತು ಮಾರುಕಟ್ಟೆಗೆ ತಕ್ಕಂತೆ" : "Match the option to your pond, water, and market"}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-4 -mr-5">{fishOptions.map((item) => { const active = item.key === selected; return <Pressable key={item.key} onPress={() => setSelected(item.key)} className={`mr-3 min-w-[124px] rounded-2xl border p-3 ${active ? "border-cyan-800 bg-cyan-800" : "border-transparent"}`} style={!active ? { backgroundColor: item.color } : undefined}><MaterialCommunityIcons name={item.icon} size={26} color={active ? "white" : "#0E7490"} /><Text className={`mt-2 text-sm font-bold ${active ? "text-white" : "text-gray-800"}`}>{isKannada ? item.kannada : item.name}</Text></Pressable>; })}</ScrollView>

          <View className="mt-6 rounded-3xl bg-white p-5 shadow-sm"><View className="flex-row items-center"><View className="h-14 w-14 items-center justify-center rounded-2xl bg-cyan-100"><MaterialCommunityIcons name={option.icon} size={31} color="#0E7490" /></View><View className="ml-4 flex-1"><Text className="text-2xl font-bold text-gray-900">{isKannada ? option.kannada : option.name}</Text><Text className="mt-1 text-xs font-semibold uppercase tracking-wide text-cyan-700">{isKannada ? "ಮೀನು ಮಾರ್ಗದರ್ಶಿ" : "Enterprise guide"}</Text></View></View><Text className="mt-5 text-sm leading-6 text-gray-600">{isKannada ? option.kannadaSummary : option.summary}</Text>
            <View className="mt-5 flex-row"><View className="mr-3 flex-1 rounded-2xl bg-orange-50 p-3"><MaterialCommunityIcons name="cash-minus" size={21} color="#C2410C" /><Text className="mt-2 text-xs font-bold uppercase text-orange-700">{isKannada ? "ವೆಚ್ಚ" : "Cost"}</Text><Text className="mt-1 text-xs leading-4 text-orange-950">{isKannada ? option.kannadaCost : option.cost}</Text></View><View className="ml-1 flex-1 rounded-2xl bg-emerald-50 p-3"><MaterialCommunityIcons name="chart-line" size={21} color="#047857" /><Text className="mt-2 text-xs font-bold uppercase text-emerald-700">{isKannada ? "ಲಾಭ" : "Profit"}</Text><Text className="mt-1 text-xs leading-4 text-emerald-950">{isKannada ? option.kannadaProfit : option.profit}</Text></View></View>
            <Text className="mt-6 text-lg font-bold text-gray-900">{isKannada ? "ಸಾಕಾಣಿಕೆ ಹಂತಗಳು" : "Farming steps"}</Text><View className="mt-3">{(isKannada ? option.kannadaSteps : option.steps).map((step, index) => <View key={step} className="mb-4 flex-row"><View className="mr-3 h-7 w-7 items-center justify-center rounded-full bg-cyan-100"><Text className="text-sm font-bold text-cyan-800">{index + 1}</Text></View><Text className="flex-1 text-sm leading-5 text-gray-700">{step}</Text></View>)}</View>
          </View>

          <Text className="mt-7 text-xl font-bold text-gray-900">{isKannada ? "ವಿಶ್ವಾಸಾರ್ಹ ಮೂಲಗಳು" : "Trusted resources"}</Text><Text className="mt-1 text-sm text-gray-500">{isKannada ? "ಲೇಖನಗಳು ಮತ್ತು ಕನ್ನಡ ವಿಡಿಯೋ ಹುಡುಕಾಟ" : "Articles and language-matched video search"}</Text>
          {sources.map((source) => <Pressable key={source.title} onPress={() => openSource(source.url)} className="mt-3 flex-row items-center rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"><View className="h-11 w-11 items-center justify-center rounded-xl bg-cyan-100"><MaterialCommunityIcons name={source.icon} size={23} color="#0E7490" /></View><View className="ml-3 flex-1"><View className="flex-row items-center"><Text className="mr-2 text-xs font-bold uppercase tracking-wide text-cyan-700">{isKannada ? (source.type === "Article" ? "ಲೇಖನ" : "ವಿಡಿಯೋ") : source.type}</Text><MaterialCommunityIcons name="shield-check-outline" size={14} color="#16A34A" /></View><Text className="mt-1 text-base font-bold text-gray-800">{isKannada ? source.kannadaTitle : source.title}</Text><Text className="mt-1 text-xs leading-4 text-gray-500">{isKannada ? source.kannadaSubtitle : source.subtitle}</Text></View><MaterialCommunityIcons name="chevron-right" size={22} color="#9CA3AF" /></Pressable>)}
          <View className="mt-5 flex-row rounded-2xl bg-amber-50 p-4"><MaterialCommunityIcons name="information-outline" size={20} color="#A16207" /><Text className="ml-3 flex-1 text-xs leading-5 text-amber-900">{isKannada ? "ಇವು ಅಂದಾಜು ಲೆಕ್ಕಗಳು ಮಾತ್ರ. ನೀರು, ಆಹಾರ, ವಿದ್ಯುತ್, ಕಾರ್ಮಿಕ, ಸಾವು ಮತ್ತು ಮಾರುಕಟ್ಟೆ ಬೆಲೆಯನ್ನು ದಾಖಲಿಸಿ ನಿಜವಾದ ಲಾಭ ಲೆಕ್ಕಿಸಿ." : "These are indicative estimates only. Track water, feed, electricity, labour, mortality, and market price for your real profit."}</Text></View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
