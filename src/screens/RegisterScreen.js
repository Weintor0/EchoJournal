import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
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
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleRegister() {
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
    <ScrollView contentContainerStyle={styles.container}>
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
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E6E6E6',
  },
  register: {
    flex: 1,
    marginTop: 50,
    padding: 20,
  },
  form: {
    backgroundColor: '#D9DCE3',
    borderRadius: 10,
    padding: 16,
    justifyContent: 'center',
  },

  title: {
    fontSize: FontSizes.xxxl,
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
    fontSize: FontSizes.xl,
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
