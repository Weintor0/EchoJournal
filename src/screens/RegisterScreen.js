import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { registerUser } from '../api/auth';
import Header from "../components/Header";
import { FontSizes } from '../constants/typography';

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validatePassword(value) {
    if (value.length < 8) {
      return 'Password must be at least 8 characters long.';
    }

    if (!/[A-Z]/.test(value)) {
      return 'Password must contain at least one uppercase letter.';
    }

    if (!/[a-z]/.test(value)) {
      return 'Password must contain at least one lowercase letter.';
    }

    if (!/[0-9]/.test(value)) {
      return 'Password must contain at least one number.';
    }

    return '';
  }

  async function handleRegister() {
    const passwordError = validatePassword(password);

    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (password !== repeatPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await registerUser({ name, surname, email, password });
      router.replace('/');
    } catch (registerError) {
      setError(registerError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
      >
        <Header />
        <View style={styles.register}>
          <View style={styles.form}>
            <Text style={styles.title}>Register</Text>

            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Name"
              style={styles.input}
            />
            <TextInput
              value={surname}
              onChangeText={setSurname}
              placeholder="Surname"
              style={styles.input}
            />
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
              autoCapitalize="none"
              keyboardType="email-address"
              style={styles.input}
            />
            <Text style={styles.passwordNotice}>
              Password must be at least 8 characters and include uppercase, lowercase, and a number.
            </Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              secureTextEntry
              style={styles.input}
            />
            <TextInput
              value={repeatPassword}
              onChangeText={setRepeatPassword}
              placeholder="Repeat password"
              secureTextEntry
              style={styles.input}
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Pressable
              style={[styles.button, isSubmitting && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={isSubmitting}
            >
              <Text style={styles.buttonText}>
                {isSubmitting ? 'Creating account...' : 'Register'}
              </Text>
            </Pressable>

            <Pressable onPress={() => router.push('/login')}>
              <Text style={styles.linkText}>Already have an account?</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E6E6E6',
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: '#E6E6E6',
  },
  register: {
    flexGrow: 1,
    padding: 20,
    marginTop: '25%',
  },
  form: {
    backgroundColor: '#D9DCE3',
    borderRadius: 10,
    padding: 16,
    justifyContent: 'center',
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
  },

  title: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#E6E6E6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: FontSizes.m,
    marginBottom: 10,
  },
  passwordNotice: {
    color: '#333333',
    fontSize: FontSizes.xs,
    lineHeight: FontSizes.m,
    marginBottom: 10
  },
  button: {
    backgroundColor: '#5A6FB2',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 6,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#000000',
    fontSize: FontSizes.m,
    fontWeight: '600',
  },
  linkText: {
    color: '#333333',
    fontSize: FontSizes.m,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 16,
  },
  errorText: {
    color: '#B00020',
    fontSize: FontSizes.s,
    marginBottom: 8,
  },
});
