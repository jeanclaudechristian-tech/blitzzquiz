import { Stack } from "expo-router";

export default function RootLayout() {
    return (
        <Stack
            screenOptions={{
                // 这行代码会干掉所有页面的顶部导航栏，包括那个返回箭头
                headerShown: false,
                // 建议顺便把背景色统一
                contentStyle: { backgroundColor: '#FFFFFF' }
            }}
        >
            {/* 你可以在这里为特定页面单独开启，但通常全局关闭最清爽 */}
            <Stack.Screen name="index" />
            <Stack.Screen name="auth/LoginScreen" />
        </Stack>
    );
}