import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const slides = [
    {
        emoji: '🍳',
        title: 'Welcome to\nWhat Can I Cook?',
        subtitle: 'Discover delicious recipes based on ingredients you already have at home.',
    },
    {
        emoji: '🛒',
        title: 'Add Your\nIngredients',
        subtitle: 'Type in what\'s in your fridge or pantry and we\'ll find matching recipes instantly.',
    },
    {
        emoji: '❤️',
        title: 'Save Your\nFavorites',
        subtitle: 'Bookmark recipes you love and plan your meals for the whole week.',
    },
];

export default function OnboardingScreen() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const router = useRouter();

    const handleNext = async () => {
        if (currentSlide < slides.length - 1) {
            setCurrentSlide(currentSlide + 1);
        } else {
            await AsyncStorage.setItem('hasSeenOnboarding', 'true');
            router.replace('/(tabs)');
        }
    };

    const slide = slides[currentSlide];

    return (
        <LinearGradient colors={['#FFF8F0', '#FFF0DC']} style={styles.gradient}>
            <SafeAreaView style={styles.container}>

                <View style={styles.slideContainer}>
                    <Text style={styles.emoji}>{slide.emoji}</Text>
                    <Text style={styles.title}>{slide.title}</Text>
                    <Text style={styles.subtitle}>{slide.subtitle}</Text>
                </View>

                <View style={styles.dots}>
                    {slides.map((_, index) => (
                        <View
                            key={index}
                            style={[styles.dot, currentSlide === index && styles.dotActive]}
                        />
                    ))}
                </View>

                <TouchableOpacity style={styles.button} onPress={handleNext}>
                    <Text style={styles.buttonText}>
                        {currentSlide < slides.length - 1 ? 'Next →' : 'Get Started 🍳'}
                    </Text>
                </TouchableOpacity>

                {currentSlide < slides.length - 1 && (
                    <TouchableOpacity onPress={async () => {
                        await AsyncStorage.setItem('hasSeenOnboarding', 'true');
                        router.replace('/(tabs)');
                    }}>
                        <Text style={styles.skip}>Skip</Text>
                    </TouchableOpacity>
                )}

            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    gradient: { flex: 1 },
    container: {
        flex: 1, alignItems: 'center',
        justifyContent: 'center', paddingHorizontal: 32
    },
    slideContainer: { alignItems: 'center', marginBottom: 48 },
    emoji: { fontSize: 80, marginBottom: 32 },
    title: {
        fontSize: 32, fontWeight: '800', color: '#3D2C1E',
        textAlign: 'center', lineHeight: 42, marginBottom: 16
    },
    subtitle: {
        fontSize: 16, color: '#A07850', textAlign: 'center',
        lineHeight: 24, paddingHorizontal: 8
    },
    dots: { flexDirection: 'row', gap: 8, marginBottom: 40 },
    dot: {
        width: 8, height: 8, borderRadius: 4,
        backgroundColor: '#E8C99A',
    },
    dotActive: {
        backgroundColor: '#C47B3A', width: 24,
    },
    button: {
        backgroundColor: '#C47B3A', borderRadius: 18,
        paddingVertical: 18, paddingHorizontal: 48,
        width: width - 64, alignItems: 'center',
        shadowColor: '#C47B3A', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35, shadowRadius: 8, elevation: 6,
        marginBottom: 16,
    },
    buttonText: { color: '#fff', fontSize: 17, fontWeight: '800' },
    skip: { color: '#A07850', fontSize: 15, fontWeight: '600' },
});