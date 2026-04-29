import { useIsFocused } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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

const PROFILE_PICTURE_URI = FileSystem.documentDirectory
  ? `${FileSystem.documentDirectory}profile-picture.jpg`
  : '';

export default function ProfileScreen() {
  const isFocused = useIsFocused();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profilePictureUri, setProfilePictureUri] = useState('');
  const [profilePictureVersion, setProfilePictureVersion] = useState(0);
  const [profilePictureError, setProfilePictureError] = useState('');

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

  useEffect(() => {
    let isActive = true;

    async function loadProfilePicture() {
      if (!PROFILE_PICTURE_URI) return;

      try {
        const profilePictureInfo = await FileSystem.getInfoAsync(PROFILE_PICTURE_URI);

        if (isActive && profilePictureInfo.exists) {
          setProfilePictureUri(PROFILE_PICTURE_URI);
          setProfilePictureVersion(Date.now());
        }
      } catch {
        if (isActive) {
          setProfilePictureUri('');
        }
      }
    }

    if (isFocused) {
      loadProfilePicture();
    }

    return () => {
      isActive = false;
    };
  }, [isFocused]);

  async function handlePickProfilePicture() {
    try {
      setProfilePictureError('');

      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        setProfilePictureError('Media library permission is required to add a profile picture.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled) return;

      const selectedAsset = result.assets?.[0];

      if (!selectedAsset?.uri) {
        setProfilePictureError('The selected profile picture could not be processed.');
        return;
      }

      if (!PROFILE_PICTURE_URI) {
        setProfilePictureUri(selectedAsset.uri);
        return;
      }

      await FileSystem.deleteAsync(PROFILE_PICTURE_URI, { idempotent: true });
      await FileSystem.copyAsync({
        from: selectedAsset.uri,
        to: PROFILE_PICTURE_URI,
      });

      setProfilePictureUri(PROFILE_PICTURE_URI);
      setProfilePictureVersion(Date.now());
    } catch {
      setProfilePictureError('The selected profile picture could not be saved.');
    }
  }

  const stats = getEntryStats(entries);
  const hasProfilePicture = Boolean(profilePictureUri);

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView contentContainerStyle={styles.content}>
        <Image
          key={`${profilePictureUri}-${profilePictureVersion}`}
          source={hasProfilePicture ? { uri: profilePictureUri } : profileIcon}
          style={styles.icon}
        />
        <Pressable style={styles.profilePictureButton} onPress={handlePickProfilePicture}>
          <Text style={styles.profilePictureButtonText}>
            {hasProfilePicture ? 'Change Profile Picture' : 'Add Profile Picture'}
          </Text>
        </Pressable>
        {profilePictureError ? (
          <Text style={styles.profilePictureError}>{profilePictureError}</Text>
        ) : null}
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
    borderRadius: 50,
    alignSelf: 'center',
    marginBottom: 12,
    marginTop: 20
  },

  profilePictureButton: {
    alignSelf: 'center',
    backgroundColor: '#5A6FB2',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 10,
  },

  profilePictureButtonText: {
    color: '#000000',
    fontSize: FontSizes.s,
    fontWeight: '600',
  },

  profilePictureError: {
    alignSelf: 'center',
    color: '#B00020',
    fontSize: FontSizes.s,
    marginBottom: 8,
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
