import React, {useState, useCallback, useEffect} from "react";
import { View, Text, StyleSheet, ScrollView, Alert } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import Animated, { Layout, SlideInUp, SlideOutDown } from "react-native-reanimated";
import * as WebBrowser from 'expo-web-browser'; // 1. 引入浏览器支持
import * as Google from 'expo-auth-session/providers/google'; // 2. 引入 Google 验证
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

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
    const router = useRouter();
    // 1. 获取登录方法
    const { login, googleLogin } = useAuth();

    const [request, response, promptAsync] = Google.useAuthRequest({
        androidClientId: "532138498181-14l35enq3ifpe2log0qevjfusipklovj.apps.googleusercontent.com",
        iosClientId: "rtushc0olk7vp3m15b8go1htdf0netre.apps.googleusercontent.com",
        webClientId: "532138498181-val9blpnrt3ns8r7jimn87s7f18eupvg.apps.googleusercontent.com",
    });
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

    useEffect(() => {
        if (response?.type === 'success') {
            const { authentication } = response;
            if (authentication?.accessToken) {
                // 拿到 Token 了！交给 AuthContext 去找后端换用户信息
                handleBackendGoogleLogin(authentication.accessToken);
            }
        } else if (response?.type === 'error') {
            Alert.alert("Erreur", "Google Login Failed");
        }
    }, [response]);

    const handleBackendGoogleLogin = async (token: string) => {
        setIsLoggingIn(true); // 复用一下 loading 状态或者单独定义
        try {
            await googleLogin(token);
            // 成功后 AuthContext 会处理跳转，这里不用管
        } catch (e) {
            setIsLoggingIn(false);
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
            // 失败只停止转圈，AuthContext 已经弹窗提示错误了
            setIsLoggingIn(false);
        }
    };

    // Google 登录模拟 (后续可接 SDK)
    const handleGoogleLogin = () => {
        setIsLoggingInGoogle(true);
        setTimeout(() => {
            setIsLoggingInGoogle(false);
            handleNav("/auth/EducationLevelScreen");
        }, 1500);
    };

    // Apple 登录模拟
    const handleAppleLogin = () => {
        setIsLoggingInApple(true);
        setTimeout(() => {
            setIsLoggingInApple(false);
            handleNav("/auth/EducationLevelScreen");
        }, 1500);
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
                                        placeholder="Nom d’utilisateur" // 这里建议改成 Courriel
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
                                    entering={SlideInUp.delay(150).springify()}
                                    exiting={SlideOutDown.delay(50).duration(500)}
                                >
                                    <DarkButton
                                        label="Inscription avec Apple"
                                        icon={<AppleIcon />}
                                        onPress={handleAppleLogin}
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
                                        // 这里的 disabled 是防止重复点击
                                        onPress={() => !request ? null : promptAsync()}
                                        isLoading={false} // Google 自己的 SDK 会处理状态
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