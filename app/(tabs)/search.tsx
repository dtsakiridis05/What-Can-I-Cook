import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    FlatList, Image, StyleSheet,
    Text, TextInput, TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Meal = {
    idMeal: string;
    strMeal: string;
    strMealThumb: string;
};

export default function SearchScreen() {
    const [query, setQuery] = useState('');
    const [meals, setMeals] = useState<Meal[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const router = useRouter();

    const searchRecipes = async () => {
        if (!query.trim()) return;
        setLoading(true);
        setSearched(true);
        const res = await fetch(
            `https://www.themealdb.com/api/json/v1/1/search.php?s=${query.trim()}`
        );
        const data = await res.json();
        setMeals(data.meals || []);
        setLoading(false);
    };

    return (
        <LinearGradient colors={['#FFF8F0', '#FFF0DC']} style={styles.gradient}>
            <SafeAreaView style={styles.container}>

                <View style={styles.header}>
                    <Text style={styles.title}>🔍 Search Recipes</Text>
                    <Text style={styles.subtitle}>Find any dish by name</Text>
                </View>

                <View style={styles.inputCard}>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. pasta, sushi, burger..."
                        placeholderTextColor="#C4A882"
                        value={query}
                        onChangeText={setQuery}
                        onSubmitEditing={searchRecipes}
                        returnKeyType="search"
                    />
                    <TouchableOpacity style={styles.searchButton} onPress={searchRecipes}>
                        <Text style={styles.searchButtonText}>Go</Text>
                    </TouchableOpacity>
                </View>

                {loading && (
                    <View style={styles.centered}>
                        <ActivityIndicator size="large" color="#C47B3A" />
                        <Text style={styles.loadingText}>Searching...</Text>
                    </View>
                )}

                {!loading && (
                    <FlatList
                        data={meals}
                        keyExtractor={(item) => item.idMeal}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 24 }}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.card}
                                onPress={() => router.push({ pathname: '/recipe/[id]', params: { id: item.idMeal } })}
                            >
                                <Image source={{ uri: item.strMealThumb }} style={styles.image} />
                                <View style={styles.cardOverlay}>
                                    <Text style={styles.mealName}>{item.strMeal}</Text>
                                    <View style={styles.arrowCircle}>
                                        <Text style={styles.arrow}>→</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        )}
                        ListEmptyComponent={
                            searched ? (
                                <View style={styles.emptyContainer}>
                                    <Text style={styles.emptyIcon}>😕</Text>
                                    <Text style={styles.empty}>No recipes found.</Text>
                                    <Text style={styles.emptySub}>Try a different dish name!</Text>
                                </View>
                            ) : (
                                <View style={styles.emptyContainer}>
                                    <Text style={styles.emptyIcon}>🍽️</Text>
                                    <Text style={styles.empty}>What are you craving?</Text>
                                    <Text style={styles.emptySub}>Type a dish name above to get started</Text>
                                </View>
                            )
                        }
                    />
                )}

            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    gradient: { flex: 1 },
    container: { flex: 1, paddingHorizontal: 24 },
    header: { paddingTop: 32, paddingBottom: 24 },
    title: { fontSize: 28, fontWeight: '800', color: '#3D2C1E' },
    subtitle: { fontSize: 15, color: '#A07850', marginTop: 4 },
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
    searchButton: {
        backgroundColor: '#C47B3A', borderRadius: 12,
        paddingHorizontal: 20, justifyContent: 'center',
        paddingVertical: 10,
    },
    searchButtonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
    centered: { alignItems: 'center', marginTop: 40 },
    loadingText: { marginTop: 12, color: '#A07850', fontSize: 16 },
    card: {
        borderRadius: 20, overflow: 'hidden',
        marginBottom: 16,
        shadowColor: '#C4A882', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2, shadowRadius: 8, elevation: 4,
    },
    image: { width: '100%', height: 180 },
    cardOverlay: {
        backgroundColor: '#fff',
        flexDirection: 'row', alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16, paddingVertical: 14,
    },
    mealName: { fontSize: 16, fontWeight: '700', color: '#3D2C1E', flex: 1 },
    arrowCircle: {
        backgroundColor: '#FFF0DC', borderRadius: 20,
        width: 36, height: 36, justifyContent: 'center', alignItems: 'center',
    },
    arrow: { fontSize: 16, color: '#C47B3A' },
    emptyContainer: { alignItems: 'center', marginTop: 60 },
    emptyIcon: { fontSize: 52, marginBottom: 12 },
    empty: { fontSize: 18, fontWeight: '700', color: '#3D2C1E' },
    emptySub: { fontSize: 14, color: '#A07850', marginTop: 6 },
});