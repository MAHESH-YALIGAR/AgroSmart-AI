import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import { useRouter } from "expo-router";

type Language = "en" | "kn";
type TopicKey = "beekeeping" | "organic-farming" | "modern-technology" | "business-market" | "agro-products";
type TopicColor = "amber" | "emerald" | "indigo" | "rose" | "orange";

type Option = {
  key: string;
  name: string;
  kannada: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  color: string;
  summary: string;
  kannadaSummary: string;
  cost: string;
  kannadaCost: string;
  returnLabel: string;
  kannadaReturnLabel: string;
  steps: string[];
  kannadaSteps: string[];
};

type Source = {
  type: "Article" | "Video" | "Tool";
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  kannadaTitle: string;
  subtitle: string;
  kannadaSubtitle: string;
  url: string;
};

type Topic = {
  key: TopicKey;
  eyebrow: string;
  kannadaEyebrow: string;
  title: string;
  kannadaTitle: string;
  description: string;
  kannadaDescription: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  color: TopicColor;
  selectorTitle: string;
  kannadaSelectorTitle: string;
  selectorHint: string;
  kannadaSelectorHint: string;
  optionLabel: string;
  kannadaOptionLabel: string;
  options: Option[];
  sources: Source[];
  actionTitle: string;
  kannadaActionTitle: string;
  actionText: string;
  kannadaActionText: string;
};

