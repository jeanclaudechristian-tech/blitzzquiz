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
        console.log("🔥 [1] AuthContext: login 被调用了！");
        setIsLoading(true);
        try {
            console.log("🔥 [2] AuthContext: 准备调用 api.post");
            const response = await api.post('/login', { email, password });
            console.log("🔥 [3] AuthContext: api.post 返回了，后端验证通过！");

            // 1. 打印看看后端到底给了什么
            console.log("📦 后端数据:", response.data);

            const { user, token } = response.data;

            // 2. 检查 Token 是否存在
            if (!token) {
                throw new Error("后端没返回 Token！");
            }

            console.log("💾 正在保存 Token...");
            await SecureStore.setItemAsync('auth_token', token);
            console.log("✅ Token 保存完毕");

            setUser(user);

            // 3. 关键修改：尝试跳转到根路径 '/'，而不是 '(tabs)'
            // 因为我怀疑你可能还没有写好 (tabs) 页面，导致导航失败
            console.log("🚗 准备跳转到首页...");
            router.replace('/(tabs)/Home');

        } catch (error: any) {
            console.log("💥 [AuthContext] 登录后续处理失败:", error);
            Alert.alert('Erreur', error.message || 'Login failed');
            throw error;
        } finally {
            setIsLoading(false);
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

            console.log("✅ [AuthContext] 注册成功!");
            const { user, token } = response.data;

            await SecureStore.setItemAsync('auth_token', token);
            setUser(user);

            // 注册成功直接进首页
            router.replace('/(tabs)/Home');

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

    return (
        <AuthContext.Provider value={{ user, isLoading, login, register, googleLogin, logout, results, refreshResults, loadingResults }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);