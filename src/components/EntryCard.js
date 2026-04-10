import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function EntryCard({ entry, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      {/* Image Placeholder */}
      <View style={styles.image} />

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>{entry.title}</Text>

        <Text style={styles.preview} numberOfLines={2}>
          {entry.note}
        </Text>

        <View style={styles.footer}>
          <Text style={styles.meta}>
            {entry.type} • {entry.rating}/10
          </Text>
          <Text style={styles.date}>{entry.date}</Text>
        </View>
      </View>

      <Text style={styles.details}>Details →</Text>
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
    alignItems: "center",
  },
  image: {
    width: 50,
    height: 70,
    backgroundColor: "black",
    borderRadius: 5,
    marginRight: 10,
  },
  content: {
    flex: 1,
  },
  title: {
    fontWeight: "600",
    fontSize: 14,
  },
  preview: {
    fontSize: 12,
    color: "#333",
    marginVertical: 4,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  meta: {
    fontSize: 12,
  },
  date: {
    fontSize: 12,
  },
  details: {
    fontSize: 12,
    marginLeft: 5,
  },
});