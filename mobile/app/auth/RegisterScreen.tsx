import React, {useState, useEffect, useCallback} from "react";
import {View, Text, StyleSheet, ScrollView, Platform} from "react-native";
import {useRouter, useNavigation, Stack, useFocusEffect} from "expo-router"; // 引入 useNavigation 和 Stack
import { InputField } from "../../components/blitzz/InputField";
import { DarkButton } from "../../components/blitzz/DarkButton";
import { TextLink } from "../../components/blitzz/TextLink";
import { IconSvg } from "../../components/blitzz/IconSvg";
import { assets } from "../../components/blitzz/assets";
import { colors, fonts } from "../../components/blitzz/tokens";
// 继续沿用 NB 的掉落动画
import Animated, {Layout, SlideInUp, SlideOutDown} from "react-native-reanimated";

export default function RegisterScreen() {
    const router = useRouter();
    const navigation = useNavigation(); // 获取导航对象
    const [isVisible, setIsVisible] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useFocusEffect(
        useCallback(() => {
            // 使用 requestAnimationFrame 确保在下一帧执行，避免动画冲突
            const task = requestAnimationFrame(() => {
                setIsVisible(true);
            });
            return () => cancelAnimationFrame(task);
        }, [])
    );

    // 1. 核心拦截器：同时搞定 安卓物理返回键 和 iOS 点击返回
    useEffect(() => {
        const unsubscribe = navigation.addListener('beforeRemove', (e) => {
            // 如果动画正在播放（isVisible 为 false），直接放行
            if (!isVisible) {
                return;
            }

            // A. 拦截：阻止立即销毁
            e.preventDefault();

            // B. 动画：触发组件“掉落地狱” (SlideOutDown)
            setIsVisible(false);

            // C. 放行：等待 600ms 动画播完，再执行返回
            setTimeout(() => {
                navigation.dispatch(e.data.action);
            }, 900);
        });

        return unsubscribe;
    }, [navigation, isVisible]);

    // 2. 按钮处理逻辑
    const handleNav = (action: 'back' | 'confirm') => {
        if (action === 'back') {
            // 直接调用 back，会被上面的 beforeRemove 拦截并自动播放动画
            router.back();
        } else {
            // "确认"按钮通常是提交表单或去下一步
            // 这里演示手动触发离场动画
            setIsVisible(false);
            setTimeout(() => {
                console.log("Submit Form");
                router.push("/auth/EducationLevelScreen" as any);
            }, 900);
        }
    };

    return (
        <Animated.View style={{ flex: 1 }} layout={Layout.springify()}>
            {/* 关键：禁用手势，确保所有返回行为都经过我们的拦截器 */}
            <Stack.Screen options={{ gestureEnabled: false }} />

            <View style={styles.mainWrapper}>
                <ScrollView contentContainerStyle={styles.container}>
                    <View style={styles.headerSpacer} />

                    {/* 只有 isVisible 为 true 时才渲染 */}
                    {isVisible && (
                        <>
                            {/* 1. 标题 */}
                            <Animated.View
                                entering={SlideInUp.delay(700).duration(600).springify()}
                                exiting={SlideOutDown.delay(400).duration(500)}
                            >
                                <Text style={styles.title}>
                                    Création{"\n"}du compte
                                </Text>
                            </Animated.View>

                            <View style={styles.formSection}>
                                {/* 2. 输入框组：依次掉落 */}
                                <Animated.View
                                    entering={SlideInUp.delay(600).springify()}
                                    exiting={SlideOutDown.delay(350).duration(500)}
                                >
                                    <InputField
                                        placeholder="Courriel (personnel ou scolaire)"
                                        leftIcon={<IconSvg uri={assets.emailIcon} width={24} height={24} />}
                                    />
                                </Animated.View>

                                <View style={styles.spacer} />

                                <Animated.View
                                    entering={SlideInUp.delay(500).springify()}
                                    exiting={SlideOutDown.delay(300).duration(500)}
                                >
                                    <InputField
                                        placeholder="Nom d’utilisateur"
                                        leftIcon={<IconSvg uri={assets.userIcon} width={24} height={24} />}
                                    />
                                </Animated.View>

                                <View style={styles.spacer} />

                                <Animated.View
                                    entering={SlideInUp.delay(400).springify()}
                                    exiting={SlideOutDown.delay(250).duration(500)}
                                >
                                    <InputField
                                        placeholder="Mot de passe"
                                        secureTextEntry
                                        leftIcon={<IconSvg uri={assets.passwordIcon} width={24} height={24} />}
                                        rightIcon={<IconSvg uri={assets.eyeIcon} width={24} height={24} />}
                                    />
                                </Animated.View>

                                <View style={styles.spacer} />

                                <Animated.View
                                    entering={SlideInUp.delay(300).springify()}
                                    exiting={SlideOutDown.delay(200).duration(500)}
                                >
                                    <InputField
                                        placeholder="Confirmer mot de passe"
                                        secureTextEntry
                                        leftIcon={<IconSvg uri={assets.checkIcon} width={16} height={16} />}
                                    />
                                </Animated.View>
                            </View>

                            {/* 3. 底部按钮组 */}
                            <View style={styles.buttonSection}>
                                {/* iOS 专属返回按钮 */}
                                {Platform.OS === 'ios' && (
                                    <Animated.View
                                        entering={SlideInUp.delay(200).springify()}
                                        exiting={SlideOutDown.delay(150).duration(500)}
                                    >
                                        <View style={styles.backLink}>
                                            <TextLink label="Retour" onPress={() => handleNav('back')} />
                                        </View>
                                    </Animated.View>
                                )}

                                <Animated.View
                                    entering={SlideInUp.delay(100).springify()}
                                    exiting={SlideOutDown.delay(100).duration(500)}
                                >
                                    <DarkButton label="Confirmer" onPress={() => handleNav('confirm')} isLoading={isSubmitting} />
                                </Animated.View>
                            </View>
                        </>
                    )}
                </ScrollView>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    mainWrapper: {
        flex: 1,
        backgroundColor: colors.light,
    },
    container: {
        flexGrow: 1,
        paddingHorizontal: 36,
        paddingBottom: 40,
        backgroundColor: colors.light,
    },
    headerSpacer: { height: 80 },
    title: {
        fontFamily: fonts.inter,
        fontWeight: "600",
        fontSize: 42,
        lineHeight: 50,
        color: colors.dark,
    },
    formSection: { marginTop: 40 },
    spacer: { height: 15 },
    buttonSection: {
        flex: 1,
        justifyContent: "flex-end",
        marginTop: 40,
    },
    backLink: {
        alignItems: "center",
        marginBottom: 20,
    },
});