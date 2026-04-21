import { createEntry } from '@/src/api/entries';
import Header from '@/src/components/Header';
import Navbar from '@/src/components/Navbar';
import TypeTag from '@/src/components/TypeTag';
import { ENTRY_TYPES } from '@/src/constants/entryTypes';
import { FontSizes } from '@/src/constants/typography';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';


export default function AddScreen() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [type, setType] = useState('Other');
  const [rating, setRating] = useState('');
  const [date, setDate] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      setError('Media library permission is required to upload an image.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // ✅ safest for most Expo SDKs
      allowsEditing: true,
      quality: 0.8,
    });

    if (result.canceled) return;

    const uri = result.assets?.[0]?.uri;

    if (!uri) return;

    setImageUrl(uri);
    setError('');
  };
  const handleCreateEntry = async () => {
  const trimmedTitle = title.trim();

  if (!trimmedTitle) {
    setError('Title is required.');
    return;
  }

  const numericRating = Number.parseFloat(rating);
    const safeRating = Number.isNaN(numericRating)
      ? ''
      : String(Math.max(0, Math.min(10, numericRating)));

    try {
      setIsSubmitting(true);
      setError('');

      const createdEntry = await createEntry({
        title: trimmedTitle,
        type,
        rating: safeRating,
        date: date.trim(),
        imageUrl: imageUrl || '', 
        note: note.trim(),
      });

      router.replace({
        pathname: '/entry/[id]',
        params: {
          id: String(createdEntry.id),
        },
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <View style={styles.container}>
      <Header />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.info}>
          <Text style={styles.title}>Add Entry</Text>

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
            onChangeText={setRating}
            placeholder="Rating (0-10)"
            keyboardType="decimal-pad"
            style={styles.input}
          />

          <TextInput
            value={date}
            onChangeText={setDate}
            placeholder="Date (DD.MM.YYYY)"
            style={styles.input}
          />

          <Text style={styles.fieldLabel}>Cover Image</Text>
          <Pressable style={styles.uploadButton} onPress={handlePickImage}>
            <Text style={styles.uploadButtonText}>Upload From Gallery</Text>
          </Pressable>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.previewImage} />
          ) : (
            <Text style={styles.helperText}>No image selected yet.</Text>
          )}
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
          style={[styles.button, isSubmitting && styles.buttonDisabled]}
          onPress={handleCreateEntry}
          disabled={isSubmitting}
        >
          <Text style={styles.buttonText}>
            {isSubmitting ? 'Creating...' : 'Create Entry'}
          </Text>
        </Pressable>
      </ScrollView>

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
    marginBottom: 10,
    width: '100%',
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
});

