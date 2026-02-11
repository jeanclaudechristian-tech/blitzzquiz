import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// ⚠️ 替换成你电脑的 IP 地址，不要用 localhost
const API_URL = 'http://10.103.43.174:8000/api';

const api = axios.create({
    baseURL: API_URL,
    timeout: 15000, // ✅ 新增：5秒连不上就报错，别傻等
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// 拦截器：每次请求自动带上 Token
api.interceptors.request.use(async (config) => {
    console.log("正在准备请求...");
    const token = await SecureStore.getItemAsync('auth_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log("🔑 [拦截器] 已附加 Token");
    }
    console.log("请求已发送:", config.url);
    return config;
});

export default api;