import React from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator } from 'react-native';
import Animated, {
    useAnimatedStyle,
    withTiming,
    useSharedValue
} from 'react-native-reanimated';
import { GLOBAL_COLORS } from '../constants/themeConstants';


export default function CustomButton({ title, onPress, loading, disabled, style }) {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }]
    }));

    const handlePressIn = () => {

        scale.value = withTiming(0.97, { duration: 100 });
    };

    const handlePressOut = () => {
        scale.value = withTiming(1, { duration: 150 });
    };

    return (
        <Animated.View style={[styles.container, animatedStyle, style]}>
            <Pressable
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={disabled || loading}
                style={({ pressed }) => [
                    styles.button,
                    (disabled || loading) && styles.disabled
                ]}
            >
                {loading ? (
                    <ActivityIndicator color={GLOBAL_COLORS.textDark} />
                ) : (
                    <Text style={styles.text}>{title.toUpperCase()}</Text>
                )}
            </Pressable>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 4,
    },
    button: {
        height: 56,
        borderRadius: 28,
        borderWidth: 1.5,
        borderColor: GLOBAL_COLORS.gold,
        backgroundColor: GLOBAL_COLORS.cardBase,
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        fontSize: 15,
        fontWeight: '800',
        letterSpacing: 2,
        color: GLOBAL_COLORS.textDark,
    },
    disabled: {
        opacity: 0.6,
    }
});
