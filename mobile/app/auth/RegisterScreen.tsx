import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, Alert } from "react-native";
import { useRouter, useNavigation, useFocusEffect, Stack } from "expo-router";
import { InputField } from "../../components/blitzz/InputField";
import { DarkButton } from "../../components/blitzz/DarkButton";
import { TextLink } from "../../components/blitzz/TextLink";
import { IconSvg } from "../../components/blitzz/IconSvg";
import { assets } from "../../components/blitzz/assets";
import { colors, fonts } from "../../components/blitzz/tokens";
import Animated, { Layout, SlideInDown, SlideOutUp } from "react-native-reanimated";
// 引入 AuthContext
import { useAuth } from "../../services/AuthContext";

export default function RegisterScreen() {
    const router = useRouter();
    const navigation = useNavigation();
    const [nickname, setNickname] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [isVisible, setIsVisible] = useState(true);

    // 复活机制：页面获得焦点时重置可见性
    useFocusEffect(
        useCallback(() => {
            const task = requestAnimationFrame(() => {
                setIsVisible(true);
            });
            return () => cancelAnimationFrame(task);
        }, [])
    );

    // 拦截返回手势
    React.useEffect(() => {
        const unsubscribe = navigation.addListener('beforeRemove', (e) => {
            if (!isVisible) return;
            e.preventDefault();
            setIsVisible(false);
            setTimeout(() => {
                navigation.dispatch(e.data.action);
            }, 600);
        });
        return unsubscribe;
    }, [navigation, isVisible]);

    const handleNextStep = () => {
        if (!nickname || !email || !password) {
            Alert.alert("Erreur", "Veuillez remplir tous les champs.");
            return;
        }

        // 1. 手动触发离场动画 (让 isVisible 变 false)
        setIsVisible(false);

        // 2. 等待动画播放完毕 (600ms 与你的 duration 一致)
        setTimeout(() => {
            router.push({
                pathname: "/auth/EducationLevelScreen",
                params: { nickname, email, password }
            });
        }, 600);
    };

    const handleNav = (action: 'back' | 'confirm') => {
        if (action === 'back') {
            router.back(); // 触发上面 useEffect 里的拦截动画
        } else {
            // 点击 Confirm 执行注册
            handleNextStep();
        }
    };

    return (
        <Animated.View style={{ flex: 1 }} layout={Layout.springify()}>
            <Stack.Screen options={{ gestureEnabled: false }} />

            <View style={styles.mainWrapper}>
                <ScrollView contentContainerStyle={styles.container} bounces={false}>
                    <View style={styles.headerSpacer} />

                    {isVisible && (
                        <>
                            <Animated.View
                                entering={SlideInDown.delay(100).duration(600).springify()}
                                exiting={SlideOutUp.duration(500)}
                            >
                                <Text style={styles.title}>
                                    Création{"\n"}du compte
                                </Text>
                            </Animated.View>

                            <View style={styles.formSection}>
                                <Animated.View
                                    entering={SlideInDown.delay(150).springify()}
                                    exiting={SlideOutUp.delay(25).duration(500)}
                                >
                                    <InputField
                                        placeholder="Nom d'utilisateur"
                                        leftIcon={<IconSvg uri={assets.userIcon} width={24} height={24} />}
                                        // 绑定昵称
                                        value={nickname}
                                        onChangeText={setNickname}
                                    />
                                </Animated.View>

                                <View style={{ height: 15 }} />

                                <Animated.View
                                    entering={SlideInDown.delay(200).springify()}
                                    exiting={SlideOutUp.delay(50).duration(500)}
                                >
                                    <InputField
                                        placeholder="Courriel (personnel ou scolaire)"
                                        leftIcon={<IconSvg uri={assets.emailIcon} width={24} height={24} />}
                                        // 绑定邮箱
                                        value={email}
                                        onChangeText={setEmail}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                    />
                                </Animated.View>

                                <View style={{ height: 15 }} />

                                <Animated.View
                                    entering={SlideInDown.delay(250).springify()}
                                    exiting={SlideOutUp.delay(75).duration(500)}
                                >
                                    <InputField
                                        placeholder="Mot de passe"
                                        secureTextEntry
                                        leftIcon={<IconSvg uri={assets.passwordIcon} width={24} height={24} />}
                                        rightIcon={<IconSvg uri={assets.eyeIcon} width={24} height={24} />}
                                        // 绑定密码
                                        value={password}
                                        onChangeText={setPassword}
                                    />
                                </Animated.View>
                            </View>

                            <View style={styles.buttonSection}>
                                <Animated.View
                                    entering={SlideInDown.delay(600).springify()}
                                    exiting={SlideOutUp.delay(250).duration(500)}
                                >
                                    <View style={styles.backLink}>
                                        <TextLink label="Retour" onPress={() => handleNav('back')} />
                                    </View>
                                </Animated.View>

                                <Animated.View
                                    entering={SlideInDown.delay(700).springify()}
                                    exiting={SlideOutUp.delay(300).duration(500)}
                                >
                                    <DarkButton
                                        label="Suivant"
                                        onPress={() => handleNav('confirm')}
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
    },
    headerSpacer: { height: 80 },
    title: {
        fontFamily: fonts.inter,
        fontWeight: "600",
        fontSize: 42,
        lineHeight: 50,
        color: colors.dark,
    },
    formSection: { marginTop: 60 },
    buttonSection: {
        flex: 1,
        justifyContent: "flex-end",
        marginTop: 40,
    },
    backLink: {
        alignItems: 'center',
        marginBottom: 20
    }
});