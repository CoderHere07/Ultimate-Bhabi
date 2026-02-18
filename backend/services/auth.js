import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    signOut,
    updateProfile
} from "@firebase/auth";
import { ref, set, update, serverTimestamp } from "@firebase/database";
import { auth, database } from "../config/firebase";

// LOGIN
export const loginUser = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        // Update last login in database
        await update(ref(database, `users/${userCredential.user.uid}`), {
            lastLogin: serverTimestamp()
        });
        return { success: true, user: userCredential.user };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// SIGN UP
export const signUpUser = async (email, password, displayName, selectedSuit) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        // Update auth profile
        await updateProfile(userCredential.user, { displayName });

        // Create user profile in database
        await set(ref(database, `users/${userCredential.user.uid}`), {
            email: email,
            displayName: displayName,
            selectedSuit: selectedSuit || 'spade',
            stats: {
                gamesPlayed: 0,
                gamesWon: 0,
                winRate: 0
            },
            createdAt: serverTimestamp(),
            lastLogin: serverTimestamp()
        });

        return { success: true, user: userCredential.user };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// FORGOT PASSWORD
export const resetPassword = async (email) => {
    try {
        await sendPasswordResetEmail(auth, email);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// LOGOUT
export const logoutUser = async () => {
    try {
        await signOut(auth);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// UPDATE PROFILE
export const updateUserProfile = async (userId, data) => {
    try {
        await update(ref(database, `users/${userId}`), data);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
};
