import React from "react";
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from "react-native";
import { useRouter } from "expo-router";
import { InputField } from "../../components/blitzz/InputField";
import { DarkButton } from "../../components/blitzz/DarkButton";
import { TextLink } from "../../components/blitzz/TextLink";
import { IconSvg } from "../../components/blitzz/IconSvg";
import { assets } from "../../components/blitzz/assets";
import { colors, fonts } from "../../components/blitzz/tokens";

export default function RegisterScreen() {
    const router = useRouter();

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.light }}>
            <ScrollView contentContainerStyle={styles.container}>

                {/* 顶部留白，保持与登录页高度一致 */}
                <View style={styles.headerSpacer} />

                {/* 标题区：修正行高防止重叠 */}
                <Text style={styles.title}>
                    Création{"\n"}du compte
                </Text>

                {/* 输入区：通过间距组件控制，不再使用 top 坐标 */}
                <View style={styles.formSection}>
                    <InputField
                        placeholder="Courriel (personnel ou scolaire)"
                        leftIcon={<IconSvg uri={assets.emailIcon} width={24} height={24} />}
                    />
                    <View style={styles.spacer} />
                    <InputField
                        placeholder="Nom d’utilisateur"
                        leftIcon={<IconSvg uri={assets.userIcon} width={24} height={24} />}
                    />
                    <View style={styles.spacer} />
                    <InputField
                        placeholder="Mot de passe"
                        secureTextEntry
                        leftIcon={<IconSvg uri={assets.passwordIcon} width={24} height={24} />}
                        rightIcon={<IconSvg uri={assets.eyeIcon} width={24} height={24} />}
                    />
                    <View style={styles.spacer} />
                    <InputField
                        placeholder="Confirmer mot de passe"
                        secureTextEntry
                        leftIcon={<IconSvg uri={assets.checkIcon} width={16} height={16} />}
                    />
                </View>

                {/* 按钮与返回区 */}
                <View style={styles.buttonSection}>
                    <View style={styles.backLink}>
                        <TextLink label="Retour" />
                    </View>
                    <DarkButton label="Confirmer" />
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        paddingHorizontal: 36, // 统一的侧边距
        paddingBottom: 40,
    },
    headerSpacer: {
        height: 80, // 与 LoginScreen 保持一致
    },
    title: {
        fontFamily: fonts.inter,
        fontWeight: "600",
        fontSize: 42,
        lineHeight: 50, // 修正行高
        color: colors.dark,
    },
    formSection: {
        marginTop: 40,
    },
    spacer: {
        height: 15,
    },
    buttonSection: {
        flex: 1,
        justifyContent: "flex-end", // 将按钮推到底部
        marginTop: 40,
    },
    backLink: {
        alignItems: "center",
        marginBottom: 20,
    },
});