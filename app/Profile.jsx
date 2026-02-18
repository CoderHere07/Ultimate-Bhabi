import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    ActivityIndicator,
    Pressable,
    Alert,
    Platform
} from 'react-native';
import { auth } from '../backend/config/firebase';
import { onAuthStateChanged } from '@firebase/auth';
import { logoutUser, updateUserProfile } from '../backend/services/auth';
import { userService } from '../backend/services/userService';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withRepeat,
    withSequence,
    Easing,
    SlideInDown
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

// --- THEME CONSTANTS (Localized for this premium screen) ---
const THEME = {
    bgStart: '#050505',
    bgEnd: '#1A0C0C',
    cardBase: '#F6F4EF',
    gold: '#BD9E6B',
    goldDark: '#A88758',
    redDeep: '#8B1E1E',
    charcoal: '#2A2A2A',
    textDark: '#1A1A1A',
    textLight: '#F6F4EF',
    statCardBg: '#1E1E1E',
};

const SUITS = [
    { id: 'spade', icon: 'cards-spade', color: THEME.charcoal },
    { id: 'heart', icon: 'cards-heart', color: THEME.redDeep },
    { id: 'club', icon: 'cards-club', color: THEME.charcoal },
    { id: 'diamond', icon: 'cards-diamond', color: THEME.redDeep },
];

