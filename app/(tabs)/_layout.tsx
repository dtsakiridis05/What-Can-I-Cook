import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#F0E0C8',
          borderTopWidth: 1,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom + 4,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#C47B3A',
        tabBarInactiveTintColor: '#C4A882',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Ingredients',
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>🍳</Text>,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>🔍</Text>,
        }}
      />
      <Tabs.Screen
        name="shopping"
        options={{
          title: 'Shopping',
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>🛒</Text>,
        }}
      />
      <Tabs.Screen
        name="planner"
        options={{
          title: 'Planner',
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>🗓️</Text>,
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: 'Saved',
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>❤️</Text>,
        }}
      />
    </Tabs>
  );
}