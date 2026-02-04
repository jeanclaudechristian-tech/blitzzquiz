import React from "react";
import { View, Text, StyleSheet, SafeAreaView } from "react-native";
import { IconSvg } from "../../components/blitzz/IconSvg";
import { assets } from "../../components/blitzz/assets";
import { colors, fonts } from "../../components/blitzz/tokens";

export default function EmailSentVerification() {
  return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.light }}>
        <View style={styles.container}>

          {/* 顶部留白，保持与登录/学历页高度一致 */}
          <View style={styles.headerSpacer} />

          {/* 标题区：修复了过低的 lineHeight 导致的文字重叠 */}
          <Text style={styles.title}>
            Valider{"\n"}l’opération{"\n"}à partir{"\n"}de votre courriel
          </Text>

          {/* 信封图标区：完全居中布局 */}
          <View style={styles.iconContainer}>
            <IconSvg uri={assets.envelopeIcon} width={143} height={143} />
          </View>

        </View>
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 36, // 统一的侧边距
  },
  headerSpacer: {
    height: 80, // 与其他页面对齐的顶部留白
  },
  title: {
    fontFamily: fonts.inter,
    fontWeight: "600",
    fontSize: 42,
    lineHeight: 50, // 修正行高
    color: colors.dark,
  },
  iconContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center", // 将图标垂直居中于剩余空间
    marginTop: -40, // 稍微向上微调，视觉上更居中
  },
});