import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Home, RefreshCw, Trophy } from "lucide-react-native";
import { useEffect, useRef, useState, useCallback } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
  Platform,
  ActivityIndicator
} from "react-native";
import { Audio } from 'expo-av';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withRepeat,
  withDelay,
  Easing,
  runOnJS,
  interpolate,
  withSpring,
} from "react-native-reanimated";
import { MaterialCommunityIcons } from '@expo/vector-icons';

import {
  createDeck,
  shuffleDeck as shuffle,
  dealCards,
  findAceOfSpadesPlayer,
} from "../utils/deckUtils";
import { useGameLogic } from "../hooks/useGameLogic";
import Card from "./Card.jsx";
import PlayerHand from "./PlayerHand.jsx";

import { auth } from "../../backend/config/firebase";
import { userService } from "../../backend/services/userService";

// --- MASTER PROMPT CONSTANTS ---
const COLORS = {
  // Background
  BG_TOP: "#0A0505",
  BG_MIDDLE: "#1A0C0C",
  BG_BOTTOM: "#050303",

  // Table (Green Felt)
  TABLE_BASE: "#1E4A3B",
  TABLE_HIGHLIGHT: "#2C5E4C",
  TABLE_SHADOW: "#0E2F25",
  TABLE_BORDER: "#BD9E6B",

  // UI
  GOLD: "#BD9E6B",
  GOLD_BRIGHT: "#FFC83D",
  CHARCOAL: "#1A1A1A",
  DEEP_RED: "#8B1E1E",

  // Avatar
  AVATAR_BORDER: "#BD9E6B",
  AVATAR_BG: "rgba(26, 26, 26, 0.9)",
};

