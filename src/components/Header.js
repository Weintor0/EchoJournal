import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { FontSizes } from "../constants/typography";


export default function Header() {
  const router = useRouter();
  
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.replace("/")}>
        <Text style={styles.title}>Personal Media Journal</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 70,
    backgroundColor: "#5A6FB2",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    color: "black",
    fontSize: FontSizes.xxxl,
    fontWeight: "600",
  },
});
