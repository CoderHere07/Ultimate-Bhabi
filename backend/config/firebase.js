import { initializeApp, getApps, getApp } from "@firebase/app";
import {
    getAuth,
    initializeAuth,
    getReactNativePersistence
} from "@firebase/auth";
import { getDatabase } from "@firebase/database";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
    apiKey: "[GCP_API_KEY]",
    authDomain: "bhabhi-tula.firebaseapp.com",
    projectId: "bhabhi-tula",
    storageBucket: "bhabhi-tula.firebasestorage.app",
    messagingSenderId: "643223572946",
    appId: "1:643223572946:web:47b50bd8b212b69305780b",
    measurementId: "G-WMM8K45RJ2"
};

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth with Persistence (React Native specific)
let auth;
try {
    auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
    });
} catch (e) {
    auth = getAuth(app);
}

const database = getDatabase(app);

export { auth, database };
