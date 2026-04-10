// src/screens/HomeScreen.js
import React from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import EntryCard from "../components/EntryCard";
import Header from "../components/Header";
import Navbar from "../components/Navbar";
import { entries } from "../data/mockData";


export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Header />

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Recent Entries</Text>

        <FlatList
          data={entries}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <EntryCard
              entry={item}
              onPress={() => console.log("Go to details", item.id)}
            />
          )}
        />

        <View style={styles.stats}>
          <Text style={styles.sectionTitle}>My Stats</Text>

          <View style={styles.statsRow}>
            <Text>Most Used Type</Text>
            <Text>Movie</Text>
          </View>

          <View style={styles.statsRow}>
            <Text>Entries This Week</Text>
            <Text>15</Text>
          </View>

          <View style={styles.statsRow}>
            <Text>Streak</Text>
            <Text>5 Days</Text>
          </View>
        </View>
      </View>

      <Navbar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E6E6E6",
  },
  content: {
    flex: 1,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
  },
  stats: {
    marginTop: 20,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
});

