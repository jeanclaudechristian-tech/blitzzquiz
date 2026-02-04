import React from "react";
import { View, TextInput, StyleSheet } from "react-native";
import { colors, sizes, fonts } from "./tokens";

type InputFieldProps = {
  placeholder: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  secureTextEntry?: boolean;
};

export function InputField({ placeholder, leftIcon, rightIcon, secureTextEntry }: InputFieldProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconBox}>{leftIcon}</View>
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={colors.secondaryText}
        secureTextEntry={secureTextEntry}
        style={styles.input}
      />
      {rightIcon ? <View style={styles.iconBox}>{rightIcon}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: sizes.inputHeight,
    borderRadius: sizes.inputRadius,
    backgroundColor: colors.grayBg,
    flexDirection: "row",
    alignItems: "center",
  },
  iconBox: {
    width: 50,
    height: sizes.inputHeight,
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: colors.dark,
    fontFamily: fonts.inter,
  },
});
