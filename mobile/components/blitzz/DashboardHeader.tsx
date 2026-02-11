import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { StatisticIsland } from './StatisticIsland';
import { ProfilIcon } from './ProfilIcon';
import { SearchIcon } from './SearchIcon';

// @ts-ignore
export const DashboardHeader = ({ averageScore = 78, completedQuizzes = 23, onProfil }) => {
    const [isSearchExpanded, setIsSearchExpanded] = useState(false);
    const [isIslandExpanded, setIsIslandExpanded] = useState(false);

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
            width: withTiming(isHiding ? 0 : 215, config),

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
                { translateX: withTiming(hide ? 20 : 0, config) }
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
            <Animated.View style={[leftContainerStyle, { zIndex: 2 }]}>
                <StatisticIsland
                    averageScore={averageScore}
                    completedQuizzes={completedQuizzes}
                    isExpanded={isIslandExpanded}
                    onToggle={toggleIsland}
                />
            </Animated.View>

            <Animated.View style={spacerStyle} />

            <Animated.View style={searchWrapperStyle}>
                <SearchIcon isExpanded={isSearchExpanded} onToggle={toggleSearch} />
            </Animated.View>

            <Animated.View style={[profileStyle, {
                alignItems: 'flex-start', // ✅ 关键：确保收缩时内容保持居中，不被单侧切掉
                justifyContent: 'center' }]}>
                <View style={{ width: 56, alignItems: 'center' }}>
                    <ProfilIcon onPress={onProfil}/>
                </View>r
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
    }
});