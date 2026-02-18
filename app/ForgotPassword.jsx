import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    KeyboardAvoidingView,
    Platform,
    ScrollView
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import AuthCard from '../src/components/AuthCard';
import FormInput from '../src/components/FormInput';
import CustomButton from '../src/components/CustomButton';
import { resetPassword } from '../backend/services/auth';
import { GLOBAL_COLORS } from '../src/constants/themeConstants';

export default function ForgotPasswordScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleReset = async () => {
        const cleanEmail = email.trim().toLowerCase();
        if (!cleanEmail) {
            setError('Please enter your email');
            return;
        }
        setLoading(true);
        setError('');
        const resp = await resetPassword(cleanEmail);
        setLoading(false);
        if (resp.success) {
            setSuccess(true);
        } else {
            setError(resp.error);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            <LinearGradient
                colors={['#050505', '#1A0C0C']}
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
                    <View style={styles.cardContainer}>
                        <AuthCard title="Reset Password" suit="spade" rank="?">
                            {success ? (
                                <View style={styles.successContent}>
                                    <Text style={styles.successText}>
                                        Reset email sent! Please check your inbox and your <Text style={{ fontWeight: 'bold' }}>Spam folder</Text>.
                                    </Text>
                                    <CustomButton
                                        title="Back to Login"
                                        onPress={() => router.back()}
                                        style={styles.button}
                                    />
                                </View>
                            ) : (
                                <View style={styles.formContent}>
                                    <Text style={styles.infoText}>
                                        Enter your email and we&apos;ll send you a link to reset your password.
                                    </Text>

                                    <FormInput
                                        label="Email"
                                        placeholder="king@example.com"
                                        value={email}
                                        onChangeText={setEmail}
                                        keyboardType="email-address"
                                    />

                                    {error ? <Text style={styles.errorText}>{error}</Text> : null}

                                    <CustomButton
                                        title="Send Reset Link"
                                        onPress={handleReset}
                                        loading={loading}
                                        style={styles.button}
                                    />

                                    <Pressable onPress={() => router.back()} style={styles.backLink}>
                                        <Text style={styles.linkText}>Remembered? <Text style={styles.linkUnderline}>Login</Text></Text>
                                    </Pressable>
                                </View>
                            )}
                        </AuthCard>
                    </View>
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
        paddingVertical: 50,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    successContent: {
        alignItems: 'center',
    },
    successText: {
        color: GLOBAL_COLORS.success,
        textAlign: 'center',
        marginBottom: 30,
        fontSize: 14,
        fontWeight: '600',
    },
    formContent: {
        width: '100%',
        alignItems: 'center',
    },
    infoText: {
        color: '#6B6B6B',
        fontSize: 12,
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 18,
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
    backLink: {
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
