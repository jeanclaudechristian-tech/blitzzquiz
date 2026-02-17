// index.tsx
import { Redirect } from 'expo-router';
import { useAuth } from "@/services/AuthContext";
import { LoadingScreen } from '@/components/blitzz/LoadingScreen';

export default function Index() {
    const { user, isLoading } = useAuth();

    // 这一层保险确保如果 RootLayout 没拦截住，这里也不会闪
    if (isLoading) return <LoadingScreen />;

    // 已经登录：飞向 Dashboard
    if (user) {
        return <Redirect href="/(tabs)/Home" />;
    }

    // 未登录：停留在登录位面
    return <Redirect href="/auth/LoginScreen" />;
}