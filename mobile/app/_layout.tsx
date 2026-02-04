import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
    return (
        // 1. 必须包裹这一层，Reanimated 才能通过 UI 线程控制动画
        <GestureHandlerRootView style={{ flex: 1 }}>
            <Stack
                screenOptions={{
                    headerShown: false,
                    animation: 'none',
                    contentStyle: { backgroundColor: '#FFFFFF' }
                }}
            >
                <Stack.Screen name="index" />
                <Stack.Screen name="auth/LoginScreen" />
                {/* 确保这里包含你的所有路由 */}
            </Stack>
        </GestureHandlerRootView>
    );
}