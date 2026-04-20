// src/screens/HomeScreen.js
import { useRouter } from "expo-router";
import React from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import EntryCard from "../components/EntryCard";
import Header from "../components/Header";
import Navbar from "../components/Navbar";
import { FontSizes } from "../constants/typography";
import { entries } from "../data/mockData";


export default function HomeScreen() {
  const router = useRouter();

  const handleEntryPress = (entry) => {
    router.push({
      pathname: "/entry/[id]",
      params: {
        id: entry.id,
        title: entry.title,
        note: entry.note,
        type: entry.type,
        rating: String(entry.rating ?? ""),
        date: entry.date,
      },
    });
  };

  return (
    <View style={styles.container}>
      <Header />

      <View style={styles.content}>
        <View style={styles.recent}>
          <Text style={styles.sectionTitle}>Recent Entries</Text>

          <FlatList
            data={entries}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <EntryCard
                entry={item}
                onPress={() => handleEntryPress(item)}
              />
            )}
          />
        </View>

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

  recent: {
    backgroundColor: '#D9DCE3',  
    borderRadius: 10,
    padding: 4,
  },

  sectionTitle: {
    fontSize: FontSizes.xl,
    fontWeight: "600",
    marginBottom: 10,
  },

  stats: {
    marginTop: 20,
    backgroundColor: '#D9DCE3',  
    borderRadius: 10,
    padding: 4,
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
});

