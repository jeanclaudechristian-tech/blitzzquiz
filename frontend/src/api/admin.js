// src/api/admin.js
import axios from 'axios';

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL + '/api/admin',
    headers: {
        'Content-Type': 'application/json',
    }
});

// 请求拦截器：自动注入圣典令牌
apiClient.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const adminService = {
    // 1. 邀请/创建管理员 (仅限超级管理员)
    inviteAdmin(email) {
        return apiClient.post('/users/invite-admin', { email });
    },

    // 2. 获取用户列表 (带分页和搜索)
    getUsers(page = 1, searchQuery = '') {
        return apiClient.get('/users', {
            params: { page, q: searchQuery }
        });
    },

    // 3. 禁用/启用用户
    toggleUserStatus(userId) {
        return apiClient.patch(`/users/${userId}/disable`);
    },

    // 4. 重置用户密码
    resetUserPassword(userId) {
        return apiClient.post(`/users/${userId}/reset-password`);
    },

    // 5. 身份模拟 (Impersonation)
    impersonateUser(userId) {
        return apiClient.post('/impersonate', { user_id: userId });
    },

    // 6. 删除用户
    deleteUser(userId) {
        return apiClient.delete(`/users/${userId}`);
    }
};