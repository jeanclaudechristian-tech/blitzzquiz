import React from "react";
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from "react-native";
import { InputField } from "../../components/blitzz/InputField";
import { DarkButton } from "../../components/blitzz/DarkButton";
import { IconSvg } from "../../components/blitzz/IconSvg";
import { assets } from "../../components/blitzz/assets";
import { colors, fonts } from "../../components/blitzz/tokens";

export default function ForgotPasswordEmail() {
  return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.light }}>
        <ScrollView contentContainerStyle={styles.container}>

          {/* 顶部留白，保持与登录页高度一致 */}
          <View style={styles.headerSpacer} />

          {/* 标题区：修正行高防止重叠 */}
          <Text style={styles.title}>
            Quel est{"\n"}votre{"\n"}courriel ?
          </Text>

          {/* 输入区 */}
          <View style={styles.formSection}>
            <InputField
                placeholder="Courriel"
                leftIcon={<IconSvg uri={assets.emailIcon} width={24} height={24} />}
            />
          </View>

          {/* 按钮区：利用 flex 推到底部或保持间距 */}
          <View style={styles.buttonSection}>
            <DarkButton label="Suivant" />
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
    marginTop: 60, // 标题下方的间距
  },
  buttonSection: {
    flex: 1,
    justifyContent: "flex-end", // 内容不满一屏时自动推到底部
    marginTop: 30,
  },
});