import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    KeyboardAvoidingView,
    Platform,
    Dimensions,
    ScrollView
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    Easing
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import AuthCard from '../src/components/AuthCard';
import FormInput from '../src/components/FormInput';
import CustomButton from '../src/components/CustomButton';
import SuitSelector from '../src/components/SuitSelector';
import { signUpUser } from '../backend/services/auth';
import { GLOBAL_COLORS, getThemeBySuit } from '../src/constants/themeConstants';

export default function SignUpScreen() {
    const router = useRouter();
    const [displayName, setDisplayName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [selectedSuit, setSelectedSuit] = useState('heart');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSignUp = async () => {
        if (!displayName || !email || !password || !confirmPassword) {
            setError('Please fill in all fields');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        setLoading(true);
        setError('');
        const resp = await signUpUser(email, password, displayName, selectedSuit);
        setLoading(false);

        if (resp.success) {
            router.replace('/Profile');
        } else {
            setError(resp.error);
        }
    };

    const currentTheme = getThemeBySuit(selectedSuit);
    const bgColors = currentTheme.isRed
        ? ['#2A0C0C', '#050505']
        : ['#050505', '#0C1A0C'];

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            <LinearGradient
                key={`bg-${selectedSuit}`}
                colors={bgColors}
                style={StyleSheet.absoluteFill}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <AuthCard title="Ace of Queens" suit={selectedSuit} rank="Q">
                        <SuitSelector selectedSuit={selectedSuit} onSelect={setSelectedSuit} />

                        <FormInput
                            label="Display Name"
                            placeholder="Your Name"
                            value={displayName}
                            onChangeText={setDisplayName}
                            accentColor={currentTheme.accent}
                        />

                        <FormInput
                            label="Email"
                            placeholder="queen@example.com"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            accentColor={currentTheme.accent}
                        />

                        <FormInput
                            label="Password"
                            placeholder="••••••••"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            accentColor={currentTheme.accent}
                        />

                        <FormInput
                            label="Confirm Password"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry
                            accentColor={currentTheme.accent}
                            error={confirmPassword && password !== confirmPassword ? 'Passwords mismatch' : ''}
                        />

                        {error ? <Text style={styles.errorText}>{error}</Text> : null}

                        <CustomButton
                            title="Sign Up Now"
                            onPress={handleSignUp}
                            loading={loading}
                            disabled={loading}
                            style={styles.button}
                        />

                        <Pressable onPress={() => router.back()} style={styles.loginLink}>
                            <Text style={styles.linkText}>Already have an account? <Text style={styles.linkUnderline}>Login</Text></Text>
                        </Pressable>
                    </AuthCard>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 50,
    },
    errorText: {
        color: GLOBAL_COLORS.error,
        fontSize: 12,
        marginBottom: 15,
        textAlign: 'center',
    },
    button: {
        marginTop: 10,
    },
    loginLink: {
        marginTop: 25,
    },
    linkText: {
        color: GLOBAL_COLORS.textDark,
        fontSize: 12,
    },
    linkUnderline: {
        color: GLOBAL_COLORS.gold,
        textDecorationLine: 'underline',
        fontWeight: '700',
    }
});
