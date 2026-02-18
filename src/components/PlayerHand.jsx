import { StyleSheet, useWindowDimensions, View } from "react-native";
import Card from "./Card.jsx";

const SUIT_ORDER = { HEARTS: 0, SPADES: 1, DIAMONDS: 2, CLUBS: 3 };

const PlayerHand = ({ cards, onCardPress, isTurn, ledSuit }) => {
  const { width } = useWindowDimensions();

  const sortedCards = [...cards].sort((a, b) => {
    if (SUIT_ORDER[a.suit] !== SUIT_ORDER[b.suit]) {
      return SUIT_ORDER[a.suit] - SUIT_ORDER[b.suit];
    }
    return a.value - b.value;
  });

  const hasLedSuit = ledSuit && cards.some((c) => c.suit === ledSuit);

  // Card width logic matching Card.jsx (Synced)
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  let cardWidth;
  if (isMobile) {
    cardWidth = width * 0.13;
  } else if (isTablet) {
    cardWidth = Math.min(width * 0.08, 90);
  } else {
    cardWidth = Math.min(width * 0.06, 110);
  }

  const sidePadding = isMobile ? 40 : 60; // Increased padding for safety
  const availableWidth = width - sidePadding;
  const totalCards = sortedCards.length;
  let overlapMargin = 0;

  if (totalCards > 1) {
    const totalNeededWidth = totalCards * cardWidth;
    // Force a tight overlap of at least 65% of card width for that "close to each other" feel
    const minOverlap = -(cardWidth * 0.65);

    if (totalNeededWidth > availableWidth) {
      const excess = totalNeededWidth - availableWidth;
      overlapMargin = Math.min(minOverlap, -(excess / (totalCards - 1)));
    } else {
      overlapMargin = minOverlap;
    }
  }

  return (
    <View style={[styles.container, { width }]}>
      <View style={styles.fanWrapper}>
        {sortedCards.map((c, i) => {
          const playable = !ledSuit || !hasLedSuit || c.suit === ledSuit;

          // Subtle fan rotation
          const rotation = (i - (totalCards - 1) / 2) * 1.5;

          return (
            <View
              key={c.id || `${c.suit}-${c.rank}-${i}`}
              style={[
                styles.cardWrapper,
                {
                  marginLeft: i === 0 ? 0 : overlapMargin,
                  zIndex: i,
                  transform: [{ rotate: `${rotation}deg` }],
                },
              ]}
            >
              <Card
                card={c}
                onPress={() => onCardPress(c)}
                disabled={!isTurn}
                isPlayable={playable && isTurn}
                isHighlighted={isTurn && playable}
              />
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    alignItems: "center",
  },
  fanWrapper: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-end",
  },
  cardWrapper: {
    // Basic wrapper
  },
});

export default PlayerHand;
