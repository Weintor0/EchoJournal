import { useLocalSearchParams } from 'expo-router';
import { Image, StyleSheet, Text, View } from 'react-native';
import Header from '../components/Header';
import Navbar from '../components/Navbar';
import { FontSizes } from '../constants/typography';

export default function EntryDetailScreen() {
  const params = useLocalSearchParams();
  const title = typeof params.title === 'string' ? params.title : 'Untitled';
  const type = typeof params.type === 'string' ? params.type : '-';
  const rating = typeof params.rating === 'string' ? params.rating : '-';
  const date = typeof params.date === 'string' ? params.date : '-';
  const imageUrl = typeof params.imageUrl === 'string' ? params.imageUrl : '';
  const note = typeof params.note === 'string' ? params.note : 'No notes yet.';

  return (
    <View style={styles.container}>
      <Header />

      <View style={styles.content}>
        <View style={styles.info}>
          <Text style={styles.title}>{title}</Text>

          <View style={styles.meta}>
            <View style={styles.imageContainer}>
              {imageUrl ? (
                <Image source={{ uri: imageUrl }} style={styles.image} />
              ) : (
                <View style={styles.image} />
              )}
            </View>
            <View style={styles.metaText}>
              <Text style={styles.metaItem}>Type: {type}</Text>
              <Text style={styles.metaItem}>Rate: {rating !== '-' ? `${rating}/10` : '-'}</Text>
              <Text style={styles.metaItem}>Date: {date}</Text>
            </View>
          </View>
        </View>

        <View style={styles.thoughts}>
          <Text style={styles.sectionTitle}>My Thoughts</Text>
          <Text style={styles.metaItem}>{note}</Text>
        </View>
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
  },

  info: { 
    padding: 16, 
    backgroundColor: '#D9DCE3', 
    margin: 16, 
    borderRadius: 10
  },

  title: { 
    fontSize: FontSizes.xxl, 
    fontWeight: '600', 
    marginBottom: 10 
  },
  
  meta: { 
    marginBottom: 20, 
    flexDirection: 'row',  
  },

  metaText: { 
    marginLeft: 16,
  },

  metaItem: { 
    fontSize: FontSizes.m, 
    marginBottom: 4 
  },

  thoughts: { 
    padding: 16, 
    backgroundColor: '#D9DCE3', 
    margin: 16, 
    borderRadius: 10
  },

  sectionTitle: {
    fontSize: FontSizes.l,
    fontWeight: '600',
    marginBottom: 6,
  },
  imageContainer: {
    width: 100,
    height: 140,
  },

  image: {
    width: '100%',
    height: '100%',
    backgroundColor: "black",
    borderRadius: 5
  
},
});
