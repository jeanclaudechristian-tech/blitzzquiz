import React, {useState, useCallback, useEffect} from "react";
import { View, Text, StyleSheet, ScrollView, Alert } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import Animated, { Layout, SlideInUp, SlideOutDown } from "react-native-reanimated";
import * as WebBrowser from 'expo-web-browser'; // 1. 引入浏览器支持
// 引入 AuthContext
import { useAuth } from "../../services/AuthContext";
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
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

GoogleSignin.configure({
    webClientId: "851398001859-dad9lrj36rlh23pvknltls5mmgolh90t.apps.googleusercontent.com",
    iosClientId: "851398001859-vtiht025g0u89bsfh1jasok9f15nuu9u.apps.googleusercontent.com",
    scopes: ['profile', 'email', 'openid'],
});

export default function LoginScreen() {
    const router = useRouter();
    // 1. 获取登录方法
    const { login, googleLogin, resendVerification } = useAuth();

    // 2. 定义输入框状态
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [isVisible, setIsVisible] = useState(true);
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [isLoggingInGoogle, setIsLoggingInGoogle] = useState(false);
    const [isLoggingInApple, setIsLoggingInApple] = useState(false);

    // 每次页面获得焦点时重置可见性 (保证返回时有动画)
    useFocusEffect(
        useCallback(() => {
            setIsVisible(true);
        }, [])
    );

    const handleBackendGoogleLogin = async (token: string) => {
        setIsLoggingInGoogle(true); // 👈 修改这里
        try {
            await googleLogin(token);
        } catch (e) {
            setIsLoggingInGoogle(false); // 👈 修改这里，报错时停掉 Google 的转圈
        }
    };

    // 3. 真实登录逻辑
    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert("Erreur", "Veuillez entrer votre courriel et mot de passe.");
            return;
        }

        setIsLoggingIn(true);
        try {
            // 调用 API，AuthContext 会处理成功后的跳转
            await login(email, password);
        } catch (e) {
            setIsLoggingIn(false);

            // @ts-ignore
            const errorResponse = e.response;

            if (errorResponse?.status === 403 && errorResponse?.data?.needs_verification) {
                try {
                    // 默默发送，不需要等它返回再跳转，提高流畅度 [cite: 1, 2026-03-15]
                    await resendVerification(email);
                } catch (resendError) {
                    console.log("自动重发神谕失败");
                }
                handleNav('/auth/EmailSentVerification');
                return;
            } else {
                // 这里可以加一个普通的报错提示，防止用户不知道发生了什么
                const msg = errorResponse?.data?.message || "Échec de la connexion.";
                Alert.alert("Erreur", msg);
            }
        }
    };

    const handleGoogleSignIn = async () => {
        console.log("🚀 战车启动：呼叫系统原生 Google 服务...");
        setIsLoggingInGoogle(true);
        try {
            // 1. 检查手机（愚者）是否安装了 Google Play 基础服务
            await GoogleSignin.hasPlayServices();

            // 2. 唤起丝滑的原生底部弹窗！
            const userInfo = await GoogleSignin.signIn();

            // 3. 拿到纯正的 idToken
            const idToken = userInfo.data?.idToken;

            if (idToken) {
                console.log("✅ 拿到原生 idToken，准备送往移动端神道...");
                // 调用你写好的后端对接方法
                await handleBackendGoogleLogin(idToken);
            } else {
                throw new Error("Google 未返回 idToken");
            }
        } catch (error: any) {
            if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                console.log("🚫 用户主动取消了登录弹窗");
            } else if (error.code === statusCodes.IN_PROGRESS) {
                console.log("⏳ 登录正在进行中...");
            } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                Alert.alert("Erreur", "Google Play Services non disponible sur cet appareil");
            } else {
                console.error("❌ 原生登录遭遇未知错误: ", error);
                Alert.alert("Erreur", "Échec de la connexion Google");
            }
        } finally {
            setIsLoggingInGoogle(false);
        }
    };


    const handleNav = (path: string) => {
        setIsVisible(false); // 触发掉落动画
        setTimeout(() => {
            router.push(path as any);
        }, 900);
    };

    return (
        <Animated.View style={{ flex: 1 }} layout={Layout.springify()}>
            <View style={styles.mainWrapper}>
                <ScrollView contentContainerStyle={styles.container}>
                    <View style={styles.headerSpacer} />

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
                                        placeholder="Courriel" // 这里建议改成 Courriel
                                        leftIcon={<IconSvg uri={assets.userIcon} width={24} height={24} />}
                                        // 绑定数据
                                        value={email}
                                        onChangeText={setEmail}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
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
                                        // 绑定数据
                                        value={password}
                                        onChangeText={setPassword}
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
                                        onPress={handleLogin} // 绑定点击事件
                                        isLoading={isLoggingIn} // 绑定加载状态
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
                                        // 注册不需要 Loading，直接跳转
                                        onPress={() => handleNav("/auth/RegisterScreen")}
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
                                        onPress={handleGoogleSignIn}
                                        // 💡 逻辑：只要 request 还没加载出来，或者正在登录中，就转圈
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