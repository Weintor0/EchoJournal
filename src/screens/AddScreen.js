import { createEntry, deleteEntry, getEntryById, updateEntry } from '@/src/api/entries';
import Header from '@/src/components/Header';
import Navbar from '@/src/components/Navbar';
import RatingSlider from "@/src/components/RatingSlider";
import TypeTag from '@/src/components/TypeTag';
import { ENTRY_TYPES } from '@/src/constants/entryTypes';
import { FontSizes } from '@/src/constants/typography';
import { useLanguage } from '@/src/hooks/useLanguage';
import { parseDateValue } from "@/src/utils/date";
import { normalizeHtmlNote, noteToHtml } from '@/src/utils/htmlNote';
import DateTimePicker from '@react-native-community/datetimepicker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { actions, RichEditor, RichToolbar } from 'react-native-pell-rich-editor';

const noImagePlaceholder = require('../assets/no-image.png');
const paletteIcon = require('../assets/icons/palette.png');
const formatIcon = require('../assets/icons/format.png');
const MAX_IMAGE_DIMENSION = 1200;
const NOTE_COLORS = ['#F8F4E3', '#E8F3E8', '#E7F0FA', '#F7E7E3', '#EFE7FA', '#F2F2F2'];
const DEFAULT_NOTE_COLOR = NOTE_COLORS[0];
const FORMAT_ACTIONS = [actions.setBold, actions.setItalic, actions.setUnderline];

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

function getResizeAction(asset, maxDimension = MAX_IMAGE_DIMENSION) {
  const width = Number(asset?.width);
  const height = Number(asset?.height);

  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    return null;
  }

  const largestSide = Math.max(width, height);

  if (largestSide <= maxDimension) {
    return null;
  }

  if (width >= height) {
    return {
      resize: {
        width: maxDimension,
      },
    };
  }

  return {
    resize: {
      height: maxDimension,
    },
  };
}

async function createCompressedImageUri(asset) {
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
    throw new Error('Image processing failed.');
  }

  return `data:image/jpeg;base64,${processedImage.base64}`;
}

