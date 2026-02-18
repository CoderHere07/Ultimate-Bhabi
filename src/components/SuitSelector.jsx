import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
    useAnimatedStyle,
    withTiming,
} from 'react-native-reanimated';
import { SUIT_THEMES, GLOBAL_COLORS } from '../constants/themeConstants';

const AVATARS = [
    { id: 'spade', ...SUIT_THEMES.spade },
    { id: 'heart', ...SUIT_THEMES.heart },
    { id: 'club', ...SUIT_THEMES.club },
    { id: 'diamond', ...SUIT_THEMES.diamond },
];

const SuitItem = ({ item, isSelected, onSelect }) => {
    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: withTiming(isSelected ? 1.1 : 1, { duration: 200 }) }],
            borderColor: withTiming(isSelected ? GLOBAL_COLORS.gold : '#E8E8E8', { duration: 200 }),
            borderWidth: isSelected ? 2 : 1,
            elevation: isSelected ? 4 : 1,
        };
    }, [isSelected]);

    return (
        <Pressable
            onPress={() => onSelect(item.id)}
            style={styles.pressable}
        >
            <Animated.View style={[styles.miniCard, animatedStyle]}>
                <MaterialCommunityIcons
                    name={item.icon}
                    size={22}
                    color={item.isRed ? GLOBAL_COLORS.redAccent : GLOBAL_COLORS.blackAccent}
                />
            </Animated.View>
        </Pressable>
    );
};

export default function SuitSelector({ selectedSuit, onSelect }) {
    return (
        <View style={styles.container}>
            {AVATARS.map((item) => (
                <SuitItem
                    key={item.id}
                    item={item}
                    isSelected={selectedSuit === item.id}
                    onSelect={onSelect}
                />
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        gap: 16,
        justifyContent: 'center',
        marginVertical: 10,
    },
    pressable: {
        padding: 4,
    },
    miniCard: {
        width: 46,
        height: 64,
        backgroundColor: '#FFFFFF',
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
});
