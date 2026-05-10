import { useIsFocused } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from 'react';
import { FlatList, Image, StyleSheet, Text, TextInput, View } from 'react-native';
import { getEntries } from '../api/entries';
import EntryCard from '../components/EntryCard';
import Header from "../components/Header";
import Navbar from '../components/Navbar';
import { FontSizes } from '../constants/typography';
import { useLanguage } from '../hooks/useLanguage';

const searchIcon = require('../assets/icons/search.png');


export default function SearchScreen() {
  const router = useRouter();
  const isFocused = useIsFocused();
  const [query, setQuery] = useState('');
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { t } = useLanguage();

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

  const searchResults = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return [];
    }

    return entries.filter((entry) =>
      String(entry.title ?? '').toLowerCase().includes(normalizedQuery)
    );
  }, [entries, query]);

  const handleEntryPress = (entry) => {
    router.push({
      pathname: "/entry/[id]",
      params: {
        id: entry.id,
      },
    });
  };

  return (
    <View style={styles.container}>
      <Header />
      <View style={styles.content}>
        <View style={styles.searchBar}>
          <Image source={searchIcon} style={styles.searchIcon} />
          <TextInput
            placeholder={t('searchEntries')}
            value={query}
            onChangeText={setQuery}
            style={styles.input}
            autoCapitalize="none"
            autoCorrect={false}
            clearButtonMode="while-editing"
          />
        </View>
        {loading ? <Text style={styles.bodyText}>{t('loadingEntries')}</Text> : null}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        {!loading && !error ? (
          <FlatList
            data={searchResults}
            keyExtractor={(item) => String(item.id)}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.results}
            renderItem={({ item }) => (
              <EntryCard
                entry={item}
                onPress={() => handleEntryPress(item)}
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
    padding: 16,
    minWidth: 0,
  },

  header: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    marginBottom: 16,
  },

  input: {
    flex: 1,
    minWidth: 0,
    height: 50,
    paddingHorizontal: 8,
    fontSize: FontSizes.m,
    outlineStyle: 'none',
  },

  searchBar: {
    width: '100%',
    height: 50,
    borderRadius: 10,
    backgroundColor: '#D9DCE3',
    paddingHorizontal: 10,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },

  results: {
    paddingBottom: 16,
    flexGrow: 1,
  },

  bodyText: {
    fontSize: FontSizes.m,
  },

  errorText: {
    color: '#B00020',
    fontSize: FontSizes.s,
    marginBottom: 10,
  },

  searchIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
});
