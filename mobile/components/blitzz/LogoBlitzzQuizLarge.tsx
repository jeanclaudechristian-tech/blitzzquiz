import React from "react";
import { View, StyleSheet } from "react-native";
import { IconSvg } from "./IconSvg";
import { assets } from "./assets";

export function LogoBlitzzQuizLarge() {
  return (
      <View style={styles.container}>
        {/* 移除所有文字，只保留闪电图标，宽度和高度由容器或组件属性控制 */}
        <IconSvg uri={assets.logoBoltLarge} width={140} height={240} />
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // 移除固定的 width: 402 和 height: 293
    // 使用 Flexbox 确保图标在容器内居中
    alignItems: "center",
    justifyContent: "center",
    // 如果在页面中需要特定的间距，可以在使用组件的地方加 margin
  },
});