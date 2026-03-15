import React, { createContext, useState, useEffect, useContext } from 'react';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';
import { useRouter } from 'expo-router';
import { Alert } from 'react-native';
// 确保你已经创建了 types/index.ts 并导出了 User 接口
import { User } from "@/types";
import {Result} from "@/types";

type AuthContextType = {
    user: User | null; // ✅ 修复 1：允许 user 为空
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, nickname: string, password: string, education_level: string, role?: string) => Promise<void>;
    googleLogin: (token: string) => Promise<void>; // ✅ 修复 2：加上 Google 登录定义
    logout: () => Promise<void>;
    results: Result[]; // ✅ 新增：全局成绩状态
    refreshResults: () => Promise<void>; // ✅ 新增：刷新方法
    loadingResults: boolean;
    forgotPassword: (email: string) => Promise<void>;
    resendVerification: (email: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    // 💡 修复：初始化必须为 true！
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const [results, setResults] = useState<Result[]>([]); // ✅ 初始化
    const [loadingResults, setLoadingResults] = useState(false);

    useEffect(() => {
        checkLoginStatus();
    }, []);

    const refreshResults = async () => {
        if (!user) return;
        setLoadingResults(true);
        try {
            const response = await api.get('/me/results');
            setResults(response.data);
            console.log("✅ [AuthContext] 成绩已同步");
        } catch (error) {
            console.error("❌ [AuthContext] 获取成绩失败:", error);
        } finally {
            setLoadingResults(false);
        }
    };

    // 当用户登录状态变化时，自动抓取一次数据
    useEffect(() => {
        if (user) {
            refreshResults();
        } else {
            setResults([]); // 登出清空
        }
    }, [user]);

    const checkLoginStatus = async () => {
        // 这里不需要写 setIsLoading(true)，因为初始化就是 true
        try {
            const token = await SecureStore.getItemAsync('auth_token');
            if (token) {
                const response = await api.get('/user');
                setUser(response.data);
                // 💡 这里的 router.replace 建议删掉，交给 index.tsx 统一分发，防止冲突
            }
        } catch (e) {
            await SecureStore.deleteItemAsync('auth_token');
            setUser(null);
        } finally {
            // ✅ 关键：无论成功失败，最后才把加载位面关闭
            setIsLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        try {
            const response = await api.post('/login', { email, password });
            const { user, token } = response.data;

            // 🛡️ 物理屏障检查：如果后端没有拦截，这里做最后的保险
            if (!user.email_verified_at) {
                throw { response: { status: 403, data: { needs_verification: true } } };
            }

            await SecureStore.setItemAsync('auth_token', token);
            setUser(user);
            router.replace('/(tabs)/Home');
        } catch (error: any) {
            // 关键：如果状态码是 403，不要在这里 Alert，把控制权交给 LoginScreen.tsx
            if (error.response?.status === 403 && error.response?.data?.needs_verification) {
                throw error;
            }

            console.log("💥 [AuthContext] 登录失败:", error);
            const message = error.response?.data?.message || 'Login failed';
            Alert.alert('Erreur', message);
            throw error;
        }
    };

    const register = async (email: string, nickname: string, password: string, educationLevel: string, role: string = 'STUDENT') => {
        setIsLoading(true);
        try {
            console.log(`🔥 [AuthContext] 开始注册: ${email}, 角色: ${role}`);

            // 发送带 role 的请求
            const response = await api.post('/register', {
                email,
                nickname,
                password,
                password_confirmation: password,
                education_level: educationLevel,
                role: role,  // 将角色传给后端
            });

            console.log("✅ [AuthContext] 注册物理存库成功，准备引导验证");

            // 注册成功验证邮箱
            router.replace('/auth/EmailSentVerification');

        } catch (error: any) {
            console.log("❌ [AuthContext] 注册失败:", error.response?.data);
            const message = error.response?.data?.message || 'Échec de l\'inscription.';
            Alert.alert('Erreur', message);
            throw error; // 抛出错误以便 UI 停止转圈
        } finally {
            setIsLoading(false);
        }
    };
    // ✅ 修复 3：补上 Google 登录实现
    const googleLogin = async (token: string) => {
        setIsLoading(true);
        try {
            console.log("🧐 [Debug] 准备发给后端的 AccessToken:", token.substring(0, 20) + "...");

            // 1. 修改请求路径为我们刚加的 google-mobile
            // 2. 修改参数名为 'token'，以匹配后端 AuthController 里的接收字段
            const response = await api.post('/auth/google-mobile', { token: token });

            console.log("✅ [AuthContext] 后端返回成功:", response.data);

            const { user, token: jwt, needs_completion } = response.data;

            // 处理注册未完成的情况（如果后端返回需要补全信息）
            if (needs_completion) {
                console.log("📝 用户需补充信息，前往完善页面...");
                // 假设你有这个路径，或者根据你的逻辑跳转
                // router.push({ pathname: "/auth/EducationLevelScreen", params: { email: user.email, google_id: user.google_id } });
                return;
            }

            // 正常登录流程
            await SecureStore.setItemAsync('auth_token', jwt);
            setUser(user);

            console.log("🚀 登录成功，正在进入 Home...");
            router.replace('/(tabs)/Home');

        } catch (error: any) {
            // 🛑 这里保留你原来的错误解密代码，非常有用
            console.log("\n💥 ----------------- 移动端 Google 登录错误 ----------------- 💥");
            if (error.response) {
                console.log("🔥 HTTP 状态码:", error.response.status);
                console.log("🔥 后端报错详情:", JSON.stringify(error.response.data, null, 2));
            } else {
                console.log("💥 错误消息:", error.message);
            }
            console.log("💥 -------------------------------------------------------- 💥\n");

            Alert.alert(
                '🔥 后端报错了',
                `错误详情:\n${error.response?.data ? JSON.stringify(error.response.data) : error.message}`
            );;
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        setIsLoading(true);
        console.log("🚶 正在退出登录...");
        try {
            await api.post('/logout');
        } catch(e) {
            // 忽略错误
        }
        await SecureStore.deleteItemAsync('auth_token');
        setUser(null);
        setIsLoading(false);
        router.replace('/auth/LoginScreen');
    };

    const forgotPassword = async (email: string) => {
        try {
            // 这里的 api 实例应该已经配置好了 baseURL (http://192.168.1.108:8000/api)
            await api.post('/forgot-password', { email });
        } catch (error: any) {
            console.error("Erreur forgotPassword:", error.response?.data);
            throw error; // 抛出错误让 UI 层处理
        }
    };

    const resendVerification = async (email: string) => {
        try {
            // 对应我们之前在 api.php 定义的公开接口 [cite: 1, 2026-03-15]
            await api.post('/email/resend-verification', { email });
        } catch (error: any) {
            console.error("❌ [AuthContext] 重发邮件失败:", error.response?.data);
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, register, googleLogin, logout, results, refreshResults, loadingResults, forgotPassword, resendVerification }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);