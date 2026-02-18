import React, { useState } from 'react';
/* Import UI Components */
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
    withRepeat,
    withSequence,
    Easing
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import AuthCard from '../src/components/AuthCard';
import FormInput from '../src/components/FormInput';
import CustomButton from '../src/components/CustomButton';
import SuitSelector from '../src/components/SuitSelector';
import { loginUser } from '../backend/services/auth';
import { GLOBAL_COLORS, getThemeBySuit } from '../src/constants/themeConstants';

const { height } = Dimensions.get('window');

export default function LoginScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [selectedSuit, setSelectedSuit] = useState('spade');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const cardScale = useSharedValue(0.9);
    const cardOpacity = useSharedValue(0);

    React.useEffect(() => {
        cardOpacity.value = withTiming(1, { duration: 800 });
        cardScale.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.back(1)) });
    }, []);

    const animatedCardStyle = useAnimatedStyle(() => ({
        opacity: cardOpacity.value,
        transform: [{ scale: cardScale.value }]
    }));

    const handleLogin = async () => {
        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }
        setLoading(true);
        setError('');
        const resp = await loginUser(email, password);
        setLoading(false);
        if (resp.success) {
            router.replace('/Profile');
        } else {
            setError(resp.error);
        }
    };

    const currentTheme = getThemeBySuit(selectedSuit);
    const bgColors = currentTheme.isRed
        ? ['#2A0C0C', '#050505'] // Deeper red for mobile visibility
        : ['#050505', '#0C1A0C']; // Charcoal with a hint of green for black suits

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
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    bounces={false}
                >
                    <Animated.View style={[styles.cardContainer, animatedCardStyle]}>
                        <AuthCard title="Ace of Kings" suit={selectedSuit} rank="K">
                            <SuitSelector selectedSuit={selectedSuit} onSelect={setSelectedSuit} />

                            <FormInput
                                label="Email"
                                placeholder="king@example.com"
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

                            <Pressable onPress={() => router.push('/ForgotPassword')} style={styles.forgotPass}>
                                <Text style={styles.forgotPassText}>[FORGOT PASSWORD?]</Text>
                            </Pressable>

                            {error ? <Text style={styles.errorText}>{error}</Text> : null}

                            <CustomButton
                                title="Login Now"
                                onPress={handleLogin}
                                loading={loading}
                                style={styles.button}
                            />

                            <Pressable onPress={() => router.push('/SignUp')} style={styles.signUpLink}>
                                <Text style={styles.linkText}>New player? <Text style={styles.linkUnderline}>Create Account</Text></Text>
                            </Pressable>
                        </AuthCard>
                    </Animated.View>
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
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 50, // Added padding for scroll space
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    forgotPass: {
        alignSelf: 'center',
        marginBottom: 20,
    },
    forgotPassText: {
        color: GLOBAL_COLORS.gold,
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 1,
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
    signUpLink: {
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
