import { StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import Header from '../components/Header';
import Navbar from '../components/Navbar';

export default function EntryDetailScreen() {
  const params = useLocalSearchParams();
  const title = typeof params.title === 'string' ? params.title : 'Untitled';
  const type = typeof params.type === 'string' ? params.type : '-';
  const rating = typeof params.rating === 'string' ? params.rating : '-';
  const date = typeof params.date === 'string' ? params.date : '-';
  const note = typeof params.note === 'string' ? params.note : 'No notes yet.';

  return (
    <View style={styles.container}>
      <Header />

      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>

        <View style={styles.meta}>
          <Text>Type: {type}</Text>
          <Text>Rate: {rating !== '-' ? `${rating}/10` : '-'}</Text>
          <Text>Date: {date}</Text>
        </View>

        <Text style={styles.section}>My Thoughts</Text>
        <Text>{note}</Text>
      </View>

      <Navbar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E6E6E6' },
  content: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  meta: { marginBottom: 20 },
  section: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
});
