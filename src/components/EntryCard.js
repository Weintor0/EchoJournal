import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { FontSizes } from "../constants/typography";

export default function EntryCard({ entry, onPress }) {
  const safeEntry = entry ?? {};

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.imageSection}>
        <View style={styles.image} />
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.title}>{safeEntry.title ?? "Untitled"}</Text>

        <Text style={styles.preview} numberOfLines={2}>
          {safeEntry.note ?? "No notes yet."}
        </Text>

        <View style={styles.footer}>
          <Text style={styles.type}>{safeEntry.type ?? "-"}</Text>
          <Text style={styles.rating}>
            {safeEntry.rating != null ? `${safeEntry.rating}/10` : "-"}
          </Text>
          <Text style={styles.date}>{safeEntry.date ?? "-"}</Text>
        </View>
      </View>

      <View style={styles.detailsSection}>
        <Text style={styles.details}>{"Details ->"}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: "#cad2e4",
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
    alignItems: "stretch",
    minHeight: 90,
  },
  imageSection: {
    width: "22%",
    justifyContent: "center",
    paddingRight: 10,
  },
  image: {
    width: "100%",
    aspectRatio: 0.72,
    backgroundColor: "black",
    borderRadius: 5,
  },
  infoSection: {
    width: "58%",
    justifyContent: "space-between",
  },
  title: {
    fontWeight: "600",
    fontSize: FontSizes.m,
  },
  preview: {
    fontSize: FontSizes.s,
    color: "#333",
    marginVertical: 4,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  type: {
    fontSize: FontSizes.s,
  },
  rating: {
    fontSize: FontSizes.s,
  },
  date: {
    fontSize: FontSizes.s,
  },
  detailsSection: {
    width: "20%",
    justifyContent: "flex-end",
    alignItems: "flex-end",
    paddingLeft: 6,
  },
  details: {
    fontSize: FontSizes.xs,
    textAlign: "right",
  },
});
