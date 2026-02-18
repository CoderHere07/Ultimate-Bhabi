export const SUITS = ["SPADES", "HEARTS", "DIAMONDS", "CLUBS"];
export const RANKS = [
    "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"
];

export const RANK_VALUES = {
    "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9, "10": 10,
    "J": 11, "Q": 12, "K": 13, "A": 14
};

export const createDeck = () => {
    const deck = [];
    SUITS.forEach((suit) => {
        RANKS.forEach((rank) => {
            deck.push({
                suit,
                rank,
                value: RANK_VALUES[rank],
                id: `${rank}_${suit}`,
            });
        });
    });
    return deck;
};

export const shuffleDeck = (deck) => {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

export const dealCards = (deck, playersCount = 4) => {
    const hands = Array.from({ length: playersCount }, () => []);
    deck.forEach((card, index) => {
        hands[index % playersCount].push(card);
    });
    return hands;
};

export const findAceOfSpadesPlayer = (hands) => {
    return hands.findIndex((hand) =>
        hand.some((card) => card.rank === "A" && card.suit === "SPADES"),
    );
};
