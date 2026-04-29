import { useIsFocused } from '@react-navigation/native';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { getCurrentUser, logoutUser, updateProfilePicture } from '../api/auth';
import { getEntries } from '../api/entries';
import editIcon from "../assets/icons/edit.png";
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

const PROFILE_IMAGE_SIZE = 500;

export default function ProfileScreen() {
  const router = useRouter();
  const isFocused = useIsFocused();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
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

    async function loadCurrentUser() {
      try {
        const user = await getCurrentUser();

        if (isActive) {
          setCurrentUser(user);
        }
      } catch {
        if (isActive) {
          setCurrentUser(null);
        }
      }
    }

    if (isFocused) {
      loadCurrentUser();
    }

    return () => {
      isActive = false;
    };
  }, [isFocused]);

  async function handlePickProfilePicture() {
    try {
      setProfilePictureError('');

      if (!currentUser?.id) {
        setProfilePictureError('Please log in before adding a profile picture.');
        return;
      }

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

      const processedImage = await manipulateAsync(
        selectedAsset.uri,
        [{ resize: { width: PROFILE_IMAGE_SIZE } }],
        {
          base64: true,
          compress: 0.75,
          format: SaveFormat.JPEG,
        }
      );

      if (!processedImage.base64) {
        setProfilePictureError('The selected profile picture could not be processed.');
        return;
      }

      const updatedUser = await updateProfilePicture(
        currentUser.id,
        `data:image/jpeg;base64,${processedImage.base64}`
      );
      setCurrentUser(updatedUser);
    } catch {
      setProfilePictureError('The selected profile picture could not be saved.');
    }
  }

  async function handleLogout() {
    await logoutUser();
    router.replace('/login');
  }

  const stats = getEntryStats(entries);
  const profilePicture = currentUser?.profilePicture ?? '';
  const hasProfilePicture = Boolean(profilePicture);
  const displayName = currentUser
    ? `${currentUser.name} ${currentUser.surname}`.trim()
    : 'User Name';

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable style={styles.profilePictureControl} onPress={handlePickProfilePicture}>
          <Image
            source={hasProfilePicture ? { uri: profilePicture } : profileIcon}
            style={styles.icon}
          />
          <Image source={editIcon} style={styles.editIcon} />
        </Pressable>
        {profilePictureError ? (
          <Text style={styles.profilePictureError}>{profilePictureError}</Text>
        ) : null}
        <Text style={styles.title}>{displayName}</Text>
        <Pressable onPress={handleLogout}>
          <Text style={styles.logout}>Log Out</Text>
        </Pressable>

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

  profilePictureControl: {
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 12,
  },

  icon: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },

  editIcon: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 22,
    height: 22,
    resizeMode: 'contain',
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
