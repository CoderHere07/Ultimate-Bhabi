import {
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

const Card = ({
  card,
  onPress,
  disabled,
  isHighlighted,
  isPlayable = true,
}) => {
  const { width, height } = useWindowDimensions();
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;

  const getCardSize = () => {
    let cardBaseW;
    if (isMobile) {
      cardBaseW = width * 0.13; // Slightly smaller to prevent screen overflow
    } else if (isTablet) {
      cardBaseW = Math.min(width * 0.08, 90);
    } else {
      cardBaseW = Math.min(width * 0.06, 110); // Reduced from 130 to prevent overlapping names
    }

    const cardH = cardBaseW * 1.4;
    const maxHeight = height * 0.18;

    if (cardH > maxHeight) {
      return {
        width: maxHeight / 1.4,
        height: maxHeight,
      };
    }

    return {
      width: cardBaseW,
      height: cardH,
    };
  };

  const { suit, rank } = card;
  const isRed = suit === "HEARTS" || suit === "DIAMONDS";

  // Master Prompt Colors
  const COLORS = {
    IVORY: "#F6F4EF",
    CHARCOAL: "#2A2A2A",
    DEEP_RED: "#8B1E1E",
    BORDER: "rgba(0,0,0,0.1)",
    GOLD_DIM: "rgba(189, 158, 107, 0.2)"
  };

  const color = isRed ? COLORS.DEEP_RED : COLORS.CHARCOAL;
  const symbol = { SPADES: "♠", HEARTS: "♥", DIAMONDS: "♦", CLUBS: "♣" }[suit];
  const { width: CARD_W, height: CARD_H } = getCardSize();

  const getFontSize = (baseSize, isCenter = false) => {
    if (isMobile) return isCenter ? baseSize * 0.45 : baseSize * 0.9; // Extreme reduction for mobile
    if (isTablet) return baseSize * 1.8;
    return baseSize * 2.2;
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      disabled={disabled || !isPlayable}
      style={[
        styles.card,
        {
          width: CARD_W,
          height: CARD_H,
          backgroundColor: COLORS.IVORY,
          borderColor: COLORS.GOLD_DIM
        },
        isHighlighted && styles.high,
      ]}
    >
      <View style={styles.cardInner}>
        {/* Top Left Corner */}
        <View style={styles.topCorner}>
          <Text style={[styles.rank, { color, fontSize: getFontSize(11) }]}>
            {rank}
          </Text>
          <Text style={[styles.suitSmall, { color, fontSize: getFontSize(10) }]}>
            {symbol}
          </Text>
        </View>

        {/* Center Symbol */}
        <Text style={[styles.centerSuit, { color, fontSize: getFontSize(32, true) }]}>
          {symbol}
        </Text>

        {/* Bottom Right Corner (Inverted) */}
        <View style={styles.bottomCorner}>
          <Text style={[styles.suitSmall, { color, fontSize: getFontSize(10) }]}>
            {symbol}
          </Text>
          <Text style={[styles.rank, { color, fontSize: getFontSize(11) }]}>
            {rank}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 6,
    borderWidth: 0.5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
    overflow: "hidden",
  },
  cardInner: {
    flex: 1,
    padding: 3,
    justifyContent: "center",
    alignItems: "center",
  },
  topCorner: {
    position: "absolute",
    top: 2,
    left: 4,
    alignItems: "center",
  },
  bottomCorner: {
    position: "absolute",
    bottom: 2,
    right: 4,
    alignItems: "center",
    transform: [{ rotate: "180deg" }],
  },
  rank: {
    fontWeight: "900", // even bolder
    fontFamily: "serif",
    lineHeight: 18,
  },
  suitSmall: {
    lineHeight: 14,
  },
  centerSuit: {
    opacity: 0.95,
  },
  high: {
    borderColor: "#BD9E6B",
    borderWidth: 1.5,
    shadowColor: "#BD9E6B",
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 8,
    transform: [{ translateY: -20 }],
  },
});

export default Card;
