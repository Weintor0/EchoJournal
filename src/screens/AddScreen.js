import { createEntry, deleteEntry, getEntryById, updateEntry } from '@/src/api/entries';
import Header from '@/src/components/Header';
import Navbar from '@/src/components/Navbar';
import TypeTag from '@/src/components/TypeTag';
import { ENTRY_TYPES } from '@/src/constants/entryTypes';
import { FontSizes } from '@/src/constants/typography';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Image,
  Modal,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

const noImagePlaceholder = require('../assets/no-image.png');
const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
const WEEKDAY_LABELS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const SLIDER_STEP = 0.1;
const MAX_IMAGE_DIMENSION = 1200;

function formatRatingValue(value) {
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

function formatDateValue(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

function parseDateValue(value) {
  if (typeof value !== 'string') return null;

  const match = value.trim().match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (!match) return null;

  const [, dayText, monthText, yearText] = match;
  const day = Number.parseInt(dayText, 10);
  const month = Number.parseInt(monthText, 10) - 1;
  const year = Number.parseInt(yearText, 10);
  const parsedDate = new Date(year, month, day);

  if (
    parsedDate.getFullYear() !== year ||
    parsedDate.getMonth() !== month ||
    parsedDate.getDate() !== day
  ) {
    return null;
  }

  return parsedDate;
}

function getCalendarDays(baseDate) {
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const startOffset = (firstDayOfMonth.getDay() + 6) % 7;
  const gridStartDate = new Date(year, month, 1 - startOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStartDate);
    date.setDate(gridStartDate.getDate() + index);

    return {
      key: `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`,
      date,
      isCurrentMonth: date.getMonth() === month,
    };
  });
}

function getResizeAction(asset) {
  const width = Number(asset?.width);
  const height = Number(asset?.height);

  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    return null;
  }

  const largestSide = Math.max(width, height);

  if (largestSide <= MAX_IMAGE_DIMENSION) {
    return null;
  }

  if (width >= height) {
    return {
      resize: {
        width: MAX_IMAGE_DIMENSION,
      },
    };
  }

  return {
    resize: {
      height: MAX_IMAGE_DIMENSION,
    },
  };
}