const topics: Record<TopicKey, Topic> = {
  beekeeping: {
    key: "beekeeping",
    eyebrow: "POLLINATION + INCOME",
    kannadaEyebrow: "ಪರಾಗಸ್ಪರ್ಶ + ಆದಾಯ",
    title: "Beekeeping",
    kannadaTitle: "ಜೇನು ಸಾಕಾಣಿಕೆ",
    description: "Start small, protect the colony, and sell more than honey through wax, pollen, and pollination services.",
    kannadaDescription: "ಸಣ್ಣದಾಗಿ ಆರಂಭಿಸಿ, ಜೇನುನೊಣಗಳ ಗೂಡನ್ನು ರಕ್ಷಿಸಿ, ಜೇನು ಮಾತ್ರವಲ್ಲದೆ ಮೇಣ, ಪರಾಗ ಮತ್ತು ಪರಾಗಸ್ಪರ್ಶ ಸೇವೆಯಿಂದಲೂ ಆದಾಯ ಗಳಿಸಿ.",
    icon: "bee",
    color: "amber",
    selectorTitle: "Choose a beekeeping model",
    kannadaSelectorTitle: "ಜೇನು ಸಾಕಾಣಿಕೆ ವಿಧಾನ ಆಯ್ಕೆ ಮಾಡಿ",
    selectorHint: "Match the model to flowers, labour, and market access",
    kannadaSelectorHint: "ಹೂವು, ಕೆಲಸಗಾರರು ಮತ್ತು ಮಾರುಕಟ್ಟೆಗೆ ತಕ್ಕ ವಿಧಾನ ಆಯ್ಕೆ ಮಾಡಿ",
    optionLabel: "Model guide",
    kannadaOptionLabel: "ವಿಧಾನ ಮಾರ್ಗದರ್ಶಿ",
    actionTitle: "A smart first move",
    kannadaActionTitle: "ಮೊದಲ ಬುದ್ಧಿವಂತ ಹೆಜ್ಜೆ",
    actionText: "Place two or three boxes near a pesticide-free flowering area for one season. Record colony strength, flowering days, feed, honey yield, and buyer price before expanding.",
    kannadaActionText: "ಕೀಟನಾಶಕ ಮುಕ್ತ ಹೂ ಬಿಡುವ ಪ್ರದೇಶದ ಬಳಿ ಎರಡು ಅಥವಾ ಮೂರು ಪೆಟ್ಟಿಗೆಗಳನ್ನು ಒಂದು ಹಂಗಾಮಿಗೆ ಇಡಿ. ವಸಾಹತು ಬಲ, ಹೂ ಬಿಡುವ ದಿನಗಳು, ಆಹಾರ, ಜೇನು ಇಳುವರಿ ಮತ್ತು ಖರೀದಿದಾರರ ಬೆಲೆ ದಾಖಲಿಸಿ.",
    options: [
      {
        key: "indian",
        name: "Indian Hive (Apis cerana)",
        kannada: "ಭಾರತೀಯ ಜೇನುನೊಣ (ಅಪಿಸ್ ಸೆರಾನಾ)",
        icon: "bee",
        color: "#FFF4CC",
        summary: "A practical small-farm choice that can suit local conditions and diversified flowering crops.",
        kannadaSummary: "ಸ್ಥಳೀಯ ಪರಿಸ್ಥಿತಿ ಮತ್ತು ವಿವಿಧ ಹೂ ಬೆಳೆಗಳಿಗೆ ಹೊಂದಿಕೊಳ್ಳುವ ಸಣ್ಣ ರೈತರಿಗೆ ಸೂಕ್ತ ಆಯ್ಕೆ.",
        cost: "Indicative setup: ₹8,000–₹18,000 per box",
        kannadaCost: "ಅಂದಾಜು ಆರಂಭಿಕ ವೆಚ್ಚ: ಒಂದು ಪೆಟ್ಟಿಗೆಗೆ ₹8,000–₹18,000",
        returnLabel: "Indicative return: ₹4,000–₹12,000 per box/season after care costs",
        kannadaReturnLabel: "ಅಂದಾಜು ಆದಾಯ: ಆರೈಕೆ ವೆಚ್ಚದ ನಂತರ ಪ್ರತಿ ಪೆಟ್ಟಿಗೆ/ಹಂಗಾಮಿಗೆ ₹4,000–₹12,000",
        steps: [
          "Attend a local training and learn to identify the queen, brood, food stores, and disease.",
          "Place boxes on a dry stand with morning sun, shade at midday, and clean water nearby.",
          "Avoid spraying pesticides during flowering; coordinate with neighbouring farmers.",
          "Inspect calmly every 7–10 days and provide feed only when natural flowers are scarce.",
          "Harvest sealed honey with clean equipment and leave enough stores for the colony.",
        ],
        kannadaSteps: [
          "ಸ್ಥಳೀಯ ತರಬೇತಿಗೆ ಹಾಜರಾಗಿ ರಾಣಿ, ಮರಿಹುಳು, ಆಹಾರ ಸಂಗ್ರಹ ಮತ್ತು ರೋಗ ಗುರುತಿಸುವುದನ್ನು ಕಲಿಯಿರಿ.",
          "ಬೆಳಗಿನ ಬಿಸಿಲು, ಮಧ್ಯಾಹ್ನ ನೆರಳು ಮತ್ತು ಹತ್ತಿರ ಸ್ವಚ್ಛ ನೀರು ಇರುವ ಒಣ ಸ್ಟ್ಯಾಂಡ್ ಮೇಲೆ ಪೆಟ್ಟಿಗೆ ಇಡಿ.",
          "ಹೂ ಬಿಡುವ ಸಮಯದಲ್ಲಿ ಕೀಟನಾಶಕ ಸಿಂಪಡಿಸಬೇಡಿ; ಪಕ್ಕದ ರೈತರೊಂದಿಗೆ ಸಮನ್ವಯ ಮಾಡಿ.",
          "ಪ್ರತಿ 7–10 ದಿನಕ್ಕೆ ಶಾಂತವಾಗಿ ಪರಿಶೀಲಿಸಿ; ಹೂವು ಕಡಿಮೆಯಾದಾಗ ಮಾತ್ರ ಆಹಾರ ನೀಡಿ.",
          "ಸ್ವಚ್ಛ ಉಪಕರಣದಿಂದ ಮುಚ್ಚಿದ ಜೇನು ತೆಗೆಯಿರಿ ಮತ್ತು ವಸಾಹತಿಗೆ ಸಾಕಷ್ಟು ಆಹಾರ ಬಿಡಿ.",
        ],
      },
      {
        key: "italian",
        name: "European Honey Bee (Apis mellifera)",
        kannada: "ಯುರೋಪಿಯನ್ ಜೇನುನೊಣ (ಅಪಿಸ್ ಮೆಲ್ಲಿಫೆರಾ)",
        icon: "bee",
        color: "#FFF8E7",
        summary: "A higher-production model for trained keepers with strong forage, migration planning, and buyer access.",
        kannadaSummary: "ಉತ್ತಮ ಹೂ ಸಂಪನ್ಮೂಲ, ವಲಸೆ ಯೋಜನೆ ಮತ್ತು ಮಾರುಕಟ್ಟೆ ಹೊಂದಿರುವ ತರಬೇತಿ ಪಡೆದ ಸಾಕಾಣಿಕೆದಾರರಿಗೆ ಹೆಚ್ಚು ಉತ್ಪಾದನಾ ವಿಧಾನ.",
        cost: "Indicative setup: ₹12,000–₹25,000 per box",
        kannadaCost: "ಅಂದಾಜು ಆರಂಭಿಕ ವೆಚ್ಚ: ಒಂದು ಪೆಟ್ಟಿಗೆಗೆ ₹12,000–₹25,000",
        returnLabel: "Indicative return: ₹8,000–₹20,000 per box/season in a strong floral area",
        kannadaReturnLabel: "ಅಂದಾಜು ಆದಾಯ: ಉತ್ತಮ ಹೂ ಪ್ರದೇಶದಲ್ಲಿ ಪ್ರತಿ ಪೆಟ್ಟಿಗೆ/ಹಂಗಾಮಿಗೆ ₹8,000–₹20,000",
        steps: [
          "Start only after practical training because colonies are larger and need closer management.",
          "Map flowering crops and plan movement only with safe transport and local permission.",
          "Monitor swarming, queen performance, pests, and food stores on a written schedule.",
          "Use protective clothing and keep an emergency plan for stings and extreme weather.",
          "Grade and label honey by harvest location and date to build buyer trust.",
        ],
        kannadaSteps: [
          "ಪ್ರಾಯೋಗಿಕ ತರಬೇತಿಯ ನಂತರ ಮಾತ್ರ ಆರಂಭಿಸಿ; ದೊಡ್ಡ ವಸಾಹತುಗಳಿಗೆ ಹೆಚ್ಚು ಆರೈಕೆ ಬೇಕಾಗುತ್ತದೆ.",
          "ಹೂ ಬೆಳೆಗಳ ನಕ್ಷೆ ಮಾಡಿ, ಸುರಕ್ಷಿತ ಸಾಗಣೆ ಮತ್ತು ಸ್ಥಳೀಯ ಅನುಮತಿಯೊಂದಿಗೆ ಮಾತ್ರ ಸ್ಥಳ ಬದಲಿಸಿ.",
          "ಗೂಡು ವಿಭಜನೆ, ರಾಣಿ ಕಾರ್ಯಕ್ಷಮತೆ, ಕೀಟ ಮತ್ತು ಆಹಾರ ಸಂಗ್ರಹವನ್ನು ಬರಹದ ವೇಳಾಪಟ್ಟಿಯಲ್ಲಿ ಗಮನಿಸಿ.",
          "ರಕ್ಷಣಾ ಉಡುಪು ಬಳಸಿ, ಕಚ್ಚುವಿಕೆ ಮತ್ತು ತೀವ್ರ ಹವಾಮಾನಕ್ಕೆ ತುರ್ತು ಯೋಜನೆ ಇರಲಿ.",
          "ಖರೀದಿದಾರರ ನಂಬಿಕೆಗಾಗಿ ಹೂ ಪ್ರದೇಶ ಮತ್ತು ಕೊಯ್ಲು ದಿನಾಂಕದಂತೆ ಜೇನನ್ನು ಗುರುತು ಹಾಕಿ.",
        ],
      },
      {
        key: "pollination",
        name: "Pollination Service",
        kannada: "ಪರಾಗಸ್ಪರ್ಶ ಸೇವೆ",
        icon: "flower",
        color: "#FFF1D6",
        summary: "Rent healthy colonies to fruit and seed growers during flowering, with honey as a secondary income.",
        kannadaSummary: "ಹಣ್ಣು ಮತ್ತು ಬೀಜ ಬೆಳೆಗಾರರಿಗೆ ಹೂ ಬಿಡುವ ಸಮಯದಲ್ಲಿ ಆರೋಗ್ಯಕರ ವಸಾಹತು ಬಾಡಿಗೆ ನೀಡಿ; ಜೇನು ಹೆಚ್ಚುವರಿ ಆದಾಯವಾಗಲಿ.",
        cost: "Indicative setup: ₹10,000–₹22,000 per managed box",
        kannadaCost: "ಅಂದಾಜು ಆರಂಭಿಕ ವೆಚ್ಚ: ನಿರ್ವಹಿತ ಪೆಟ್ಟಿಗೆಗೆ ₹10,000–₹22,000",
        returnLabel: "Indicative service income: ₹1,000–₹3,000 per box/flowering period plus honey",
        kannadaReturnLabel: "ಅಂದಾಜು ಸೇವಾ ಆದಾಯ: ಜೇನು ಜೊತೆಗೆ ಪ್ರತಿ ಪೆಟ್ಟಿಗೆ/ಹೂ ಅವಧಿಗೆ ₹1,000–₹3,000",
        steps: [
          "Agree in writing on placement dates, pesticide restrictions, transport, and payment.",
          "Place strong, disease-free colonies when the crop begins flowering.",
          "Keep a clear distance from farm workers and provide a contact number on each stand.",
          "Measure fruit set or seed set with the farmer to show service value.",
          "Move colonies after flowering and check feed before the next placement.",
        ],
        kannadaSteps: [
          "ಇಡುವ ದಿನಾಂಕ, ಕೀಟನಾಶಕ ನಿಯಮ, ಸಾಗಣೆ ಮತ್ತು ಪಾವತಿ ಕುರಿತು ಬರಹದ ಒಪ್ಪಂದ ಮಾಡಿ.",
          "ಬೆಳೆ ಹೂ ಬಿಡಲು ಆರಂಭಿಸಿದಾಗ ಬಲವಾದ, ರೋಗರಹಿತ ವಸಾಹತುಗಳನ್ನು ಇಡಿ.",
          "ಕಾರ್ಮಿಕರಿಂದ ಸುರಕ್ಷಿತ ಅಂತರ ಇಟ್ಟು, ಪ್ರತಿ ಸ್ಟ್ಯಾಂಡ್ ಮೇಲೆ ಸಂಪರ್ಕ ಸಂಖ್ಯೆ ಹಾಕಿ.",
          "ಸೇವೆಯ ಮೌಲ್ಯ ತೋರಿಸಲು ರೈತರೊಂದಿಗೆ ಹಣ್ಣು ಅಥವಾ ಬೀಜ ಕಟ್ಟುವ ಪ್ರಮಾಣ ಅಳೆಯಿರಿ.",
          "ಹೂ ಅವಧಿಯ ನಂತರ ವಸಾಹತುಗಳನ್ನು ಸ್ಥಳಾಂತರಿಸಿ, ಮುಂದಿನ ಬಳಕೆಗೆ ಮೊದಲು ಆಹಾರ ಪರಿಶೀಲಿಸಿ.",
        ],
      },
    ],
    sources: [
      { type: "Article", icon: "file-document-outline", title: "National Bee Board", kannadaTitle: "ರಾಷ್ಟ್ರೀಯ ಜೇನು ಮಂಡಳಿ", subtitle: "Government beekeeping schemes, training, and guidance", kannadaSubtitle: "ಸರ್ಕಾರಿ ಜೇನು ಸಾಕಾಣಿಕೆ ಯೋಜನೆ, ತರಬೇತಿ ಮತ್ತು ಮಾರ್ಗದರ್ಶನ", url: "https://nbb.gov.in/" },
      { type: "Article", icon: "school-outline", title: "KVK Beekeeping Resources", kannadaTitle: "KVK ಜೇನು ಸಾಕಾಣಿಕೆ ಸಂಪನ್ಮೂಲಗಳು", subtitle: "Find local agricultural training and expert support", kannadaSubtitle: "ಸ್ಥಳೀಯ ಕೃಷಿ ತರಬೇತಿ ಮತ್ತು ತಜ್ಞರ ಸಹಾಯ ಹುಡುಕಿ", url: "https://icar.gov.in/" },
    ],
  },
  "organic-farming": {
    key: "organic-farming",
    eyebrow: "SOIL + MARKET VALUE",
    kannadaEyebrow: "ಮಣ್ಣು + ಮಾರುಕಟ್ಟೆ ಮೌಲ್ಯ",
    title: "Organic Farming",
    kannadaTitle: "ಸಾವಯವ ಕೃಷಿ",
    description: "Build soil health first, keep records, and choose a market before paying for certification or inputs.",
    kannadaDescription: "ಮೊದಲು ಮಣ್ಣಿನ ಆರೋಗ್ಯ ಬೆಳೆಸಿ, ದಾಖಲೆ ಇಟ್ಟು, ಪ್ರಮಾಣಪತ್ರ ಅಥವಾ ಒಳಹರಿವಿಗೆ ಹಣ ಖರ್ಚು ಮಾಡುವ ಮೊದಲು ಮಾರುಕಟ್ಟೆ ಆಯ್ಕೆ ಮಾಡಿ.",
    icon: "leaf",
    color: "emerald",
    selectorTitle: "Choose an organic system",
    kannadaSelectorTitle: "ಸಾವಯವ ವಿಧಾನ ಆಯ್ಕೆ ಮಾಡಿ",
    selectorHint: "Start with the system that matches your land and buyer",
    kannadaSelectorHint: "ನಿಮ್ಮ ಭೂಮಿ ಮತ್ತು ಖರೀದಿದಾರರಿಗೆ ತಕ್ಕ ವಿಧಾನದಿಂದ ಆರಂಭಿಸಿ",
    optionLabel: "System guide",
    kannadaOptionLabel: "ವಿಧಾನ ಮಾರ್ಗದರ್ಶಿ",
    actionTitle: "A smart first move",
    kannadaActionTitle: "ಮೊದಲ ಬುದ್ಧಿವಂತ ಹೆಜ್ಜೆ",
    actionText: "Convert one small plot first. Compare yield, input cost, labour time, soil moisture, and selling price against your conventional plot for one full season.",
    kannadaActionText: "ಮೊದಲು ಒಂದು ಸಣ್ಣ ಜಮೀನಿನಲ್ಲಿ ಪರಿವರ್ತನೆ ಮಾಡಿ. ಒಂದು ಪೂರ್ಣ ಹಂಗಾಮಿನಲ್ಲಿ ಇಳುವರಿ, ಒಳಹರಿವು ವೆಚ್ಚ, ಕೆಲಸದ ಸಮಯ, ಮಣ್ಣಿನ ತೇವಾಂಶ ಮತ್ತು ಮಾರಾಟ ಬೆಲೆಯನ್ನು ಸಾಮಾನ್ಯ ಜಮೀನಿನೊಂದಿಗೆ ಹೋಲಿಸಿ.",
    options: [
      {
        key: "natural",
        name: "Natural Farming",
        kannada: "ನೈಸರ್ಗಿಕ ಕೃಷಿ",
        icon: "leaf-circle",
        color: "#E6F7EA",
        summary: "A low-external-input approach using local biomass, cover, diversity, and careful water management.",
        kannadaSummary: "ಸ್ಥಳೀಯ ಜೈವಿಕ ವಸ್ತು, ಮುಚ್ಚು ಬೆಳೆ, ವೈವಿಧ್ಯ ಮತ್ತು ನೀರಿನ ನಿರ್ವಹಣೆಯ ಮೂಲಕ ಹೊರಗಿನ ಒಳಹರಿವು ಕಡಿಮೆ ಮಾಡುವ ವಿಧಾನ.",
        cost: "Indicative seasonal input cost: ₹8,000–₹25,000 per acre",
        kannadaCost: "ಅಂದಾಜು ಹಂಗಾಮಿ ಒಳಹರಿವು ವೆಚ್ಚ: ಎಕರೆಗೆ ₹8,000–₹25,000",
        returnLabel: "Potential benefit: lower purchased-input cost; premium depends on buyer proof",
        kannadaReturnLabel: "ಸಂಭಾವ್ಯ ಲಾಭ: ಖರೀದಿಸುವ ಒಳಹರಿವು ವೆಚ್ಚ ಕಡಿಮೆ; ಹೆಚ್ಚುವರಿ ಬೆಲೆ ಖರೀದಿದಾರರ ನಂಬಿಕೆಗೆ ಅವಲಂಬಿತ",
        steps: [
          "Test soil and water before changing the input plan.",
          "Prepare farm-made compost or bio-inputs with clean ingredients and records.",
          "Keep soil covered with mulch or living cover and reduce bare soil.",
          "Use crop diversity, trap crops, and beneficial insects before any treatment.",
          "Record every input and harvest; never claim certified organic without certification.",
        ],
        kannadaSteps: [
          "ಒಳಹರಿವು ಯೋಜನೆ ಬದಲಿಸುವ ಮೊದಲು ಮಣ್ಣು ಮತ್ತು ನೀರಿನ ಪರೀಕ್ಷೆ ಮಾಡಿ.",
          "ಸ್ವಚ್ಛ ಪದಾರ್ಥಗಳಿಂದ ತಯಾರಿಸಿದ ಕಾಂಪೋಸ್ಟ್ ಅಥವಾ ಜೈವಿಕ ಒಳಹರಿವಿನ ದಾಖಲೆ ಇಡಿ.",
          "ಮಲ್ಚ್ ಅಥವಾ ಜೀವಂತ ಮುಚ್ಚು ಬೆಳೆಗಳಿಂದ ಮಣ್ಣನ್ನು ಮುಚ್ಚಿ, ಖಾಲಿ ಮಣ್ಣು ಕಡಿಮೆ ಮಾಡಿ.",
          "ಯಾವುದೇ ಚಿಕಿತ್ಸೆಗೂ ಮೊದಲು ಬೆಳೆ ವೈವಿಧ್ಯ, ಬಲೆ ಬೆಳೆ ಮತ್ತು ಉಪಕಾರಿ ಕೀಟ ಬಳಸಿ.",
          "ಪ್ರತಿ ಒಳಹರಿವು ಮತ್ತು ಕೊಯ್ಲು ದಾಖಲಿಸಿ; ಪ್ರಮಾಣಪತ್ರವಿಲ್ಲದೆ ಪ್ರಮಾಣಿತ ಸಾವಯವ ಎಂದು ಹೇಳಬೇಡಿ.",
        ],
      },
      {
        key: "vegetable",
        name: "Organic Vegetables",
        kannada: "ಸಾವಯವ ತರಕಾರಿಗಳು",
        icon: "carrot",
        color: "#EAF8ED",
        summary: "Short-duration vegetables can create regular cash flow when harvest planning and direct buyers are strong.",
        kannadaSummary: "ಕೊಯ್ಲು ಯೋಜನೆ ಮತ್ತು ನೇರ ಖರೀದಿದಾರರು ಉತ್ತಮವಾಗಿದ್ದರೆ ಕಡಿಮೆ ಅವಧಿಯ ತರಕಾರಿಗಳು ನಿಯಮಿತ ಹಣದ ಹರಿವು ನೀಡಬಹುದು.",
        cost: "Indicative seasonal cost: ₹25,000–₹60,000 per acre",
        kannadaCost: "ಅಂದಾಜು ಹಂಗಾಮಿ ವೆಚ್ಚ: ಎಕರೆಗೆ ₹25,000–₹60,000",
        returnLabel: "Potential gross margin: ₹40,000–₹1.2 lakh per acre/season before family labour",
        kannadaReturnLabel: "ಸಂಭಾವ್ಯ ಒಟ್ಟು ಅಂತರ: ಕುಟುಂಬದ ಕೆಲಸದ ಮೊದಲು ಎಕರೆಗೆ/ಹಂಗಾಮಿಗೆ ₹40,000–₹1.2 ಲಕ್ಷ",
        steps: [
          "Select 3–5 crops with staggered harvest dates instead of planting everything together.",
          "Use healthy seed, nursery hygiene, compost, mulch, and drip or careful irrigation.",
          "Scout twice a week and remove infected leaves or plants early.",
          "Create a weekly buyer list before harvest: households, shops, hotels, or a group order.",
          "Grade, wash safely, and pack with the harvest date and farm contact.",
        ],
        kannadaSteps: [
          "ಎಲ್ಲವನ್ನೂ ಒಂದೇ ಸಮಯದಲ್ಲಿ ನೆಡುವ ಬದಲು ಬೇರೆ ಬೇರೆ ಕೊಯ್ಲು ದಿನಾಂಕದ 3–5 ಬೆಳೆ ಆರಿಸಿ.",
          "ಆರೋಗ್ಯಕರ ಬೀಜ, ಸಸಿಮಡಿ ಸ್ವಚ್ಛತೆ, ಕಾಂಪೋಸ್ಟ್, ಮಲ್ಚ್ ಮತ್ತು ಡ್ರಿಪ್ ಅಥವಾ ಜಾಗರೂಕ ನೀರಾವರಿ ಬಳಸಿ.",
          "ವಾರಕ್ಕೆ ಎರಡು ಬಾರಿ ಪರಿಶೀಲಿಸಿ, ಸೋಂಕಿತ ಎಲೆ ಅಥವಾ ಸಸ್ಯಗಳನ್ನು ಬೇಗ ತೆಗೆದುಹಾಕಿ.",
          "ಕೊಯ್ಲಿಗೂ ಮೊದಲು ಮನೆ, ಅಂಗಡಿ, ಹೋಟೆಲ್ ಅಥವಾ ಗುಂಪು ಆರ್ಡರ್ ಖರೀದಿದಾರರ ವಾರದ ಪಟ್ಟಿಮಾಡಿ.",
          "ವಿಂಗಡಿಸಿ, ಸುರಕ್ಷಿತವಾಗಿ ತೊಳೆದು, ಕೊಯ್ಲು ದಿನಾಂಕ ಮತ್ತು ಫಾರ್ಮ್ ಸಂಪರ್ಕದೊಂದಿಗೆ ಪ್ಯಾಕ್ ಮಾಡಿ.",
        ],
      },
      {
        key: "certified",
        name: "Certified Organic",
        kannada: "ಪ್ರಮಾಣಿತ ಸಾವಯವ",
        icon: "certificate-outline",
        color: "#F0FDF4",
        summary: "A documented transition path for farmers targeting buyers who require an approved organic claim.",
        kannadaSummary: "ಅನುಮೋದಿತ ಸಾವಯವ ಗುರುತು ಬೇಕಿರುವ ಖರೀದಿದಾರರನ್ನು ಗುರಿಯಾಗಿಸುವ ರೈತರಿಗೆ ದಾಖಲೆ ಆಧಾರಿತ ಪರಿವರ್ತನಾ ವಿಧಾನ.",
        cost: "Indicative planning cost: ₹10,000–₹40,000 for records, inspection, and inputs",
        kannadaCost: "ಅಂದಾಜು ಯೋಜನಾ ವೆಚ್ಚ: ದಾಖಲೆ, ಪರಿಶೀಲನೆ ಮತ್ತು ಒಳಹರಿವಿಗೆ ₹10,000–₹40,000",
        returnLabel: "Potential premium: depends on certification, crop, buyer, volume, and quality",
        kannadaReturnLabel: "ಸಂಭಾವ್ಯ ಹೆಚ್ಚುವರಿ ಬೆಲೆ: ಪ್ರಮಾಣಪತ್ರ, ಬೆಳೆ, ಖರೀದಿದಾರ, ಪ್ರಮಾಣ ಮತ್ತು ಗುಣಮಟ್ಟಕ್ಕೆ ಅವಲಂಬಿತ",
        steps: [
          "Ask the certification group about conversion period, permitted inputs, and inspection rules.",
          "Map the plot, buffer zone, irrigation source, storage, and neighbouring risks.",
          "Keep input purchase bills, field diary, harvest records, and sales records together.",
          "Never mix certified and non-certified produce during storage or transport.",
          "Secure a buyer contract or premium channel before increasing the certified area.",
        ],
        kannadaSteps: [
          "ಪರಿವರ್ತನಾ ಅವಧಿ, ಅನುಮತಿಸಿದ ಒಳಹರಿವು ಮತ್ತು ಪರಿಶೀಲನಾ ನಿಯಮಗಳನ್ನು ಪ್ರಮಾಣೀಕರಣ ಸಂಸ್ಥೆಯಿಂದ ತಿಳಿಯಿರಿ.",
          "ಜಮೀನು, ಬಫರ್ ವಲಯ, ನೀರಿನ ಮೂಲ, ಸಂಗ್ರಹಣೆ ಮತ್ತು ಪಕ್ಕದ ಅಪಾಯಗಳನ್ನು ನಕ್ಷೆ ಮಾಡಿ.",
          "ಒಳಹರಿವು ಬಿಲ್, ಜಮೀನು ದಿನಚರಿ, ಕೊಯ್ಲು ಮತ್ತು ಮಾರಾಟ ದಾಖಲೆಗಳನ್ನು ಒಟ್ಟಿಗೆ ಇಡಿ.",
          "ಪ್ರಮಾಣಿತ ಮತ್ತು ಪ್ರಮಾಣಿತವಲ್ಲದ ಉತ್ಪನ್ನವನ್ನು ಸಂಗ್ರಹಣೆ ಅಥವಾ ಸಾಗಣೆಯಲ್ಲಿ ಎಂದಿಗೂ ಮಿಶ್ರಣ ಮಾಡಬೇಡಿ.",
          "ಪ್ರಮಾಣಿತ ಪ್ರದೇಶ ಹೆಚ್ಚಿಸುವ ಮೊದಲು ಖರೀದಿದಾರ ಒಪ್ಪಂದ ಅಥವಾ ಹೆಚ್ಚುವರಿ ಬೆಲೆ ಚಾನೆಲ್ ಪಡೆಯಿರಿ.",
        ],
      },
    ],
    sources: [
      { type: "Article", icon: "file-document-outline", title: "National Centre of Organic Farming", kannadaTitle: "ರಾಷ್ಟ್ರೀಯ ಸಾವಯವ ಕೃಷಿ ಕೇಂದ್ರ", subtitle: "Organic standards, inputs, and farmer guidance", kannadaSubtitle: "ಸಾವಯವ ಮಾನದಂಡ, ಒಳಹರಿವು ಮತ್ತು ರೈತ ಮಾರ್ಗದರ್ಶನ", url: "https://ncof.dac.gov.in/" },
      { type: "Article", icon: "certificate-outline", title: "Jaivik Bharat Organic Food", kannadaTitle: "ಜೈವಿಕ್ ಭಾರತ ಸಾವಯವ ಆಹಾರ", subtitle: "Official organic food and certification information", kannadaSubtitle: "ಅಧಿಕೃತ ಸಾವಯವ ಆಹಾರ ಮತ್ತು ಪ್ರಮಾಣೀಕರಣ ಮಾಹಿತಿ", url: "https://jaivikbharat.fssai.gov.in/" },
    ],
  },
  "modern-technology": {
    key: "modern-technology",
    eyebrow: "DATA + BETTER DECISIONS",
    kannadaEyebrow: "ದತ್ತಾಂಶ + ಉತ್ತಮ ನಿರ್ಧಾರ",
    title: "Modern Technology",
    kannadaTitle: "ಆಧುನಿಕ ತಂತ್ರಜ್ಞಾನ",
    description: "Use technology to save water, labour, and crop losses. Start with one measurable problem, not an expensive gadget.",
    kannadaDescription: "ನೀರು, ಕೆಲಸ ಮತ್ತು ಬೆಳೆ ನಷ್ಟ ಉಳಿಸಲು ತಂತ್ರಜ್ಞಾನ ಬಳಸಿ. ದುಬಾರಿ ಸಾಧನದಿಂದಲ್ಲ, ಅಳೆಯಬಹುದಾದ ಒಂದು ಸಮಸ್ಯೆಯಿಂದ ಆರಂಭಿಸಿ.",
    icon: "tractor",
    color: "indigo",
    selectorTitle: "Choose a technology",
    kannadaSelectorTitle: "ತಂತ್ರಜ್ಞಾನ ಆಯ್ಕೆ ಮಾಡಿ",
    selectorHint: "Pick the tool that solves your biggest farm bottleneck",
    kannadaSelectorHint: "ನಿಮ್ಮ ಫಾರ್ಮ್‌ನ ದೊಡ್ಡ ಸಮಸ್ಯೆ ಪರಿಹರಿಸುವ ಸಾಧನ ಆರಿಸಿ",
    optionLabel: "Technology guide",
    kannadaOptionLabel: "ತಂತ್ರಜ್ಞಾನ ಮಾರ್ಗದರ್ಶಿ",
    actionTitle: "A smart first move",
    kannadaActionTitle: "ಮೊದಲ ಬುದ್ಧಿವಂತ ಹೆಜ್ಜೆ",
    actionText: "Write down your current water use, labour hours, and crop loss for two weeks. Then trial one tool on a small area and compare the numbers before buying more.",
    kannadaActionText: "ಎರಡು ವಾರಗಳ ಪ್ರಸ್ತುತ ನೀರಿನ ಬಳಕೆ, ಕೆಲಸದ ಗಂಟೆ ಮತ್ತು ಬೆಳೆ ನಷ್ಟವನ್ನು ಬರೆಯಿರಿ. ನಂತರ ಸಣ್ಣ ಪ್ರದೇಶದಲ್ಲಿ ಒಂದು ಸಾಧನ ಪರೀಕ್ಷಿಸಿ, ಹೆಚ್ಚು ಖರೀದಿಸುವ ಮೊದಲು ಸಂಖ್ಯೆಗಳ ಹೋಲಿಕೆ ಮಾಡಿ.",
    options: [
      {
        key: "drip",
        name: "Drip Irrigation",
        kannada: "ಡ್ರಿಪ್ ನೀರಾವರಿ",
        icon: "water-outline",
        color: "#EEF2FF",
        summary: "Deliver water near the root zone and combine it with mulch, filters, and a simple irrigation schedule.",
        kannadaSummary: "ಬೇರು ಭಾಗಕ್ಕೆ ನೀರು ತಲುಪಿಸಿ, ಮಲ್ಚ್, ಫಿಲ್ಟರ್ ಮತ್ತು ಸರಳ ನೀರಾವರಿ ವೇಳಾಪಟ್ಟಿಯೊಂದಿಗೆ ಬಳಸಿ.",
        cost: "Indicative setup: ₹35,000–₹80,000 per acre before subsidy",
        kannadaCost: "ಅಂದಾಜು ಆರಂಭಿಕ ವೆಚ್ಚ: ಸಬ್ಸಿಡಿಗೂ ಮೊದಲು ಎಕರೆಗೆ ₹35,000–₹80,000",
        returnLabel: "Potential saving: 20–50% water and lower weed or labour cost, depending on crop",
        kannadaReturnLabel: "ಸಂಭಾವ್ಯ ಉಳಿತಾಯ: ಬೆಳೆಗನುಗುಣವಾಗಿ 20–50% ನೀರು ಮತ್ತು ಕಡಿಮೆ ಕಳೆ/ಕೆಲಸದ ವೆಚ್ಚ",
        steps: [
          "Check water source, pressure, filter, and soil before choosing emitter spacing.",
          "Divide the field into zones and irrigate according to crop stage and soil moisture.",
          "Clean filters and flush lines on a fixed schedule to prevent clogging.",
          "Repair leaks immediately and record water hours before and after installation.",
          "Ask the agriculture department about current subsidy eligibility before purchase.",
        ],
        kannadaSteps: [
          "ಎಮಿಟರ್ ಅಂತರ ಆಯ್ಕೆ ಮಾಡುವ ಮೊದಲು ನೀರಿನ ಮೂಲ, ಒತ್ತಡ, ಫಿಲ್ಟರ್ ಮತ್ತು ಮಣ್ಣು ಪರಿಶೀಲಿಸಿ.",
          "ಜಮೀನನ್ನು ವಲಯಗಳಾಗಿ ವಿಭಜಿಸಿ, ಬೆಳೆ ಹಂತ ಮತ್ತು ಮಣ್ಣಿನ ತೇವಾಂಶಕ್ಕೆ ತಕ್ಕಂತೆ ನೀರು ನೀಡಿ.",
          "ತಡೆ ಉಂಟಾಗದಂತೆ ಫಿಲ್ಟರ್ ಸ್ವಚ್ಛಗೊಳಿಸಿ, ಪೈಪ್‌ಗಳನ್ನು ನಿಗದಿತ ವೇಳೆಯಲ್ಲಿ ಫ್ಲಷ್ ಮಾಡಿ.",
          "ಸೋರಿಕೆಯನ್ನು ತಕ್ಷಣ ಸರಿಪಡಿಸಿ, ಅಳವಡಿಸುವ ಮೊದಲು ಮತ್ತು ನಂತರ ನೀರಿನ ಗಂಟೆ ದಾಖಲಿಸಿ.",
          "ಖರೀದಿಗೂ ಮೊದಲು ಪ್ರಸ್ತುತ ಸಬ್ಸಿಡಿ ಅರ್ಹತೆಯನ್ನು ಕೃಷಿ ಇಲಾಖೆಯಿಂದ ತಿಳಿಯಿರಿ.",
        ],
      },
      {
        key: "soil",
        name: "Soil Sensor + Weather",
        kannada: "ಮಣ್ಣಿನ ಸೆನ್ಸರ್ + ಹವಾಮಾನ",
        icon: "access-point",
        color: "#F0F4FF",
        summary: "Use simple measurements for irrigation and spray timing instead of relying only on guesswork.",
        kannadaSummary: "ಅಂದಾಜಿನ ಮೇಲೆ ಮಾತ್ರ ಅವಲಂಬಿಸದೆ ನೀರಾವರಿ ಮತ್ತು ಸಿಂಪಡಣೆ ಸಮಯಕ್ಕೆ ಸರಳ ಅಳತೆಗಳನ್ನು ಬಳಸಿ.",
        cost: "Indicative setup: ₹5,000–₹35,000 per monitoring point",
        kannadaCost: "ಅಂದಾಜು ಆರಂಭಿಕ ವೆಚ್ಚ: ಒಂದು ಮೇಲ್ವಿಚಾರಣಾ ಬಿಂದುವಿಗೆ ₹5,000–₹35,000",
        returnLabel: "Potential benefit: fewer unnecessary irrigations and better disease timing",
        kannadaReturnLabel: "ಸಂಭಾವ್ಯ ಲಾಭ: ಅನಗತ್ಯ ನೀರಾವರಿ ಕಡಿಮೆ ಮತ್ತು ರೋಗ ನಿಯಂತ್ರಣದ ಉತ್ತಮ ಸಮಯ",
        steps: [
          "Place the sensor in a representative root zone, not beside a wet inlet or boundary.",
          "Calibrate readings with a manual soil check during the first few weeks.",
          "Combine local observations with a weather forecast before spraying or irrigating.",
          "Set simple alerts for very dry soil, heavy rain, heat, or pump faults.",
          "Review the data weekly and remove the tool if it does not change a decision.",
        ],
        kannadaSteps: [
          "ಒದ್ದೆಯಾದ ಒಳಹರಿವು ಅಥವಾ ಗಡಿಯ ಪಕ್ಕದಲ್ಲಲ್ಲ, ಪ್ರತಿನಿಧಿಸುವ ಬೇರು ವಲಯದಲ್ಲಿ ಸೆನ್ಸರ್ ಇಡಿ.",
          "ಮೊದಲ ಕೆಲವು ವಾರಗಳಲ್ಲಿ ಕೈಯಿಂದ ಮಣ್ಣಿನ ಪರೀಕ್ಷೆಯೊಂದಿಗೆ ಅಳತೆಯನ್ನು ಸರಿಹೊಂದಿಸಿ.",
          "ಸಿಂಪಡಣೆ ಅಥವಾ ನೀರಾವರಿ ಮೊದಲು ಸ್ಥಳೀಯ ಗಮನವನ್ನು ಹವಾಮಾನ ಮುನ್ಸೂಚನೆಯೊಂದಿಗೆ ಸೇರಿಸಿ.",
          "ತೀವ್ರ ಒಣಮಣ್ಣು, ಭಾರಿ ಮಳೆ, ಬಿಸಿ ಅಥವಾ ಪಂಪ್ ದೋಷಕ್ಕೆ ಸರಳ ಎಚ್ಚರಿಕೆ ಹೊಂದಿಸಿ.",
          "ವಾರಕ್ಕೊಮ್ಮೆ ದತ್ತಾಂಶ ಪರಿಶೀಲಿಸಿ; ನಿರ್ಧಾರ ಬದಲಾಗದಿದ್ದರೆ ಸಾಧನ ತೆಗೆದುಹಾಕಿ.",
        ],
      },
      {
        key: "solar",
        name: "Solar Pump",
        kannada: "ಸೌರ ಪಂಪ್",
        icon: "solar-power",
        color: "#FFF7D6",
        summary: "Reduce daytime pumping electricity or diesel costs, while planning storage for cloudy days and safe water use.",
        kannadaSummary: "ಹಗಲಿನ ಪಂಪ್ ವಿದ್ಯುತ್ ಅಥವಾ ಡೀಸೆಲ್ ವೆಚ್ಚ ಕಡಿಮೆ ಮಾಡಬಹುದು; ಮೋಡದ ದಿನಗಳ ಸಂಗ್ರಹಣೆ ಮತ್ತು ನೀರಿನ ಸುರಕ್ಷಿತ ಬಳಕೆ ಯೋಜಿಸಿ.",
        cost: "Indicative setup: ₹1.5–₹4.5 lakh before subsidy, based on pump size",
        kannadaCost: "ಅಂದಾಜು ಆರಂಭಿಕ ವೆಚ್ಚ: ಪಂಪ್ ಗಾತ್ರಕ್ಕೆ ತಕ್ಕಂತೆ ಸಬ್ಸಿಡಿಗೂ ಮೊದಲು ₹1.5–₹4.5 ಲಕ್ಷ",
        returnLabel: "Potential saving: diesel/electricity cost; payback depends on usage and subsidy",
        kannadaReturnLabel: "ಸಂಭಾವ್ಯ ಉಳಿತಾಯ: ಡೀಸೆಲ್/ವಿದ್ಯುತ್ ವೆಚ್ಚ; ಮರುಪಾವತಿ ಬಳಕೆ ಮತ್ತು ಸಬ್ಸಿಡಿಗೆ ಅವಲಂಬಿತ",
        steps: [
          "Measure current pump hours, head, water need, and fuel or electricity cost.",
          "Size the pump with an approved installer; do not oversize only for peak demand.",
          "Add storage or a controlled irrigation system so free pumping does not waste water.",
          "Protect panels, cables, and pump from theft, animals, and lightning.",
          "Ask for warranty, service response time, and subsidy paperwork in writing.",
        ],
        kannadaSteps: [
          "ಪ್ರಸ್ತುತ ಪಂಪ್ ಗಂಟೆ, ಎತ್ತರ, ನೀರಿನ ಅಗತ್ಯ ಮತ್ತು ಇಂಧನ ಅಥವಾ ವಿದ್ಯುತ್ ವೆಚ್ಚ ಅಳೆಯಿರಿ.",
          "ಅನುಮೋದಿತ ಅಳವಡಿಕೆದಾರರೊಂದಿಗೆ ಪಂಪ್ ಗಾತ್ರ ಆಯ್ಕೆ ಮಾಡಿ; ಗರಿಷ್ಠ ಬೇಡಿಕೆಗಾಗಿ ಅತಿದೊಡ್ಡ ಪಂಪ್ ಬೇಡ.",
          "ಉಚಿತ ಪಂಪಿಂಗ್‌ನಿಂದ ನೀರು ವ್ಯರ್ಥವಾಗದಂತೆ ಸಂಗ್ರಹಣೆ ಅಥವಾ ನಿಯಂತ್ರಿತ ನೀರಾವರಿ ವ್ಯವಸ್ಥೆ ಸೇರಿಸಿ.",
          "ಪ್ಯಾನೆಲ್, ಕೇಬಲ್ ಮತ್ತು ಪಂಪ್ ಅನ್ನು ಕಳ್ಳತನ, ಪ್ರಾಣಿಗಳು ಮತ್ತು ಮಿಂಚಿನಿಂದ ರಕ್ಷಿಸಿ.",
          "ವಾರಂಟಿ, ಸೇವಾ ಸಮಯ ಮತ್ತು ಸಬ್ಸಿಡಿ ದಾಖಲೆಗಳನ್ನು ಬರಹದಲ್ಲಿ ಪಡೆಯಿರಿ.",
        ],
      },
    ],
    sources: [
      { type: "Article", icon: "file-document-outline", title: "PM-KUSUM Information", kannadaTitle: "PM-KUSUM ಮಾಹಿತಿ", subtitle: "Official solar pump and renewable agriculture scheme information", kannadaSubtitle: "ಸೌರ ಪಂಪ್ ಮತ್ತು ನವೀಕರಿಸಬಹುದಾದ ಕೃಷಿ ಯೋಜನೆಗಳ ಅಧಿಕೃತ ಮಾಹಿತಿ", url: "https://pmkusum.mnre.gov.in/" },
      { type: "Tool", icon: "weather-partly-cloudy", title: "India Weather Services", kannadaTitle: "ಭಾರತ ಹವಾಮಾನ ಸೇವೆಗಳು", subtitle: "Use local forecasts to improve irrigation and spray timing", kannadaSubtitle: "ನೀರಾವರಿ ಮತ್ತು ಸಿಂಪಡಣೆ ಸಮಯ ಸುಧಾರಿಸಲು ಸ್ಥಳೀಯ ಮುನ್ಸೂಚನೆ ಬಳಸಿ", url: "https://mausam.imd.gov.in/" },
    ],
  },
  "business-market": {
    key: "business-market",
    eyebrow: "SELL BETTER, PLAN BETTER",
    kannadaEyebrow: "ಉತ್ತಮ ಮಾರಾಟ, ಉತ್ತಮ ಯೋಜನೆ",
    title: "Business & Marketing",
    kannadaTitle: "ವ್ಯವಹಾರ ಮತ್ತು ಮಾರುಕಟ್ಟೆ",
    description: "Profit is not only what you grow. It is the price, timing, quality, buyer, and cost you control.",
    kannadaDescription: "ಲಾಭವೆಂದರೆ ನೀವು ಬೆಳೆಸಿದ ಪ್ರಮಾಣ ಮಾತ್ರವಲ್ಲ. ಬೆಲೆ, ಸಮಯ, ಗುಣಮಟ್ಟ, ಖರೀದಿದಾರ ಮತ್ತು ನೀವು ನಿಯಂತ್ರಿಸುವ ವೆಚ್ಚವೂ ಮುಖ್ಯ.",
    icon: "chart-line",
    color: "rose",
    selectorTitle: "Choose a sales path",
    kannadaSelectorTitle: "ಮಾರಾಟದ ವಿಧಾನ ಆಯ್ಕೆ ಮಾಡಿ",
    selectorHint: "Choose the path that matches your volume and confidence",
    kannadaSelectorHint: "ನಿಮ್ಮ ಉತ್ಪಾದನೆ ಮತ್ತು ಆತ್ಮವಿಶ್ವಾಸಕ್ಕೆ ತಕ್ಕ ವಿಧಾನ ಆಯ್ಕೆ ಮಾಡಿ",
    optionLabel: "Business guide",
    kannadaOptionLabel: "ವ್ಯವಹಾರ ಮಾರ್ಗದರ್ಶಿ",
    actionTitle: "A smart first move",
    kannadaActionTitle: "ಮೊದಲ ಬುದ್ಧಿವಂತ ಹೆಜ್ಜೆ",
    actionText: "Before planting or buying stock, call three buyers and record their grade, quantity, pickup day, payment time, and price. Use the best realistic offer in your budget.",
    kannadaActionText: "ನೆಡುವ ಅಥವಾ ಪಶು/ಮೀನು ಖರೀದಿಸುವ ಮೊದಲು ಮೂವರು ಖರೀದಿದಾರರಿಗೆ ಕರೆ ಮಾಡಿ, ಗುಣಮಟ್ಟ, ಪ್ರಮಾಣ, ತೆಗೆದುಕೊಳ್ಳುವ ದಿನ, ಪಾವತಿ ಸಮಯ ಮತ್ತು ಬೆಲೆ ದಾಖಲಿಸಿ. ನಿಮ್ಮ ಬಜೆಟ್‌ನಲ್ಲಿ ವಾಸ್ತವಿಕ ಉತ್ತಮ ಆಫರ್ ಬಳಸಿ.",
    options: [
      {
        key: "direct",
        name: "Direct to Consumer",
        kannada: "ನೇರ ಗ್ರಾಹಕ ಮಾರಾಟ",
        icon: "account-group-outline",
        color: "#FFF0F2",
        summary: "Sell boxes, subscriptions, or weekly produce directly for better margins, with more work in packing and delivery.",
        kannadaSummary: "ಪೆಟ್ಟಿಗೆ, ಚಂದಾದಾರಿಕೆ ಅಥವಾ ವಾರದ ಉತ್ಪನ್ನವನ್ನು ನೇರವಾಗಿ ಮಾರಾಟ ಮಾಡಿ; ಪ್ಯಾಕಿಂಗ್ ಮತ್ತು ವಿತರಣೆಯ ಕೆಲಸ ಹೆಚ್ಚಾಗುತ್ತದೆ.",
        cost: "Indicative setup: ₹5,000–₹30,000 for packaging, transport, and simple promotion",
        kannadaCost: "ಅಂದಾಜು ಆರಂಭಿಕ ವೆಚ್ಚ: ಪ್ಯಾಕಿಂಗ್, ಸಾಗಣೆ ಮತ್ತು ಸರಳ ಪ್ರಚಾರಕ್ಕೆ ₹5,000–₹30,000",
        returnLabel: "Potential margin: 10–35% higher than wholesale when repeat buyers are stable",
        kannadaReturnLabel: "ಸಂಭಾವ್ಯ ಅಂತರ: ನಿಯಮಿತ ಗ್ರಾಹಕರಿದ್ದರೆ ಸಗಟಿಗಿಂತ 10–35% ಹೆಚ್ಚು",
        steps: [
          "Choose one customer group and one weekly delivery day before adding many products.",
          "Publish a clear price, weight, harvest date, and replacement policy.",
          "Collect advance orders through a simple phone or messaging list.",
          "Group deliveries by route and calculate packaging, fuel, and your time.",
          "Ask every buyer for one useful review and track repeat orders.",
        ],
        kannadaSteps: [
          "ಹೆಚ್ಚು ಉತ್ಪನ್ನ ಸೇರಿಸುವ ಮೊದಲು ಒಂದು ಗ್ರಾಹಕ ಗುಂಪು ಮತ್ತು ಒಂದು ವಾರದ ವಿತರಣಾ ದಿನ ಆಯ್ಕೆ ಮಾಡಿ.",
          "ಸ್ಪಷ್ಟ ಬೆಲೆ, ತೂಕ, ಕೊಯ್ಲು ದಿನಾಂಕ ಮತ್ತು ಬದಲಾವಣೆ ನಿಯಮ ಪ್ರಕಟಿಸಿ.",
          "ಸರಳ ಫೋನ್ ಅಥವಾ ಮೆಸೇಜಿಂಗ್ ಪಟ್ಟಿಯ ಮೂಲಕ ಮುಂಗಡ ಆರ್ಡರ್ ಪಡೆಯಿರಿ.",
          "ಮಾರ್ಗದಂತೆ ವಿತರಣೆ ಗುಂಪು ಮಾಡಿ, ಪ್ಯಾಕಿಂಗ್, ಇಂಧನ ಮತ್ತು ನಿಮ್ಮ ಸಮಯ ಲೆಕ್ಕಿಸಿ.",
          "ಪ್ರತಿ ಗ್ರಾಹಕರಿಂದ ಒಂದು ಉಪಯುಕ್ತ ವಿಮರ್ಶೆ ಪಡೆದು ಮರುಆರ್ಡರ್ ದಾಖಲಿಸಿ.",
        ],
      },
      {
        key: "fpo",
        name: "FPO / Group Selling",
        kannada: "FPO / ಗುಂಪು ಮಾರಾಟ",
        icon: "account-multiple-outline",
        color: "#FCEFF5",
        summary: "Combine volume for better transport, grading, bargaining, storage, and access to larger buyers.",
        kannadaSummary: "ಹೆಚ್ಚಿನ ಪ್ರಮಾಣದಿಂದ ಸಾಗಣೆ, ವಿಂಗಡಣೆ, ಚರ್ಚೆ, ಸಂಗ್ರಹಣೆ ಮತ್ತು ದೊಡ್ಡ ಖರೀದಿದಾರರ ಪ್ರವೇಶ ಸುಧಾರಿಸಬಹುದು.",
        cost: "Indicative setup: ₹2,000–₹15,000 member contribution for collection and records",
        kannadaCost: "ಅಂದಾಜು ಆರಂಭಿಕ ವೆಚ್ಚ: ಸಂಗ್ರಹಣೆ ಮತ್ತು ದಾಖಲೆಗಾಗಿ ಸದಸ್ಯರಿಗೆ ₹2,000–₹15,000 ಕೊಡುಗೆ",
        returnLabel: "Potential benefit: lower per-unit logistics cost and stronger price negotiation",
        kannadaReturnLabel: "ಸಂಭಾವ್ಯ ಲಾಭ: ಪ್ರತಿ ಘಟಕ ಸಾಗಣೆ ವೆಚ್ಚ ಕಡಿಮೆ ಮತ್ತು ಬೆಲೆ ಮಾತುಕತೆ ಬಲವಾದುದು",
        steps: [
          "Start with a written quality standard, weighing method, and payment timeline.",
          "Nominate one transparent person for records, buyer calls, and collections.",
          "Aggregate only products that meet the agreed grade; do not hide defects.",
          "Compare at least three buyers and record deductions before accepting a deal.",
          "Reconcile member payments openly after each sale.",
        ],
        kannadaSteps: [
          "ಬರಹದ ಗುಣಮಟ್ಟ ಮಾನದಂಡ, ತೂಕ ವಿಧಾನ ಮತ್ತು ಪಾವತಿ ಸಮಯದೊಂದಿಗೆ ಆರಂಭಿಸಿ.",
          "ದಾಖಲೆ, ಖರೀದಿದಾರರ ಕರೆ ಮತ್ತು ಸಂಗ್ರಹಣೆಗೆ ಪಾರದರ್ಶಕ ಒಬ್ಬರನ್ನು ನೇಮಿಸಿ.",
          "ಒಪ್ಪಿದ ಗುಣಮಟ್ಟದ ಉತ್ಪನ್ನವನ್ನೇ ಸೇರಿಸಿ; ದೋಷಗಳನ್ನು ಮರೆಮಾಡಬೇಡಿ.",
          "ಒಪ್ಪಂದಕ್ಕೂ ಮೊದಲು ಕನಿಷ್ಠ ಮೂವರು ಖರೀದಿದಾರರನ್ನು ಹೋಲಿಸಿ, ಕಡಿತಗಳನ್ನು ದಾಖಲಿಸಿ.",
          "ಪ್ರತಿ ಮಾರಾಟದ ನಂತರ ಸದಸ್ಯರ ಪಾವತಿಯನ್ನು ಬಹಿರಂಗವಾಗಿ ಹೊಂದಾಣಿಕೆ ಮಾಡಿ.",
        ],
      },
      {
        key: "value",
        name: "Value Addition",
        kannada: "ಮೌಲ್ಯವರ್ಧಿತ ಉತ್ಪನ್ನ",
        icon: "package-variant-closed",
        color: "#FFF3F5",
        summary: "Clean, grade, process, or package farm products to extend shelf life and create a recognisable local brand.",
        kannadaSummary: "ಉತ್ಪನ್ನವನ್ನು ಸ್ವಚ್ಛಗೊಳಿಸಿ, ವಿಂಗಡಿಸಿ, ಸಂಸ್ಕರಿಸಿ ಅಥವಾ ಪ್ಯಾಕ್ ಮಾಡಿ ಸಂಗ್ರಹ ಅವಧಿ ಮತ್ತು ಸ್ಥಳೀಯ ಬ್ರ್ಯಾಂಡ್ ಮೌಲ್ಯ ಹೆಚ್ಚಿಸಿ.",
        cost: "Indicative setup: ₹20,000–₹2 lakh depending on equipment and licence",
        kannadaCost: "ಅಂದಾಜು ಆರಂಭಿಕ ವೆಚ್ಚ: ಉಪಕರಣ ಮತ್ತು ಪರವಾನಗಿಗೆ ಅನುಗುಣವಾಗಿ ₹20,000–₹2 ಲಕ್ಷ",
        returnLabel: "Potential margin: higher price, but packaging, compliance, wastage, and labour must be counted",
        kannadaReturnLabel: "ಸಂಭಾವ್ಯ ಅಂತರ: ಬೆಲೆ ಹೆಚ್ಚಾಗಬಹುದು; ಪ್ಯಾಕಿಂಗ್, ನಿಯಮ, ವ್ಯರ್ಥ ಮತ್ತು ಕೆಲಸದ ವೆಚ್ಚ ಲೆಕ್ಕಿಸಬೇಕು",
        steps: [
          "Validate demand with a small paid batch before buying equipment.",
          "Calculate raw material, labour, packaging, transport, licence, wastage, and your time.",
          "Use a consistent recipe or grade and record batch dates for traceability.",
          "Follow food safety, labelling, and local licence requirements.",
          "Start with one product and one sales channel; expand after repeat orders.",
        ],
        kannadaSteps: [
          "ಉಪಕರಣ ಖರೀದಿಸುವ ಮೊದಲು ಸಣ್ಣ ಪಾವತಿ ಬ್ಯಾಚ್ ಮೂಲಕ ಬೇಡಿಕೆ ಪರೀಕ್ಷಿಸಿ.",
          "ಕಚ್ಚಾ ವಸ್ತು, ಕೆಲಸ, ಪ್ಯಾಕಿಂಗ್, ಸಾಗಣೆ, ಪರವಾನಗಿ, ವ್ಯರ್ಥ ಮತ್ತು ನಿಮ್ಮ ಸಮಯ ಲೆಕ್ಕಿಸಿ.",
          "ಒಂದೇ ರೀತಿಯ ಪಾಕವಿಧಾನ ಅಥವಾ ಗುಣಮಟ್ಟ ಬಳಸಿ, ಪತ್ತೆಹಚ್ಚಲು ಬ್ಯಾಚ್ ದಿನಾಂಕ ದಾಖಲಿಸಿ.",
          "ಆಹಾರ ಸುರಕ್ಷತೆ, ಲೇಬಲ್ ಮತ್ತು ಸ್ಥಳೀಯ ಪರವಾನಗಿ ನಿಯಮ ಪಾಲಿಸಿ.",
          "ಒಂದು ಉತ್ಪನ್ನ ಮತ್ತು ಒಂದು ಮಾರಾಟ ಚಾನೆಲ್‌ನಿಂದ ಆರಂಭಿಸಿ; ಮರುಆರ್ಡರ್ ನಂತರ ವಿಸ್ತರಿಸಿ.",
        ],
      },
    ],
    sources: [
      { type: "Tool", icon: "chart-box-outline", title: "AGMARKNET Prices", kannadaTitle: "AGMARKNET ಬೆಲೆಗಳು", subtitle: "Check mandi arrivals and reported market prices", kannadaSubtitle: "ಮಂಡಿ ಆಗಮನ ಮತ್ತು ವರದಿಯಾದ ಮಾರುಕಟ್ಟೆ ಬೆಲೆ ಪರಿಶೀಲಿಸಿ", url: "https://agmarknet.gov.in/" },
      { type: "Article", icon: "storefront-outline", title: "eNAM Market", kannadaTitle: "eNAM ಮಾರುಕಟ್ಟೆ", subtitle: "Official electronic agriculture market information", kannadaSubtitle: "ಅಧಿಕೃತ ಎಲೆಕ್ಟ್ರಾನಿಕ್ ಕೃಷಿ ಮಾರುಕಟ್ಟೆ ಮಾಹಿತಿ", url: "https://enam.gov.in/web/" },
    ],
  },
  "agro-products": {
    key: "agro-products",
    eyebrow: "TURN HARVEST INTO VALUE",
    kannadaEyebrow: "ಕೊಯ್ಲನ್ನು ಮೌಲ್ಯವಾಗಿಸಿ",
    title: "Agro Products",
    kannadaTitle: "ಕೃಷಿ ಉತ್ಪನ್ನಗಳು",
    description: "Convert farm produce into clean, useful products with better shelf life, clearer pricing, and a local brand.",
    kannadaDescription: "ಕೃಷಿ ಉತ್ಪನ್ನಗಳನ್ನು ಸ್ವಚ್ಛ, ಉಪಯುಕ್ತ ವಸ್ತುಗಳಾಗಿ ಪರಿವರ್ತಿಸಿ; ಸಂಗ್ರಹ ಅವಧಿ, ಬೆಲೆ ಮತ್ತು ಸ್ಥಳೀಯ ಬ್ರ್ಯಾಂಡ್ ಮೌಲ್ಯ ಹೆಚ್ಚಿಸಿ.",
    icon: "factory",
    color: "orange",
    selectorTitle: "Choose a product idea",
    kannadaSelectorTitle: "ಉತ್ಪನ್ನದ ಕಲ್ಪನೆ ಆಯ್ಕೆ ಮಾಡಿ",
    selectorHint: "Start with the raw material you can source consistently",
    kannadaSelectorHint: "ನಿರಂತರವಾಗಿ ಸಿಗುವ ಕಚ್ಚಾ ವಸ್ತುವಿನಿಂದ ಆರಂಭಿಸಿ",
    optionLabel: "Product guide",
    kannadaOptionLabel: "ಉತ್ಪನ್ನ ಮಾರ್ಗದರ್ಶಿ",
    actionTitle: "A smart first move",
    kannadaActionTitle: "ಮೊದಲ ಬುದ್ಧಿವಂತ ಹೆಜ್ಜೆ",
    actionText: "Make a 20-unit paid trial before buying machines. Write down raw material weight, finished weight, labour, packaging, transport, wastage, selling price, and repeat orders.",
    kannadaActionText: "ಯಂತ್ರ ಖರೀದಿಸುವ ಮೊದಲು 20 ಘಟಕಗಳ ಪಾವತಿ ಪರೀಕ್ಷೆ ಮಾಡಿ. ಕಚ್ಚಾ ವಸ್ತು ತೂಕ, ಸಿದ್ಧ ಉತ್ಪನ್ನ ತೂಕ, ಕೆಲಸ, ಪ್ಯಾಕಿಂಗ್, ಸಾಗಣೆ, ವ್ಯರ್ಥ, ಮಾರಾಟ ಬೆಲೆ ಮತ್ತು ಮರುಆರ್ಡರ್ ದಾಖಲಿಸಿ.",
    options: [
      {
        key: "spices",
        name: "Cleaned Spice Powders",
        kannada: "ಸ್ವಚ್ಛ ಮಸಾಲೆ ಪುಡಿ",
        icon: "shaker-outline",
        color: "#FFF0E1",
        summary: "Clean, dry, grind, and pack chilli, turmeric, coriander, or local spice blends with a traceable batch.",
        kannadaSummary: "ಮೆಣಸಿನಕಾಯಿ, ಅರಿಶಿನ, ಕೊತ್ತಂಬರಿ ಅಥವಾ ಸ್ಥಳೀಯ ಮಸಾಲೆ ಮಿಶ್ರಣವನ್ನು ಸ್ವಚ್ಛಗೊಳಿಸಿ, ಒಣಗಿಸಿ, ಪುಡಿ ಮಾಡಿ ಮತ್ತು ಬ್ಯಾಚ್ ದಾಖಲೆಯೊಂದಿಗೆ ಪ್ಯಾಕ್ ಮಾಡಿ.",
        cost: "Indicative starter setup: ₹35,000–₹1.5 lakh",
        kannadaCost: "ಅಂದಾಜು ಆರಂಭಿಕ ವ್ಯವಸ್ಥೆ: ₹35,000–₹1.5 ಲಕ್ಷ",
        returnLabel: "Potential gross margin: 15–35% before labour, wastage, licence, and delivery",
        kannadaReturnLabel: "ಸಂಭಾವ್ಯ ಒಟ್ಟು ಅಂತರ: ಕೆಲಸ, ವ್ಯರ್ಥ, ಪರವಾನಗಿ ಮತ್ತು ವಿತರಣೆಯ ಮೊದಲು 15–35%",
        steps: [
          "Choose one spice and one pack size; confirm local demand before buying a grinder.",
          "Buy clean raw material, dry it safely, and reject mouldy or contaminated lots.",
          "Use food-grade equipment and keep raw and finished products separate.",
          "Print batch date, net weight, ingredients, contact, and required food label details.",
          "Sell a small paid batch to shops or households and record repeat orders and complaints.",
        ],
        kannadaSteps: [
          "ಒಂದು ಮಸಾಲೆ ಮತ್ತು ಒಂದು ಪ್ಯಾಕ್ ಗಾತ್ರದಿಂದ ಆರಂಭಿಸಿ; ಗ್ರೈಂಡರ್ ಖರೀದಿಸುವ ಮೊದಲು ಸ್ಥಳೀಯ ಬೇಡಿಕೆ ಪರಿಶೀಲಿಸಿ.",
          "ಸ್ವಚ್ಛ ಕಚ್ಚಾ ವಸ್ತು ಖರೀದಿಸಿ, ಸುರಕ್ಷಿತವಾಗಿ ಒಣಗಿಸಿ, ಹುಳು ಅಥವಾ ಮಾಲಿನ್ಯ ಇರುವ ವಸ್ತು ತಿರಸ್ಕರಿಸಿ.",
          "ಆಹಾರ ದರ್ಜೆಯ ಉಪಕರಣ ಬಳಸಿ, ಕಚ್ಚಾ ಮತ್ತು ಸಿದ್ಧ ಉತ್ಪನ್ನವನ್ನು ಬೇರ್ಪಡಿಸಿ.",
          "ಬ್ಯಾಚ್ ದಿನಾಂಕ, ನಿವ್ವಳ ತೂಕ, ಪದಾರ್ಥ, ಸಂಪರ್ಕ ಮತ್ತು ಅಗತ್ಯ ಆಹಾರ ಲೇಬಲ್ ವಿವರ ಮುದ್ರಿಸಿ.",
          "ಅಂಗಡಿ ಅಥವಾ ಮನೆಗಳಿಗೆ ಸಣ್ಣ ಪಾವತಿ ಬ್ಯಾಚ್ ಮಾರಾಟ ಮಾಡಿ, ಮರುಆರ್ಡರ್ ಮತ್ತು ದೂರು ದಾಖಲಿಸಿ.",
        ],
      },
      {
        key: "flour",
        name: "Flour and Millet Mix",
        kannada: "ಹಿಟ್ಟು ಮತ್ತು ಸಿರಿಧಾನ್ಯ ಮಿಶ್ರಣ",
        icon: "grain",
        color: "#FFF7E5",
        summary: "Create clean, convenient flour mixes from millets, pulses, maize, or other local grains with clear preparation instructions.",
        kannadaSummary: "ಸಿರಿಧಾನ್ಯ, ಬೇಳೆ, ಮೆಕ್ಕೆಜೋಳ ಅಥವಾ ಸ್ಥಳೀಯ ಧಾನ್ಯಗಳಿಂದ ಸ್ವಚ್ಛ, ಸುಲಭ ಹಿಟ್ಟು ಮಿಶ್ರಣ ಮಾಡಿ; ತಯಾರಿಸುವ ಸೂಚನೆ ಸ್ಪಷ್ಟವಾಗಿರಲಿ.",
        cost: "Indicative starter setup: ₹25,000–₹1.2 lakh",
        kannadaCost: "ಅಂದಾಜು ಆರಂಭಿಕ ವ್ಯವಸ್ಥೆ: ₹25,000–₹1.2 ಲಕ್ಷ",
        returnLabel: "Potential gross margin: 10–30%; shelf life and moisture control decide losses",
        kannadaReturnLabel: "ಸಂಭಾವ್ಯ ಒಟ್ಟು ಅಂತರ: 10–30%; ಸಂಗ್ರಹ ಅವಧಿ ಮತ್ತು ತೇವಾಂಶ ನಿಯಂತ್ರಣ ನಷ್ಟ ನಿರ್ಧರಿಸುತ್ತದೆ",
        steps: [
          "Select a recipe based on one customer need, such as dosa, porridge, or baking mix.",
          "Clean, grade, and dry grains before milling; test moisture and avoid damp storage.",
          "Record the recipe by weight so every batch tastes and cooks consistently.",
          "Use sealed food-grade packaging with a simple cooking instruction and date.",
          "Test the product with local shops, self-help groups, and households before scaling.",
        ],
        kannadaSteps: [
          "ದೋಸೆ, ಗಂಜಿ ಅಥವಾ ಬೇಕರಿ ಮಿಶ್ರಣದಂತಹ ಒಂದು ಗ್ರಾಹಕ ಅಗತ್ಯದ ಆಧಾರದ ಮೇಲೆ ಪಾಕವಿಧಾನ ಆಯ್ಕೆ ಮಾಡಿ.",
          "ಅರೆಯುವ ಮೊದಲು ಧಾನ್ಯ ಸ್ವಚ್ಛಗೊಳಿಸಿ, ವಿಂಗಡಿಸಿ ಮತ್ತು ಒಣಗಿಸಿ; ತೇವಾಂಶ ಪರೀಕ್ಷಿಸಿ.",
          "ಪ್ರತಿ ಬ್ಯಾಚ್ ರುಚಿ ಮತ್ತು ಬೇಯುವಿಕೆ ಒಂದೇ ಇರಲು ತೂಕದಂತೆ ಪಾಕವಿಧಾನ ದಾಖಲಿಸಿ.",
          "ದಿನಾಂಕ ಮತ್ತು ಸರಳ ಅಡುಗೆ ಸೂಚನೆಯೊಂದಿಗೆ ಮುಚ್ಚಿದ ಆಹಾರ ದರ್ಜೆಯ ಪ್ಯಾಕಿಂಗ್ ಬಳಸಿ.",
          "ವಿಸ್ತರಿಸುವ ಮೊದಲು ಸ್ಥಳೀಯ ಅಂಗಡಿ, ಸ್ವಸಹಾಯ ಗುಂಪು ಮತ್ತು ಮನೆಗಳಲ್ಲಿ ಪರೀಕ್ಷಿಸಿ.",
        ],
      },
      {
        key: "dried",
        name: "Dried Fruits and Vegetables",
        kannada: "ಒಣಗಿಸಿದ ಹಣ್ಣು ಮತ್ತು ತರಕಾರಿಗಳು",
        icon: "fruit-cherries",
        color: "#FFF1E8",
        summary: "Extend the selling window for seasonal produce by drying it hygienically and packing it in small, useful portions.",
        kannadaSummary: "ಋತುಮಾನದ ಉತ್ಪನ್ನವನ್ನು ಸ್ವಚ್ಛವಾಗಿ ಒಣಗಿಸಿ ಸಣ್ಣ ಉಪಯುಕ್ತ ಪ್ಯಾಕ್‌ಗಳಲ್ಲಿ ಮಾರಾಟ ಮಾಡುವ ಮೂಲಕ ಮಾರಾಟ ಅವಧಿ ಹೆಚ್ಚಿಸಿ.",
        cost: "Indicative starter setup: ₹20,000–₹1 lakh",
        kannadaCost: "ಅಂದಾಜು ಆರಂಭಿಕ ವ್ಯವಸ್ಥೆ: ₹20,000–₹1 ಲಕ್ಷ",
        returnLabel: "Potential gross margin: 20–45%; count drying loss, power, packaging, and unsold stock",
        kannadaReturnLabel: "ಸಂಭಾವ್ಯ ಒಟ್ಟು ಅಂತರ: 20–45%; ಒಣಗಿಸುವ ನಷ್ಟ, ವಿದ್ಯುತ್, ಪ್ಯಾಕಿಂಗ್ ಮತ್ತು ಮಾರಾಟವಾಗದ ಸಂಗ್ರಹ ಲೆಕ್ಕಿಸಿ",
        steps: [
          "Choose produce that has a seasonal surplus and a known local buyer.",
          "Wash, sort, slice uniformly, and dry on clean food-safe surfaces or equipment.",
          "Measure fresh weight, dried weight, drying time, and final moisture for each batch.",
          "Use moisture-proof packaging and store away from heat, pests, and sunlight.",
          "Sell sample packs first and collect feedback on taste, size, price, and shelf life.",
        ],
        kannadaSteps: [
          "ಋತುಮಾನದ ಹೆಚ್ಚುವರಿ ಉತ್ಪನ್ನ ಮತ್ತು ಸ್ಥಳೀಯವಾಗಿ ತಿಳಿದಿರುವ ಖರೀದಿದಾರ ಇರುವ ವಸ್ತು ಆಯ್ಕೆ ಮಾಡಿ.",
          "ಸ್ವಚ್ಛ ಆಹಾರ ಸುರಕ್ಷಿತ ಮೇಲ್ಮೈ ಅಥವಾ ಉಪಕರಣದಲ್ಲಿ ತೊಳೆದು, ವಿಂಗಡಿಸಿ, ಸಮವಾಗಿ ಕತ್ತರಿಸಿ ಒಣಗಿಸಿ.",
          "ಪ್ರತಿ ಬ್ಯಾಚ್‌ಗೆ ತಾಜಾ ತೂಕ, ಒಣ ತೂಕ, ಒಣಗಿಸುವ ಸಮಯ ಮತ್ತು ಅಂತಿಮ ತೇವಾಂಶ ಅಳೆಯಿರಿ.",
          "ತೇವಾಂಶ ತಡೆಯುವ ಪ್ಯಾಕಿಂಗ್ ಬಳಸಿ, ಬಿಸಿ, ಕೀಟ ಮತ್ತು ಸೂರ್ಯನ ಬೆಳಕಿನಿಂದ ದೂರ ಸಂಗ್ರಹಿಸಿ.",
          "ರುಚಿ, ಗಾತ್ರ, ಬೆಲೆ ಮತ್ತು ಸಂಗ್ರಹ ಅವಧಿಯ ಅಭಿಪ್ರಾಯಕ್ಕಾಗಿ ಮೊದಲು ಮಾದರಿ ಪ್ಯಾಕ್ ಮಾರಾಟ ಮಾಡಿ.",
        ],
      },
    ],
    sources: [
      { type: "Article", icon: "food-variant", title: "FSSAI Food Business Guidance", kannadaTitle: "FSSAI ಆಹಾರ ವ್ಯವಹಾರ ಮಾರ್ಗದರ್ಶನ", subtitle: "Food safety, registration, hygiene, and labelling information", kannadaSubtitle: "ಆಹಾರ ಸುರಕ್ಷತೆ, ನೋಂದಣಿ, ಸ್ವಚ್ಛತೆ ಮತ್ತು ಲೇಬಲ್ ಮಾಹಿತಿ", url: "https://www.fssai.gov.in/" },
      { type: "Article", icon: "finance", title: "PMFME Scheme", kannadaTitle: "PMFME ಯೋಜನೆ", subtitle: "Official micro food-processing support and scheme information", kannadaSubtitle: "ಸಣ್ಣ ಆಹಾರ ಸಂಸ್ಕರಣಾ ಘಟಕಗಳಿಗೆ ಅಧಿಕೃತ ಸಹಾಯ ಮತ್ತು ಯೋಜನೆ ಮಾಹಿತಿ", url: "https://pmfme.mofpi.gov.in/" },
      { type: "Tool", icon: "storefront-outline", title: "eNAM Market", kannadaTitle: "eNAM ಮಾರುಕಟ್ಟೆ", subtitle: "Check market information before deciding your product and price", kannadaSubtitle: "ಉತ್ಪನ್ನ ಮತ್ತು ಬೆಲೆ ನಿರ್ಧರಿಸುವ ಮೊದಲು ಮಾರುಕಟ್ಟೆ ಮಾಹಿತಿ ಪರಿಶೀಲಿಸಿ", url: "https://enam.gov.in/web/" },
    ],
  },
};

