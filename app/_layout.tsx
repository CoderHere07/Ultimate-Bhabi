import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function Layout() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="Login" />
                <Stack.Screen name="SignUp" />
                <Stack.Screen name="Profile" />
                <Stack.Screen name="ForgotPassword" />
                <Stack.Screen name="table" />
            </Stack>
        </GestureHandlerRootView>
    );
}
