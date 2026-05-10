import { useRouter } from "expo-router";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { FontSizes } from "../constants/typography";
import { useLanguage } from "../hooks/useLanguage";

const languageIcon = require("../assets/icons/language.png");

export default function Header() {
  const router = useRouter();
  const { language, t, toggleLanguage } = useLanguage();
  
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.titleButton} onPress={() => router.replace("/")}>
        <Text style={styles.title} numberOfLines={2}>{t("appTitle")}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.languageButton}
        onPress={toggleLanguage}
        accessibilityLabel={t("languageName")}>
        <Image source={languageIcon} style={styles.languageIcon} />
        <Text style={styles.languageText}>{language.toUpperCase()}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 60,
    backgroundColor: "#5A6FB2",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: "row",
  },
  titleButton: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    color: "black",
    fontSize: FontSizes.xxl,
    fontWeight: "600",
    maxWidth: "100%",
    textAlign: "center",
  },
  languageButton: {
    position: "absolute",
    right: 16,  
    alignItems: "flex-end",
    justifyContent: "flex-end",
  },
  languageIcon: {
    width: 18,
    height: 18,
    resizeMode: "contain",
  },
  languageText: {
    fontSize: FontSizes.xxs,
    fontWeight: "700",
    color: "#000000",
    marginTop: 1,
  },
});
