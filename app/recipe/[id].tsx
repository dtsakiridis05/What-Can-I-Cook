import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Image, ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type MealDetail = {
    idMeal: string;
    strMeal: string;
    strMealThumb: string;
    strInstructions: string;
    [key: string]: string;
};

type ShoppingItem = {
    id: string;
    name: string;
    checked: boolean;
    recipeId: string;
    recipeName: string;
};

export default function RecipeDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [meal, setMeal] = useState<MealDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [saved, setSaved] = useState(false);
    const [addedToShopping, setAddedToShopping] = useState<Set<string>>(new Set());

    useEffect(() => {
        fetchMealDetail();
        checkIfSaved();
    }, []);

    const fetchMealDetail = async () => {
        const res = await fetch(
            `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`
        );
        const data = await res.json();
        setMeal(data.meals[0]);
        setLoading(false);
    };

    const checkIfSaved = async () => {
        const stored = await AsyncStorage.getItem('savedRecipes');
        const savedRecipes = stored ? JSON.parse(stored) : [];
        setSaved(savedRecipes.some((r: MealDetail) => r.idMeal === id));
    };

    const toggleSave = async () => {
        const stored = await AsyncStorage.getItem('savedRecipes');
        const savedRecipes = stored ? JSON.parse(stored) : [];
        if (saved) {
            const updated = savedRecipes.filter((r: MealDetail) => r.idMeal !== id);
            await AsyncStorage.setItem('savedRecipes', JSON.stringify(updated));
            setSaved(false);
        } else {
            const updated = [...savedRecipes, meal];
            await AsyncStorage.setItem('savedRecipes', JSON.stringify(updated));
            setSaved(true);
        }
    };

    const toggleShoppingItem = async (ingredientName: string) => {
        const stored = await AsyncStorage.getItem('shoppingList');
        const shoppingList: ShoppingItem[] = stored ? JSON.parse(stored) : [];
        const itemId = `${id}-${ingredientName}`;
        const alreadyAdded = addedToShopping.has(ingredientName);

        if (alreadyAdded) {
            const updated = shoppingList.filter(i => i.id !== itemId);
            await AsyncStorage.setItem('shoppingList', JSON.stringify(updated));
            const newSet = new Set(addedToShopping);
            newSet.delete(ingredientName);
            setAddedToShopping(newSet);
        } else {
            const newItem: ShoppingItem = {
                id: itemId,
                name: ingredientName,
                checked: false,
                recipeId: id as string,
                recipeName: meal!.strMeal,
            };
            await AsyncStorage.setItem('shoppingList', JSON.stringify([...shoppingList, newItem]));
            const newSet = new Set(addedToShopping);
            newSet.add(ingredientName);
            setAddedToShopping(newSet);
        }
    };

    const getIngredients = () => {
        if (!meal) return [];
        const ingredients = [];
        for (let i = 1; i <= 20; i++) {
            const ingredient = meal[`strIngredient${i}`];
            const measure = meal[`strMeasure${i}`];
            if (ingredient && ingredient.trim()) {
                ingredients.push({
                    full: `${measure?.trim()} ${ingredient.trim()}`,
                    name: ingredient.trim(),
                });
            }
        }
        return ingredients;
    };

    if (loading) {
        return (
            <LinearGradient colors={['#FFF8F0', '#FFF0DC']} style={styles.centered}>
                <ActivityIndicator size="large" color="#C47B3A" />
                <Text style={styles.loadingText}>Loading recipe...</Text>
            </LinearGradient>
        );
    }

    if (!meal) {
        return (
            <LinearGradient colors={['#FFF8F0', '#FFF0DC']} style={styles.centered}>
                <Text style={{ color: '#3D2C1E' }}>Recipe not found.</Text>
            </LinearGradient>
        );
    }

    return (
        <LinearGradient colors={['#FFF8F0', '#FFF0DC']} style={styles.gradient}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <Image source={{ uri: meal.strMealThumb }} style={styles.image} />
                <SafeAreaView edges={['bottom']}>
                    <View style={styles.content}>
                        <View style={styles.titleRow}>
                            <Text style={styles.title}>{meal.strMeal}</Text>
                            <TouchableOpacity style={styles.saveButton} onPress={toggleSave}>
                                <Text style={styles.saveIcon}>{saved ? '❤️' : '🤍'}</Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.sectionTitle}>🛒 Ingredients</Text>
                        <Text style={styles.sectionHint}>Tap + to add to your shopping list</Text>
                        <View style={styles.ingredientsCard}>
                            {getIngredients().map((item, index) => {
                                const isAdded = addedToShopping.has(item.name);
                                return (
                                    <View key={index} style={styles.ingredientRow}>
                                        <View style={styles.dot} />
                                        <Text style={styles.ingredientText}>{item.full}</Text>
                                        <TouchableOpacity
                                            style={[styles.addShoppingBtn, isAdded && styles.addShoppingBtnActive]}
                                            onPress={() => toggleShoppingItem(item.name)}
                                        >
                                            <Text style={[styles.addShoppingBtnText, isAdded && styles.addShoppingBtnTextActive]}>
                                                {isAdded ? '✓' : '+'}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                );
                            })}
                        </View>

                        <Text style={styles.sectionTitle}>📋 Instructions</Text>
                        <View style={styles.instructionsCard}>
                            <Text style={styles.instructions}>{meal.strInstructions}</Text>
                        </View>
                    </View>
                </SafeAreaView>
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    gradient: { flex: 1 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 12, color: '#A07850', fontSize: 16 },
    image: { width: '100%', height: 300 },
    content: { padding: 24 },
    titleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
    title: { fontSize: 24, fontWeight: '800', color: '#3D2C1E', flex: 1, lineHeight: 32 },
    saveButton: {
        backgroundColor: '#fff', borderRadius: 50,
        width: 48, height: 48, justifyContent: 'center', alignItems: 'center',
        shadowColor: '#C4A882', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2, shadowRadius: 4, elevation: 3,
    },
    saveIcon: { fontSize: 22 },
    sectionTitle: {
        fontSize: 17, fontWeight: '800', color: '#C47B3A',
        marginBottom: 4, letterSpacing: 0.3,
    },
    sectionHint: { fontSize: 12, color: '#A07850', marginBottom: 12 },
    ingredientsCard: {
        backgroundColor: '#fff', borderRadius: 16, padding: 16,
        marginBottom: 24,
        shadowColor: '#C4A882', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15, shadowRadius: 6, elevation: 3,
    },
    ingredientRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    dot: {
        width: 8, height: 8, borderRadius: 4,
        backgroundColor: '#C47B3A', marginRight: 12,
    },
    ingredientText: { fontSize: 15, color: '#3D2C1E', flex: 1 },
    addShoppingBtn: {
        width: 28, height: 28, borderRadius: 8,
        borderWidth: 2, borderColor: '#C47B3A',
        justifyContent: 'center', alignItems: 'center', marginLeft: 8,
    },
    addShoppingBtnActive: { backgroundColor: '#C47B3A' },
    addShoppingBtnText: { color: '#C47B3A', fontWeight: '800', fontSize: 16 },
    addShoppingBtnTextActive: { color: '#fff' },
    instructionsCard: {
        backgroundColor: '#fff', borderRadius: 16, padding: 16,
        shadowColor: '#C4A882', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15, shadowRadius: 6, elevation: 3,
    },
    instructions: { fontSize: 15, color: '#5C4033', lineHeight: 26 },
});