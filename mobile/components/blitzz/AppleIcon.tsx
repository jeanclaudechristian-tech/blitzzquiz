import React from "react";
import { View, StyleSheet } from "react-native";
import { IconSvg } from "./IconSvg";
import { assets } from "./assets";

export function AppleIcon() {
  return (
    <View style={styles.container}>
      <IconSvg uri={assets.appleIconMain} width={20} height={14} />
      <View style={styles.leaf}>
        <IconSvg uri={assets.appleIconLeaf} width={6} height={6} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  leaf: {
    position: "absolute",
    top: 2,
    left: 12,
  },
});
