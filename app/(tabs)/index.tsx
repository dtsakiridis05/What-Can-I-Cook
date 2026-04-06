import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text, TextInput, TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function IngredientsScreen() {
  const [input, setInput] = useState('');
  const [ingredients, setIngredients] = useState<string[]>([]);
  const router = useRouter();

  const addIngredient = () => {
    const trimmed = input.trim().toLowerCase();
    if (trimmed && !ingredients.includes(trimmed)) {
      setIngredients([...ingredients, trimmed]);
    }
    setInput('');
  };

  const removeIngredient = (item: string) => {
    setIngredients(ingredients.filter(i => i !== item));
  };

  return (
    <LinearGradient colors={['#FFF8F0', '#FFF0DC']} style={styles.gradient}>
      <SafeAreaView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>

          <View style={styles.header}>
            <Text style={styles.emoji}>🍳</Text>
            <Text style={styles.title}>What Can I Cook?</Text>
            <Text style={styles.subtitle}>Add ingredients you have at home</Text>
          </View>

          <View style={styles.inputCard}>
            <TextInput
              style={styles.input}
              placeholder="e.g. chicken, garlic..."
              placeholderTextColor="#C4A882"
              value={input}
              onChangeText={setInput}
              onSubmitEditing={addIngredient}
              returnKeyType="done"
            />
            <TouchableOpacity style={styles.addButton} onPress={addIngredient}>
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>

          {ingredients.length > 0 && (
            <View style={styles.tagSection}>
              <Text style={styles.tagLabel}>Your ingredients</Text>
              <View style={styles.tagList}>
                {ingredients.map((item) => (
                  <TouchableOpacity
                    key={item}
                    style={styles.tag}
                    onPress={() => removeIngredient(item)}
                  >
                    <Text style={styles.tagText}>{item} ✕</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {ingredients.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🥕</Text>
              <Text style={styles.emptyText}>No ingredients yet!</Text>
              <Text style={styles.emptySubtext}>Start adding what you have in your kitchen</Text>
            </View>
          )}

        </ScrollView>

        {ingredients.length > 0 && (
          <TouchableOpacity
            style={styles.searchButton}
            onPress={() => router.push({ pathname: '/results', params: { ingredients: ingredients.join(',') } })}
          >
            <Text style={styles.searchButtonText}>Find Recipes 🔍</Text>
          </TouchableOpacity>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 24 },
  header: { alignItems: 'center', paddingTop: 32, paddingBottom: 28 },
  emoji: { fontSize: 52, marginBottom: 10 },
  title: { fontSize: 30, fontWeight: '800', color: '#3D2C1E', letterSpacing: 0.3 },
  subtitle: { fontSize: 15, color: '#A07850', marginTop: 6 },
  inputCard: {
    flexDirection: 'row', gap: 10,
    backgroundColor: '#fff',
    borderRadius: 16, padding: 8,
    shadowColor: '#C4A882',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 8,
    elevation: 4, marginBottom: 24,
  },
  input: {
    flex: 1, fontSize: 16, color: '#3D2C1E',
    paddingHorizontal: 12, paddingVertical: 8,
  },
  addButton: {
    backgroundColor: '#C47B3A', borderRadius: 12,
    paddingHorizontal: 20, justifyContent: 'center',
    paddingVertical: 10,
  },
  addButtonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  tagSection: { marginBottom: 24 },
  tagLabel: { fontSize: 13, fontWeight: '600', color: '#A07850', marginBottom: 10, letterSpacing: 0.5 },
  tagList: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tag: {
    backgroundColor: '#fff', borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 8,
    borderWidth: 1.5, borderColor: '#C47B3A',
    shadowColor: '#C4A882', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15, shadowRadius: 4, elevation: 2,
  },
  tagText: { color: '#C47B3A', fontWeight: '600', fontSize: 14 },
  emptyState: { alignItems: 'center', marginTop: 60 },
  emptyIcon: { fontSize: 52, marginBottom: 12 },
  emptyText: { fontSize: 18, fontWeight: '700', color: '#3D2C1E' },
  emptySubtext: { fontSize: 14, color: '#A07850', marginTop: 6, textAlign: 'center' },
  searchButton: {
    backgroundColor: '#C47B3A', borderRadius: 18,
    padding: 18, alignItems: 'center', marginBottom: 16,
    shadowColor: '#C47B3A', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 8, elevation: 6,
  },
  searchButtonText: { color: '#fff', fontSize: 17, fontWeight: '800' },
});