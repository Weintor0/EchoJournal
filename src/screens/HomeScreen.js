// src/screens/HomeScreen.js
import { useRouter } from "expo-router";
import { useIsFocused } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { getEntries } from "../api/entries";
import EntryCard from "../components/EntryCard";
import Header from "../components/Header";
import Navbar from "../components/Navbar";
import { FontSizes } from "../constants/typography";

function getMostUsedType(entries) {
  if (entries.length === 0) {
    return "-";
  }

  const counts = entries.reduce((map, entry) => {
    const key = entry.type?.trim() || "Other";
    map[key] = (map[key] ?? 0) + 1;
    return map;
  }, {});

  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
}

function getEntriesThisWeek(entries) {
  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 7);

  return entries.filter((entry) => {
    if (!entry.createdAt) {
      return false;
    }

    const createdAt = new Date(entry.createdAt);
    return !Number.isNaN(createdAt.getTime()) && createdAt >= sevenDaysAgo;
  }).length;
}

function getStreak(entries) {
  const uniqueDayKeys = [
    ...new Set(
      entries
        .map((entry) => entry.createdAt)
        .filter(Boolean)
        .map((createdAt) => {
          const date = new Date(createdAt);
          return Number.isNaN(date.getTime()) ? null : date.toISOString().slice(0, 10);
        })
        .filter(Boolean)
    ),
  ].sort().reverse();

  if (uniqueDayKeys.length === 0) {
    return 0;
  }

  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  if (uniqueDayKeys[0] !== cursor.toISOString().slice(0, 10)) {
    cursor.setDate(cursor.getDate() - 1);
  }

  for (const dayKey of uniqueDayKeys) {
    if (dayKey !== cursor.toISOString().slice(0, 10)) {
      break;
    }

    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

export default function HomeScreen() {
  const router = useRouter();
  const isFocused = useIsFocused();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const handleEntryPress = (entry) => {
    router.push({
      pathname: "/entry/[id]",
      params: {
        id: entry.id,
      },
    });
  };

  useEffect(() => {
    let isActive = true;

    async function loadEntries() {
      try {
        setLoading(true);
        setError("");
        const data = await getEntries();

        if (isActive) {
          setEntries(data);
        }
      } catch (loadError) {
        if (isActive) {
          setError(loadError.message);
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    if (isFocused) {
      loadEntries();
    }

    return () => {
      isActive = false;
    };
  }, [isFocused]);

  const recentEntries = entries.slice(0, 5);
  const mostUsedType = getMostUsedType(entries);
  const entriesThisWeek = getEntriesThisWeek(entries);
  const streak = getStreak(entries);

  return (
    <View style={styles.container}>
      <Header />

      <View style={styles.content}>
        <View style={styles.recent}>
          <Text style={styles.sectionTitle}>Recent Entries</Text>

          {loading ? <Text>Loading recent entries...</Text> : null}
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          {!loading && !error ? (
            <FlatList
              data={recentEntries}
              keyExtractor={(item) => String(item.id)}
              ListEmptyComponent={<Text>No entries yet.</Text>}
              renderItem={({ item }) => (
                <EntryCard
                  entry={item}
                  onPress={() => handleEntryPress(item)}
                />
              )}
            />
          ) : null}
        </View>

        <View style={styles.stats}>
          <Text style={styles.sectionTitle}>My Stats</Text>

          <View style={styles.statsRow}>
            <Text>Most Used Type</Text>
            <Text>{mostUsedType}</Text>
          </View>

          <View style={styles.statsRow}>
            <Text>Entries This Week</Text>
            <Text>{entriesThisWeek}</Text>
          </View>

          <View style={styles.statsRow}>
            <Text>Streak</Text>
            <Text>{streak} Days</Text>
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

  errorText: {
    color: "#B00020",
    marginBottom: 10,
  },
});

