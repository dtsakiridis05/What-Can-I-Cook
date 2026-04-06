import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

export default function RootLayout() {
  const [initialRoute, setInitialRoute] = useState<string | null>(null);

  useEffect(() => {
    checkOnboarding();
  }, []);

  const checkOnboarding = async () => {
    const seen = await AsyncStorage.getItem('hasSeenOnboarding');
    setInitialRoute(seen ? '(tabs)' : 'onboarding');
  };

  if (!initialRoute) return <View style={{ flex: 1, backgroundColor: '#FFF8F0' }} />;

  return (
    <>
      <Stack initialRouteName={initialRoute}>
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="results" options={{ title: 'Results', headerShown: true }} />
        <Stack.Screen name="recipe/[id]" options={{ title: 'Recipe', headerShown: true }} />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}