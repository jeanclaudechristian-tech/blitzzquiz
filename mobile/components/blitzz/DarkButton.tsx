import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  ViewStyle,
  ActivityIndicator // 1. 引入菊花组件
} from "react-native";
import { colors, sizes, fonts } from "./tokens";

type DarkButtonProps = {
  label: string;
  icon?: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  isLoading?: boolean; // 2. 新增属性：是否加载中
};

export function DarkButton({ label, icon, style, onPress, isLoading = false }: DarkButtonProps) {
  return (
      <TouchableOpacity
          // 3. 加载时降低透明度，增加视觉反馈
          style={[styles.button, style, isLoading && { opacity: 0.8 }]}
          onPress={onPress}
          activeOpacity={0.8}
          // 4. 关键：加载中禁止点击
          disabled={isLoading}
      >
        {/* 5. 互斥渲染：加载时显示菊花，平时显示内容 */}
        {isLoading ? (
            <ActivityIndicator size="small" color={colors.light} />
        ) : (
            <>
              {icon ? <View style={styles.iconWrap}>{icon}</View> : null}
              <Text style={styles.text}>{label}</Text>
            </>
        )}
      </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: sizes.buttonHeight,
    borderRadius: sizes.inputRadius,
    backgroundColor: colors.dark,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10, // 保持你原有的间距设计
  },
  text: {
    color: colors.light,
    fontSize: 16,
    fontFamily: fonts.inter,
    fontWeight: "500",
  },
  iconWrap: {
    width: 26,
    height: 26,
    alignItems: "center",
    justifyContent: "center",
  },
});