const Table = ({ userProfile: initialProfile }) => {
  const router = useRouter();
  const params = useLocalSearchParams();

  const userProfile = {
    name: initialProfile?.name || params.name || "Player",
    emoji: initialProfile?.emoji || params.emoji || "👤",
  };

  const { width, height } = useWindowDimensions();
  const isDesktop = width > 768;
  const isMobile = width < 768;

  // Sound Management
  const throwSoundRef = useRef(null);
  const dealSoundRef = useRef(null);
  const prevDealingLen = useRef(0);
  const prevPileLen = useRef(0);

  useEffect(() => {
    let isMounted = true;
    async function preloadSounds() {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: false,
        });

        const loadSound = async (path) => {
          const { sound } = await Audio.Sound.createAsync(
            path,
            { shouldPlay: false, positionMillis: 0, volume: 1.0 }
          );
          return sound;
        };

        const [sThrow, sDeal] = await Promise.all([
          loadSound(require("../../assets/sounds/card-throw.mp3")),
          loadSound(require("../../assets/sounds/dealing-card.mp3"))
        ]);

        if (isMounted) {
          throwSoundRef.current = sThrow;
          dealSoundRef.current = sDeal;
        }
      } catch (e) {
        console.log("Error preloading sounds", e);
      }
    }
    preloadSounds();
    return () => {
      isMounted = false;
      if (throwSoundRef.current) throwSoundRef.current.unloadAsync();
      if (dealSoundRef.current) dealSoundRef.current.unloadAsync();
    };
  }, []);

  const playSound = (type = 'throw', duration = 500) => {
    const sound = type === 'throw' ? throwSoundRef.current : dealSoundRef.current;
    if (!sound) return;

    // Use setPosition + play for faster response than stop + play
    sound.setPositionAsync(0).then(() => {
      sound.playAsync().catch(e => { });
    }).catch(e => { });

    if (duration) {
      setTimeout(() => {
        try {
          sound.stopAsync().catch(e => { });
        } catch (e) { }
      }, duration);
    }
  };



  // Game Logic Hook
  const {
    hands, setHands,
    turn, setTurn,
    pile, setPile,
    led, setLed,
    message, setMessage,
    isFirstTurn, setIsFirstTurn,
    bhabhi, setBhabhi,
    isDealing, setIsDealing,
    showThola, setShowThola,
    deckCount, setDeckCount,
    dealingCards, setDealingCards,
    initGame,
    startDealing,
    playCard
  } = useGameLogic();

  // Reanimated Shared Values
  const tableOpacity = useSharedValue(0);
  const deckScale = useSharedValue(0);
  const deckTranslateY = useSharedValue(0);
  const turnIndicatorOpacity = useSharedValue(0);

  // Background Suit Drifts
  const drift1 = useSharedValue(0);
  const drift2 = useSharedValue(0);

  const gameEndingRef = useRef(false);

  // --- INITIALIZATION ---
  const init = async () => {
    // UI Animations
    tableOpacity.value = withTiming(1, { duration: 400 });
    deckScale.value = withDelay(400, withTiming(1, { duration: 300 }));
    deckTranslateY.value = 0;

    // Reset game ending flag for new game
    gameEndingRef.current = false;

    // Core Init Logic
    await initGame(() => {
      // No longer passing playSound
      setTimeout(() => {
        startDealing();
      }, 1500);
    });
  };

  const BOT_EMOJIS = ["🤖", "🤡", "👹", "👺"];

  useEffect(() => {
    if (!isDealing && turn !== -1) {
      deckScale.value = withTiming(0, { duration: 400 });
      turnIndicatorOpacity.value = withDelay(500, withTiming(1, { duration: 400 }));
    }
  }, [isDealing, turn]);

  useEffect(() => {
    if (dealingCards.length > 0 && dealingCards.length > prevDealingLen.current) {
      playSound('deal', 300); // 300ms covers the travel time better
    }
    prevDealingLen.current = dealingCards.length;
  }, [dealingCards.length]);

  useEffect(() => {
    if (pile.length > prevPileLen.current && !isDealing) {
      playSound('throw', 500); // Clean single thump for gameplay
    }
    prevPileLen.current = pile.length;
  }, [pile.length, isDealing]);

  useEffect(() => {
    init();

    // Background Drifts
    drift1.value = withRepeat(withTiming(1, { duration: 45000 }), -1, true);
    drift2.value = withRepeat(withTiming(1, { duration: 60000 }), -1, true);
  }, []);

  const bhabhiConfirmed = bhabhi !== null && !showThola;

  // Bot Turn Logic
  useEffect(() => {
    if (turn < 1 || turn > 3 || bhabhi !== null || isDealing || showThola) return;

    const botTimer = setTimeout(() => {
      const botHand = hands[turn];
      if (!botHand || botHand.length === 0) return;

      let chosen = null;

      if (isFirstTurn) {
        chosen = botHand.find((c) => c.suit === "SPADES" && c.rank === "A");
      } else if (pile.length === 0) {
        chosen = botHand[Math.floor(Math.random() * botHand.length)];
      } else {
        const matching = botHand.filter((c) => c.suit === led);
        chosen = matching.length > 0 ? matching[0] : botHand[0];
      }

      if (chosen) playCard(chosen, turn);
    }, 1500);

    return () => clearTimeout(botTimer);
  }, [turn, hands, pile, led, isFirstTurn, bhabhi, isDealing, showThola]);

  // Game Over Check
  useEffect(() => {
    if (gameEndingRef.current || bhabhi !== null || isDealing) return;

    const playersWithCards = hands.map((h, i) => ({ count: h.length, idx: i })).filter(p => p.count > 0);

    if (playersWithCards.length === 1 && hands.some(h => h.length > 0)) {
      gameEndingRef.current = true;
      const bIdx = playersWithCards[0].idx;

      setBhabhi(bIdx);
      setTurn(-1);

      // Update Stats
      if (auth.currentUser) {
        console.log("Game Over - Updating stats for:", auth.currentUser.uid);
        // Player wins if they are NOT the Bhabhi (bidx !== 0)
        const isWin = bIdx !== 0;
        userService.updateStats(auth.currentUser.uid, isWin)
          .then(() => console.log("Stats updated successfully"))
          .catch(err => console.error("Failed to update stats:", err));
      }
    }
  }, [hands, isDealing, bhabhi]);


  // --- ANIMATED STYLES ---
  const animatedTable = useAnimatedStyle(() => ({
    opacity: tableOpacity.value,
    transform: [{ scale: interpolate(tableOpacity.value, [0, 1], [0.98, 1]) }],
  }));

  const animatedDeck = useAnimatedStyle(() => ({
    transform: [
      { scale: deckScale.value },
      { translateY: deckTranslateY.value }
    ],
    opacity: deckScale.value,
  }));

  const animatedTurnIndicator = useAnimatedStyle(() => ({
    opacity: turnIndicatorOpacity.value,
  }));

  const bgSuit1 = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(drift1.value, [0, 1], [-20, 20]) }, { translateY: interpolate(drift1.value, [0, 1], [-10, 10]) }],
    opacity: 0.05
  }));

  const bgSuit2 = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(drift2.value, [0, 1], [30, -30]) }, { translateY: interpolate(drift2.value, [0, 1], [-20, 20]) }],
    opacity: 0.04
  }));

  const FunnyPenaltyOverlay = ({ data }) => {
    const opacity = useSharedValue(0);

    useEffect(() => {
      opacity.value = withTiming(1, { duration: 300 });
    }, []);

    const animStyle = useAnimatedStyle(() => ({
      opacity: opacity.value
    }));

    const isBhabhi = data.type === 'BHABHI';
    const isUser = data.pIdx === 0;
    const name = isUser ? "YOU" : `BOT ${data.pIdx}`;

    return (
      <View style={styles.penaltyOverlay}>
        <Animated.View style={[styles.penaltyCard, animStyle, { borderLeftWidth: 10, borderLeftColor: isBhabhi ? '#ff4444' : COLORS.GOLD }]}>
          <Text style={styles.penaltyTitle}>{data.type}!</Text>
          <Text style={styles.penaltySubtitle}>{name} {isBhabhi ? "IS THE LOSER" : "PICKS UP CARDS"}</Text>
        </Animated.View>
      </View>
    );
  };

  const renderPlayerAvatar = (idx, emoji) => {
    const active = turn === idx;
    const cards = hands[idx]?.length || 0;
    const isPlayer = idx === 0;

    return (
      <View style={styles.avatarWrapper}>
        <View style={[styles.ava, active && styles.avaActive, isPlayer && styles.playerAva]}>
          <Text style={styles.avaEmoji}>{emoji || "🤖"}</Text>
          {active && <Animated.View style={styles.turnPulse} />}
        </View>
        <View style={styles.cardPill}>
          <Text style={styles.cardCount}>{cards}</Text>
        </View>
        {isPlayer && (
          <Text style={[styles.playerNameText, { fontSize: isMobile ? 8 : 9 }]}>
            {userProfile.name.toUpperCase()}
          </Text>
        )}
      </View>
    );
  };

  const AnimatedFlyingCard = ({ item }) => {
    const isThrow = item.type === 'throw';
    const progress = useSharedValue(0);

    useEffect(() => {
      progress.value = withTiming(1, {
        duration: isThrow ? 500 : 200, // Matched to CARD_TRAVEL_DURATION
        easing: Easing.bezier(0.25, 0.1, 0.25, 1)
      });
    }, []);

    const animStyle = useAnimatedStyle(() => {
      const startX = 0;
      const startY = 0;

      // Target coords relative to center
      let endX = 0;
      let endY = 0;

      if (isThrow) {
        // From player pos to center
        if (item.origin === 0) endY = height * 0.3; // bot
        if (item.origin === 2) endY = -height * 0.3; // top
        if (item.origin === 1) endX = -width * 0.4; // left
        if (item.origin === 3) endX = width * 0.4; // right

        return {
          transform: [
            { translateX: interpolate(progress.value, [0, 1], [endX, 0]) },
            { translateY: interpolate(progress.value, [0, 1], [endY, 0]) },
            { scale: interpolate(progress.value, [0, 1], [0.8, 1]) },
            { rotate: `${interpolate(progress.value, [0, 1], [0, 15])}deg` }
          ],
          opacity: interpolate(progress.value, [0, 1], [1, item.origin === 0 ? 1 : 0]), // fade if bot? no, user to bot fades?
          // "when the card user to bot it fades" -> if origin is 0 and it's a throw?
          // User is 0. Bots are 1, 2, 3.
          // Let's fadebot cards if they are played? 
          zIndex: 100,
        };
      } else {
        // Dealing: center to player
        if (item.target === 0) endY = height * 0.4;
        if (item.target === 2) endY = -height * 0.4;
        if (item.target === 1) endX = -width * 0.45;
        if (item.target === 3) endX = width * 0.45;

        return {
          transform: [
            { translateX: interpolate(progress.value, [0, 1], [0, endX]) },
            { translateY: interpolate(progress.value, [0, 1], [0, endY]) },
            { scale: interpolate(progress.value, [0, 1], [0.3, 0.5]) },
            { rotate: `${interpolate(progress.value, [0, 1], [0, 360])}deg` }
          ],
          opacity: interpolate(progress.value, [0.8, 1], [1, 0]),
          zIndex: 100,
        };
      }
    });

    return (
      <Animated.View style={[{ position: 'absolute' }, animStyle]}>
        {!isThrow ? (
          /* Face Down Deck-style Card for dealing */
          <View style={[styles.deckBack, { width: 55, height: 80, transform: [{ scale: 1.5 }] }]}>
            <LinearGradient colors={["#0D1B2A", "#1B263B"]} style={styles.deckInner}>
              <MaterialCommunityIcons name="poker-chip" size={20} color={COLORS.GOLD} />
            </LinearGradient>
          </View>
        ) : (
          <Card card={item.card} />
        )}
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      {/* 1. CINEMATIC BACKGROUND */}
      <LinearGradient
        colors={["#0A0505", "#1A0C0C", "#050303"]}
        style={StyleSheet.absoluteFill}
      />

      {/* Drifting Suit Symbols */}
      <Animated.View style={[styles.bgIcon, { top: '10%', left: '10%' }, bgSuit1]}>
        <MaterialCommunityIcons name="cards-spade" size={140} color={COLORS.CHARCOAL} />
      </Animated.View>
      <Animated.View style={[styles.bgIcon, { bottom: '15%', right: '10%' }, bgSuit2]}>
        <MaterialCommunityIcons name="cards-heart" size={120} color={COLORS.DEEP_RED} />
      </Animated.View>

      <SafeAreaView style={styles.safe}>
        {/* Header Logo & Navigation */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.exitBtn}
            onPress={() => router.replace("/")}
          >
            <View style={styles.exitBtnInner}>
              <MaterialCommunityIcons name="chevron-left" size={20} color={COLORS.GOLD} />
              <Text style={styles.exitText}>EXIT</Text>
            </View>
          </TouchableOpacity>
          <Text style={styles.logo}>BHABHI <Text style={{ color: COLORS.GOLD_BRIGHT }}>ULTIMATE</Text></Text>
          <View style={{ width: 75 }} />
        </View>

        <View style={styles.main}>

          {/* Status Message (Fixed below header on mobile) */}
          <View style={styles.statusArea}>
            <Text style={styles.statusText}>{message.toUpperCase()}</Text>
          </View>

          {/* 2. NATURAL GREEN FELT TABLE */}
          <Animated.View style={[
            styles.tableContainer,
            { marginVertical: isMobile ? 10 : 40 },
            animatedTable
          ]}>
            <View style={[
              styles.tableBorder,
              {
                width: isMobile ? '92%' : '100%',
                maxWidth: isMobile ? width * 0.85 : (width > height ? height * 0.55 : 480)
              }
            ]}>
              <LinearGradient
                colors={[COLORS.TABLE_HIGHLIGHT, COLORS.TABLE_BASE, COLORS.TABLE_SHADOW]}
                start={{ x: 0.5, y: 0.5 }}
                end={{ x: 1, y: 1 }}
                style={styles.tableFelt}
              >
                {/* Table Inner Rim Shadow */}
                <View style={styles.innerShadow} />

                {/* Center Area (Pile & Deck) */}
                <View style={styles.centerArea}>
                  {deckCount > 0 && (
                    <Animated.View style={[styles.deckBack, animatedDeck]}>
                      <LinearGradient colors={["#0D1B2A", "#1B263B"]} style={styles.deckInner}>
                        <MaterialCommunityIcons name="poker-chip" size={30} color={COLORS.GOLD} />
                        <Text style={{ color: COLORS.GOLD, fontSize: 10, fontWeight: '900', marginTop: 4 }}>{deckCount}</Text>
                      </LinearGradient>
                    </Animated.View>
                  )}

                  {pile.map((it, idx) => (
                    <View
                      key={idx}
                      style={[
                        styles.playedCard,
                        { transform: [{ rotate: `${(idx * 20) - 10}deg` }, { scale: 0.85 }] }
                      ]}
                    >
                      <Card card={it.card} />
                    </View>
                  ))}

                  {/* Flying Cards Layer */}
                  {dealingCards.map(item => (
                    <AnimatedFlyingCard key={item.id} item={item} />
                  ))}
                </View>

              </LinearGradient>

              {/* Avatars on the Border (Half-in, Half-out) */}
              <View style={styles.botPosTop}>{renderPlayerAvatar(2, BOT_EMOJIS[2])}</View>
              <View style={styles.botPosLeft}>{renderPlayerAvatar(1, BOT_EMOJIS[1])}</View>
              <View style={styles.botPosRight}>{renderPlayerAvatar(3, BOT_EMOJIS[3])}</View>
              <View style={styles.playerPosBottom}>{renderPlayerAvatar(0, userProfile.emoji)}</View>
            </View>
          </Animated.View>

          {/* 3. PLAYER HAND */}
          <View style={[
            styles.playerHandSection,
            { height: isDesktop ? 180 : 140, marginBottom: isMobile ? 10 : 30 }
          ]}>
            <PlayerHand
              cards={hands[0]}
              onCardPress={(c) => playCard(c, 0)}
              isTurn={turn === 0}
              ledSuit={led}
            />
          </View>

        </View>

        {/* --- FUNNY PENALTY OVERLAY --- */}
        {showThola && <FunnyPenaltyOverlay data={showThola} />}

        {/* --- GAME OVER MODAL --- */}
        {bhabhiConfirmed && (
          <View style={styles.over}>
            <Animated.View style={styles.modal}>
              <Trophy size={60} color={COLORS.GOLD} style={{ marginBottom: 20 }} />
              <Text style={styles.modalTitle}>GAME OVER</Text>
              <Text style={styles.modalMsg}>
                {bhabhi === 0 ? "YOU ARE THE BHABHI!" : `BOT ${bhabhi} IS THE BHABHI!`}
              </Text>
              <TouchableOpacity style={styles.btn} onPress={init}>
                <LinearGradient colors={[COLORS.GOLD, "#A67C00"]} style={styles.btnGrad}>
                  <RefreshCw size={20} color="#000" />
                  <Text style={styles.btnText}>PLAY AGAIN</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnSecondary} onPress={() => router.push("/")}>
                <Home size={20} color={COLORS.GOLD} />
                <Text style={styles.btnTextSecondary}>HOME</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  safe: { flex: 1 },
  header: {
    paddingVertical: Platform.OS === 'web' ? 20 : 10,
    paddingTop: Platform.OS === 'android' ? 45 : 10, // Added Safe Area padding
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  logo: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 2,
    opacity: 0.9,
    flex: 1,
    textAlign: 'center'
  },
  exitBtn: {
    width: 75,
  },
  exitBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingVertical: 8, // Increased touch area
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(189,158,107,0.3)',
    gap: 2,
  },
  exitText: {
    color: COLORS.GOLD_BRIGHT,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5
  },
  playerNameText: {
    color: COLORS.GOLD_BRIGHT,
    fontWeight: '900',
    letterSpacing: 1,
    position: 'absolute',
    bottom: -15,
    width: 100,
    textAlign: 'center'
  },
  bgIcon: { position: 'absolute' },
  main: { flex: 1, paddingHorizontal: 10, justifyContent: 'space-between', paddingBottom: 20 }, // Increased padding bottom

  // Table Structure
  tableContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  tableBorder: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: COLORS.TABLE_BORDER,
    padding: 3,
    borderRadius: 250,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
  },
  tableFelt: {
    flex: 1,
    borderRadius: 247,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerShadow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 247,
    borderWidth: 25,
    borderColor: 'rgba(0,0,0,0.15)',
  },

  // Avatars
  avatarWrapper: { alignItems: 'center' },
  ava: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: COLORS.AVATAR_BG,
    borderWidth: 1.5,
    borderColor: COLORS.AVATAR_BORDER,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playerAva: { width: 64, height: 64, borderRadius: 32, borderColor: COLORS.GOLD_BRIGHT },
  avaActive: {
    borderColor: COLORS.GOLD_BRIGHT,
    shadowColor: COLORS.GOLD_BRIGHT,
    shadowOpacity: 0.6,
    shadowRadius: 10,
  },
  avaEmoji: { fontSize: 24 },
  cardPill: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: -8,
    borderWidth: 1,
    borderColor: 'rgba(189,158,107,0.3)',
  },
  cardCount: { color: COLORS.GOLD, fontSize: 10, fontWeight: '900' },

  // Turn Indicators
  turnPulse: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: COLORS.GOLD_BRIGHT,
    opacity: 0.4,
  },
  turnPill: {
    display: 'none',
  },

  // Layout Positions (Half-in, Half-out)
  botPosTop: {
    position: 'absolute',
    top: -27,
    left: '50%',
    marginLeft: -35 // container width center
  },
  botPosLeft: {
    position: 'absolute',
    left: -27,
    top: '50%',
    marginTop: -35
  },
  botPosRight: {
    position: 'absolute',
    right: -27,
    top: '50%',
    marginTop: -35
  },
  playerPosBottom: {
    position: 'absolute',
    bottom: -32,
    left: '50%',
    marginLeft: -35
  },

  // Center
  centerArea: { width: 120, height: 120, justifyContent: 'center', alignItems: 'center' },
  deckBack: { width: 70, height: 100, backgroundColor: COLORS.GOLD, borderRadius: 8, padding: 2 },
  deckInner: { flex: 1, borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
  playedCard: { position: 'absolute' },

  // UI Bottom
  statusArea: { paddingVertical: 10, alignItems: 'center' },
  statusText: { color: COLORS.GOLD, fontSize: 11, fontWeight: '800', letterSpacing: 3, opacity: 0.7 },
  playerHandSection: {
    justifyContent: 'center',
  },

  // Penalty Animations
  penaltyOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
  },
  penaltyCard: {
    backgroundColor: '#1A1A1A',
    padding: 30,
    borderRadius: 30,
    alignItems: 'center',
    borderWidth: 3,
    shadowColor: '#000',
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 20,
    minWidth: 260
  },
  penaltyEmoji: { fontSize: 80, marginBottom: 10 },
  penaltyTitle: { color: '#FFF', fontSize: 40, fontWeight: '900', letterSpacing: 5 },
  penaltySubtitle: { color: COLORS.GOLD, fontSize: 14, fontWeight: '800', marginTop: 5, textAlign: 'center' },

  // Modal
  over: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modal: { width: '85%', maxWidth: 400, backgroundColor: '#1A0C0C', borderRadius: 24, padding: 30, alignItems: 'center', borderWidth: 1, borderColor: COLORS.DEEP_RED },
  modalTitle: { color: '#666', fontSize: 12, fontWeight: '900', letterSpacing: 4 },
  modalMsg: { color: COLORS.GOLD, fontSize: 22, fontWeight: '900', marginVertical: 20, textAlign: 'center' },
  btn: { width: '100%', borderRadius: 12, overflow: 'hidden', marginBottom: 15 },
  btnGrad: { paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  btnText: { color: '#000', fontWeight: '900', fontSize: 15 },
  btnSecondary: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  btnTextSecondary: { color: COLORS.GOLD, fontWeight: '800' },
});


export default Table;
