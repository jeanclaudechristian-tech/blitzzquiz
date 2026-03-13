import React, { useState } from 'react';
import {View, StyleSheet, SafeAreaView, Platform, StatusBar, Alert} from 'react-native';
import { colors } from '../../components/blitzz/tokens';
import { DashboardHeader } from '../../components/blitzz/DashboardHeader';
import Animated, { FadeIn } from 'react-native-reanimated';

// 导入你新创建的模块
import Dashboard from './Dashboard';
import Profile from './Profile';
import Groups from "@/app/(tabs)/Groups";
import {Group, Quiz} from "@/types";
import GroupDetail from "@/app/(tabs)/GroupDetail";
import {GroupDetailProvider} from "@/services/GroupDetailContext";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import SearchPage from './SearchPage';
import {QuizDetailModal} from "@/app/(tabs)/QuizDetailModal";
import { useQuizzes } from '@/services/QuizContext';
import {useRouter} from "expo-router";
import { LoadingScreen } from '@/components/blitzz/LoadingScreen';

export default function HomeScreen() {
    const insets = useSafeAreaInsets();
    // 定义当前显示的位面：'dashboard' (主页) 或 'profile' (个人资料)
    const [currentTab, setCurrentTab] = useState<'dashboard' | 'profile' | 'groups' | 'group-detail'>('dashboard');
    const [searchResults, setSearchResults] = useState<Quiz[] | null>(null);
    const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);

    const router = useRouter();
    const { fetchQuestions } = useQuizzes(); // 获取加载题目
    const [isStarting, setIsStarting] = useState(false);

    const handleStartQuiz = async (quiz: Quiz) => {
        setIsStarting(true);
        try {
            // 现在 TypeScript 知道 questions 是 Question[] | null 了
            const questions = await fetchQuestions(quiz.id);

            // ✅ 检查是否有题目返回
            if (questions && questions.length > 0) {
                setIsModalVisible(false);

                setTimeout(() => {
                    // 穿越至答题位面
                    router.push("/quiz/QuizPlayer");
                }, 300);
            } else {
                // 如果返回了空数组或 null
                Alert.alert("Désolé", "Ce quiz ne contient aucune question.");
            }
        } catch (e) {
            console.error(e);
            Alert.alert("Erreur", "Une erreur est survenue.");
        } finally {
            setIsStarting(false);
        }
    };

    const handleOpenDetail = (quiz: Quiz) => {
        setSelectedQuiz(quiz);
        setIsModalVisible(true);
    };

    // @ts-ignore
    return (
        <SafeAreaView style={styles.container}>
            <Animated.View
                entering={FadeIn.duration(600)}
                style={{ flex: 1}}
            >
                <View style={[
                    styles.content,
                    {
                        // 动态计算顶部留白：insets.top 是状态栏高度，再加 20 像素的呼吸感
                        paddingTop: Platform.OS === 'android' ? insets.top + 40 : 30,
                        paddingBottom: Platform.OS === 'android' ? insets.bottom : 0
                    }
                ]}>
                {/* Header 逻辑：当在 groups 时，Header 应该显示为 profile 选中状态或根据你设计调整 */}
                <DashboardHeader
                    currentTab={currentTab === 'groups' ? 'profile' : currentTab}
                    onProfil={() => setCurrentTab('profile')}
                    onHome={() => {
                        setCurrentTab('dashboard');
                        setIsSearching(false); // 回家时关闭搜索位面
                    }}
                    // ✅ 传给 Header 的回调
                    onSearchStateChange={(expanded) => {
                        setIsSearching(expanded);
                        if (!expanded) setSearchText(''); // 关闭搜索时重置文字
                    }}
                    onSearchResults={(results, query) => {
                        setSearchResults(results);
                        // ✅ 确保即使 query 为 undefined 也有兜底的空字符串
                        setSearchText(query || '');
                    }}
                />

                    {/* --- 搜索位面：优先级最高 --- */}
                    {isSearching ? (
                        <Animated.View entering={FadeIn} style={{ flex: 1 }}>
                            <SearchPage
                                results={searchResults}
                                searchQuery={searchText}
                                onSelectQuiz={handleOpenDetail} // ✅ 传下去
                            />
                        </Animated.View>
                    ) : (
                        /* --- 常规 Tab 位面 --- */
                        <>
                            {currentTab === 'dashboard' && (
                                <Animated.View entering={FadeIn} style={{ flex: 1 }}>
                                    {/* ✅ 统一使用这个带回调的版本 */}
                                    <Dashboard onSelectQuiz={handleOpenDetail} />
                                </Animated.View>
                            )}

                            {currentTab === 'profile' && (
                                <Animated.View entering={FadeIn} style={{ flex: 1 }}>
                                    <Profile onViewGroups={() => setCurrentTab('groups')} />
                                </Animated.View>
                            )}

                            {currentTab === 'groups' && (
                                <Animated.View entering={FadeIn} style={{ flex: 1 }}>
                                    <Groups onBack={() => setCurrentTab('profile')} onSelectGroup={(group) => {
                                        setSelectedGroup(group);
                                        setCurrentTab('group-detail');
                                    }}/>
                                </Animated.View>
                            )}

                            {currentTab === 'group-detail' && selectedGroup ? (
                                <GroupDetailProvider>
                                    <Animated.View entering={FadeIn} style={{ flex: 1 }}>
                                        <GroupDetail
                                            group={selectedGroup}
                                            onBack={() => setCurrentTab('groups')}
                                            onSelectQuiz={handleOpenDetail}
                                        />
                                    </Animated.View>
                                </GroupDetailProvider>
                            ) : null}
                        </>
                    )}
            </View>
            </Animated.View>
            <QuizDetailModal
                quiz={selectedQuiz}
                isVisible={isModalVisible}
                onClose={() => setIsModalVisible(false)}
                onStart={handleStartQuiz} // ✅ 绑定这个仪式
                groupId={(!isSearching && currentTab === 'group-detail') ? selectedGroup?.id : undefined}
            />

            {/* 如果正在加载题目，可以加个全局加载状态 */}
            {isStarting && (
                <View style={[StyleSheet.absoluteFill, { zIndex: 999 }]}>
                    <LoadingScreen />
                </View>
            )}
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
        paddingBottom: 20,
    },
});