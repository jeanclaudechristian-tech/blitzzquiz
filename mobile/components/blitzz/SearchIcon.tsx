import React, { useRef, useState, useEffect } from 'react';
import { StyleSheet, TextInput, Pressable, View, Keyboard, BackHandler, Text } from 'react-native';
import Animated, {
    useAnimatedStyle,
    FadeIn,
    FadeOut,
} from 'react-native-reanimated';
import LottieView from 'lottie-react-native';
import { colors, fonts } from './tokens'; // 确保路径正确

interface SearchIconProps {
    isExpanded: boolean;
    onToggle: (expanded: boolean) => void;
}

export const SearchIcon = ({ isExpanded, onToggle }: SearchIconProps) => {
    const inputRef = useRef<TextInput>(null);
    const lottieRef = useRef<LottieView>(null);
    const [searchText, setSearchText] = useState('');

    // 监听安卓物理返回键
    useEffect(() => {
        const backAction = () => {
            if (isExpanded) {
                handleClose();
                return true;
            }
            return false;
        };
        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
        return () => backHandler.remove();
    }, [isExpanded]);

    const handlePress = () => {
        if (!isExpanded) {
            onToggle(true);
            lottieRef.current?.play();
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    };

    const handleClose = () => {
        Keyboard.dismiss();
        setSearchText('');
        lottieRef.current?.reset();
        onToggle(false);
    };

    // 动态样式：只负责外层容器的宽度变化
    const containerStyle = useAnimatedStyle(() => {
        return {
            flex: isExpanded ? 1 : 0,
            width: isExpanded ? '100%' : 56,
        };
    }, [isExpanded]);

    return (
        // 1. 外层：Animated.View 负责变形
        <Animated.View style={[styles.container, containerStyle]}>

            {/* 2. 内层：普通的 Pressable 负责点击，填满父容器 */}
            <Pressable
                style={styles.innerButton}
                onPress={handlePress}
                disabled={isExpanded} // 展开后禁用点击，防止再次触发
            >
                {/* 图标区域 */}
                <View style={styles.iconArea}>
                    <LottieView
                        ref={lottieRef}
                        source={require('../../assets/animated/system-regular-42-search-hover-pinch.json')}
                        style={styles.lottie}
                        autoPlay={false}
                        loop={false}
                    />
                </View>

                {/* 输入框区域 */}
                {isExpanded && (
                    <Animated.View
                        entering={FadeIn.delay(100)}
                        exiting={FadeOut.duration(100)}
                        style={styles.inputWrapper}
                    >
                        <TextInput
                            ref={inputRef}
                            style={styles.input}
                            placeholder="Rechercher..."
                            placeholderTextColor={colors.secondaryText || '#999'}
                            value={searchText}
                            onChangeText={setSearchText}
                            returnKeyType="search"
                        />

                        <Pressable onPress={handleClose} hitSlop={10} style={styles.closeButton}>
                            <View style={styles.closeIconBg}>
                                <Text style={{color: '#666', fontWeight: 'bold'}}>×</Text>
                            </View>
                        </Pressable>
                    </Animated.View>
                )}
            </Pressable>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 56,
        backgroundColor: '#ffffff',
        borderRadius: 28,
        // 阴影放在最外层 View 上
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    innerButton: {
        flex: 1, // 填满 Animated.View
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconArea: {
        width: 56,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
    },
    lottie: {
        width: 32,
        height: 32,
    },
    inputWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        height: '100%',
        paddingRight: 15,
    },
    input: {
        flex: 1,
        height: '100%',
        fontFamily: fonts.inter || 'System',
        fontSize: 16,
        color: colors.dark || '#000',
        marginLeft: -5,
    },
    closeButton: {
        padding: 5,
    },
    closeIconBg: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#f0f0f0',
        alignItems: 'center',
        justifyContent: 'center'
    }
});