export default function AddScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const richText = useRef(null);
  const entryId = typeof params.id === 'string' ? params.id : '';
  const isEditMode = Boolean(entryId);

  const [title, setTitle] = useState('');
  const [type, setType] = useState('Other');
  const [rating, setRating] = useState('');
  const [date, setDate] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [note, setNote] = useState('');
  const [noteColor, setNoteColor] = useState(DEFAULT_NOTE_COLOR);
  const [isColorPaletteVisible, setIsColorPaletteVisible] = useState(false);
  const [isFormatToolbarVisible, setIsFormatToolbarVisible] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [isLoadingEntry, setIsLoadingEntry] = useState(isEditMode);
  const { t } = useLanguage();

  const parsedRating = Number.parseFloat(rating.replace(',', '.'));
  const sliderValue = Number.isNaN(parsedRating) ? 0 : Math.max(0, Math.min(10, parsedRating));
  const selectedDate = parseDateValue(date);
  const datePickerValue = selectedDate ?? new Date();
  const editorStyle = useMemo(
    () => ({
      backgroundColor: noteColor,
      color: '#000000',
      caretColor: '#000000',
      placeholderColor: '#666666',
      contentCSSText:
        'font-size: 16px; line-height: 22px; padding: 12px; min-height: 220px;',
      cssText: '.pell-content p, .pell-content div { margin: 0; }',
    }),
    [noteColor]
  );

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
        setNote(noteToHtml(entry?.note ?? ''));
        setNoteColor(NOTE_COLORS.includes(entry?.noteColor) ? entry.noteColor : DEFAULT_NOTE_COLOR);

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

  function openDatePicker() {
    setIsDatePickerVisible(true);
  }

  function handleDateChange(event, nextDate) {
    if (Platform.OS !== 'ios') {
      setIsDatePickerVisible(false);
    }

    if (event?.type === 'dismissed' || !nextDate) {
      return;
    }

    setDate(formatDateValue(nextDate));
    setError('');
  }

  function handleNoteChange(nextNote) {
    setNote(nextNote);
  }

  async function handlePickImage() {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        setError(t('mediaPermissionRequired'));
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
        setError(t('imageProcessError'));
        return;
      }

      setImageUrl(await createCompressedImageUri(asset));
      setError('');
    } catch {
      setError(t('imageProcessError'));
    }
  }

  async function handleSaveEntry() {
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setError(t('titleRequired'));
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
      note: normalizeHtmlNote(note),
      noteColor,
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

  const screenTitle = isEditMode ? t('editEntry') : t('addEntry');
  const submitLabel = isEditMode ? t('saveChanges') : t('createEntry');

  return (
    <View style={styles.container}>
      <Header />

      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 16 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets
        >
          <View style={styles.info}>
            <Text style={styles.title}>{screenTitle}</Text>
            {isLoadingEntry ? <Text style={styles.helperText}>{t('loadingEntry')}</Text> : null}
            <View style={styles.section}>
              <Text style={styles.fieldLabel}>{t('title')}</Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder={t('title')}
                style={styles.input}
              />
            </View>
            <View style={styles.section}>
              <View style={styles.metaRow}>
                <View style={styles.metaInput}>
                  <Text style={styles.fieldLabel}>{t('type')}</Text>
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
            </View>
            <View style={styles.section}>
              <Text style={styles.fieldLabel}>{t('rating')}</Text>
              <RatingSlider
                value={sliderValue}
                onChange={setRatingFromSlider}
              />
            </View>
            <View style={styles.section}>
              <Text style={styles.fieldLabel}>{t('date')}</Text>
              <Pressable style={styles.input} onPress={openDatePicker}>
                <Text style={date ? styles.dateText : styles.datePlaceholder}>
                  {date || t('pickDate')}
                </Text>
              </Pressable>
              {isDatePickerVisible ? (
                <DateTimePicker
                  value={datePickerValue}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'compact' : 'default'}
                  onChange={handleDateChange}
                  style={styles.datePicker}
                />
              ) : null}
            </View>
            <View style={styles.section}>
              <Text style={styles.fieldLabel}>{t('coverImage')}</Text>
              <Pressable style={styles.uploadButton} onPress={handlePickImage}>
                <Text style={styles.uploadButtonText}>{t('uploadFromGallery')}</Text>
              </Pressable>
              <Image
                source={imageUrl ? { uri: imageUrl } : noImagePlaceholder}
                style={styles.previewImage}
                resizeMode={imageUrl ? 'cover' : 'contain'}
              />
              {!imageUrl ? <Text style={styles.helperText}>{t('noImageSelected')}</Text> : null}
            </View>
          </View>


          <View style={styles.thoughts}>
            <View style={styles.thoughtsHeader}>
              <Text style={styles.sectionTitle}>{t('myThoughts')}</Text>
            </View>

            <View style={styles.thouhgtActions}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('selectThoughtColor')}
                onPress={() => setIsColorPaletteVisible((isVisible) => !isVisible)}
                style={[styles.helperButton, isColorPaletteVisible && styles.helperButtonActive]}
              >
                <Image source={paletteIcon} style={styles.actionButton}/>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Format thought"
                onPress={() => setIsFormatToolbarVisible((isVisible) => !isVisible)}
                style={[styles.helperButton, isFormatToolbarVisible && styles.helperButtonActive]}
              >
                <Image source={formatIcon} style={styles.actionButton}/>
              </Pressable>
            </View>

            {isColorPaletteVisible ? (
              <View style={styles.colorPalette}>
                {NOTE_COLORS.map((color) => {
                  const isSelected = color === noteColor;

                  return (
                    <Pressable
                      key={color}
                      accessibilityRole="button"
                      accessibilityLabel={t('selectThoughtColor')}
                      onPress={() => setNoteColor(color)}
                      style={[
                        styles.colorSwatch,
                        { backgroundColor: color },
                        isSelected && styles.colorSwatchSelected,
                      ]}
                    />
                  );
                })}
              </View>
            ) : null}

            {isFormatToolbarVisible ? (
              <RichToolbar
                editor={richText}
                actions={FORMAT_ACTIONS}
                iconTint="#333333"
                selectedIconTint="#000000"
                selectedButtonStyle={styles.formatButtonSelected}
                style={styles.formatToolbar}
              />
            ) : null}

            <View style={[styles.noteCard, { backgroundColor: noteColor }]}>
              {!isLoadingEntry ? (
                <RichEditor
                  ref={richText}
                  initialContentHTML={note}
                  initialHeight={240}
                  placeholder={t('writeThoughts')}
                  pasteAsPlainText
                  defaultParagraphSeparator="p"
                  editorStyle={editorStyle}
                  onChange={handleNoteChange}
                  style={styles.richEditor}
                />
              ) : null}
            </View>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Pressable
            style={[styles.button, (isSubmitting || isLoadingEntry) && styles.buttonDisabled]}
            onPress={handleSaveEntry}
            disabled={isSubmitting || isLoadingEntry}
          >
            <Text style={styles.buttonText}>
              {isSubmitting ? t('saving') : submitLabel}
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>

      <Navbar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E6E6E6',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 96,
  },
  section: {
    marginBottom: 16,
  },
  info: {
    padding: 16,
    backgroundColor: '#D9DCE3',
    borderRadius: 10,
    marginBottom: 16,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#E6E6E6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: FontSizes.m,
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
  datePicker: {
    alignSelf: 'flex-start',
    marginTop: 8,
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
    height: 'auto',
    width: '32%',
    maxWidth: 120,
    minWidth: 88,
    aspectRatio: 5 / 7,
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
  thoughtsHeader: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '600',
  },
  colorPalette: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
  },
  colorSwatch: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#B5BAC4',
  },
  colorSwatchSelected: {
    borderColor: '#000000',
    borderWidth: 3,
  },
  noteCard: {
    minHeight: 240,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    overflow: 'hidden',
    position: 'relative',
  },
  richEditor: {
    backgroundColor: 'transparent',
    height: 240,
  },
  thouhgtActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  helperButton: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helperButtonActive: {
    backgroundColor: '#C4C8D1',
  },
  formatToolbar: {
    backgroundColor: '#E6E6E6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#B5BAC4',
    height: 40,
    marginBottom: 12,
  },
  formatButtonSelected: {
    backgroundColor: '#C4C8D1',
  },
  actionButton: {
    width: 20,
    height: 20,
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
    fontSize: FontSizes.m,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
});
