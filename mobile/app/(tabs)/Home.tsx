import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { useAuth } from '../../services/AuthContext';
import { colors } from '../../components/blitzz/tokens';
import { DashboardHeader } from '../../components/blitzz/DashboardHeader';

// 导入你新创建的模块
import Dashboard from './Dashboard';
import Profile from './Profile';

export default function HomeScreen() {
    const { user, logout } = useAuth();

    // 定义当前显示的位面：'dashboard' (主页) 或 'profile' (个人资料)
    const [activeTab, setActiveTab] = useState<'dashboard' | 'profile'>('dashboard');

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>

                {/* Header 逻辑控制 */}
                <DashboardHeader
                    averageScore={78}
                    completedQuizzes={23}
                    currentTab={activeTab} // 告诉 Header 现在在哪里
                    onProfil={() => setActiveTab('profile')} // 点击 Profile 跳去 Profile
                    onHome={() => setActiveTab('dashboard')}    // 点击 Home 跳回 Dashboard
                />

                {/* 根据状态条件渲染内容 */}
                {activeTab === 'dashboard' ? <Dashboard /> : <Profile user={user} logout={logout} />}

            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.light,
    },
    content: {
        flex: 1,
        paddingHorizontal: 30,
        paddingTop: 40,
        paddingBottom: 20,
    },
});