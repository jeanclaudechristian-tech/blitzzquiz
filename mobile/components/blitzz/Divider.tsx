import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { IconSvg } from "./IconSvg";
import { assets } from "./assets";
import { colors, fonts } from "./tokens";

export function Divider() {
  return (
    <View style={styles.container}>
      <IconSvg uri={assets.dividerLine} width={76} height={2} />
      <Text style={styles.text}>ou</Text>
      <IconSvg uri={assets.dividerLine} width={76} height={2} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  text: {
    color: colors.primary,
    fontSize: 10,
    fontFamily: fonts.inter,
    fontWeight: "500",
  },
});
