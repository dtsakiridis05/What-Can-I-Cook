import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
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

export default function SavedScreen() {
    const [savedRecipes, setSavedRecipes] = useState<Meal[]>([]);
    const router = useRouter();

    useFocusEffect(
        useCallback(() => {
            loadSaved();
        }, [])
    );

    const loadSaved = async () => {
        const stored = await AsyncStorage.getItem('savedRecipes');
        setSavedRecipes(stored ? JSON.parse(stored) : []);
    };

    return (
        <LinearGradient colors={['#FFF8F0', '#FFF0DC']} style={styles.gradient}>
            <SafeAreaView style={styles.container}>
                <Text style={styles.title}>❤️ Saved Recipes</Text>
                <FlatList
                    data={savedRecipes}
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
                            <Text style={styles.emptyIcon}>🍽️</Text>
                            <Text style={styles.empty}>No saved recipes yet.</Text>
                            <Text style={styles.emptySub}>Tap ❤️ on any recipe to save it!</Text>
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
    title: { fontSize: 26, fontWeight: '800', color: '#3D2C1E', marginBottom: 20 },
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