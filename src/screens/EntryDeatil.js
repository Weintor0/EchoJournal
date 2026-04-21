import { getEntryById } from '@/src/api/entries';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import Header from '../components/Header';
import Navbar from '../components/Navbar';
import TypeTag from '../components/TypeTag';
import { FontSizes } from '../constants/typography';

const starIcon = require('../assets/icons/star.png');

export default function EntryDetailScreen() {
  const params = useLocalSearchParams();
  const entryId = typeof params.id === 'string' ? params.id : '';
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isActive = true;

    async function loadEntry() {
      if (!entryId) {
        setError('Entry id is missing.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');
        const data = await getEntryById(entryId);

        if (isActive) {
          setEntry(data);
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

    loadEntry();

    return () => {
      isActive = false;
    };
  }, [entryId]);

  const title = entry?.title ?? 'Untitled';
  const type = entry?.type ?? '-';
  const rating =
    entry?.rating != null && String(entry.rating).trim() ? String(entry.rating) : '-';
  const date = entry?.date?.trim() ? entry.date : '-';
  const imageUrl = entry?.imageUrl?.trim() ? entry.imageUrl : '';
  const note = entry?.note?.trim() ? entry.note : 'No notes yet.';

  return (
    <View style={styles.container}>
      <Header />

      <View style={styles.content}>
        {loading ? <Text style={styles.statusText}>Loading entry...</Text> : null}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {!loading && !error ? (
          <>
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
                  <View style={styles.typeRow}>
                    <Text style={styles.metaItem}>Type:</Text>
                    <TypeTag type={type} />
                  </View>

                  <View style={styles.ratingRow}>
                    <Text style={styles.metaItem}>Rate:</Text>
                    <Image source={starIcon} style={styles.ratingIcon} />
                    <Text style={styles.metaItem}>{rating !== '-' ? `${rating}/10` : '-'}</Text>
                  </View>

                  <Text style={styles.metaItem}>Date: {date}</Text>
                </View>
              </View>
            </View>

            <View style={styles.thoughts}>
              <Text style={styles.sectionTitle}>My Thoughts</Text>
              <Text style={styles.metaItem}>{note}</Text>
            </View>
          </>
        ) : null}
      </View>

      <Navbar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E6E6E6',
  },

  content: {
    flex: 1,
  },

  info: {
    padding: 16,
    backgroundColor: '#D9DCE3',
    margin: 16,
    borderRadius: 10,
  },

  title: {
    fontSize: FontSizes.xxl,
    fontWeight: '600',
    marginBottom: 10,
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
    marginBottom: 4,
  },

  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },

  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },

  ratingIcon: {
    width: 16,
    height: 16,
    resizeMode: 'contain',
  },

  thoughts: {
    padding: 16,
    backgroundColor: '#D9DCE3',
    margin: 16,
    borderRadius: 10,
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
    backgroundColor: 'black',
    borderRadius: 5,
  },

  statusText: {
    marginHorizontal: 16,
    marginTop: 16,
    fontSize: FontSizes.m,
  },

  errorText: {
    marginHorizontal: 16,
    marginTop: 16,
    color: '#B00020',
    fontSize: FontSizes.m,
  },
});
