import { StyleSheet, Text, View } from "react-native";
import { FontSizes } from "../constants/typography";

export default function Header() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Personal Media Journal</Text>
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
