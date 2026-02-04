import React from "react";
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";
import { colors, sizes, fonts } from "./tokens";

type PrimaryButtonProps = {
  label: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  onPress?: () => void; // 1. 在类型定义中添加 onPress
};

export function PrimaryButton({ label, style, textStyle, onPress }: PrimaryButtonProps) {
  return (
      // 2. 将 onPress 传给 TouchableOpacity
      <TouchableOpacity
          style={[styles.button, style]}
          onPress={onPress}
          activeOpacity={0.7}
      >
        <Text style={[styles.text, textStyle]}>{label}</Text>
      </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: sizes.buttonHeight,
    borderRadius: sizes.inputRadius,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: colors.light,
    fontSize: 16,
    fontFamily: fonts.inter,
    fontWeight: "500",
  },
});