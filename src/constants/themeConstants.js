export const GLOBAL_COLORS = {
    gold: '#BD9E6B',
    goldBright: '#FFC83D',
    cardBase: '#FAF9F6',
    textDark: '#1A1A1A',
    charcoal: '#333333',
    offWhite: '#FAF9F6',
    deepRed: '#1A0C0C',
    black: '#050505',
    error: '#B22222',
    success: '#2E5C4E',
    blackAccent: '#2A2A2A',
    redAccent: '#8B1E1E',
};

export const SUIT_THEMES = {
    spade: {
        label: 'Spades',
        icon: 'cards-spade',
        accent: '#BD9E6B', // Gold
        isRed: false
    },
    heart: {
        label: 'Hearts',
        icon: 'cards-heart',
        accent: '#ff4d4d', // Red
        isRed: true
    },
    club: {
        label: 'Clubs',
        icon: 'cards-club',
        accent: '#BD9E6B', // Gold
        isRed: false
    },
    diamond: {
        label: 'Diamonds',
        icon: 'cards-diamond',
        accent: '#ff4d4d', // Red
        isRed: true
    }
};

export const getThemeBySuit = (suit) => SUIT_THEMES[suit] || SUIT_THEMES.spade;
