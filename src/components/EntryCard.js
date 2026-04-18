import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

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
    backgroundColor: "#D9DCE3",
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
    fontSize: 16,
  },
  preview: {
    fontSize: 14,
    color: "#333",
    marginVertical: 4,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  type: {
    fontSize: 14,
  },
  rating: {
    fontSize: 14,
  },
  date: {
    fontSize: 14,
  },
  detailsSection: {
    width: "20%",
    justifyContent: "flex-end",
    alignItems: "flex-end",
    paddingLeft: 6,
  },
  details: {
    fontSize: 10,
    textAlign: "right",
  },
});
