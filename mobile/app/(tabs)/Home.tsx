import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { colors } from '../../components/blitzz/tokens';
import { DashboardHeader } from '../../components/blitzz/DashboardHeader';
import Animated, { FadeIn } from 'react-native-reanimated';

// 导入你新创建的模块
import Dashboard from './Dashboard';
import Profile from './Profile';

export default function HomeScreen() {
    // 定义当前显示的位面：'dashboard' (主页) 或 'profile' (个人资料)
    const [activeTab, setActiveTab] = useState<'dashboard' | 'profile'>('dashboard');

    return (
        <SafeAreaView style={styles.container}>
            <Animated.View
                entering={FadeIn.duration(600)}
                style={{ flex: 1}}
            >
            <View style={styles.content}>

                {/* Header 逻辑控制 */}
                <DashboardHeader
                    currentTab={activeTab} // 告诉 Header 现在在哪里
                    onProfil={() => setActiveTab('profile')} // 点击 Profile 跳去 Profile
                    onHome={() => setActiveTab('dashboard')}    // 点击 Home 跳回 Dashboard
                />

                {/* 根据状态条件渲染内容 */}
                {activeTab === 'dashboard' ? <Dashboard /> : <Profile />}

            </View>
            </Animated.View>
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