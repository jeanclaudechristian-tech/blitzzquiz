import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { colors } from '../../components/blitzz/tokens';
import { DashboardHeader } from '../../components/blitzz/DashboardHeader';
import Animated, { FadeIn } from 'react-native-reanimated';

// 导入你新创建的模块
import Dashboard from './Dashboard';
import Profile from './Profile';
import Groups from "@/app/(tabs)/Groups";

export default function HomeScreen() {
    // 定义当前显示的位面：'dashboard' (主页) 或 'profile' (个人资料)
    const [currentTab, setCurrentTab] = useState<'dashboard' | 'profile' | 'groups'>('dashboard');

    return (
        <SafeAreaView style={styles.container}>
            <Animated.View
                entering={FadeIn.duration(600)}
                style={{ flex: 1}}
            >
            <View style={styles.content}>
                {/* Header 逻辑：当在 groups 时，Header 应该显示为 profile 选中状态或根据你设计调整 */}
                <DashboardHeader
                    currentTab={currentTab === 'groups' ? 'profile' : currentTab}
                    onProfil={() => setCurrentTab('profile')}
                    onHome={() => setCurrentTab('dashboard')}
                />

                {/* 条件渲染逻辑：确保互斥，一次只显示一个 */}
                {currentTab === 'dashboard' && (
                    <Animated.View entering={FadeIn} style={{ flex: 1 }}>
                        <Dashboard />
                    </Animated.View>
                )}

                {currentTab === 'profile' && (
                    <Animated.View entering={FadeIn} style={{ flex: 1 }}>
                        {/* 传入真正的切换函数，不再 throw error */}
                        <Profile onViewGroups={() => setCurrentTab('groups')} />
                    </Animated.View>
                )}

                {currentTab === 'groups' && (
                    <Animated.View entering={FadeIn} style={{ flex: 1 }}>
                        <Groups onBack={() => setCurrentTab('profile')} />
                    </Animated.View>
                )}

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