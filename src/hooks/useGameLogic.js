import { useState, useCallback, useRef } from 'react';
import { createDeck, shuffleDeck, findAceOfSpadesPlayer } from '../utils/deckUtils';

export const useGameLogic = () => {
    // Game State
    const [hands, setHands] = useState([[], [], [], []]);
    const [turn, setTurn] = useState(-1);
    const [pile, setPile] = useState([]);
    const [led, setLed] = useState(null);
    const [message, setMessage] = useState("Preparing Deck...");
    const [isFirstTurn, setIsFirstTurn] = useState(true);
    const [bhabhi, setBhabhi] = useState(null);
    const [isDealing, setIsDealing] = useState(false);
    const [showThola, setShowThola] = useState(null);
    const [deckCount, setDeckCount] = useState(52);
    const [dealingCards, setDealingCards] = useState([]);

    const gameEndingRef = useRef(false);

    const initGame = useCallback(async (startDealingCallback) => {
        setTurn(-1);
        setPile([]);
        setLed(null);
        setBhabhi(null);
        gameEndingRef.current = false;
        setIsFirstTurn(true);
        setMessage("Shuffling...");

        if (startDealingCallback) {
            startDealingCallback();
        }
    }, []);

    const startDealing = useCallback(async () => {
        setIsDealing(true);
        setDeckCount(52);
        setMessage("DEALING CARDS...");

        const deck = shuffleDeck(createDeck());
        const dHands = [[], [], [], []];
        const DEAL_INTERVAL = 250;
        const CARD_TRAVEL_DURATION = 200;

        for (let i = 0; i < 52; i++) {
            const pIdx = i % 4;
            const card = deck[i];
            dHands[pIdx].push(card);

            setTimeout(() => {
                setDealingCards(prev => [...prev, {
                    id: `deal-${i}`,
                    target: pIdx,
                    card,
                    type: 'deal'
                }]);
                setDeckCount(prev => prev - 1);
            }, i * DEAL_INTERVAL);

            setTimeout(() => {
                setHands(prevHands => {
                    const newHands = [...prevHands];
                    newHands[pIdx] = [...newHands[pIdx], card];
                    return newHands;
                });
                setDealingCards(prev => prev.filter(c => c.id !== `deal-${i}`));
            }, i * DEAL_INTERVAL + CARD_TRAVEL_DURATION);
        }

        const totalDealingTime = (52 * DEAL_INTERVAL) + CARD_TRAVEL_DURATION;

        setTimeout(() => {
            const starter = findAceOfSpadesPlayer(dHands);
            setTurn(starter);
            setIsDealing(false);
            setMessage(starter === 0 ? "YOUR TURN (ACE OF SPADES)" : `BOT ${starter} STARTS ROUND`);
        }, totalDealingTime + 600);
    }, []);

    const checkThoka = useCallback((currentPile, leadSuit) => {
        if (!leadSuit || currentPile.length < 2) return false;
        return currentPile.some((p) => p.card.suit !== leadSuit);
    }, []);

    const moveToNextTurn = useCallback((currentIdx, currentHands) => {
        let next = (currentIdx + 1) % 4;
        let count = 0;
        while (currentHands[next].length === 0 && count < 4) {
            next = (next + 1) % 4;
            count++;
        }
        setTurn(next);
        setMessage(next === 0 ? "YOUR TURN" : `Bot ${next}'s Turn`);
    }, []);

    const handleThoka = useCallback((currentPile, leadSuit, currentHands) => {
        setMessage("THOKA! (Penalty)");
        setTurn(-1);
        setTimeout(() => {
            const matching = currentPile.filter((p) => p.card.suit === leadSuit);
            const penaltyPlayer = matching.reduce(
                (m, c) => (c.card.value >= m.card.value ? c : m),
                matching[0],
            );

            const othersEmpty = currentHands.every((h, i) => i === penaltyPlayer.pIdx || h.length === 0);

            if (!othersEmpty) {
                setShowThola({ pIdx: penaltyPlayer.pIdx, type: 'THOLA' });
            }

            setHands((prev) => {
                const h = [...prev];
                h[penaltyPlayer.pIdx] = [...h[penaltyPlayer.pIdx], ...currentPile.map((p) => p.card)];
                return h;
            });

            setPile([]);
            setLed(null);
            setTurn(penaltyPlayer.pIdx);
            setMessage(penaltyPlayer.pIdx === 0 ? "You take penalty" : `Bot ${penaltyPlayer.pIdx} takes penalty`);
            setTimeout(() => setShowThola(null), 2000);
        }, 1500);
    }, []);

    const handleRoundEnd = useCallback((currentPile, lastSuit, currentHands) => {
        setTurn(-1);
        setTimeout(() => {
            const matching = currentPile.filter((p) => p.card.suit === lastSuit);

            // Sort by card value descending
            const sortedMatching = [...matching].sort((a, b) => b.card.value - a.card.value);

            // Find highest card played by someone who still has cards
            let roundStarter = sortedMatching.find(p => currentHands[p.pIdx].length > 0);

            // If everyone in this round is out (edge case), fallback to absolute winner
            if (!roundStarter) {
                roundStarter = sortedMatching[0];
            }

            const absoluteWinner = sortedMatching[0];

            setPile([]);
            setLed(null);
            setTurn(roundStarter.pIdx);

            if (absoluteWinner.pIdx !== roundStarter.pIdx) {
                const winnerName = absoluteWinner.pIdx === 0 ? "YOU" : `BOT ${absoluteWinner.pIdx}`;
                setMessage(`${winnerName} FINISHED! Turn to ${roundStarter.pIdx === 0 ? "YOU" : "BOT " + roundStarter.pIdx}`);
            } else {
                setMessage(roundStarter.pIdx === 0 ? "You win round" : `Bot ${roundStarter.pIdx} wins round`);
            }
        }, 1200);
    }, []);

    const playCard = useCallback((card, pIdx) => {
        if (turn !== pIdx || isDealing || showThola) return;

        setTurn(-1);

        setDealingCards(prev => [...prev, {
            id: `play-${Date.now()}`,
            origin: pIdx,
            card,
            type: 'throw'
        }]);

        setHands((prev) => {
            const h = [...prev];
            h[pIdx] = h[pIdx].filter((c) => c.id !== card.id);
            return h;
        });

        setTimeout(() => {
            setPile(prevPile => {
                const newPile = [...prevPile, { card, pIdx }];
                const isThoka = checkThoka(newPile, led);

                if (isFirstTurn && card.suit === "SPADES" && card.rank === "A") {
                    setIsFirstTurn(false);
                }

                if (isThoka) {
                    setHands(currentHands => {
                        handleThoka(newPile, led, currentHands);
                        return currentHands;
                    });
                } else {
                    if (newPile.length === 1) setLed(card.suit);

                    setHands(currentHands => {
                        // Check if there are any players who still have cards AND haven't played in this pile yet
                        const playersWhoStillNeedToPlay = currentHands.filter((h, i) =>
                            h.length > 0 && !newPile.some(p => p.pIdx === i)
                        ).length;

                        if (playersWhoStillNeedToPlay > 0) {
                            moveToNextTurn(pIdx, currentHands);
                        } else {
                            handleRoundEnd(newPile, card.suit, currentHands);
                        }
                        return currentHands;
                    });
                }
                return newPile;
            });

            setDealingCards(prev => prev.filter(c => !c.id.startsWith('play-')));
        }, 500);
    }, [turn, isDealing, showThola, led, isFirstTurn, checkThoka, handleThoka, moveToNextTurn, handleRoundEnd]);

    // Bot Logic can be triggered from the component using this state

    return {
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
    };
};
