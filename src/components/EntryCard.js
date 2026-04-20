import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { FontSizes } from "../constants/typography";
import TypeTag from "./TypeTag";

const starIcon = require("../assets/icons/star.png");
const calendarIcon = require("../assets/icons/calendar.png");

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
          <TypeTag type={safeEntry.type} />
          <View style={styles.ratingRow}>
            <Image source={starIcon} style={styles.ratingIcon} />
            <Text style={styles.rating}>
              {safeEntry.rating != null ? `${safeEntry.rating}/10` : "-"}
            </Text>
          </View>
          <View style={styles.dateRow}>
            <Image source={calendarIcon} style={styles.dateIcon} />
            <Text style={styles.date}>{safeEntry.date ?? "-"}</Text>
          </View>
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
    alignItems: "center",
    gap: 8,
  },
  rating: {
    fontSize: FontSizes.s,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingIcon: {
    width: 14,
    height: 14,
    resizeMode: "contain",
  },
  date: {
    fontSize: FontSizes.s,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  dateIcon: {
    width: 14,
    height: 14,
    resizeMode: "contain",
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