export default function ProfileScreen() {
    const router = useRouter();
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [authStateChecked, setAuthStateChecked] = useState(false);

    useEffect(() => {
        let profileUnsub;

        const authUnsub = onAuthStateChanged(auth, (user) => {
            if (profileUnsub) {
                profileUnsub();
                profileUnsub = null;
            }

            if (user) {
                profileUnsub = userService.subscribeToProfile(user.uid, (data) => {
                    setUserData(data);
                    setLoading(false);
                });
            } else {
                setLoading(false);
                router.replace('/Login');
            }
            setAuthStateChecked(true);
        });

        return () => {
            if (profileUnsub) profileUnsub();
            authUnsub();
        };
    }, []);

    const handleLogout = async () => {
        console.log("Logout button pressed");
        try {
            console.log("Attempting to sign out...");
            setLoading(true);
            await logoutUser();
            console.log("Sign out successful");
            router.replace('/Login');
        } catch (error) {
            console.error("Logout failed", error);
            setLoading(false);
            const errorMsg = error.message || "Logout failed";
            if (Platform.OS === 'web') {
                window.alert(errorMsg);
            } else {
                Alert.alert("Error", errorMsg);
            }
        }
    };

    const handleSuitChange = async (newSuit) => {
        if (auth.currentUser && userData?.selectedSuit !== newSuit) {
            await updateUserProfile(auth.currentUser.uid, { selectedSuit: newSuit });
        }
    };

    if (loading || !authStateChecked) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={THEME.gold} />
            </View>
        );
    }

    const currentSuit = SUITS.find(s => s.id === (userData?.selectedSuit || 'spade')) || SUITS[0];
    const gamesPlayed = userData?.stats?.gamesPlayed || 0;
    const gamesWon = userData?.stats?.gamesWon || 0;
    const winRate = gamesPlayed > 0 ? Math.round((gamesWon / gamesPlayed) * 100) : 0;
    const joinYear = userData?.createdAt ? new Date(userData.createdAt).getFullYear() : '2026';

    const getSuitColor = (suitId) => {
        if (suitId === 'heart' || suitId === 'diamond') return THEME.redDeep;
        return THEME.charcoal;
    };

    const isRedSuit = currentSuit.id === 'heart' || currentSuit.id === 'diamond';
    const bgColors = isRedSuit ? ['#2A0C0C', '#050505'] : ['#050505', '#0C1A0C']; // Changed black suit to slightly greenish for distinction

    return (
        <View style={styles.container}>
            <LinearGradient
                key={`bg-${userData?.selectedSuit || 'spade'}`}
                colors={bgColors}
                style={StyleSheet.absoluteFill}
            />

            <View style={styles.screenHeader}>
                <Text style={styles.screenTitle}>YOUR PROFILE</Text>
                <Text style={styles.screenSubtitle}>👑</Text>
            </View>

            <Animated.View
                entering={SlideInDown.duration(600).springify()}
                style={styles.mainCard}
            >
                <View style={styles.avatarRow}>
                    <View style={styles.avatarContainer}>
                        <View style={[styles.avatarCircle, { backgroundColor: currentSuit.color }]}>
                            <MaterialCommunityIcons name={currentSuit.icon} size={32} color={THEME.textLight} />
                        </View>
                    </View>

                    <View style={styles.userInfo}>
                        <View style={styles.nameRow}>
                            <Text style={styles.displayName} numberOfLines={1}>{userData?.displayName || 'Player'}</Text>
                            <Text style={styles.crown}>👑</Text>
                        </View>
                        <Text style={styles.email} numberOfLines={1}>{userData?.email}</Text>
                        <Text style={styles.memberSince}>MEMBER SINCE {joinYear}</Text>
                    </View>
                </View>

                <View style={styles.statsRow}>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>GAMES</Text>
                        <Text style={styles.statValue}>{gamesPlayed}</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>WIN RATE</Text>
                        <View style={styles.winRateContainer}>
                            <Text style={styles.statValue}>{winRate}%</Text>
                            <Text style={styles.statSubtext}>{gamesWon} WINS</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.suitSection}>
                    <Text style={styles.sectionTitle}>YOUR SUIT</Text>
                    <View style={styles.suitRow}>
                        {SUITS.map((suit) => {
                            const isSelected = userData?.selectedSuit === suit.id;
                            return (
                                <Pressable
                                    key={suit.id}
                                    onPress={() => handleSuitChange(suit.id)}
                                    style={({ pressed }) => [
                                        styles.suitCircle,
                                        isSelected && styles.suitCircleSelected,
                                        pressed && { transform: [{ scale: 0.95 }] }
                                    ]}
                                >
                                    <MaterialCommunityIcons
                                        name={suit.icon}
                                        size={24}
                                        color={isSelected ? THEME.gold : getSuitColor(suit.id)}
                                    />
                                </Pressable>
                            );
                        })}
                    </View>
                    <Text style={styles.currentSuitText}>
                        Current: <Text style={{ fontStyle: 'italic', color: THEME.gold }}>{currentSuit.id.charAt(0).toUpperCase() + currentSuit.id.slice(1)}s</Text>
                    </Text>
                </View>

                <View style={styles.actionRow}>
                    <Pressable
                        style={({ pressed }) => [styles.actionButton, pressed && styles.btnPressed]}
                        onPress={() => {
                            router.push('/table');
                        }}
                    >
                        <LinearGradient
                            colors={[THEME.gold, THEME.goldDark]}
                            style={StyleSheet.absoluteFill}
                        />
                        <View style={styles.btnContent}>
                            <MaterialCommunityIcons name="cards-playing-outline" size={18} color={THEME.textDark} />
                            <Text style={styles.btnTextPrimary}>PLAY GAME</Text>
                        </View>
                    </Pressable>

                    <Pressable
                        style={({ pressed }) => [styles.actionButton, styles.btnSecondary, pressed && styles.btnPressed]}
                        onPress={() => {
                            console.log("Logout Pressable triggered");
                            handleLogout();
                        }}
                    >
                        <View style={styles.btnContent}>
                            <MaterialCommunityIcons name="logout" size={18} color={THEME.gold} />
                            <Text style={styles.btnTextSecondary}>LOG OUT</Text>
                        </View>
                    </Pressable>
                </View>
            </Animated.View >
        </View >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: THEME.bgStart,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: THEME.bgStart,
        justifyContent: 'center',
        alignItems: 'center',
    },
    screenHeader: {
        position: 'absolute',
        top: '6%',
        alignItems: 'center',
        zIndex: 1,
    },
    screenTitle: {
        fontSize: 14,
        letterSpacing: 3,
        fontWeight: '700',
        color: THEME.gold,
        marginBottom: 4,
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    },
    screenSubtitle: {
        fontSize: 16,
    },
    mainCard: {
        width: width * 0.9,
        height: height * 0.75,
        backgroundColor: THEME.cardBase,
        borderRadius: 24,
        justifyContent: 'space-between',
        paddingVertical: 24,
        paddingHorizontal: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 15,
        borderWidth: 1,
        borderColor: THEME.gold,
        marginTop: 20,
        zIndex: 5,
    },
    avatarRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    avatarContainer: {
        width: 74,
        height: 74,
        borderRadius: 37,
        borderWidth: 2,
        padding: 3,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarCircle: {
        width: '100%',
        height: '100%',
        borderRadius: 35,
        justifyContent: 'center',
        alignItems: 'center',
    },
    userInfo: {
        marginLeft: 16,
        flex: 1,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6
    },
    displayName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: THEME.charcoal,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    crown: {
        fontSize: 14,
    },
    email: {
        fontSize: 12,
        color: '#8A8A8A',
        marginTop: 2,
        marginBottom: 6,
    },
    memberSince: {
        fontSize: 10,
        color: THEME.redDeep,
        fontWeight: '700',
        letterSpacing: 1,
    },
    statsRow: {
        flexDirection: 'row',
        gap: 12,
        height: 100,
    },
    statCard: {
        flex: 1,
        backgroundColor: THEME.statCardBg,
        borderRadius: 12,
        borderWidth: 0.5,
        borderColor: THEME.gold,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
    },
    statLabel: {
        color: THEME.gold,
        fontSize: 9,
        fontWeight: '700',
        letterSpacing: 1.5,
        marginBottom: 8,
    },
    statValue: {
        color: '#FFFFFF',
        fontSize: 26,
        fontWeight: 'bold',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    winRateContainer: {
        alignItems: 'center',
    },
    statSubtext: {
        color: THEME.gold,
        fontSize: 9,
        opacity: 0.8,
        marginTop: 2,
    },
    suitSection: {
        backgroundColor: '#EBE9E4',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#D4C5A9',
        borderStyle: 'dashed',
        padding: 16,
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: 10,
        color: '#8A8A8A',
        fontWeight: '700',
        letterSpacing: 2,
        marginBottom: 12,
    },
    suitRow: {
        flexDirection: 'row',
        gap: 20,
        marginBottom: 10,
    },
    suitCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: THEME.gold,
    },
    suitCircleSelected: {
        borderWidth: 2,
        borderColor: THEME.gold,
        backgroundColor: THEME.charcoal,
        elevation: 4,
    },
    currentSuitText: {
        fontSize: 11,
        color: '#666',
        fontWeight: '500',
    },
    actionRow: {
        flexDirection: 'row',
        gap: 12,
        height: 48,
        zIndex: 10,
    },
    actionButton: {
        flex: 1,
        borderRadius: 24,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: THEME.gold,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    btnSecondary: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: THEME.gold,
        elevation: 0,
        shadowOpacity: 0,
    },
    btnContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    btnTextPrimary: {
        fontSize: 13,
        fontWeight: '800',
        color: THEME.textDark,
        letterSpacing: 1,
    },
    btnTextSecondary: {
        fontSize: 13,
        fontWeight: '800',
        color: THEME.gold,
        letterSpacing: 1,
    },
    btnPressed: {
        transform: [{ scale: 0.97 }],
        opacity: 0.9,
    },
});
