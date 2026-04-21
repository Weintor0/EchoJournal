import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { FontSizes } from "../constants/typography";
import TypeTag from "./TypeTag";

const starIcon = require("../assets/icons/star.png");
const calendarIcon = require("../assets/icons/calendar.png");
const deleteIcon = require("../assets/icons/delete.png");

export default function EntryCard({ entry, onPress, onDelete }) {
  const safeEntry = entry ?? {};
  const imageUrl =
  typeof safeEntry.image === "string" && safeEntry.image.trim()
    ? safeEntry.image
    : typeof safeEntry.imageUrl === "string"
    ? safeEntry.imageUrl
    : "";
  const ratingText =
    safeEntry.rating != null && String(safeEntry.rating).trim()
      ? `${safeEntry.rating}/10`
      : "-";

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.imageSection}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.image} />
        ) : (
          <View style={styles.image} />
        )}
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
            <Text style={styles.rating}>{ratingText}</Text>
          </View>
          <View style={styles.dateRow}>
            <Image source={calendarIcon} style={styles.dateIcon} />
            <Text style={styles.date}>{safeEntry.date ?? "-"}</Text>
          </View>
        </View>
      </View>

      <View style={styles.detailsSection}>
        <TouchableOpacity onPress={() => onDelete(entry)}>
          <Image source={deleteIcon} style={styles.deleteIcon} />
        </TouchableOpacity>
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
  deleteIcon: {
    width: 16,
    height: 16,
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
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingLeft: 6,
  },
  details: {
    fontSize: FontSizes.xs,
    textAlign: "right",
  },
});
