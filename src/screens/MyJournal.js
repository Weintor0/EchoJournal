//import Slider from "@react-native-community/slider";
import RatingSlider from "@/src/components/RatingSlider";
import { parseDateValue } from "@/src/utils/date";
import { useIsFocused } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, Image, Modal, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { deleteEntry, getEntries } from '../api/entries';
import EntryCard from '../components/EntryCard';
import Header from "../components/Header";
import Navbar from '../components/Navbar';
import { ENTRY_TYPES } from "../constants/entryTypes";
import { FontSizes } from '../constants/typography';

const arrowUp = require('../assets/icons/up-arrow.png');
const undoIcon = require('../assets/icons/undo.png');

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

//Sort starts here
const [sortField, setSortField] = useState("date");
const [sortDirection, setSortDirection] = useState("desc");

const sortEntries = (entries, field, direction) => {
  const sorted = [...entries];

  const modifier = direction === "asc" ? 1 : -1;

  const getEntryDate = (value) => {
    const parsed = parseDateValue(value);
    if (parsed instanceof Date && !isNaN(parsed)) {
      return parsed;
    }
    const fallback = new Date(value);
    return fallback instanceof Date && !isNaN(fallback) ? fallback : new Date(0);
  };

  switch (field) {
    case "date":
      return sorted.sort((a, b) => {
        const dateA = getEntryDate(a.date);
        const dateB = getEntryDate(b.date);
        return (dateB - dateA) * modifier;
      });

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
//Sort ends here

//Filter starts here

const [filterVisible, setFilterVisible] = useState(false);

const [selectedTypes, setSelectedTypes] = useState([]);
const [minRating, setMinRating] = useState(0);
const [maxRating, setMaxRating] = useState(10);
const [dateFilter, setDateFilter] = useState("all");

const handleMinRatingChange = (value) => {
  setMinRating(value);
  if (value > maxRating) {
    setMaxRating(value);
  }
};

const handleMaxRatingChange = (value) => {
  setMaxRating(value);
  if (value < minRating) {
    setMinRating(value);
  }
};

const filterIsActive =
  selectedTypes.length > 0 ||
  minRating > 0 ||
  maxRating < 10 ||
  dateFilter !== "all";

const filterEntries = React.useCallback((entries) => {
  return entries.filter((entry) => {
    // TYPE
    if (selectedTypes.length > 0 && !selectedTypes.includes(entry.type)) {
      return false;
    }

    // RATING
    const ratingValue = Number(entry.rating) || 0;
    if (ratingValue < minRating) {
      return false;
    }
    if (ratingValue > maxRating) {
      return false;
    }

    // DATE
    const entryDate = parseDateValue(entry.date);
    if (!entryDate) return false;

    const now = new Date();

    if (dateFilter === "today") {
      return entryDate.toDateString() === now.toDateString();
    }

    if (dateFilter === "month") {
      return (
        entryDate.getMonth() === now.getMonth() &&
        entryDate.getFullYear() === now.getFullYear()
      );
    }

    if (dateFilter === "3months") {
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(now.getMonth() - 3);
      return entryDate >= threeMonthsAgo;
    }

    if (dateFilter === "year") {
      return entryDate.getFullYear() === now.getFullYear();
    }

    return true;
  });
}, [selectedTypes, minRating, maxRating, dateFilter]);
//Filter ends here

//Combination of filter and sort
const processedEntries = React.useMemo(() => {
  const filtered = filterEntries(entries);
  return sortEntries(filtered, sortField, sortDirection);
}, [entries, filterEntries, sortField, sortDirection]);


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
    <FlatList
      style={styles.list}
      contentContainerStyle={styles.content}
      data={!loading && !error ? processedEntries : []}
      keyExtractor={(item) => String(item.id)}
      ListHeaderComponent={
        <View>
          <Text style={styles.header}>My Journal</Text>
          {loading ? <Text style={styles.bodyText}>Loading your entries...</Text> : null}
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          {!loading && !error ? (
            <View style={styles.sortFilter}>  
              <View style={styles.filterContainer}>
                <View style={styles.filterDelete}>
                  <TouchableOpacity
                    style={[styles.filterButton, filterIsActive && styles.filterButtonActive]}
                    onPress={() => setFilterVisible(true)}
                  >
                    <Text style={styles.sortFilterText}>Filter</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.reset} onPress={() => {
                    setSelectedTypes([]);
                    setMinRating(0);
                    setMaxRating(10);
                    setDateFilter("all");
                  }}>
                    <Image source={undoIcon} style={styles.undoIcon} />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.sortContainer}>
                <TouchableOpacity
                  style={[styles.sortButtonContainer, sortField === "date" && styles.sortButtonActive]}
                  onPress={() => handleSortPress("date")}
                >
                  <View style={styles.sortButtonContent}>
                    <Text style={styles.sortFilterText}>Date</Text>
                    <Image source={arrowUp} style={[styles.icon, getArrowStyle("date")]} />
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.sortButtonContainer, sortField === "rating" && styles.sortButtonActive]}
                  onPress={() => handleSortPress("rating")}
                >
                  <View style={styles.sortButtonContent}>
                    <Text style={styles.sortFilterText}>Rating</Text>
                    <Image source={arrowUp} style={[styles.icon, getArrowStyle("rating")]} />
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.sortButtonContainer, sortField === "title" && styles.sortButtonActive]}
                  onPress={() => handleSortPress("title")}
                >
                  <View style={styles.sortButtonContent}>
                    <Text style={styles.sortFilterText}>A-Z</Text>
                    <Image source={arrowUp} style={[styles.icon, getArrowStyle("title")]} />
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          ) : null}
        </View>
      }
      ListEmptyComponent={
        !loading && !error ? <Text style={styles.bodyText}>No entries yet.</Text> : null
      }
      renderItem={({ item }) => (
        <EntryCard
          entry={item}
          onPress={() => handleEntryPress(item)}
          onDelete={() => handleDeleteEntry(item.id)}
        />
      )}
    />

    <Modal visible={filterVisible} animationType="fade" transparent>
      <View style={styles.modalOverlay}>

        <TouchableWithoutFeedback onPress={() => setFilterVisible(false)}>
          <View style={StyleSheet.absoluteFillObject} />
        </TouchableWithoutFeedback>

        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Filter</Text>

          {/* TYPE */}
          <Text style={styles.sectionTitle}>Type</Text>
          <View style={styles.rowWrap}>
            {ENTRY_TYPES.map((item) => {
              const type = item.label;

              return (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.chip,
                    selectedTypes.includes(type) && styles.chipActive,
                  ]}
                  onPress={() => {
                    setSelectedTypes((prev) =>
                      prev.includes(type)
                        ? prev.filter((t) => t !== type)
                        : [...prev, type]
                    );
                  }}
                >
                  <Text>{type}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* RATING */}
          <Text style={styles.sectionTitle}>Min Rating:</Text>
          <RatingSlider
            value={minRating}
            onChange={handleMinRatingChange}
          />

          <Text style={styles.sectionTitle}>Max Rating:</Text>
          <RatingSlider
            value={maxRating}
            onChange={handleMaxRatingChange}
          />

          {/* DATE */}
          <Text style={styles.sectionTitle}>Date</Text>
          <View style={styles.rowWrap}>
            {[
              { label: "All", value: "all" },
              { label: "Today", value: "today" },
              { label: "This Month", value: "month" },
              { label: "3 Months", value: "3months" },
              { label: "This Year", value: "year" },
            ].map((item) => (
              <TouchableOpacity
                key={item.value}
                style={[
                  styles.chip,
                  dateFilter === item.value && styles.chipActive,
                ]}
                onPress={() => setDateFilter(item.value)}
              >
                <Text>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {/* ACTIONS */}
          <View style={styles.modalActions}>
            <TouchableOpacity onPress={() => setFilterVisible(false)}>
              <Text style={styles.actionText}>Apply</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => {
                setSelectedTypes([]);
                setMinRating(0);
                setMaxRating(10);
                setDateFilter("all");
              }}
            >
              <Text style={styles.actionText}>Reset</Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </Modal>  

    <Navbar />
  </View>
);
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#E6E6E6' 
  },

  list: {
    flex: 1,
  },

  content: { 
    padding: 16,
    paddingBottom: 24,
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
    flexWrap: "wrap",
    gap: 10,
  },

  filterDelete: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
  },

  filterButton: {
    backgroundColor: "#D9DCE3",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },

  filterButtonActive: {
    backgroundColor: "#CAD2E4",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
  },

  modalContent: {
    backgroundColor: "#E6E6E6",
    width: "90%",
    maxWidth: 520,
    alignSelf: "center",
    borderRadius: 12,
    padding: 20,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },

  sectionTitle: {
    marginTop: 10,
    marginBottom: 5,
    fontWeight: "600",
  },

  rowWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  chip: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#eee",
    borderWidth: 2,
    borderColor: "#ccc",
  },

  chipActive: {
    borderWidth: 2,
    borderColor: '#5A6FB2',
  },

  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },

  actionText: {
    fontSize: FontSizes.l,
    fontWeight: "700",
    color: '#rgb(90, 111, 178)',
  },

  sortContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    flexWrap: "wrap",
    gap: 4,
    flex: 1,
    marginBottom: 10,
  },

  sortButtonContainer: {
    backgroundColor: "#D9DCE3",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },

  sortButtonContent: {
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

  undoIcon: {
    width: 16,
    height: 16,
  },


});
