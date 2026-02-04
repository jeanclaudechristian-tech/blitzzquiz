import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { IconSvg } from "./IconSvg";
import { assets } from "./assets";
import { colors, fonts } from "./tokens";

export function LogoMinBlitzz() {
  return (
      <View style={styles.container}>
        {/* 图标 */}
        <IconSvg uri={assets.logoBoltSmall} width={84} height={153} />

        {/* 如果你以后想把 "Blitzz" 文字加回来，它会自动排在图标右侧 */}
        {/* <Text style={styles.text}>B</Text> */}
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // 改为 Flex 布局，水平排列，居中对齐
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    // 移除固定的 width: 185，让它由内容决定大小
  },
  text: {
    // 移除 position: "absolute"
    marginLeft: 10, // 与图标保持间距
    fontFamily: fonts.verdana,
    fontWeight: "700",
    fontSize: 40,
    color: colors.primary,
  },
});