import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Line } from "react-native-svg";
// @ts-ignore
import Animated, {
    useSharedValue,
    useAnimatedProps,
    withTiming,
    Easing,
    Extrapolation,
    interpolate,
} from "react-native-reanimated";
import { colors } from "./tokens"; // 引入主题颜色

// 1. 创建可以被 Reanimated 动画化的 SVG Line 组件
const AnimatedLine = Animated.createAnimatedComponent(Line);

type Props = {
    isActive: boolean; // true 表示需要画杠（显示密码），false 表示不需要（隐藏密码）
    size?: number;     // 图标尺寸，默认 24
    color?: string;    // 图标颜色
    baseIcon: React.ReactNode; // 底部的眼睛图标
};

export function AnimatedSlashEye({
                                     isActive,
                                     size = 24,
                                     baseIcon,
                                 }: Props) {
    // 动画进度值：0 = 没有杠，1 = 杠完全画出
    const progress = useSharedValue(isActive ? 1 : 0);

    // 监听 isActive 状态变化，触发动画
    useEffect(() => {
        progress.value = withTiming(isActive ? 1 : 0, {
            duration: 300, // 动画时长 300ms
            easing: Easing.bezier(0.4, 0.0, 0.2, 1), // 顺滑的贝塞尔曲线
        });
    }, [isActive]);

    // 计算斜线的长度。对于 24x24 的图标，对角线约为 34。
    // 我们稍微缩进一点，让线段大约长 28 左右。
    const lineLength = size * 1.2;

    // 2. 定义动画属性
    const animatedProps = useAnimatedProps(() => {
        // 核心原理：通过插值改变 strokeDashoffset
        // progress 为 0 时，offset 为 lineLength (线被完全推出去，不可见)
        // progress 为 1 时，offset 为 0 (线完全滑入，可见)
        const offset = interpolate(
            progress.value,
            [0, 1],
            [lineLength, 0],
            Extrapolation.CLAMP
        );

        return {
            strokeDashoffset: offset,
        };
    });

    // 计算线条的起始和结束坐标（稍微留点边距，不要顶角）
    const padding = size * 0.15; // 大约 3.6px
    const start = padding;
    const end = size - padding;

    return (
        <View style={{ width: size, height: size, justifyContent:'center', alignItems:'center' }}>
            {/* 底层：原始的眼睛图标 */}
            {baseIcon}

            {/* 顶层：绝对定位的 SVG，用于画杠 */}
            <Svg
                width={size}
                height={size}
                style={StyleSheet.absoluteFill} // 绝对定位覆盖在眼睛上
                viewBox={`0 0 ${size} ${size}`}
            >
                <AnimatedLine
                    y1={start} x1={start} // 左上
                    y2={end} x2={end}     // 右下
                    stroke={colors.secondaryText}        // 线条颜色
                    strokeWidth="2"       // 线条宽度
                    strokeLinecap="round" // 圆角端点，看起来更柔和
                    // 核心魔法：设置虚线阵列为 [实心长度, 空白长度]
                    strokeDasharray={`${lineLength} ${lineLength}`}
                    // 绑定动画属性
                    animatedProps={animatedProps}
                />
            </Svg>
        </View>
    );
}