export default function AddScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const entryId = typeof params.id === 'string' ? params.id : '';
  const isEditMode = Boolean(entryId);

  const [title, setTitle] = useState('');
  const [type, setType] = useState('Other');
  const [rating, setRating] = useState('');
  const [date, setDate] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [sliderWidth, setSliderWidth] = useState(0);
  const [isLoadingEntry, setIsLoadingEntry] = useState(isEditMode);
  const sliderWidthRef = useRef(0);

  const parsedRating = Number.parseFloat(rating.replace(',', '.'));
  const sliderValue = Number.isNaN(parsedRating) ? 0 : Math.max(0, Math.min(10, parsedRating));
  const selectedDate = parseDateValue(date);
  const calendarDays = getCalendarDays(calendarMonth);

  useEffect(() => {
    let isActive = true;

    async function loadEntry() {
      if (!isEditMode) {
        setIsLoadingEntry(false);
        return;
      }

      try {
        setIsLoadingEntry(true);
        setError('');
        const entry = await getEntryById(entryId);

        if (!isActive) return;

        setTitle(entry?.title ?? '');
        setType(entry?.type?.trim() ? entry.type : 'Other');
        setRating(
          entry?.rating != null && String(entry.rating).trim() ? String(entry.rating) : ''
        );
        setDate(entry?.date?.trim() ? entry.date : '');
        setImageUrl(entry?.imageUrl?.trim() ? entry.imageUrl : '');
        setNote(entry?.note ?? '');
        setCalendarMonth(parseDateValue(entry?.date) ?? new Date());
      } catch (loadError) {
        if (isActive) {
          setError(loadError.message);
        }
      } finally {
        if (isActive) {
          setIsLoadingEntry(false);
        }
      }
    }

    loadEntry();

    return () => {
      isActive = false;
    };
  }, [entryId, isEditMode]);

  function setRatingFromSlider(value) {
    setRating(formatRatingValue(value));
    setError('');
  }

  function updateRatingFromPosition(positionX) {
    if (sliderWidthRef.current <= 0) return;

    const clampedPosition = Math.max(0, Math.min(sliderWidthRef.current, positionX));
    const nextValue =
      Math.round((clampedPosition / sliderWidthRef.current) * (10 / SLIDER_STEP)) * SLIDER_STEP;

    setRatingFromSlider(nextValue);
  }

  const sliderPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (event) => {
        updateRatingFromPosition(event.nativeEvent.locationX);
      },
      onPanResponderMove: (event) => {
        updateRatingFromPosition(event.nativeEvent.locationX);
      },
    })
  ).current;

  function handleRatingChange(value) {
    const normalizedValue = value.replace(',', '.');

    if (normalizedValue === '') {
      setRating('');
      setError('');
      return;
    }

    if (!/^\d{0,2}(\.\d?)?$/.test(normalizedValue)) {
      return;
    }

    const numericValue = Number.parseFloat(normalizedValue);

    if (!Number.isNaN(numericValue) && numericValue > 10) {
      return;
    }

    setRating(normalizedValue);
    setError('');
  }

  function handleRatingBlur() {
    const normalizedValue = rating.replace(',', '.').trim();

    if (!normalizedValue) {
      setRating('');
      return;
    }

    const numericValue = Number.parseFloat(normalizedValue);

    if (Number.isNaN(numericValue)) {
      setRating('');
      return;
    }

    setRating(formatRatingValue(Math.max(0, Math.min(10, numericValue))));
  }

  function openCalendar() {
    setCalendarMonth(parseDateValue(date) ?? new Date());
    setIsCalendarVisible(true);
  }

  function handleSelectDate(nextDate) {
    setDate(formatDateValue(nextDate));
    setIsCalendarVisible(false);
    setError('');
  }

  async function handlePickImage() {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        setError('Media library permission is required to upload an image.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (result.canceled) return;

      const asset = result.assets?.[0];

      if (!asset?.uri) {
        setError('The selected image could not be processed.');
        return;
      }

      const resizeAction = getResizeAction(asset);
      const processedImage = await manipulateAsync(
        asset.uri,
        resizeAction ? [resizeAction] : [],
        {
          base64: true,
          compress: 0.7,
          format: SaveFormat.JPEG,
        }
      );

      if (!processedImage.base64) {
        setError('The selected image could not be processed.');
        return;
      }

      setImageUrl(`data:image/jpeg;base64,${processedImage.base64}`);
      setError('');
    } catch {
      setError('The selected image could not be processed.');
    }
  }

  async function handleSaveEntry() {
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setError('Title is required.');
      return;
    }

    const numericRating = Number.parseFloat(rating.replace(',', '.'));
    const safeRating = Number.isNaN(numericRating)
      ? ''
      : String(Math.max(0, Math.min(10, numericRating)));
    const payload = {
      title: trimmedTitle,
      type,
      rating: safeRating,
      date: date.trim(),
      imageUrl: imageUrl || '',
      note: note.trim(),
    };

    try {
      setIsSubmitting(true);
      setError('');

      let savedEntry;

      if (isEditMode) {
        try {
          savedEntry = await updateEntry(entryId, payload);
        } catch (updateError) {
          const message = typeof updateError?.message === 'string' ? updateError.message : '';
          const canFallbackToReplace =
            message.includes('Cannot PUT') ||
            message.includes('404') ||
            message === 'Request failed.';

          if (!canFallbackToReplace) {
            throw updateError;
          }

          const replacementEntry = await createEntry(payload);
          await deleteEntry(entryId);
          savedEntry = replacementEntry;
        }
      } else {
        savedEntry = await createEntry(payload);
      }

      router.replace({
        pathname: '/entry/[id]',
        params: {
          id: String(savedEntry.id),
        },
      });
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const screenTitle = isEditMode ? 'Edit Entry' : 'Add Entry';
  const submitLabel = isEditMode ? 'Save Changes' : 'Create Entry';

  return (
    <View style={styles.container}>
      <Header />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.info}>
          <Text style={styles.title}>{screenTitle}</Text>
          {isLoadingEntry ? <Text style={styles.helperText}>Loading entry...</Text> : null}

          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Title"
            style={styles.input}
          />

          <View style={styles.metaRow}>
            <View style={styles.metaInput}>
              <Text style={styles.fieldLabel}>Type</Text>
              <View style={styles.typeList}>
                {ENTRY_TYPES.map((entryType) => {
                  const isSelected = entryType.label === type;

                  return (
                    <Pressable
                      key={entryType.label}
                      onPress={() => setType(entryType.label)}
                      style={[styles.typeOption, isSelected && styles.typeOptionSelected]}
                    >
                      <TypeTag
                        type={entryType.label}
                        style={styles.typeTag}
                        textStyle={styles.typeTagText}
                      />
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </View>

          <TextInput
            value={rating}
            onChangeText={handleRatingChange}
            onBlur={handleRatingBlur}
            placeholder="Rating (0-10)"
            keyboardType="decimal-pad"
            style={styles.input}
          />
          <View
            style={styles.sliderSection}
            onLayout={(event) => {
              const { width } = event.nativeEvent.layout;
              sliderWidthRef.current = width;
              setSliderWidth(width);
            }}
            {...sliderPanResponder.panHandlers}
          >
            <View style={styles.sliderTrack}>
              <View
                style={[styles.sliderFill, { width: sliderWidth ? `${(sliderValue / 10) * 100}%` : '0%' }]}
              />
              <View
                style={[
                  styles.sliderThumb,
                  { left: sliderWidth ? (sliderValue / 10) * sliderWidth - 12 : -12 },
                ]}
              />
            </View>
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabel}>0</Text>
              <Text style={styles.sliderValue}>{formatRatingValue(sliderValue)}</Text>
              <Text style={styles.sliderLabel}>10</Text>
            </View>
          </View>

          <Text style={styles.fieldLabel}>Date</Text>
          <Pressable style={styles.input} onPress={openCalendar}>
            <Text style={date ? styles.dateText : styles.datePlaceholder}>
              {date || 'Pick a date'}
            </Text>
          </Pressable>

          <Text style={styles.fieldLabel}>Cover Image</Text>
          <Pressable style={styles.uploadButton} onPress={handlePickImage}>
            <Text style={styles.uploadButtonText}>Upload From Gallery</Text>
          </Pressable>
          <Image
            source={imageUrl ? { uri: imageUrl } : noImagePlaceholder}
            style={styles.previewImage}
            resizeMode={imageUrl ? 'cover' : 'contain'}
          />
          {!imageUrl ? <Text style={styles.helperText}>No image selected yet.</Text> : null}
        </View>

        <View style={styles.thoughts}>
          <Text style={styles.sectionTitle}>My Thoughts</Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="Write your thoughts..."
            multiline
            textAlignVertical="top"
            style={styles.noteInput}
          />
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Pressable
          style={[styles.button, (isSubmitting || isLoadingEntry) && styles.buttonDisabled]}
          onPress={handleSaveEntry}
          disabled={isSubmitting || isLoadingEntry}
        >
          <Text style={styles.buttonText}>
            {isSubmitting ? 'Saving...' : submitLabel}
          </Text>
        </Pressable>
      </ScrollView>

      <Modal
        visible={isCalendarVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsCalendarVisible(false)}
      >
        <Pressable style={styles.calendarBackdrop} onPress={() => setIsCalendarVisible(false)}>
          <Pressable style={styles.calendarModal} onPress={() => {}}>
            <View style={styles.calendarHeader}>
              <Pressable
                style={styles.calendarNavButton}
                onPress={() =>
                  setCalendarMonth(
                    new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1)
                  )
                }
              >
                <Text style={styles.calendarNavText}>{'<'}</Text>
              </Pressable>
              <Text style={styles.calendarTitle}>
                {MONTH_NAMES[calendarMonth.getMonth()]} {calendarMonth.getFullYear()}
              </Text>
              <Pressable
                style={styles.calendarNavButton}
                onPress={() =>
                  setCalendarMonth(
                    new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1)
                  )
                }
              >
                <Text style={styles.calendarNavText}>{'>'}</Text>
              </Pressable>
            </View>

            <View style={styles.calendarWeekdays}>
              {WEEKDAY_LABELS.map((label) => (
                <Text key={label} style={styles.calendarWeekdayText}>
                  {label}
                </Text>
              ))}
            </View>

            <View style={styles.calendarGrid}>
              {calendarDays.map(({ key, date: dayDate, isCurrentMonth }) => {
                const isSelected =
                  selectedDate &&
                  dayDate.getDate() === selectedDate.getDate() &&
                  dayDate.getMonth() === selectedDate.getMonth() &&
                  dayDate.getFullYear() === selectedDate.getFullYear();

                return (
                  <Pressable
                    key={key}
                    style={[styles.calendarDay, isSelected && styles.calendarDaySelected]}
                    onPress={() => handleSelectDate(dayDate)}
                  >
                    <Text
                      style={[
                        styles.calendarDayText,
                        !isCurrentMonth && styles.calendarDayOutsideMonth,
                        isSelected && styles.calendarDaySelectedText,
                      ]}
                    >
                      {dayDate.getDate()}
                    </Text>
                  </Pressable>
                );
              })}
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
  },
  info: {
    padding: 16,
    backgroundColor: '#D9DCE3',
    borderRadius: 10,
    marginBottom: 16,
  },
  title: {
    fontSize: FontSizes.xl,
    fontWeight: '600',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#E6E6E6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: FontSizes.m,
    marginBottom: 12,
    width: '100%',
  },
  dateText: {
    fontSize: FontSizes.m,
    color: '#000000',
  },
  datePlaceholder: {
    fontSize: FontSizes.m,
    color: '#666666',
  },
  metaRow: {
    marginBottom: 10,
  },
  fieldLabel: {
    fontSize: FontSizes.s,
    fontWeight: '600',
    marginBottom: 6,
  },
  uploadButton: {
    backgroundColor: '#5A6FB2',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  uploadButtonText: {
    color: '#000000',
    fontSize: FontSizes.s,
    fontWeight: '600',
  },
  previewImage: {
    width: 100,
    height: 140,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#C4C8D1',
    overflow: 'hidden',
  },
  helperText: {
    fontSize: FontSizes.s,
    color: '#555',
    marginBottom: 8,
  },
  sliderSection: {
    marginBottom: 12,
  },
  sliderTrack: {
    height: 10,
    backgroundColor: '#C4C8D1',
    borderRadius: 999,
    position: 'relative',
    justifyContent: 'center',
    marginTop: 6,
  },
  sliderFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#5A6FB2',
    borderRadius: 999,
  },
  sliderThumb: {
    position: 'absolute',
    top: -7,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#5A6FB2',
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  sliderLabel: {
    fontSize: FontSizes.s,
    color: '#555555',
  },
  sliderValue: {
    fontSize: FontSizes.s,
    fontWeight: '600',
    color: '#000000',
  },
  typeList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeOption: {
    borderRadius: 999,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  typeOptionSelected: {
    borderColor: '#5A6FB2',
  },
  typeTag: {
    alignSelf: 'stretch',
  },
  typeTagText: {
    fontSize: FontSizes.xs,
  },
  thoughts: {
    padding: 16,
    backgroundColor: '#D9DCE3',
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: FontSizes.l,
    fontWeight: '600',
    marginBottom: 8,
  },
  noteInput: {
    minHeight: 120,
    backgroundColor: '#E6E6E6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: FontSizes.m,
  },
  errorText: {
    color: '#B00020',
    fontSize: FontSizes.s,
    marginTop: 12,
  },
  button: {
    marginTop: 14,
    backgroundColor: '#5A6FB2',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#000000',
    fontSize: FontSizes.xl,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  calendarBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    justifyContent: 'center',
    padding: 20,
  },
  calendarModal: {
    backgroundColor: '#F4F5F7',
    borderRadius: 16,
    padding: 16,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  calendarNavButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#D9DCE3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarNavText: {
    fontSize: FontSizes.l,
    fontWeight: '600',
  },
  calendarTitle: {
    fontSize: FontSizes.m,
    fontWeight: '600',
  },
  calendarWeekdays: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  calendarWeekdayText: {
    width: `${100 / 7}%`,
    textAlign: 'center',
    fontSize: FontSizes.s,
    fontWeight: '600',
    color: '#666666',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
  },
  calendarDaySelected: {
    backgroundColor: '#5A6FB2',
  },
  calendarDayText: {
    fontSize: FontSizes.s,
    color: '#000000',
  },
  calendarDayOutsideMonth: {
    color: '#9AA0AE',
  },
  calendarDaySelectedText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
