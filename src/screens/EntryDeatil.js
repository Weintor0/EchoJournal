import { deleteEntry, getEntryById } from '@/src/api/entries';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Header from '../components/Header';
import Navbar from '../components/Navbar';
import TypeTag from '../components/TypeTag';
import { FontSizes } from '../constants/typography';
import { useLanguage } from '../hooks/useLanguage';

const starIcon = require('../assets/icons/star.png');
const calendarIcon = require('../assets/icons/calendar.png');
const noImagePlaceholder = require('../assets/no-image.png');

export default function EntryDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const entryId = typeof params.id === 'string' ? params.id : '';
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    let isActive = true;

    async function loadEntry() {
      if (!entryId) {
        setError(t('entryIdMissing'));
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
  }, [entryId, t]);

  const title = entry?.title ?? t('untitled');
  const type = entry?.type ?? '-';
  const rating =
    entry?.rating != null && String(entry.rating).trim() ? String(entry.rating) : '-';
  const date = entry?.date?.trim() ? entry.date : '-';
  const imageUrl = entry?.imageUrl?.trim() ? entry.imageUrl : '';
  const note = entry?.note?.trim() ? entry.note : t('noNotesYet');

  function handleEditPress() {
    if (!entryId) {
      setError(t('entryIdMissing'));
      return;
    }

    router.push({
      pathname: '/add',
      params: {
        id: entryId,
      },
    });
  }

  function confirmDelete() {
    if (!entryId || isDeleting) {
      return;
    }
    setIsDeleteModalVisible(true);
  }

  async function handleDeletePress() {
    if (!entryId) {
      setError(t('entryIdMissing'));
      return;
    }

    try {
      setIsDeleting(true);
      setError('');
      setIsDeleteModalVisible(false);
      await deleteEntry(entryId);
      router.replace('/journal');
    } catch (deleteError) {
      setError(deleteError.message);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <View style={styles.container}>
      <Header />

      <ScrollView contentContainerStyle={styles.content}>
        {loading ? <Text style={styles.statusText}>{t('loadingEntry')}</Text> : null}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {!loading && !error ? (
          <>
            <View style={styles.info}>
              <Text style={styles.title}>{title}</Text>

              <View style={styles.meta}>
                <View style={styles.imageContainer}>
                  <Image
                    source={imageUrl ? { uri: imageUrl } : noImagePlaceholder}
                    style={styles.image}
                    resizeMode={imageUrl ? 'cover' : 'contain'}
                  />
                </View>

                <View style={styles.metaText}>
                  <View style={styles.infoRow}>
                    <Text style={styles.metaItem}>{t('type')}:</Text>
                    <TypeTag type={type} />
                  </View>

                  <View style={styles.infoRow}>
                    <Text style={styles.metaItem}>{t('rate')}:</Text>
                    <Image source={starIcon} style={styles.ratingIcon} />
                    <Text style={styles.metaItem}>{rating !== '-' ? `${rating}/10` : '-'}</Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Text style={styles.metaItem}>{t('date')}:</Text>
                    <Image source={calendarIcon} style={styles.calendarIcon} />
                    <Text style={styles.metaItem}>{date}</Text>
                  </View>
                </View>

              </View>
            </View>

            <View style={styles.thoughts}>
              <Text style={styles.sectionTitle}>{t('myThoughts')}</Text>
              <Text
                style={[
                  styles.metaItem
                ]}
              >
                {note}
              </Text>
            </View>

            <View style={styles.editDelete}>
              <Pressable style={styles.editButton} onPress={handleEditPress}>
                <Text style={styles.actionButtonText}>{t('edit')}</Text>
              </Pressable>
              <Pressable
                style={[styles.deleteButton, isDeleting && styles.actionButtonDisabled]}
                onPress={confirmDelete}
                disabled={isDeleting}
              >
                <Text style={styles.actionButtonText}>
                  {isDeleting ? t('deleting') : t('delete')}
                </Text>
              </Pressable>
            </View>
          </>
        ) : null}
      </ScrollView>

      <Modal
        visible={isDeleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsDeleteModalVisible(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => {
            if (!isDeleting) {
              setIsDeleteModalVisible(false);
            }
          }}
        >
          <Pressable style={styles.deleteModal} onPress={() => {}}>
            <Text style={styles.deleteModalTitle}>{t('deleteEntry')}</Text>
            <Text style={styles.deleteModalText}>
              {t('deleteEntryDescription')}
            </Text>
            <View style={styles.deleteModalActions}>
              <Pressable
                style={styles.cancelButton}
                onPress={() => setIsDeleteModalVisible(false)}
                disabled={isDeleting}
              >
                <Text style={styles.actionButtonText}>{t('cancel')}</Text>
              </Pressable>
              <Pressable
                style={[styles.deleteButton, isDeleting && styles.actionButtonDisabled]}
                onPress={handleDeletePress}
                disabled={isDeleting}
              >
                <Text style={styles.actionButtonText}>
                  {isDeleting ? t('deleting') : t('delete')}
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
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
    padding: 16,
    paddingBottom: 16,
  },

  info: {
    padding: 16,
    backgroundColor: '#D9DCE3',
    borderRadius: 10,
  },

  title: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    marginBottom: 10,
  },

  meta: {
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: 16,
  },

  metaText: {
    flex: 1,
    minWidth: 150,
  },

  metaItem: {
    fontSize: FontSizes.m,
    marginBottom: 4,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },

  ratingIcon: {
    width: 16,
    height: 16,
    resizeMode: 'contain',
  },

  calendarIcon: {
    width: 16,
    height: 16,
    resizeMode: 'contain',
  },

  thoughts: {
    padding: 16,
    backgroundColor: '#D9DCE3',
    marginTop: 16,
    borderRadius: 10,
  },

  sectionTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '600',
    marginBottom: 6,
  },

  imageContainer: {
    width: '32%',
    maxWidth: 120,
    minWidth: 88,
    aspectRatio: 5 / 7,
  },

  image: {
    width: '100%',
    height: '100%',
    backgroundColor: '#C4C8D1',
    borderRadius: 5,
    overflow: 'hidden',
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
    fontSize: FontSizes.s,
  },
  editDelete: {
    marginTop: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  editButton: {
    flex: 1,
    minWidth: 120,
    backgroundColor: '#5A6FB2',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  deleteButton: {
    flex: 1,
    minWidth: 120,
    backgroundColor: '#B45151',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#000000',
    fontSize: FontSizes.m,
    fontWeight: '600',
  },
  actionButtonDisabled: {
    opacity: 0.7,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    justifyContent: 'center',
    padding: 20,
  },
  deleteModal: {
    backgroundColor: '#F4F5F7',
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  deleteModalTitle: {
    fontSize: FontSizes.l,
    fontWeight: '600',
    color: '#000000',
  },
  deleteModalText: {
    fontSize: FontSizes.m,
    color: '#333333',
  },
  deleteModalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#C4C8D1',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
});
