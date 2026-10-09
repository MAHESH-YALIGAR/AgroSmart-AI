import { useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { getLearningUi, type LearningLanguage } from "../../utils/learningTranslations";

export type { LearningLanguage } from "../../utils/learningTranslations";

type LanguageOption = {
  code: LearningLanguage;
  label: string;
  nativeLabel: string;
};

export const LEARNING_LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: "en", label: "English", nativeLabel: "English" },
  { code: "kn", label: "Kannada", nativeLabel: "ಕನ್ನಡ" },
  { code: "hi", label: "Hindi", nativeLabel: "हिन्दी" },
  { code: "ta", label: "Tamil", nativeLabel: "தமிழ்" },
  { code: "te", label: "Telugu", nativeLabel: "తెలుగు" },
  { code: "ml", label: "Malayalam", nativeLabel: "മലയാളം" },
  { code: "mr", label: "Marathi", nativeLabel: "मराठी" },
];

type LanguageDropdownProps = {
  value: LearningLanguage;
  onChange: (language: LearningLanguage) => void;
  accentColor?: string;
};

export default function LanguageDropdown({
  value,
  onChange,
  accentColor = "#166534",
}: LanguageDropdownProps) {
  const [visible, setVisible] = useState(false);
  const selected = LEARNING_LANGUAGE_OPTIONS.find((option) => option.code === value) ?? LEARNING_LANGUAGE_OPTIONS[0];
  const ui = getLearningUi(value);

  const selectLanguage = (language: LearningLanguage) => {
    onChange(language);
    setVisible(false);
  };

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Select learning language"
        onPress={() => setVisible(true)}
        className="min-w-[150px] flex-row items-center justify-between rounded-xl border border-gray-200 bg-white px-3 py-2.5"
      >
        <View className="flex-row items-center">
          <MaterialCommunityIcons name="translate" size={18} color={accentColor} />
          <Text className="ml-2 text-sm font-bold text-gray-800">{selected.nativeLabel}</Text>
        </View>
        <MaterialCommunityIcons name="chevron-down" size={20} color="#6B7280" />
      </Pressable>

      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
        <Pressable className="flex-1 justify-end bg-black/35" onPress={() => setVisible(false)}>
          <Pressable className="rounded-t-3xl bg-white px-5 pb-8 pt-5" onPress={(event) => event.stopPropagation()}>
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-lg font-bold text-gray-900">{ui.chooseLanguage}</Text>
              <Pressable accessibilityLabel="Close language menu" onPress={() => setVisible(false)} className="h-9 w-9 items-center justify-center rounded-full bg-gray-100">
                <MaterialCommunityIcons name="close" size={19} color="#4B5563" />
              </Pressable>
            </View>
            {LEARNING_LANGUAGE_OPTIONS.map((option) => {
              const isSelected = option.code === value;
              return (
                <Pressable
                  key={option.code}
                  onPress={() => selectLanguage(option.code)}
                  className="mb-2 flex-row items-center justify-between rounded-2xl px-4 py-3"
                  style={{ backgroundColor: isSelected ? `${accentColor}14` : "#F9FAFB" }}
                >
                  <View>
                    <Text className="text-base font-semibold text-gray-900">{option.nativeLabel}</Text>
                    <Text className="mt-0.5 text-xs text-gray-500">{option.label}</Text>
                  </View>
                  {isSelected && <MaterialCommunityIcons name="check-circle" size={21} color={accentColor} />}
                </Pressable>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
