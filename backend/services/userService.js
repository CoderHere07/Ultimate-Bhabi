import { ref, get, update, onValue } from "@firebase/database";
import { database, auth } from "../config/firebase";

export const userService = {
    /**
     * Get user profile data once
     */
    async getUserProfile(userId) {
        try {
            const snapshot = await get(ref(database, `users/${userId}`));
            if (snapshot.exists()) {
                return snapshot.val();
            }
            return null;
        } catch (error) {
            console.error("Error fetching user profile:", error);
            throw error;
        }
    },

    /**
     * Subscribe to user profile changes
     */
    subscribeToProfile(userId, callback) {
        const userRef = ref(database, `users/${userId}`);
        return onValue(userRef, (snapshot) => {
            callback(snapshot.val());
        });
    },

    /**
     * Update user profile stats after a game
     */
    async updateStats(userId, isWin) {
        console.log(`userService.updateStats called for ${userId}, isWin: ${isWin}`);
        try {
            const profile = await userService.getUserProfile(userId);
            if (!profile) {
                console.error(`UpdateStats failed: No profile found for user ${userId}`);
                return;
            }

            console.log("Current profile stats:", profile.stats);

            const stats = profile.stats || { gamesPlayed: 0, gamesWon: 0, winRate: 0 };
            const newGamesPlayed = (stats.gamesPlayed || 0) + 1;
            const newGamesWon = isWin ? (stats.gamesWon || 0) + 1 : (stats.gamesWon || 0);
            const newWinRate = Math.round((newGamesWon / newGamesPlayed) * 100);

            console.log(`Updating stats to: gamesPlayed=${newGamesPlayed}, gamesWon=${newGamesWon}, winRate=${newWinRate}`);

            await update(ref(database, `users/${userId}/stats`), {
                gamesPlayed: newGamesPlayed,
                gamesWon: newGamesWon,
                winRate: newWinRate
            });
            console.log("Database update successful");
        } catch (error) {
            console.error("Error updating stats in userService:", error);
            throw error;
        }
    },

    /**
     * Update user's preferred card suit
     */
    async updateSuit(userId, suit) {
        try {
            await update(ref(database, `users/${userId}`), {
                selectedSuit: suit
            });
        } catch (error) {
            console.error("Error updating suit:", error);
        }
    }
};
