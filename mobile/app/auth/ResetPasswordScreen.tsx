import React from "react";
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from "react-native";
import { InputField } from "../../components/blitzz/InputField";
import { DarkButton } from "../../components/blitzz/DarkButton";
import { IconSvg } from "../../components/blitzz/IconSvg";
import { assets } from "../../components/blitzz/assets";
import { colors, fonts } from "../../components/blitzz/tokens";

export default function ResetPasswordScreen() {
  return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.light }}>
        <ScrollView contentContainerStyle={styles.container}>

          {/* 顶部留白，保持全应用视觉统一 */}
          <View style={styles.headerSpacer} />

          {/* 标题区：修正行高防止文字重叠 */}
          <Text style={styles.title}>
            Changer{"\n"}votre{"\n"}mot de passe
          </Text>

          {/* 输入区：使用间距组件代替固定 top 坐标 */}
          <View style={styles.formSection}>
            <InputField
                placeholder="Nouveau mot de passe"
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

          {/* 确认按钮区 */}
          <View style={styles.buttonSection}>
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
    height: 80, // 与其他重构页面保持高度一致
  },
  title: {
    fontFamily: fonts.inter,
    fontWeight: "600",
    fontSize: 42,
    lineHeight: 50, // 修正原有的 22.26，防止文字堆叠
    color: colors.dark,
  },
  formSection: {
    marginTop: 60,
  },
  spacer: {
    height: 15,
  },
  buttonSection: {
    flex: 1,
    justifyContent: "flex-end", // 将确认按钮自然推向底部
    marginTop: 40,
  },
});