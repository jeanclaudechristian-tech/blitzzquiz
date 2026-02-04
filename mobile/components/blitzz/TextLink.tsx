import React from "react";
import { Text, StyleSheet, TouchableOpacity } from "react-native";
import { colors, fonts } from "./tokens";

type TextLinkProps = {
  label: string;
  style?: object;
  onPress?: () => void; // 1. 声明点击属性
};

export function TextLink({ label, style, onPress }: TextLinkProps) {
  return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.6}>
        <Text style={[styles.text, style]}>{label}</Text>
      </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  text: {
    color: colors.accent,
    fontSize: 12,
    fontFamily: fonts.inter,
  },
});