import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList, Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Meal = {
    idMeal: string;
    strMeal: string;
    strMealThumb: string;
};

export default function ResultsScreen() {
    const { ingredients } = useLocalSearchParams<{ ingredients: string }>();
    const [meals, setMeals] = useState<Meal[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchRecipes();
    }, []);

    const fetchRecipes = async () => {
        const ingredientList = ingredients.split(',');
        const results: Meal[] = [];
        const seen = new Set<string>();

        for (const ingredient of ingredientList) {
            const res = await fetch(
                `https://www.themealdb.com/api/json/v1/1/filter.php?i=${ingredient.trim()}`
            );
            const data = await res.json();
            if (data.meals) {
                for (const meal of data.meals) {
                    if (!seen.has(meal.idMeal)) {
                        seen.add(meal.idMeal);
                        results.push(meal);
                    }
                }
            }
        }

        setMeals(results);
        setLoading(false);
    };

    if (loading) {
        return (
            <LinearGradient colors={['#FFF8F0', '#FFF0DC']} style={styles.centered}>
                <ActivityIndicator size="large" color="#C47B3A" />
                <Text style={styles.loadingText}>Finding recipes...</Text>
            </LinearGradient>
        );
    }

    return (
        <LinearGradient colors={['#FFF8F0', '#FFF0DC']} style={styles.gradient}>
            <SafeAreaView style={styles.container}>
                <Text style={styles.title}>🍽️ Recipes Found</Text>
                <Text style={styles.subtitle}>{meals.length} results for your ingredients</Text>
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
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyIcon}>😕</Text>
                            <Text style={styles.empty}>No recipes found.</Text>
                            <Text style={styles.emptySub}>Try different ingredients!</Text>
                        </View>
                    }
                />
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    gradient: { flex: 1 },
    container: { flex: 1, paddingHorizontal: 24, paddingTop: 16 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 12, color: '#A07850', fontSize: 16 },
    title: { fontSize: 26, fontWeight: '800', color: '#3D2C1E', marginBottom: 4 },
    subtitle: { color: '#A07850', marginBottom: 20, fontSize: 14 },
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
    emptyIcon: { fontSize: 48, marginBottom: 12 },
    empty: { fontSize: 18, fontWeight: '700', color: '#3D2C1E' },
    emptySub: { fontSize: 14, color: '#A07850', marginTop: 6 },
});