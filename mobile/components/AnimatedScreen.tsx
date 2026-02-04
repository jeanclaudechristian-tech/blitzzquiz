import React from 'react';
import Animated, {
    SlideOutDown,
    SlideInDown,
    Layout
} from 'react-native-reanimated';
import { StyleSheet } from 'react-native';

export const AnimatedScreen = ({ children }: { children: React.ReactNode }) => {
    return (
        <Animated.View
            style={{ flex: 1 }}
            // 进入动画：从上方掉落
            entering={SlideInDown.duration(600).springify()}
            // 退出动画：自由落体掉出屏幕
            exiting={SlideOutDown.duration(600)}
            // 布局变动平滑过渡
            layout={Layout.springify()}
        >
            {children}
        </Animated.View>
    );
};