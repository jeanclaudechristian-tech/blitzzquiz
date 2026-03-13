import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { colors, fonts } from '../../components/blitzz/tokens';
import { useQuizzes } from '@/services/QuizContext';
import { QuizCard } from '@/components/blitzz/QuizCard';
import { Quiz } from '@/types';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {useAuth} from "@/services/AuthContext";
interface DashboardProps {
    onSelectQuiz: (quiz: Quiz) => void;
}

export default function Dashboard({ onSelectQuiz }: DashboardProps) {
    // 从我们定义的 QuizContext 中提取数据和抓取方法
    const { quizzes, isLoading, fetchQuizzes } = useQuizzes();
    const { user } = useAuth();

    // 组件挂载时，根据用户的 education_level 同步后端测验
    useEffect(() => {
        fetchQuizzes();
    }, []);

    const getFrenchDay = () => {
        const days = [
            'dimanche', 'lundi', 'mardi', 'mercredi',
            'jeudi', 'vendredi', 'samedi'
        ];
        return days[new Date().getDay()];
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        const day = getFrenchDay();

        if (hour < 12) return `Bon ${day}`;
        if (hour < 18) return `Bon après-midi`;
        return `Bonsoir`;
    };

    const userName = user?.nickname;

    const renderHeader = () => (
        <View style={styles.headerSection}>
            <Text style={styles.greetingText}>
                {getGreeting()},
            </Text>
            <Text style={styles.title}>
                {userName}
            </Text>
            <View style={styles.sectionDivider}>
                <Text style={styles.sectionLabel}>Recommandé pour vous</Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={quizzes}
                style={{ marginHorizontal: -15 }}
                keyExtractor={(item) => item.id.toString()}
                ListHeaderComponent={renderHeader}
                renderItem={({ item, index }) => (
                    // 使用 Reanimated 增加进入位面的仪式感
                    <Animated.View entering={FadeInDown.delay(index * 100).duration(600)}>
                        <QuizCard
                            quiz={item}
                            onPress={() => onSelectQuiz(item)}
                        />
                    </Animated.View>
                )}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                // 下拉刷新，再次感应后端数据
                refreshControl={
                    <RefreshControl
                        refreshing={isLoading}
                        onRefresh={fetchQuizzes}
                        tintColor={colors.primary}
                    />
                }
                // 当列表为空且不在加载时显示
                ListEmptyComponent={!isLoading ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>Aucun quiz trouvé pour votre profil.</Text>
                    </View>
                ) : null}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.light,
    },
    listContent: {
        paddingHorizontal: 15,
        paddingBottom: 40,
    },
    headerSection: {
        paddingTop: 10,
        marginBottom: 10,
    },
    greetingText: {
        fontFamily: fonts.inter,
        fontSize: 24, // 问候语稍微小一点
        fontWeight: '600',
        color: '#888', // 灰色更显优雅
        marginBottom: -4,
    },
    title: {
        fontFamily: fonts.inter,
        fontSize: 36, // 你的名字作为视觉核心
        fontWeight: '900',
        color: colors.dark,
        marginBottom: 20,
    },
    subtitle: {
        fontFamily: fonts.inter,
        fontSize: 16,
        color: '#888',
        marginBottom: 30,
    },
    sectionDivider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    sectionLabel: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.dark,
    },
    emptyContainer: {
        marginTop: 60,
        alignItems: 'center',
    },
    emptyText: {
        color: '#999',
        fontSize: 15,
        fontFamily: fonts.inter,
    }
});