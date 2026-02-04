import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router"; // 必须添加路由
import { LogoMinBlitzz } from "../../components/blitzz/LogoMinBlitzz";
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

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.headerSpacer} />

            <Text style={styles.title}>
                Se connecter{"\n"}à mon compte
            </Text>

            <View style={styles.formSection}>
                <InputField
                    placeholder="Nom d’utilisateur"
                    leftIcon={<IconSvg uri={assets.userIcon} width={24} height={24} />}
                />
                <View style={{ height: 15 }} />
                <InputField
                    placeholder="Mot de passe"
                    secureTextEntry
                    leftIcon={<IconSvg uri={assets.passwordIcon} width={24} height={24} />}
                    rightIcon={<IconSvg uri={assets.eyeIcon} width={24} height={24} />}
                />
                <View style={styles.forgot}>
                    <TextLink
                        label="Mot de passe oublié ?"
                        onPress={() => router.push("/auth/ForgotPasswordEmail")}
                    />
                </View>
            </View>

            <View style={styles.buttonSection}>
                {/* 登录成功前往主页 */}
                <PrimaryButton
                    label="Connexion"
                    // onPress={() => router.push("/(tabs)")}
                />

                <View style={styles.dividerBox}>
                    <Divider />
                </View>

                {/* 前往注册页 */}
                <DarkButton
                    label="Créer un compte"
                    onPress={() => router.push("/auth/RegisterScreen")}
                />

                <View style={{ height: 10 }} />

                {/* Apple/Google 登录前往第三方验证页 */}
                <DarkButton
                    label="Inscription avec Apple"
                    icon={<AppleIcon />}
                    onPress={() => router.push("/auth/SocialAuthVerifyScreen")}
                />

                <View style={{ height: 10 }} />

                <DarkButton
                    label="Inscription avec Google"
                    icon={<GoogleIcon />}
                    onPress={() => router.push("/auth/SocialAuthVerifyScreen")}
                />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: colors.light,
        paddingHorizontal: 36,
        paddingBottom: 40,
    },
    logoSection: {
        alignItems: "center",
        marginTop: 66,
    },
    headerSpacer: {
        height: 80, // 这里控制顶部留白的高度，你可以根据感觉调整
    },
    title: {
        fontFamily: fonts.inter,
        fontWeight: "600",
        fontSize: 42,
        lineHeight: 50, // 修正原有的 22.26，否则文字会重叠
        color: colors.dark,
        marginTop: 40,
    },
    formSection: {
        marginTop: 50,
    },
    forgot: {
        alignItems: "flex-end",
        marginTop: 10,
    },
    buttonSection: {
        marginTop: 30,
    },
    dividerBox: {
        alignItems: "center",
        marginVertical: 25,
    },
});