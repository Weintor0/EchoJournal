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
import { useLanguage } from '../hooks/useLanguage';
import { getEntryStats } from '../utils/entryStats';

const PROFILE_STATS = [
  { labelKey: 'profileMostUsedEntryType', key: 'mostUsedType', isType: true },
  { labelKey: 'profileEntriesAddedThisWeek', key: 'entriesThisWeek' },
  { labelKey: 'profileCurrentStreak', key: 'currentStreak', suffixKey: 'days' },
  { labelKey: 'profileLongestStreakEver', key: 'longestStreak', suffixKey: 'days' },
  { labelKey: 'profileAverageRating', key: 'averageRating' },
  { labelKey: 'profileTotalNumberOfEntries', key: 'totalEntries' },
  { labelKey: 'profileTotalEntriesThisMonth', key: 'entriesThisMonth' },
  { labelKey: 'profileEntriesAddedToday', key: 'entriesToday' },
  { labelKey: 'profileMostFrequentlyUsedRating', key: 'mostFrequentRating' },
  { labelKey: 'profileHighestRatedCategory', key: 'highestRatedCategory', isType: true },
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
  const { getEntryTypeLabel, t } = useLanguage();

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
        setProfilePictureError(t('loginBeforeProfilePicture'));
        return;
      }

      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        setProfilePictureError(t('profilePicturePermissionRequired'));
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
        setProfilePictureError(t('profilePictureProcessError'));
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
        setProfilePictureError(t('profilePictureProcessError'));
        return;
      }

      const updatedUser = await updateProfilePicture(
        currentUser.id,
        `data:image/jpeg;base64,${processedImage.base64}`
      );
      setCurrentUser(updatedUser);
    } catch {
      setProfilePictureError(t('profilePictureSaveError'));
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
    : t('userName');

  function getStatValue(item) {
    const value = item.isType ? getEntryTypeLabel(stats[item.key]) : stats[item.key];
    return `${value}${item.suffixKey ? ` ${t(item.suffixKey)}` : ''}`;
  }

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
          <Text style={styles.logout}>{t('logOut')}</Text>
        </Pressable>

        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>{t('stats')}</Text>
          {loading ? <Text style={styles.statusText}>{t('loadingStats')}</Text> : null}
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          {!loading && !error
            ? PROFILE_STATS.map((item) => (
                <View key={item.key} style={styles.statRow}>
                  <Text style={styles.statLabel}>{t(item.labelKey)}</Text>
                  <Text style={styles.statValue}>
                    {getStatValue(item)}
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
    flex: 1, 
    backgroundColor: '#E6E6E6' 
  },
  
  content: { 
    padding: 16,
    paddingBottom: 24,
  },

  profilePictureControl: {
    width: '100%',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 12,
  },

  icon: {
    width: '38%',
    maxWidth: 150,
    minWidth: 96,
    aspectRatio: 1,
    borderRadius: 999,
  },

  editIcon: {
    position: 'absolute',
    right: '30%',
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
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    textAlign: 'center',
  },

  logout: { 
    textAlign: 'center',
    color: 'gray',
    fontSize: FontSizes.m,
    marginBottom: 20,
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
    flexWrap: 'wrap',
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
    flexShrink: 1,
    textAlign: 'right',
  },

  statusText: {
    fontSize: FontSizes.m,
    color: '#333333',
  },

  errorText: {
    fontSize: FontSizes.s,
    color: '#B00020',
  },
});
