import BottomSheet, { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

type Meal = {
    idMeal: string;
    strMeal: string;
    strMealThumb: string;
};

type MealPlan = {
    [day: string]: Meal | null;
};

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TODAY = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()];

export default function PlannerScreen() {
    const [mealPlan, setMealPlan] = useState<MealPlan>({});
    const [selectedDay, setSelectedDay] = useState<string | null>(null);
    const [savedRecipes, setSavedRecipes] = useState<Meal[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Meal[]>([]);
    const [searching, setSearching] = useState(false);
    const router = useRouter();

    const bottomSheetRef = useRef<BottomSheet>(null);
    const snapPoints = useMemo(() => ['60%', '90%'], []);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const loadData = async () => {
        const planStored = await AsyncStorage.getItem('mealPlan');
        const savedStored = await AsyncStorage.getItem('savedRecipes');
        setMealPlan(planStored ? JSON.parse(planStored) : {});
        setSavedRecipes(savedStored ? JSON.parse(savedStored) : []);
    };

    const openDayPicker = (day: string) => {
        setSelectedDay(day);
        setSearchQuery('');
        setSearchResults([]);
        bottomSheetRef.current?.expand();
    };

    const assignMeal = async (meal: Meal) => {
        if (!selectedDay) return;
        const updated = { ...mealPlan, [selectedDay]: meal };
        setMealPlan(updated);
        await AsyncStorage.setItem('mealPlan', JSON.stringify(updated));
        bottomSheetRef.current?.close();
        setSelectedDay(null);
    };

    const removeMeal = async (day: string) => {
        const updated = { ...mealPlan, [day]: null };
        setMealPlan(updated);
        await AsyncStorage.setItem('mealPlan', JSON.stringify(updated));
    };

    const searchRecipes = async (query: string) => {
        setSearchQuery(query);
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }
        setSearching(true);
        const res = await fetch(
            `https://www.themealdb.com/api/json/v1/1/search.php?s=${query.trim()}`
        );
        const data = await res.json();
        setSearchResults(data.meals || []);
        setSearching(false);
    };

    const displayedMeals = searchQuery.trim() ? searchResults : savedRecipes;

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <LinearGradient colors={['#FFF8F0', '#FFF0DC']} style={styles.gradient}>
                <SafeAreaView style={styles.container}>

                    <View style={styles.header}>
                        <View>
                            <Text style={styles.title}>🗓️ Meal Planner</Text>
                            <Text style={styles.subtitle}>Plan your week ahead</Text>
                        </View>
                        <View style={styles.todayBadge}>
                            <Text style={styles.todayLabel}>TODAY</Text>
                            <Text style={styles.todayDay}>{TODAY}</Text>
                        </View>
                    </View>

                    <FlatList
                        data={DAYS}
                        keyExtractor={(item) => item}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 24 }}
                        renderItem={({ item: day }) => {
                            const meal = mealPlan[day];
                            const isToday = day === TODAY;
                            return (
                                <View style={[styles.dayCard, isToday && styles.dayCardToday]}>
                                    <View style={styles.dayLabelRow}>
                                        <Text style={[styles.dayLabel, isToday && styles.dayLabelToday]}>
                                            {day}
                                        </Text>
                                        {isToday && (
                                            <View style={styles.todayPill}>
                                                <Text style={styles.todayPillText}>Today</Text>
                                            </View>
                                        )}
                                    </View>
                                    {meal ? (
                                        <TouchableOpacity
                                            style={styles.mealCard}
                                            onPress={() => router.push({ pathname: '/recipe/[id]', params: { id: meal.idMeal } })}
                                        >
                                            <Image source={{ uri: meal.strMealThumb }} style={styles.mealImage} />
                                            <View style={styles.mealInfo}>
                                                <Text style={styles.mealName} numberOfLines={2}>{meal.strMeal}</Text>
                                                <Text style={styles.tapHint}>Tap to view recipe →</Text>
                                            </View>
                                            <TouchableOpacity
                                                style={styles.removeButton}
                                                onPress={() => removeMeal(day)}
                                            >
                                                <Text style={styles.removeButtonText}>✕</Text>
                                            </TouchableOpacity>
                                        </TouchableOpacity>
                                    ) : (
                                        <TouchableOpacity
                                            style={[styles.emptyDay, isToday && styles.emptyDayToday]}
                                            onPress={() => openDayPicker(day)}
                                        >
                                            <Text style={styles.emptyDayText}>+ Add a meal</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            );
                        }}
                    />

                </SafeAreaView>
            </LinearGradient>

            <BottomSheet
                ref={bottomSheetRef}
                index={-1}
                snapPoints={snapPoints}
                enablePanDownToClose
                backgroundStyle={styles.bottomSheetBg}
                handleIndicatorStyle={styles.handle}
            >
                <View style={styles.sheetHeader}>
                    <Text style={styles.sheetTitle}>
                        Pick a meal for {selectedDay}
                    </Text>
                    <View style={styles.searchBar}>
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search any recipe..."
                            placeholderTextColor="#C4A882"
                            value={searchQuery}
                            onChangeText={searchRecipes}
                        />
                        {searching && <ActivityIndicator size="small" color="#C47B3A" />}
                    </View>
                </View>

                {!searchQuery && savedRecipes.length === 0 && (
                    <View style={styles.sheetEmpty}>
                        <Text style={styles.sheetEmptyIcon}>❤️</Text>
                        <Text style={styles.sheetEmptyText}>No saved recipes yet.</Text>
                        <Text style={styles.sheetEmptySub}>Search for a recipe above!</Text>
                    </View>
                )}

                {!searchQuery && savedRecipes.length > 0 && (
                    <Text style={styles.sheetSectionLabel}>YOUR SAVED RECIPES</Text>
                )}

                {searchQuery && !searching && searchResults.length === 0 && (
                    <View style={styles.sheetEmpty}>
                        <Text style={styles.sheetEmptyText}>No results found.</Text>
                    </View>
                )}

                <BottomSheetFlatList<Meal>
                    data={displayedMeals}
                    keyExtractor={(item: Meal) => item.idMeal}
                    contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
                    renderItem={({ item }: { item: Meal }) => (
                        <TouchableOpacity
                            style={styles.sheetCard}
                            onPress={() => assignMeal(item)}
                        >
                            <Image source={{ uri: item.strMealThumb }} style={styles.sheetImage} />
                            <View style={styles.sheetCardText}>
                                <Text style={styles.sheetMealName} numberOfLines={2}>{item.strMeal}</Text>
                                <Text style={styles.sheetTapHint}>Tap to assign →</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                />
            </BottomSheet>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    gradient: { flex: 1 },
    container: { flex: 1, paddingHorizontal: 24 },
    header: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', paddingTop: 32, paddingBottom: 24
    },
    title: { fontSize: 28, fontWeight: '800', color: '#3D2C1E' },
    subtitle: { fontSize: 15, color: '#A07850', marginTop: 4 },
    todayBadge: {
        backgroundColor: '#C47B3A', borderRadius: 14,
        paddingHorizontal: 14, paddingVertical: 8,
        alignItems: 'center',
    },
    todayLabel: { fontSize: 10, fontWeight: '800', color: '#FFE0C0', letterSpacing: 1 },
    todayDay: { fontSize: 14, fontWeight: '800', color: '#fff' },
    dayCard: { marginBottom: 14 },
    dayCardToday: {},
    dayLabelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, gap: 8 },
    dayLabel: { fontSize: 13, fontWeight: '700', color: '#A07850', letterSpacing: 0.5 },
    dayLabelToday: { color: '#C47B3A' },
    todayPill: {
        backgroundColor: '#FFF0DC', borderRadius: 20,
        paddingHorizontal: 10, paddingVertical: 2,
        borderWidth: 1.5, borderColor: '#C47B3A',
    },
    todayPillText: { fontSize: 11, fontWeight: '700', color: '#C47B3A' },
    mealCard: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden',
        shadowColor: '#C4A882', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2, shadowRadius: 6, elevation: 3,
    },
    mealImage: { width: 80, height: 80 },
    mealInfo: { flex: 1, paddingHorizontal: 14 },
    mealName: { fontSize: 15, fontWeight: '700', color: '#3D2C1E' },
    tapHint: { fontSize: 12, color: '#A07850', marginTop: 4 },
    removeButton: { padding: 16, justifyContent: 'center', alignItems: 'center' },
    removeButtonText: { fontSize: 16, color: '#C4A882', fontWeight: '700' },
    emptyDay: {
        backgroundColor: '#fff', borderRadius: 16,
        borderWidth: 1.5, borderColor: '#E8C99A',
        borderStyle: 'dashed', padding: 18, alignItems: 'center',
    },
    emptyDayToday: { borderColor: '#C47B3A' },
    emptyDayText: { color: '#C47B3A', fontWeight: '700', fontSize: 15 },
    bottomSheetBg: { backgroundColor: '#FFF8F0' },
    handle: { backgroundColor: '#E8C99A' },
    sheetHeader: { paddingHorizontal: 20, paddingBottom: 12 },
    sheetTitle: { fontSize: 18, fontWeight: '800', color: '#3D2C1E', marginBottom: 12 },
    searchBar: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#fff', borderRadius: 14, paddingHorizontal: 14,
        borderWidth: 1.5, borderColor: '#E8C99A',
    },
    searchInput: { flex: 1, fontSize: 15, color: '#3D2C1E', paddingVertical: 12 },
    sheetSectionLabel: {
        fontSize: 11, fontWeight: '700', color: '#A07850',
        letterSpacing: 1, paddingHorizontal: 20, marginBottom: 10,
    },
    sheetEmpty: { alignItems: 'center', padding: 40 },
    sheetEmptyIcon: { fontSize: 40, marginBottom: 8 },
    sheetEmptyText: { fontSize: 16, fontWeight: '700', color: '#3D2C1E' },
    sheetEmptySub: { fontSize: 13, color: '#A07850', marginTop: 4 },
    sheetCard: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden',
        marginBottom: 10,
        shadowColor: '#C4A882', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15, shadowRadius: 4, elevation: 2,
    },
    sheetImage: { width: 70, height: 70 },
    sheetCardText: { flex: 1, paddingHorizontal: 14 },
    sheetMealName: { fontSize: 15, fontWeight: '700', color: '#3D2C1E' },
    sheetTapHint: { fontSize: 12, color: '#A07850', marginTop: 4 },
});