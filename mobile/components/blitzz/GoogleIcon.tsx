import React from "react";
import { View, StyleSheet } from "react-native";
import { IconSvg } from "./IconSvg";
import { assets } from "./assets";

export function GoogleIcon() {
  return (
    <View style={styles.container}>
      <IconSvg uri={assets.googleIcon1} width={26} height={26} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 26,
    height: 26,
  },
});
