import { Stack } from "expo-router";
import { StyleSheet, View } from "react-native";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";

function AppLayout() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <View style={[styles.statusBarGap, { height: insets.top }]} />
      <View style={styles.content}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: styles.screenContent,
          }}
        />
      </View>
    </View>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppLayout />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E6E6E6",
  },
  statusBarGap: {
    backgroundColor: "#000000",
  },
  content: {
    flex: 1,
    backgroundColor: "#E6E6E6",
  },
  screenContent: {
    backgroundColor: "#E6E6E6",
  },
});
