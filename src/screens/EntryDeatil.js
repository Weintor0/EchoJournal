import { StyleSheet, Text, View } from 'react-native';

export default function EntryDetailScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Entry Detail Name</Text>

      <View style={styles.meta}>
        <Text>Type: Movie</Text>
        <Text>Rate: 9.8/10</Text>
        <Text>Date: 10.04.2026</Text>
      </View>

      <Text style={styles.section}>My Thoughts</Text>
      <Text>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  meta: { marginBottom: 20 },
  section: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
});