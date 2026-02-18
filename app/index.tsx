import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { onAuthStateChanged } from '@firebase/auth';
// @ts-ignore
import { auth } from '../backend/config/firebase';
import { useRouter, Redirect } from 'expo-router';

export default function Index() {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        // @ts-ignore
        const unsubscribe = onAuthStateChanged(auth, (u) => {
            setUser(u);
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#050505' }}>
                <ActivityIndicator size="large" color="#BD9E6B" />
            </View>
        );
    }

    // Redirect to Login if no user, otherwise to Profile
    return <Redirect href={user ? "/Profile" : "/Login"} />;
}
