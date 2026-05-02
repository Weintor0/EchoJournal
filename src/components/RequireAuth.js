import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { getCurrentUser } from '../api/auth';

export default function RequireAuth({ children }) {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    let isActive = true;

    async function checkAuth() {
      try {
        const user = await getCurrentUser();

        if (!isActive) return;

        if (!user) {
          router.replace('/login');
          return;
        }

        setIsCheckingAuth(false);
      } catch {
        if (isActive) {
          router.replace('/login');
        }
      }
    }

    checkAuth();

    return () => {
      isActive = false;
    };
  }, [router]);

  if (isCheckingAuth) {
    return <View style={styles.container} />;
  }

  return children;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E6E6E6',
  },
});
