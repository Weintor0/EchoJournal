import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import EntryCard from '../components/EntryCard';
import Navbar from '../components/Navbar';

const dummyData = [
  {
    id: '1',
    title: 'Inception',
    note: 'A layered sci-fi story with a strong ending.',
    type: 'Movie',
    rating: 9.8,
    date: '10.04.2026',
  },
  {
    id: '2',
    title: 'Breaking Bad',
    note: 'Intense episodes and great character writing.',
    type: 'Series',
    rating: 9.7,
    date: '11.04.2026',
  },
  {
    id: '3',
    title: 'Interstellar',
    note: 'Excellent soundtrack and emotional scenes.',
    type: 'Movie',
    rating: 9.5,
    date: '12.04.2026',
  },
];

export default function MyJournalScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.header}>My Journal</Text>
        <FlatList
          data={dummyData}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <EntryCard entry={item} />}
        />
      </View>
      <Navbar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E6E6E6' },
  content: { flex: 1, padding: 16 },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
});
