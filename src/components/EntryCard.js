import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function EntryCard({ entry, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.imageSection}>
        <View style={styles.image} />
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.title}>{entry.title}</Text>

        <Text style={styles.preview} numberOfLines={2}>
          {entry.note}
        </Text>

        <View style={styles.footer}>
          <Text style={styles.type}>{entry.type}</Text>
          <Text style={styles.rating}>{entry.rating}/10</Text>
          <Text style={styles.date}>{entry.date}</Text>
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
    fontSize: 18,
  },
  preview: {
    fontSize: 16,
    color: "#333",
    marginVertical: 4,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  type: {
    fontSize: 16,
  },
  rating: {
    fontSize: 16,
  },
  date: {
    fontSize: 16,
  },
  detailsSection: {
    width: "20%",
    justifyContent: "flex-end",
    alignItems: "flex-end",
    paddingLeft: 6,
  },
  details: {
    fontSize: 12,
    textAlign: "right",
  },
});
