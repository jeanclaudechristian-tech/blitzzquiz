import React, {useEffect, useState} from 'react';
import {View, StyleSheet} from 'react-native';
import Animated, {
    useAnimatedStyle,
    withTiming,
    Easing,
    FadeInDown,
    FadeOutDown,
    ZoomIn,
    ZoomOut, withRepeat, withSequence, FadeIn, FadeOut
} from 'react-native-reanimated';
import {StatisticIsland} from './StatisticIsland';
import {ProfilIcon} from './ProfilIcon';
import {HomeIcon} from './HomeIcon';
import {SearchIcon} from './SearchIcon';
import { useAuth } from '@/services/AuthContext';
import {Result} from "@/types/index";
import {colors} from "@/components/blitzz/tokens";

// @ts-ignore
interface DashboardHeaderProps {
    averageScore?: number
}

// @ts-ignore
export const DashboardHeader = ({onProfil, onHome, currentTab = 'dashboard'}) => {
    const [isSearchExpanded, setIsSearchExpanded] = useState(false);
    const [isIslandExpanded, setIsIslandExpanded] = useState(false);

    const { results, loadingResults } = useAuth();
    const [loading, setLoading] = useState(true);
    // 📊 1. 实时计算逻辑：只要 results 变了，这里会自动重算
    const completedQuizzes = results.length;
    const totalScoreSum = results.reduce((sum, item) => sum + item.score, 0);
    const averageScore = completedQuizzes > 0 ? Math.round(totalScoreSum / completedQuizzes) : 0;

    const categoryMap = results.reduce((acc, item) => {
        const catName = item.quiz?.category || "Général";
        if (!acc[catName]) acc[catName] = { sum: 0, count: 0 };
        acc[catName].sum += item.score;
        acc[catName].count += 1;
        return acc;
    }, {} as Record<string, { sum: number; count: number }>);

    const categories = Object.keys(categoryMap).map((name, index) => ({
        id: index,
        name: name,
        score: Math.round(categoryMap[name].sum / categoryMap[name].count)
    }));

    const skeletonOpacity = useAnimatedStyle(() => ({
        opacity: withRepeat(
            withSequence(withTiming(0.4, { duration: 800 }), withTiming(0.8, { duration: 800 })),
            -1,
            true
        ),
    }));

    const config = { duration: 300, easing: Easing.inOut(Easing.quad) };

    const toggleIsland = () => {
        if (isSearchExpanded) return;
        setIsIslandExpanded(!isIslandExpanded);
    };

    const toggleSearch = (expanded: boolean) => {
        setIsSearchExpanded(expanded);
        if (expanded) setIsIslandExpanded(false);
    };

    // 1. Island 容器：移除 width: '100%'，改用 flex 扩张
    const leftContainerStyle = useAnimatedStyle(() => {
        // 赞美主，这里是解决“横向瞬间回收”的关键
        const isHiding = isSearchExpanded;

        return {
            // 1. 对 flex 进行动画处理，防止布局瞬间跳变
            flex: withTiming(isIslandExpanded ? 1 : 0, config),

            // 2. 避免从 '100%' 直接跳回固定数值，动画过程中使用固定的参考宽
            // 当 flex 为 0 时，组件会回落到这个 width
            width: withTiming(isHiding ? 0 : 200, config),

            opacity: withTiming(isHiding ? 0 : 1, config),
        };
    }, [isSearchExpanded, isIslandExpanded]);

    const spacerStyle = useAnimatedStyle(() => {
        const isSomethingExpanded = isSearchExpanded || isIslandExpanded;
        return {
            // Spacer 也要同步动画化其伸缩性
            flex: withTiming(isSomethingExpanded ? 0 : 1, config),
            // 增加一个极小的宽度缓冲，防止布局计算瞬间归零
            width: withTiming(isSomethingExpanded ? 0 : 8, config),
        };
    }, [isSearchExpanded, isIslandExpanded]);

    // 3. 右侧 Profile
    const profileStyle = useAnimatedStyle(() => {
        const hide = isSearchExpanded || isIslandExpanded;

        return {
            // 1. 物理宽度依然要归零，负责“腾出空间”给 Search
            width: withTiming(hide ? 0 : 56, config),

            // 2. 边距同步归零
            marginLeft: withTiming(hide ? 0 : 12, config),

            // 3. 核心修改：淡出逻辑
            opacity: withTiming(hide ? 0 : 1, config),

            // 4. 增加位移：让它向右滑动消失，而不是原地缩死
            transform: [
                {translateX: withTiming(hide ? 20 : 0, config)}
            ],
        };
    }, [isSearchExpanded, isIslandExpanded]);

    // 4. 右侧 Search 容器：对齐 SearchIcon 的逻辑
    const searchWrapperStyle = useAnimatedStyle(() => {
        const hide = isIslandExpanded;
        return {
            // 搜索展开时 flex: 1，收起时根据 hide 状态变为 0 或 56
            flex: isSearchExpanded ? withTiming(1, config) : 0,
            width: withTiming(hide ? 0 : (isSearchExpanded ? 300 : 56), config), // 300 这里只是给一个足够大的参考值，flex 1 会限制它
            opacity: withTiming(hide ? 0 : 1, config),
        };
    }, [isSearchExpanded, isIslandExpanded]);

    return (
        <View style={styles.headerContainer}>
            <Animated.View style={[leftContainerStyle, {zIndex: 2}]}>
                {loadingResults ? (
                    /* ✅ 加载时的占位岛屿 */
                    <Animated.View
                        entering={FadeIn}
                        exiting={FadeOut}
                        style={[styles.skeletonIsland, skeletonOpacity]}
                    />
                ) : (
                    <StatisticIsland
                        averageScore={averageScore}
                        completedQuizzes={completedQuizzes}
                        isExpanded={isIslandExpanded}
                        onToggle={toggleIsland}
                        categories={categories}
                    />
                )}
            </Animated.View>

            <Animated.View style={spacerStyle}/>

            <Animated.View style={searchWrapperStyle}>
                <SearchIcon isExpanded={isSearchExpanded} onToggle={toggleSearch}/>
            </Animated.View>

            <Animated.View
                style={[profileStyle, {alignItems: 'flex-start', justifyContent: 'center'}]}
            >
                <View style={{width: 56, alignItems: 'center'}}>
                    {currentTab === 'dashboard' ? (
                        <Animated.View
                            key="profil-btn"
                            entering={ZoomIn.duration(200)}  // 从远处飞到前面
                            exiting={ZoomOut.duration(200)} // 往后/往下飞走
                        >
                            <ProfilIcon onPress={onProfil}/>
                        </Animated.View>
                    ) : (
                        <Animated.View
                            key="home-btn"
                            entering={ZoomIn.duration(200)}
                            exiting={ZoomOut.duration(200)}
                        >
                            <HomeIcon onPress={onHome}/>
                        </Animated.View>
                    )}
                </View>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        width: '100%',
        minHeight: 56,
        paddingBottom: 12, // ✅ 为阴影留出空间，防止被切
        paddingHorizontal: 4, // ✅ 为侧面阴影留空间
        zIndex: 10,
    },
    skeletonIsland: {
        height: 56,
        width: 140, // 稍微窄一点，给呼吸感留空间
        backgroundColor: colors.grayBg,
        borderRadius: 28,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    }
});