import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { colors, sizes, fonts } from "./tokens";

type SelectFieldProps = {
  label: string;
  icon?: React.ReactNode;
};

export function SelectField({ label, icon }: SelectFieldProps) {
  return (
    <TouchableOpacity style={styles.container}>
      <Text style={styles.text}>{label}</Text>
      {icon ? <>{icon}</> : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    height: sizes.inputHeight,
    borderRadius: sizes.inputRadius,
    backgroundColor: colors.grayBg,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: colors.secondaryText,
    fontFamily: fonts.inter,
    fontSize: 15,
  },
});
