import { useIsFocused } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { deleteEntry, getEntries } from '../api/entries';
import EntryCard from '../components/EntryCard';
import Header from "../components/Header";
import Navbar from '../components/Navbar';
import { FontSizes } from '../constants/typography';

const arrowUp = require('../assets/icons/up-arrow.png');
//const arrowDown = require('../assets/arrow-down.png');

export default function MyJournalScreen() {
  const router = useRouter();
  const isFocused = useIsFocused();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
      const updatedEntries = await getEntries();
      setEntries(updatedEntries);
    } catch (deleteError) {
      setError(deleteError.message);
    }
  };

const [sortField, setSortField] = useState("date");
const [sortDirection, setSortDirection] = useState("desc");

const sortEntries = (entries, field, direction) => {
  const sorted = [...entries];

  const modifier = direction === "asc" ? 1 : -1;

  switch (field) {
    case "date":
      return sorted.sort(
        (a, b) => (new Date(a.date) - new Date(b.date)) * modifier
      );

    case "rating":
      return sorted.sort(
        (a, b) => ((b.rating || 0) - (a.rating || 0)) * modifier
      );

    case "title":
      return sorted.sort(
        (a, b) =>
          (b.title || "").localeCompare(a.title || "") * modifier
      );

    default:
      return sorted;
  }
};

const handleSortPress = (field) => {
  if (sortField === field) {
    setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
  } else {
    setSortField(field);
    setSortDirection("desc");
  }
};

const getArrowStyle = (field) => {
  if (sortField !== field) return {};
  return {
    transform: [{ rotate: sortDirection === "asc" ? "180deg" : "0deg" }],
  };
};

  useEffect(() => {
    let isActive = true;

    async function loadEntries() {
      try {
        setLoading(true);
        setError('');
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

  return (
  <View style={styles.container}>
    <Header />
    <View style={styles.content}>
      <Text style={styles.header}>My Journal</Text>
      {loading ? <Text style={styles.bodyText}>Loading your entries...</Text> : null}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {!loading && !error ? (
        <View>
          <View style={styles.sortFilter}>  
            <View style={styles.filterContainer}>
              <TouchableOpacity style={styles.filterButton}>
                <Text style={styles.sortFilterText}>Filter</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.sortContainer}>
              <TouchableOpacity
                style={[styles.sortButtonContainer, sortField === "date" && styles.sortButtonActive]}
                onPress={() => handleSortPress("date")}
              >
                <Text style={styles.sortFilterText}>Date</Text>
                <Image source={arrowUp} style={[styles.icon, getArrowStyle("date")]} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.sortButtonContainer, sortField === "rating" && styles.sortButtonActive]}
                onPress={() => handleSortPress("rating")}
              >
                <Text style={styles.sortFilterText}>Rating</Text>
                <Image source={arrowUp} style={[styles.icon, getArrowStyle("rating")]} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.sortButtonContainer, sortField === "title" && styles.sortButtonActive]}
                onPress={() => handleSortPress("title")}
              >
                <Text style={styles.sortFilterText}>A-Z</Text>
                <Image source={arrowUp} style={[styles.icon, getArrowStyle("title")]} />
              </TouchableOpacity>
            </View>
          </View>
            <FlatList
              data={sortEntries(entries, sortField, sortDirection)}
              keyExtractor={(item) => String(item.id)}
              ListEmptyComponent={
                <Text style={styles.bodyText}>No entries yet.</Text>
              }
              renderItem={({ item }) => (
                <EntryCard
                  entry={item}
                  onPress={() => handleEntryPress(item)}
                  onDelete={() => handleDeleteEntry(item.id)}
                />
              )}
            />
          </View>
      ) : null}
    </View>

    <Navbar />
  </View>
);
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#E6E6E6' 
  },

  content: { 
    flex: 1, 
    padding: 16 
  },

  header: { 
    fontSize: FontSizes.xxl, 
    fontWeight: '700',
    marginBottom: 16 
  },

  bodyText: {
    fontSize: FontSizes.m,
  },

  errorText: {
    color: '#B00020',
    fontSize: FontSizes.s,
    marginBottom: 10,
  },
  sortFilter: {
    marginBottom: 4,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  filterButton: {
    backgroundColor: "#D9DCE3",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },

  sortContainer: {
    flexDirection: "row",
    justifyContent: "end",
    marginBottom: 10,
  },

  sortButtonContainer: {
    backgroundColor: "#D9DCE3",
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginLeft: 4,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
  },

  sortButtonActive: {
    backgroundColor: "#CAD2E4",
  },

  sortFilterText: {
    fontSize: FontSizes.s,
    fontWeight: "600",
  },

  icon: {
    width: 10,
    height: 10,
    marginLeft: 4,
  },
});
