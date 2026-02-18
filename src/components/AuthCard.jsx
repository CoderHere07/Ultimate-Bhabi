import React from 'react';
import { View, Text, StyleSheet, Dimensions, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
    useAnimatedStyle,
    withTiming
} from 'react-native-reanimated';
import { GLOBAL_COLORS, SUIT_THEMES } from '../constants/themeConstants';

const { width } = Dimensions.get('window');
const CARD_WIDTH = Math.min(width * 0.85, 400);

export default function AuthCard({ children, title, suit = 'spade', rank = 'K' }) {
    const theme = SUIT_THEMES[suit] || SUIT_THEMES.spade;

    return (
        <View style={styles.card}>
            {/* Corner Marks */}
            <View style={[styles.cornerMark, { top: 15, left: 15 }]}>
                <Text style={[styles.cornerText, { color: theme.accent }]}>{rank}</Text>
                <MaterialCommunityIcons name={theme.icon} size={18} color={theme.accent} />
            </View>

            <View style={[styles.cornerMark, { bottom: 15, right: 15, transform: [{ rotate: '180deg' }] }]}>
                <Text style={[styles.cornerText, { color: theme.accent }]}>{rank}</Text>
                <MaterialCommunityIcons name={theme.icon} size={18} color={theme.accent} />
            </View>

            <View style={styles.content}>
                <View style={styles.header}>
                    <View style={[styles.iconContainer, { borderColor: GLOBAL_COLORS.gold }]}>
                        <MaterialCommunityIcons name={theme.icon} size={40} color={theme.accent} />
                    </View>
                    <Text style={[styles.title, { color: theme.accent }]}>{title.toUpperCase()}</Text>
                </View>

                {children}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        width: CARD_WIDTH,
        backgroundColor: GLOBAL_COLORS.cardBase,
        borderRadius: 24,
        padding: 24, // Reduced from 30
        paddingBottom: 24,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 10,
        justifyContent: 'center',
    },
    cornerMark: {
        position: 'absolute',
        alignItems: 'center',
    },
    cornerText: {
        fontSize: 18, // Reduced from 20
        fontWeight: 'bold',
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    },
    content: {
        flex: 1,
        alignItems: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 15, // Reduced from 20
    },
    iconContainer: {
        width: 48, // Reduced from 64
        height: 48, // Reduced from 64
        borderRadius: 24,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FAF9F6',
        marginBottom: 8, // Reduced from 10
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        letterSpacing: 2,
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    }
});
