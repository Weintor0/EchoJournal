import { useIsFocused } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { deleteEntry, getEntries } from '../api/entries';
import EntryCard from '../components/EntryCard';
import Header from "../components/Header";
import Navbar from '../components/Navbar';
import { FontSizes } from '../constants/typography';

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
          <FlatList
            data={entries}
            keyExtractor={(item) => String(item.id)}
            ListEmptyComponent={<Text style={styles.bodyText}>No entries yet.</Text>}
            renderItem={({ item }) => (
              <EntryCard
                entry={item}
                onPress={() => handleEntryPress(item)}
                onDelete={() => handleDeleteEntry(item.id)}
              />
            )}
          />
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
    marginBottom: 10 
  },

  bodyText: {
    fontSize: FontSizes.m,
  },

  errorText: {
    color: '#B00020',
    fontSize: FontSizes.s,
    marginBottom: 10,
  },
});