const theme = {
  amber: { header: "bg-amber-800", button: "bg-amber-700", soft: "bg-amber-100", text: "text-amber-800", icon: "#B45309", border: "border-amber-700" },
  emerald: { header: "bg-emerald-900", button: "bg-emerald-800", soft: "bg-emerald-100", text: "text-emerald-800", icon: "#047857", border: "border-emerald-700" },
  indigo: { header: "bg-indigo-900", button: "bg-indigo-800", soft: "bg-indigo-100", text: "text-indigo-800", icon: "#4338CA", border: "border-indigo-700" },
  rose: { header: "bg-rose-900", button: "bg-rose-800", soft: "bg-rose-100", text: "text-rose-800", icon: "#BE123C", border: "border-rose-700" },
  orange: { header: "bg-orange-900", button: "bg-orange-800", soft: "bg-orange-100", text: "text-orange-800", icon: "#C2410C", border: "border-orange-700" },
};

export default function LearningTopicScreen({ topicKey }: { topicKey: TopicKey }) {
  const topic = topics[topicKey];
  const colors = theme[topic.color];
  const router = useRouter();
  const [language, setLanguage] = useState<Language>("en");
  const [selectedKey, setSelectedKey] = useState(topic.options[0].key);
  const selected = topic.options.find((item) => item.key === selectedKey) ?? topic.options[0];
  const isKannada = language === "kn";
  const videoUrl = isKannada
    ? `https://www.youtube.com/results?search_query=Kannada+${encodeURIComponent(topic.kannadaTitle)}+Karnataka`
    : `https://www.youtube.com/results?search_query=scientific+${encodeURIComponent(topic.title)}+India`;
  const sources: Source[] = [
    ...topic.sources,
    {
      type: "Video",
      icon: "play-circle-outline",
      title: `${topic.title} videos`,
      kannadaTitle: `ಕನ್ನಡ ${topic.kannadaTitle} ವಿಡಿಯೋಗಳು`,
      subtitle: "Practical video search for farmers",
      kannadaSubtitle: "ರೈತರಿಗೆ ಪ್ರಾಯೋಗಿಕ ಕನ್ನಡ ವಿಡಿಯೋ ಹುಡುಕಾಟ",
      url: videoUrl,
    },
  ];

  const openSource = async (url: string) => {
    await WebBrowser.openBrowserAsync(url, {
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
      controlsColor: colors.icon,
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FAFAF9]">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 36 }}>
        <View className={`${colors.header} px-5 pb-7 pt-3`}>
          <View className="flex-row items-center justify-between">
            <Pressable accessibilityLabel="Go back" onPress={() => router.back()} className={`h-11 w-11 items-center justify-center rounded-full ${colors.button}`}>
              <MaterialCommunityIcons name="arrow-left" size={23} color="white" />
            </Pressable>
            <View className="flex-1 px-4">
              <Text className="text-xs font-semibold uppercase tracking-widest text-white/70">{isKannada ? topic.kannadaEyebrow : topic.eyebrow}</Text>
              <Text className="mt-1 text-2xl font-bold text-white">{isKannada ? topic.kannadaTitle : topic.title}</Text>
            </View>
            <View className={`h-11 w-11 items-center justify-center rounded-full ${colors.button}`}><MaterialCommunityIcons name={topic.icon} size={25} color="white" /></View>
          </View>
          <Text className="mt-5 text-sm leading-5 text-white/80">{isKannada ? topic.kannadaDescription : topic.description}</Text>
        </View>

        <View className="px-5 pt-5">
          <View className="flex-row items-center justify-between">
            <Text className="text-base font-bold text-gray-800">{isKannada ? "ಭಾಷೆ ಆಯ್ಕೆ ಮಾಡಿ" : "Choose language"}</Text>
            <View className="flex-row rounded-xl bg-gray-200 p-1">
              <Pressable onPress={() => setLanguage("en")} className={`rounded-lg px-4 py-2 ${!isKannada ? "bg-white" : ""}`}><Text className={`text-sm font-bold ${!isKannada ? colors.text : "text-gray-500"}`}>English</Text></Pressable>
              <Pressable onPress={() => setLanguage("kn")} className={`rounded-lg px-4 py-2 ${isKannada ? "bg-white" : ""}`}><Text className={`text-sm font-bold ${isKannada ? colors.text : "text-gray-500"}`}>ಕನ್ನಡ</Text></Pressable>
            </View>
          </View>

          <Text className="mt-7 text-xl font-bold text-gray-900">{isKannada ? topic.kannadaSelectorTitle : topic.selectorTitle}</Text>
          <Text className="mt-1 text-sm text-gray-500">{isKannada ? topic.kannadaSelectorHint : topic.selectorHint}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-4 -mr-5">
            {topic.options.map((item) => {
              const active = item.key === selectedKey;
              return <Pressable key={item.key} onPress={() => setSelectedKey(item.key)} className={`mr-3 min-w-[132px] rounded-2xl border p-3 ${active ? `${colors.border} ${colors.button}` : "border-transparent"}`} style={!active ? { backgroundColor: item.color } : undefined}><MaterialCommunityIcons name={item.icon} size={26} color={active ? "white" : colors.icon} /><Text className={`mt-2 text-sm font-bold ${active ? "text-white" : "text-gray-800"}`}>{isKannada ? item.kannada : item.name}</Text></Pressable>;
            })}
          </ScrollView>

          <View className="mt-6 rounded-3xl bg-white p-5 shadow-sm">
            <View className="flex-row items-center"><View className={`h-14 w-14 items-center justify-center rounded-2xl ${colors.soft}`}><MaterialCommunityIcons name={selected.icon} size={31} color={colors.icon} /></View><View className="ml-4 flex-1"><Text className="text-2xl font-bold text-gray-900">{isKannada ? selected.kannada : selected.name}</Text><Text className={`mt-1 text-xs font-semibold uppercase tracking-wide ${colors.text}`}>{isKannada ? topic.kannadaOptionLabel : topic.optionLabel}</Text></View></View>
            <Text className="mt-5 text-sm leading-6 text-gray-600">{isKannada ? selected.kannadaSummary : selected.summary}</Text>
            <View className="mt-5 flex-row"><View className="mr-3 flex-1 rounded-2xl bg-orange-50 p-3"><MaterialCommunityIcons name="cash-minus" size={21} color="#C2410C" /><Text className="mt-2 text-xs font-bold uppercase text-orange-700">{isKannada ? "ವೆಚ್ಚ" : "Cost"}</Text><Text className="mt-1 text-xs leading-4 text-orange-950">{isKannada ? selected.kannadaCost : selected.cost}</Text></View><View className="ml-1 flex-1 rounded-2xl bg-emerald-50 p-3"><MaterialCommunityIcons name="chart-line" size={21} color="#047857" /><Text className="mt-2 text-xs font-bold uppercase text-emerald-700">{isKannada ? "ಆದಾಯ / ಉಳಿತಾಯ" : "Return / saving"}</Text><Text className="mt-1 text-xs leading-4 text-emerald-950">{isKannada ? selected.kannadaReturnLabel : selected.returnLabel}</Text></View></View>
            <Text className="mt-6 text-lg font-bold text-gray-900">{isKannada ? "ಹಂತ ಹಂತದ ವಿಧಾನ" : "Step-by-step method"}</Text><View className="mt-3">{(isKannada ? selected.kannadaSteps : selected.steps).map((step, index) => <View key={step} className="mb-4 flex-row"><View className={`mr-3 h-7 w-7 items-center justify-center rounded-full ${colors.soft}`}><Text className={`text-sm font-bold ${colors.text}`}>{index + 1}</Text></View><Text className="flex-1 text-sm leading-5 text-gray-700">{step}</Text></View>)}</View>
          </View>

          <View className={`mt-5 flex-row rounded-2xl ${colors.soft} p-4`}><MaterialCommunityIcons name="lightbulb-on-outline" size={21} color={colors.icon} /><View className="ml-3 flex-1"><Text className={`text-sm font-bold ${colors.text}`}>{isKannada ? topic.kannadaActionTitle : topic.actionTitle}</Text><Text className="mt-1 text-xs leading-5 text-gray-700">{isKannada ? topic.kannadaActionText : topic.actionText}</Text></View></View>

          <Text className="mt-7 text-xl font-bold text-gray-900">{isKannada ? "ವಿಶ್ವಾಸಾರ್ಹ ಮೂಲಗಳು" : "Trusted resources"}</Text><Text className="mt-1 text-sm text-gray-500">{isKannada ? "ಲೇಖನ, ಸಾಧನ ಮತ್ತು ಕನ್ನಡ ವಿಡಿಯೋ ಹುಡುಕಾಟ" : "Articles, tools, and language-matched video search"}</Text>
          {sources.map((source) => <Pressable key={source.title} onPress={() => openSource(source.url)} className="mt-3 flex-row items-center rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"><View className={`h-11 w-11 items-center justify-center rounded-xl ${colors.soft}`}><MaterialCommunityIcons name={source.icon} size={23} color={colors.icon} /></View><View className="ml-3 flex-1"><View className="flex-row items-center"><Text className={`mr-2 text-xs font-bold uppercase tracking-wide ${colors.text}`}>{isKannada ? (source.type === "Article" ? "ಲೇಖನ" : source.type === "Video" ? "ವಿಡಿಯೋ" : "ಸಾಧನ") : source.type}</Text><MaterialCommunityIcons name="shield-check-outline" size={14} color="#16A34A" /></View><Text className="mt-1 text-base font-bold text-gray-800">{isKannada ? source.kannadaTitle : source.title}</Text><Text className="mt-1 text-xs leading-4 text-gray-500">{isKannada ? source.kannadaSubtitle : source.subtitle}</Text></View><MaterialCommunityIcons name="chevron-right" size={22} color="#9CA3AF" /></Pressable>)}
          <View className="mt-5 flex-row rounded-2xl bg-amber-50 p-4"><MaterialCommunityIcons name="information-outline" size={20} color="#A16207" /><Text className="ml-3 flex-1 text-xs leading-5 text-amber-900">{isKannada ? "ಇವು ಅಂದಾಜು ಮಾಹಿತಿ ಮಾತ್ರ. ನಿಮ್ಮ ಸ್ಥಳೀಯ ಬೆಲೆ, ಕಾರ್ಮಿಕ, ವಿದ್ಯುತ್, ಒಳಹರಿವು ಮತ್ತು ಮಾರುಕಟ್ಟೆ ವೆಚ್ಚ ದಾಖಲಿಸಿ ನಿಜವಾದ ಲಾಭ ಲೆಕ್ಕಿಸಿ." : "These are indicative estimates only. Record your local prices, labour, electricity, inputs, and market costs to calculate real profit."}</Text></View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
