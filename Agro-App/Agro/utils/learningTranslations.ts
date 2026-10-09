export type LearningLanguage = "en" | "kn" | "hi" | "ta" | "te" | "ml" | "mr";

type LearningUi = {
  chooseLanguage: string;
  selectCrop: string;
  selectBreed: string;
  selectFish: string;
  simpleGuidance: string;
  matchBreed: string;
  matchFish: string;
  cropGuide: string;
  breedGuide: string;
  enterpriseGuide: string;
  steps: string;
  dailyManagement: string;
  learnMore: string;
  trustedResources: string;
  cost: string;
  profit: string;
  detailedContentNote: string;
};

const translations: Record<LearningLanguage, LearningUi> = {
  en: {
    chooseLanguage: "Choose language",
    selectCrop: "Select a crop",
    selectBreed: "Select a breed",
    selectFish: "Select a fish enterprise",
    simpleGuidance: "Simple guidance for your field",
    matchBreed: "Match the breed to your feed, climate, and market",
    matchFish: "Match the option to your pond, water, and market",
    cropGuide: "Crop guide",
    breedGuide: "Breed guide",
    enterpriseGuide: "Enterprise guide",
    steps: "Step-by-step method",
    dailyManagement: "Daily management",
    learnMore: "Learn more",
    trustedResources: "Trusted resources",
    cost: "Cost",
    profit: "लाभ",
    detailedContentNote: "Detailed topic content is available in English and Kannada.",
  },
  kn: {
    chooseLanguage: "ಭಾಷೆ ಆಯ್ಕೆ ಮಾಡಿ",
    selectCrop: "ಬೆಳೆ ಆಯ್ಕೆ ಮಾಡಿ",
    selectBreed: "ತಳಿ ಆಯ್ಕೆ ಮಾಡಿ",
    selectFish: "ಮೀನು ಸಾಕಾಣಿಕೆ ಆಯ್ಕೆ ಮಾಡಿ",
    simpleGuidance: "ನಿಮ್ಮ ಬೆಳೆಗೆ ಸರಳ ಮಾರ್ಗದರ್ಶನ",
    matchBreed: "ನಿಮ್ಮ ಮೇವು, ಹವಾಮಾನ ಮತ್ತು ಮಾರುಕಟ್ಟೆಗೆ ತಕ್ಕಂತೆ",
    matchFish: "ನಿಮ್ಮ ಕೊಳ, ನೀರು ಮತ್ತು ಮಾರುಕಟ್ಟೆಗೆ ತಕ್ಕಂತೆ",
    cropGuide: "ಬೆಳೆ ಮಾರ್ಗದರ್ಶಿ",
    breedGuide: "ತಳಿ ಮಾರ್ಗದರ್ಶಿ",
    enterpriseGuide: "ಸಾಕಾಣಿಕೆ ಮಾರ್ಗದರ್ಶಿ",
    steps: "ಹಂತ ಹಂತದ ವಿಧಾನ",
    dailyManagement: "ದಿನನಿತ್ಯದ ನಿರ್ವಹಣೆ",
    learnMore: "ಇನ್ನಷ್ಟು ಕಲಿಯಿರಿ",
    trustedResources: "ವಿಶ್ವಾಸಾರ್ಹ ಮೂಲಗಳು",
    cost: "ವೆಚ್ಚ",
    profit: "ಲಾಭ",
    detailedContentNote: "ವಿವರವಾದ ವಿಷಯ ಇಂಗ್ಲಿಷ್ ಮತ್ತು ಕನ್ನಡದಲ್ಲಿ ಲಭ್ಯವಿದೆ.",
  },
  hi: {
    chooseLanguage: "भाषा चुनें",
    selectCrop: "फसल चुनें",
    selectBreed: "नस्ल चुनें",
    selectFish: "मछली पालन चुनें",
    simpleGuidance: "आपके खेत के लिए सरल मार्गदर्शन",
    matchBreed: "नस्ल को चारे, जलवायु और बाजार से मिलाएं",
    matchFish: "विकल्प को तालाब, पानी और बाजार से मिलाएं",
    cropGuide: "फसल मार्गदर्शिका",
    breedGuide: "नस्ल मार्गदर्शिका",
    enterpriseGuide: "व्यवसाय मार्गदर्शिका",
    steps: "चरण-दर-चरण तरीका",
    dailyManagement: "दैनिक प्रबंधन",
    learnMore: "और जानें",
    trustedResources: "विश्वसनीय स्रोत",
    cost: "लागत",
    profit: "Profit",
    detailedContentNote: "विस्तृत विषय सामग्री अभी अंग्रेजी और कन्नड़ में उपलब्ध है।",
  },
  ta: {
    chooseLanguage: "மொழியைத் தேர்ந்தெடுக்கவும்",
    selectCrop: "பயிரைத் தேர்ந்தெடுக்கவும்",
    selectBreed: "இனத்தைத் தேர்ந்தெடுக்கவும்",
    selectFish: "மீன் வளர்ப்பு முறையைத் தேர்ந்தெடுக்கவும்",
    simpleGuidance: "உங்கள் வயலுக்கான எளிய வழிகாட்டி",
    matchBreed: "தீவனம், காலநிலை மற்றும் சந்தைக்கு ஏற்ற இனத்தைத் தேர்ந்தெடுக்கவும்",
    matchFish: "குளம், நீர் மற்றும் சந்தைக்கு ஏற்ற முறையைத் தேர்ந்தெடுக்கவும்",
    cropGuide: "பயிர் வழிகாட்டி",
    breedGuide: "இன வழிகாட்டி",
    enterpriseGuide: "தொழில் வழிகாட்டி",
    steps: "படிப்படியான முறை",
    dailyManagement: "தினசரி மேலாண்மை",
    learnMore: "மேலும் அறிக",
    trustedResources: "நம்பகமான வளங்கள்",
    cost: "செலவு",
    profit: "லாபம்",
    detailedContentNote: "விரிவான தலைப்பு உள்ளடக்கம் தற்போது ஆங்கிலம் மற்றும் கன்னடத்தில் உள்ளது.",
  },
  te: {
    chooseLanguage: "భాషను ఎంచుకోండి",
    selectCrop: "పంటను ఎంచుకోండి",
    selectBreed: "జాతిని ఎంచుకోండి",
    selectFish: "చేపల పెంపకం ఎంపికను ఎంచుకోండి",
    simpleGuidance: "మీ పొలానికి సరళమైన మార్గదర్శకం",
    matchBreed: "మేత, వాతావరణం మరియు మార్కెట్‌కు సరిపోయే జాతిని ఎంచుకోండి",
    matchFish: "చెరువు, నీరు మరియు మార్కెట్‌కు సరిపోయే ఎంపికను ఎంచుకోండి",
    cropGuide: "పంట మార్గదర్శకం",
    breedGuide: "జాతి మార్గదర్శకం",
    enterpriseGuide: "వ్యాపార మార్గదర్శకం",
    steps: "దశలవారీ విధానం",
    dailyManagement: "రోజువారీ నిర్వహణ",
    learnMore: "మరింత తెలుసుకోండి",
    trustedResources: "నమ్మకమైన వనరులు",
    cost: "ఖర్చు",
    profit: "లాభం",
    detailedContentNote: "వివరణాత్మక విషయం ప్రస్తుతం ఇంగ్లీష్ మరియు కన్నడలో అందుబాటులో ఉంది.",
  },
  ml: {
    chooseLanguage: "ഭാഷ തിരഞ്ഞെടുക്കുക",
    selectCrop: "വിള തിരഞ്ഞെടുക്കുക",
    selectBreed: "ഇനം തിരഞ്ഞെടുക്കുക",
    selectFish: "മത്സ്യകൃഷി തിരഞ്ഞെടുക്കുക",
    simpleGuidance: "നിങ്ങളുടെ കൃഷിയിടത്തിനുള്ള ലളിതമായ മാർഗ്ഗനിർദ്ദേശം",
    matchBreed: "തീറ്റ, കാലാവസ്ഥ, വിപണി എന്നിവയ്ക്ക് അനുയോജ്യമായ ഇനം തിരഞ്ഞെടുക്കുക",
    matchFish: "കുളം, വെള്ളം, വിപണി എന്നിവയ്ക്ക് അനുയോജ്യമായ രീതി തിരഞ്ഞെടുക്കുക",
    cropGuide: "വിള മാർഗ്ഗനിർദ്ദേശം",
    breedGuide: "ഇനം മാർഗ്ഗനിർദ്ദേശം",
    enterpriseGuide: "സംരംഭ മാർഗ്ഗനിർദ്ദേശം",
    steps: "ഘട്ടംഘട്ടമായ രീതി",
    dailyManagement: "ദൈനംദിന പരിപാലനം",
    learnMore: "കൂടുതൽ അറിയുക",
    trustedResources: "വിശ്വസനീയമായ ഉറവിടങ്ങൾ",
    cost: "ചെലവ്",
    profit: "ലാഭം",
    detailedContentNote: "വിശദമായ വിഷയം ഇപ്പോൾ ഇംഗ്ലീഷിലും കന്നഡയിലും ലഭ്യമാണ്.",
  },
  mr: {
    chooseLanguage: "भाषा निवडा",
    selectCrop: "पीक निवडा",
    selectBreed: "जात निवडा",
    selectFish: "मत्स्यपालन निवडा",
    simpleGuidance: "तुमच्या शेतासाठी सोपे मार्गदर्शन",
    matchBreed: "चारा, हवामान आणि बाजाराशी योग्य जात जुळवा",
    matchFish: "तलाव, पाणी आणि बाजाराशी योग्य पर्याय जुळवा",
    cropGuide: "पीक मार्गदर्शक",
    breedGuide: "जात मार्गदर्शक",
    enterpriseGuide: "व्यवसाय मार्गदर्शक",
    steps: "टप्प्याटप्प्याची पद्धत",
    dailyManagement: "दैनंदिन व्यवस्थापन",
    learnMore: "अधिक जाणून घ्या",
    trustedResources: "विश्वसनीय स्रोत",
    cost: "खर्च",
    profit: "नफा",
    detailedContentNote: "सविस्तर विषय सामग्री सध्या इंग्रजी आणि कन्नडमध्ये उपलब्ध आहे.",
  },
};

export const getLearningUi = (language: LearningLanguage): LearningUi => translations[language];