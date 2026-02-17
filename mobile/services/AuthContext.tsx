import React, { createContext, useState, useEffect, useContext } from 'react';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';
import { useRouter } from 'expo-router';
import { Alert } from 'react-native';
// 确保你已经创建了 types/index.ts 并导出了 User 接口
import { User } from "@/types";

type AuthContextType = {
    user: User | null; // ✅ 修复 1：允许 user 为空
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, nickname: string, password: string, role?: string) => Promise<void>;    googleLogin: (token: string) => Promise<void>; // ✅ 修复 2：加上 Google 登录定义
    logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        checkLoginStatus();
    }, []);

    const checkLoginStatus = async () => {
        try {
            const token = await SecureStore.getItemAsync('auth_token');
            if (token) {
                const response = await api.get('/user');
                setUser(response.data);
                router.replace("/(tabs)/Home")
            }
        } catch (e) {
            await SecureStore.deleteItemAsync('auth_token');
            setUser(null);
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

    const register = async (email: string, nickname: string, password: string, role: string = 'STUDENT') => {
        setIsLoading(true);
        try {
            console.log(`🔥 [AuthContext] 开始注册: ${email}, 角色: ${role}`);

            // 发送带 role 的请求
            const response = await api.post('/register', {
                email,
                nickname,
                password,
                password_confirmation: password,
                role: role // 将角色传给后端
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
            console.log("🧐 [Debug] 准备发给后端的 Token:", token.substring(0, 30) + "...");

            const response = await api.post('/auth/google/callback', { token });
            const { user, token: jwt } = response.data;

            await SecureStore.setItemAsync('auth_token', jwt);
            setUser(user);

            // @ts-ignore
            router.replace('/(tabs)/Home'); // 顺手帮你把路由补全了

        } catch (error: any) {
            // 🛑 核心解密代码：把后端的报错底裤扒出来
            console.log("\n💥 ----------------- 错误开始 ----------------- 💥");

            if (error.response) {
                // 请求发成功了，但后端返回了 400 报错
                console.log("🔥 HTTP 状态码:", error.response.status);
                // 这里会把你后端 Laravel 写的 details 完完整整打印出来
                console.log("🔥 后端报错详情:", JSON.stringify(error.response.data, null, 2));
            } else if (error.request) {
                // 连不上后端（可能是 IP 变了或者服务没开）
                console.log("💀 没收到后端回应 (请检查网络或IP):", error.request);
            } else {
                // 纯前端代码错误
                console.log("💥 请求发送失败:", error.message);
            }

            console.log("💥 ----------------- 错误结束 ----------------- 💥\n");

            Alert.alert('Erreur', 'Google Login Failed');
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        try {
            await api.post('/logout');
        } catch(e) {
            // 忽略错误
        }
        await SecureStore.deleteItemAsync('auth_token');
        setUser(null);
        router.replace('/auth/LoginScreen');
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, register, googleLogin, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);