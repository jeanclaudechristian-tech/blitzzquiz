import React from "react";
import { TouchableOpacity, Text, StyleSheet, View, ViewStyle } from "react-native";
import { colors, sizes, fonts } from "./tokens";

type DarkButtonProps = {
  label: string;
  icon?: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void; // 1. 声明点击属性
};

export function DarkButton({ label, icon, style, onPress }: DarkButtonProps) {
  return (
      <TouchableOpacity
          style={[styles.button, style]}
          onPress={onPress} // 2. 绑定点击事件
          activeOpacity={0.8}
      >
        {icon ? <View style={styles.iconWrap}>{icon}</View> : null}
        <Text style={styles.text}>{label}</Text>
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
    gap: 10,
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