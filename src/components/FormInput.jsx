import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Animated as RNAnimated, Platform } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming
} from 'react-native-reanimated';
import { GLOBAL_COLORS } from '../constants/themeConstants';

export default function FormInput({
    label,
    value,
    onChangeText,
    placeholder,
    secureTextEntry,
    error,
    keyboardType = 'default',
    accentColor = GLOBAL_COLORS.gold
}) {
    const [isFocused, setIsFocused] = useState(false);
    const focusLineScale = useSharedValue(0);

    useEffect(() => {
        focusLineScale.value = withTiming(isFocused ? 1 : 0, { duration: 250 });
    }, [isFocused]);

    const animatedLineStyle = useAnimatedStyle(() => ({
        transform: [{ scaleX: focusLineScale.value }],
        backgroundColor: accentColor
    }));

    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label.toUpperCase()}</Text>}
            <View style={styles.inputWrapper}>
                <TextInput
                    style={[styles.input, Platform.OS === 'web' && { outlineStyle: 'none' }]}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor="#A0A0A0"
                    secureTextEntry={secureTextEntry}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    keyboardType={keyboardType}
                    selectionColor={accentColor}
                    underlineColorAndroid="transparent"
                />
                <View style={styles.underlineBase} />
                <Animated.View style={[styles.underlineActive, animatedLineStyle]} />
            </View>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        marginBottom: 20,
    },
    label: {
        fontSize: 9,
        fontWeight: '600',
        letterSpacing: 1.5,
        color: '#6B6B6B',
        marginBottom: 8,
    },
    inputWrapper: {
        height: 40,
        justifyContent: 'center',
    },
    input: {
        fontSize: 16,
        color: GLOBAL_COLORS.textDark,
        paddingVertical: 8,
        fontFamily: 'Courier',
    },
    underlineBase: {
        height: 1,
        backgroundColor: '#D4D4D4',
        width: '100%',
        position: 'absolute',
        bottom: 0,
    },
    underlineActive: {
        height: 2,
        width: '100%',
        position: 'absolute',
        bottom: 0,
    },
    errorText: {
        color: GLOBAL_COLORS.error,
        fontSize: 10,
        marginTop: 4,
    }
});
