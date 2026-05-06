import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { FontSizes } from "../constants/typography";


export default function Header() {
  const router = useRouter();
  
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.replace("/")}>
        <Text style={styles.title} numberOfLines={2}>Personal Media Journal</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 60,
    backgroundColor: "#5A6FB2",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  title: {
    color: "black",
    fontSize: FontSizes.xxl,
    fontWeight: "600",
    maxWidth: "100%",
    textAlign: "center",
  },
});
