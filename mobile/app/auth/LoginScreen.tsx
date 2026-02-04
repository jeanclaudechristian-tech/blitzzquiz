import React, { useState, useCallback } from "react"; // 引入 useCallback
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useRouter, useFocusEffect } from "expo-router"; // 关键：引入 useFocusEffect
import Animated, { Layout, SlideInUp, SlideOutDown } from "react-native-reanimated";
import { InputField } from "../../components/blitzz/InputField";
import { PrimaryButton } from "../../components/blitzz/PrimaryButton";
import { DarkButton } from "../../components/blitzz/DarkButton";
import { Divider } from "../../components/blitzz/Divider";
import { TextLink } from "../../components/blitzz/TextLink";
import { AppleIcon } from "../../components/blitzz/AppleIcon";
import { GoogleIcon } from "../../components/blitzz/GoogleIcon";
import { IconSvg } from "../../components/blitzz/IconSvg";
import { assets } from "../../components/blitzz/assets";
import { colors, fonts } from "../../components/blitzz/tokens";

export default function LoginScreen() {
    const router = useRouter();
    const [isVisible, setIsVisible] = useState(true);
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [isLoggingInGoogle, setIsLoggingInGoogle] = useState(false);
    const [isLoggingInApple, setIsLoggingInApple] = useState(false);

    const handleLogin = () => {
        // A. 开始加载（转圈）
        setIsLoggingIn(true);

        // B. 模拟 API 请求
        setTimeout(() => {
            // C. 请求结束，停止转圈
            setIsLoggingIn(false);

            // D. 关键修正：这里不要直接 router.push，而是调用 handleNav
            // 这样才能触发 setIsVisible(false) 让页面掉下去！
            handleNav("/auth/RegisterScreen");

        }, 2000); // 模拟 1.5秒延迟
    };

    // Google
    const handleGoogleLogin = () => {
        setIsLoggingInGoogle(true);
        setTimeout(() => {
            setIsLoggingInGoogle(false);
            handleNav("/auth/EducationLevelScreen");
        }, 1500);
    };

    // Apple
    const handleAppleLogin = () => {
        setIsLoggingInApple(true);
        setTimeout(() => {
            setIsLoggingInApple(false);
            handleNav("/auth/EducationLevelScreen");
        }, 1500);
    };

    // 核心修复：每次页面“获得焦点”（从别的页面回来）时，重置为可见
    useFocusEffect(
        useCallback(() => {
            setIsVisible(true);

            // 可选：return 一个清理函数，在失去焦点时做点什么
            // 这里我们不需要，因为 handleNav 已经处理了离场逻辑
        }, [])
    );

    const handleNav = (path: string) => {
        setIsVisible(false); // 触发掉落退出
        setTimeout(() => {
            router.push(path as any);
        }, 900);
    };

    return (
        <Animated.View
            style={{ flex: 1 }}
            layout={Layout.springify()}
        >
            <View style={styles.mainWrapper}>
                <ScrollView contentContainerStyle={styles.container}>
                    <View style={styles.headerSpacer} />

                    {/* 只有 isVisible 为 true 时才渲染 */}
                    {isVisible && (
                        <>
                            <Animated.View
                                entering={SlideInUp.delay(750).duration(600).springify()}
                                exiting={SlideOutDown.delay(400).duration(500)}
                            >
                                <Text style={styles.title}>
                                    Se connecter{"\n"}à mon compte
                                </Text>
                            </Animated.View>

                            <View style={styles.formSection}>
                                <Animated.View
                                    entering={SlideInUp.delay(700).springify()}
                                    exiting={SlideOutDown.delay(350).duration(500)}
                                >
                                    <InputField
                                        placeholder="Nom d’utilisateur"
                                        leftIcon={<IconSvg uri={assets.userIcon} width={24} height={24} />}
                                    />
                                </Animated.View>

                                <View style={{ height: 15 }} />

                                <Animated.View
                                    entering={SlideInUp.delay(600).springify()}
                                    exiting={SlideOutDown.delay(300).duration(500)}
                                >
                                    <InputField
                                        placeholder="Mot de passe"
                                        secureTextEntry
                                        leftIcon={<IconSvg uri={assets.passwordIcon} width={24} height={24} />}
                                        rightIcon={<IconSvg uri={assets.eyeIcon} width={24} height={24} />}
                                    />
                                </Animated.View>

                                <Animated.View
                                    entering={SlideInUp.delay(550).springify()}
                                    exiting={SlideOutDown.delay(250).duration(500)}
                                    style={styles.forgot}
                                >
                                    <TextLink
                                        label="Mot de passe oublié ?"
                                        onPress={() => handleNav("/auth/ForgotPasswordEmail")}
                                    />
                                </Animated.View>
                            </View>

                            <View style={styles.buttonSection}>
                                <Animated.View
                                    entering={SlideInUp.delay(450).springify()}
                                    exiting={SlideOutDown.delay(200).duration(500)}
                                >
                                    <PrimaryButton
                                        label="Connexion"
                                        onPress={() => handleNav("/(tabs)")}
                                    />
                                </Animated.View>

                                <Animated.View
                                    entering={SlideInUp.delay(350).springify()}
                                    style={styles.dividerBox}
                                    exiting={SlideOutDown.delay(150).duration(500)}
                                >
                                    <Divider />
                                </Animated.View>

                                <Animated.View
                                    entering={SlideInUp.delay(250).springify()}
                                    exiting={SlideOutDown.delay(100).duration(500)}
                                >
                                    <DarkButton
                                        label="Créer un compte"
                                        onPress={handleLogin}
                                        isLoading={isLoggingIn}
                                    />
                                </Animated.View>

                                <View style={{ height: 10 }} />

                                <Animated.View
                                    entering={SlideInUp.delay(150).springify()}
                                    exiting={SlideOutDown.delay(50).duration(500)}
                                >
                                    <DarkButton
                                        label="Inscription avec Apple"
                                        icon={<AppleIcon />}
                                        onPress={() => handleAppleLogin()}
                                        isLoading={isLoggingInApple}
                                    />
                                </Animated.View>

                                <View style={{ height: 10 }} />

                                <Animated.View
                                    entering={SlideInUp.delay(50).springify()}
                                    exiting={SlideOutDown.delay(0).duration(500)}
                                >
                                    <DarkButton
                                        label="Inscription with Google"
                                        icon={<GoogleIcon />}
                                        onPress={() => handleGoogleLogin()}
                                        isLoading={isLoggingInGoogle}
                                    />
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
        marginTop: 40,
    },
    formSection: { marginTop: 50 },
    forgot: { alignItems: "flex-end", marginTop: 10 },
    buttonSection: { marginTop: 30 },
    dividerBox: { alignItems: "center", marginVertical: 25 },
});