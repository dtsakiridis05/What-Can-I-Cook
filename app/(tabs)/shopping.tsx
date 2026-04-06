import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
    SectionList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type ShoppingItem = {
    id: string;
    name: string;
    checked: boolean;
    recipeId: string;
    recipeName: string;
};

type Section = {
    title: string;
    data: ShoppingItem[];
};

export default function ShoppingScreen() {
    const [sections, setSections] = useState<Section[]>([]);
    const [allItems, setAllItems] = useState<ShoppingItem[]>([]);

    useFocusEffect(
        useCallback(() => {
            loadItems();
        }, [])
    );

    const loadItems = async () => {
        const stored = await AsyncStorage.getItem('shoppingList');
        const items: ShoppingItem[] = stored ? JSON.parse(stored) : [];
        setAllItems(items);
        setSections(groupByRecipe(items));
    };

    const groupByRecipe = (items: ShoppingItem[]): Section[] => {
        const map = new Map<string, ShoppingItem[]>();
        for (const item of items) {
            const key = item.recipeName || 'Other';
            if (!map.has(key)) map.set(key, []);
            map.get(key)!.push(item);
        }
        return Array.from(map.entries()).map(([title, data]) => ({ title, data }));
    };

    const toggleItem = async (id: string) => {
        const updated = allItems.map(item =>
            item.id === id ? { ...item, checked: !item.checked } : item
        );
        setAllItems(updated);
        setSections(groupByRecipe(updated));
        await AsyncStorage.setItem('shoppingList', JSON.stringify(updated));
    };

    const clearChecked = async () => {
        const updated = allItems.filter(item => !item.checked);
        setAllItems(updated);
        setSections(groupByRecipe(updated));
        await AsyncStorage.setItem('shoppingList', JSON.stringify(updated));
    };

    const clearAll = async () => {
        setAllItems([]);
        setSections([]);
        await AsyncStorage.setItem('shoppingList', JSON.stringify([]));
    };

    const checkedCount = allItems.filter(i => i.checked).length;

    return (
        <LinearGradient colors={['#FFF8F0', '#FFF0DC']} style={styles.gradient}>
            <SafeAreaView style={styles.container}>

                <View style={styles.headerRow}>
                    <View>
                        <Text style={styles.title}>🛒 Shopping List</Text>
                        <Text style={styles.subtitle}>
                            {allItems.length === 0
                                ? 'No items yet'
                                : `${checkedCount} of ${allItems.length} done`}
                        </Text>
                    </View>
                    {allItems.length > 0 && (
                        <View style={styles.headerButtons}>
                            {checkedCount > 0 && (
                                <TouchableOpacity style={styles.clearButton} onPress={clearChecked}>
                                    <Text style={styles.clearButtonText}>Remove done</Text>
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity style={styles.clearAllButton} onPress={clearAll}>
                                <Text style={styles.clearAllText}>Clear all</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                <SectionList
                    sections={sections}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 24 }}
                    renderSectionHeader={({ section: { title } }) => (
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionHeaderText}>{title}</Text>
                        </View>
                    )}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[styles.item, item.checked && styles.itemChecked]}
                            onPress={() => toggleItem(item.id)}
                        >
                            <View style={[styles.checkbox, item.checked && styles.checkboxChecked]}>
                                {item.checked && <Text style={styles.checkmark}>✓</Text>}
                            </View>
                            <Text style={[styles.itemText, item.checked && styles.itemTextChecked]}>
                                {item.name}
                            </Text>
                        </TouchableOpacity>
                    )}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyIcon}>🛍️</Text>
                            <Text style={styles.empty}>Your list is empty.</Text>
                            <Text style={styles.emptySub}>
                                Open a recipe and tap + on ingredients you need!
                            </Text>
                        </View>
                    }
                />

            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    gradient: { flex: 1 },
    container: { flex: 1, paddingHorizontal: 24 },
    headerRow: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'flex-start', paddingTop: 32, paddingBottom: 24
    },
    title: { fontSize: 28, fontWeight: '800', color: '#3D2C1E' },
    subtitle: { fontSize: 14, color: '#A07850', marginTop: 4 },
    headerButtons: { gap: 8, alignItems: 'flex-end' },
    clearButton: {
        backgroundColor: '#fff', borderRadius: 10,
        paddingHorizontal: 12, paddingVertical: 6,
        borderWidth: 1.5, borderColor: '#C47B3A',
    },
    clearButtonText: { color: '#C47B3A', fontWeight: '600', fontSize: 12 },
    clearAllButton: {
        backgroundColor: '#fff', borderRadius: 10,
        paddingHorizontal: 12, paddingVertical: 6,
        borderWidth: 1.5, borderColor: '#E8C99A',
    },
    clearAllText: { color: '#A07850', fontWeight: '600', fontSize: 12 },
    sectionHeader: {
        backgroundColor: '#FFF0DC', borderRadius: 10,
        paddingHorizontal: 14, paddingVertical: 8,
        marginBottom: 8, marginTop: 8,
    },
    sectionHeaderText: {
        fontSize: 14, fontWeight: '800',
        color: '#C47B3A', letterSpacing: 0.3,
    },
    item: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#fff', borderRadius: 14,
        padding: 16, marginBottom: 8,
        shadowColor: '#C4A882', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15, shadowRadius: 4, elevation: 2,
    },
    itemChecked: { opacity: 0.6 },
    checkbox: {
        width: 24, height: 24, borderRadius: 8,
        borderWidth: 2, borderColor: '#C47B3A',
        marginRight: 14, justifyContent: 'center', alignItems: 'center',
    },
    checkboxChecked: { backgroundColor: '#C47B3A', borderColor: '#C47B3A' },
    checkmark: { color: '#fff', fontWeight: '800', fontSize: 14 },
    itemText: { fontSize: 16, color: '#3D2C1E', fontWeight: '500', flex: 1 },
    itemTextChecked: { textDecorationLine: 'line-through', color: '#A07850' },
    emptyContainer: { alignItems: 'center', marginTop: 60 },
    emptyIcon: { fontSize: 52, marginBottom: 12 },
    empty: { fontSize: 18, fontWeight: '700', color: '#3D2C1E' },
    emptySub: { fontSize: 14, color: '#A07850', marginTop: 6, textAlign: 'center' },
});