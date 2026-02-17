import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withSequence,
    FadeIn
} from 'react-native-reanimated';
import { colors } from './tokens'; //

export const LoadingScreen = () => {
    const scale = useSharedValue(1);
    const opacity = useSharedValue(0.3);

    useEffect(() => {
        // 模拟呼吸动画：在 1.2 倍和 0.8 倍之间循环
        scale.value = withRepeat(withTiming(1.2, { duration: 1000 }), -1, true);
        opacity.value = withRepeat(withTiming(0.8, { duration: 1000 }), -1, true);
    }, []);

    const animatedCircle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
    }));

    return (
        <Animated.View entering={FadeIn} style={styles.container}>
            {/* 中心圆环：呼吸灯效果 */}
            <Animated.View style={[styles.outerCircle, animatedCircle]} />
            <View style={styles.innerCore} />
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.light,
    },
    outerCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        borderWidth: 2,
        borderColor: colors.dark, //
        position: 'absolute',
    },
    innerCore: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: colors.dark, //
    },
});