import { useIsFocused } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { getEntries } from '../api/entries';
import profileIcon from "../assets/icons/profile.png";
import Header from "../components/Header";
import Navbar from '../components/Navbar';
import { FontSizes } from '../constants/typography';
import { getEntryStats } from '../utils/entryStats';

const PROFILE_STATS = [
  { label: 'Most Used Entry Type', key: 'mostUsedType' },
  { label: 'Entries Added This Week', key: 'entriesThisWeek' },
  { label: 'Current Streak', key: 'currentStreak', suffix: ' Days' },
  { label: 'Longest Streak Ever', key: 'longestStreak', suffix: ' Days' },
  { label: 'Average Rating', key: 'averageRating' },
  { label: 'Total Number of Entries', key: 'totalEntries' },
  { label: 'Total Entries This Month', key: 'entriesThisMonth' },
  { label: 'Entries Added Today', key: 'entriesToday' },
  { label: 'Most Frequently Used Rating', key: 'mostFrequentRating' },
  { label: 'Highest Rated Category', key: 'highestRatedCategory' },
];

export default function ProfileScreen() {
  const isFocused = useIsFocused();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  const stats = getEntryStats(entries);

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView contentContainerStyle={styles.content}>
        <Image source={profileIcon} style={styles.icon} />
        <Text style={styles.title}>User Name</Text>
        <Text style={styles.logout}>Log Out</Text>

        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>Stats</Text>
          {loading ? <Text style={styles.statusText}>Loading stats...</Text> : null}
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          {!loading && !error
            ? PROFILE_STATS.map((item) => (
                <View key={item.key} style={styles.statRow}>
                  <Text style={styles.statLabel}>{item.label}</Text>
                  <Text style={styles.statValue}>
                    {`${stats[item.key]}${item.suffix ?? ''}`}
                  </Text>
                </View>
              ))
            : null}
        </View>
      </ScrollView>
      <Navbar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, backgroundColor: '#E6E6E6' 
  },
  
  content: { 
    padding: 16,
    paddingBottom: 24,
  },

  icon: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginBottom: 16,
    marginTop: 20
  },

  title: { 
    fontSize: FontSizes.xxl, fontWeight: 'bold', textAlign: 'center' 
  },

  logout: { 
    textAlign: 'center', color: 'gray', marginBottom: 20 
  },

  statsContainer: { 
    marginTop: 20,
    backgroundColor: '#D9DCE3',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  statsTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '600',
    marginBottom: 10,
  },

  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#B9BFCC',
  },

  statLabel: {
    flex: 1,
    fontSize: FontSizes.m,
    color: '#222222',
  },

  statValue: {
    fontSize: FontSizes.m,
    fontWeight: '600',
    color: '#000000',
  },

  statusText: {
    fontSize: FontSizes.m,
    color: '#333333',
  },

  errorText: {
    fontSize: FontSizes.m,
    color: '#B00020',
  },
});
