import { useIsFocused } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { getCurrentUser } from "../api/auth";
import { deleteEntry, getEntries } from "../api/entries";
import EntryCard from "../components/EntryCard";
import Header from "../components/Header";
import Navbar from "../components/Navbar";
import { FontSizes } from "../constants/typography";
import { getEntryStats } from "../utils/entryStats";

export default function HomeScreen() {
  const router = useRouter();
  const isFocused = useIsFocused();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  const handleEntryPress = (entry) => {
    router.push({
      pathname: "/entry/[id]",
      params: {
        id: entry.id,
      },
    });
  };

  const handleDeleteEntry = async (id) => {
    try {
      await deleteEntry(id);
      const updated = await getEntries();
      setEntries(updated);
    } catch (err) {
      console.log("Delete error:", err);
    }
  };

  useEffect(() => {
    let isActive = true;

    async function loadEntries() {
      try {
        setLoading(true);
        setError("");
        const [data, user] = await Promise.all([getEntries(), getCurrentUser()]);

        if (isActive) {
          setEntries(data);
          setCurrentUser(user);
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
  const stats = getEntryStats(entries);
  const displayName = currentUser?.name?.trim() || "there";

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hello}>
          <Text style={styles.helloText}>Hello, {displayName || "there"}!</Text>
        </View>
        <TouchableOpacity style={styles.recent} onPress={() => router.replace("/journal")}>
          <Text style={styles.sectionTitle}>Recent Entries</Text>

          {loading ? <Text style={styles.bodyText}>Loading recent entries...</Text> : null}
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          {!loading && !error ? (
            <FlatList
              data={recentEntries}
              keyExtractor={(item) => String(item.id)}
              ListEmptyComponent={<Text style={styles.bodyText}>No entries yet.</Text>}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <EntryCard
                  entry={item}
                  onPress={() => handleEntryPress(item)}
                  onDelete={() => handleDeleteEntry(item.id)}
                />
              )}
            />
          ) : null}
        </TouchableOpacity>

        <TouchableOpacity style={styles.stats} onPress={() => router.replace("/profile")}>
          <Text style={styles.sectionTitle}>My Stats</Text>

          <View style={styles.statsRow}>
            <Text style={styles.bodyText}>Most Used Type</Text>
            <Text style={styles.statValue}>{stats.mostUsedType}</Text>
          </View>

          <View style={styles.statsRow}>
            <Text style={styles.bodyText}>Entries This Week</Text>
            <Text style={styles.statValue}>{stats.entriesThisWeek}</Text>
          </View>

          <View style={styles.statsRow}>
            <Text style={styles.bodyText}>Streak</Text>
            <Text style={styles.statValue}>{stats.currentStreak} Days</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
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
    padding: 15,
  },

  recent: {
    backgroundColor: '#D9DCE3',  
    borderRadius: 10,
    padding: 4,
  },

  hello: {
    marginBottom: 16,
  },

  helloText: {
    fontSize: FontSizes.xxl,
    fontWeight: "700",
    color: "#000000",
  },

  sectionTitle: {
    fontSize: FontSizes.xl,
    fontWeight: "600",
    marginBottom: 10,
  },

  bodyText: {
    fontSize: FontSizes.m,
  },

  stats: {
    marginTop: 20,
    backgroundColor: '#D9DCE3',  
    borderRadius: 10,
    padding: 4,
    fontSize: FontSizes.s,
    
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#B9BFCC',
  },

  errorText: {
    color: "#B00020",
    fontSize: FontSizes.s,
    marginBottom: 10,
  },

  statValue: {  
    fontWeight: "600",
    fontSize: FontSizes.m,
  },
});
