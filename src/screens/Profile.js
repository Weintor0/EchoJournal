import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Navbar from '../components/Navbar';

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>User Name</Text>
        <Text style={styles.logout}>Log Out</Text>

        <View style={styles.statsContainer}>
          {[...Array(8)].map((_, i) => (
            <View key={i} style={styles.statRow}>
              <Text>Stat{i + 1}</Text>
              <Text>6514</Text>
            </View>
          ))}
        </View>
      </View>
      <Navbar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E6E6E6' },
  content: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center' },
  logout: { textAlign: 'center', color: 'gray', marginBottom: 20 },
  statsContainer: { marginTop: 20 },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
});
