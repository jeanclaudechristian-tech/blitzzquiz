// _layout.tsx
import { AuthProvider, useAuth } from "@/services/AuthContext"; // 确保导出了 useAuth
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { LoadingScreen } from "@/components/blitzz/LoadingScreen"; // 我们刚才讨论的加载页
import { colors, fonts } from "@/components/blitzz/tokens";
import {GroupProvider} from "@/services/GroupContext";
import {GroupDetailProvider} from "@/services/GroupDetailContext";
import { QuizProvider } from "@/services/QuizContext";

function RootLayoutNav() {
    const { isLoading } = useAuth();

    // 💡 关键：如果还在加载（检查 Token 中），直接显示加载页，不渲染 Stack
    if (isLoading) {
        return <LoadingScreen />;
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <Stack
                screenOptions={{
                    headerShown: false,
                    animation: 'fade',
                    contentStyle: { backgroundColor: colors.light }
                }}
            >
                <Stack.Screen name="index" />
                <Stack.Screen name="auth/LoginScreen" />
                <Stack.Screen name="(tabs)/Home" />
                {/* 你的其他路由 */}
            </Stack>
        </GestureHandlerRootView>
    );
}

export default function RootLayout() {
    return (
        <AuthProvider>
            <QuizProvider>
                <GroupProvider>
                    <RootLayoutNav/>
                </GroupProvider>
            </QuizProvider>
        </AuthProvider>
    );
}