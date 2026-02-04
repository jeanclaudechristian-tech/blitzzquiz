import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LogoBlitzzQuizLarge } from "../../components/blitzz/LogoBlitzzQuizLarge";
import { PrimaryButton } from "../../components/blitzz/PrimaryButton";
import { colors, fonts } from "../../components/blitzz/tokens";

export default function SuccessScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.logo}>
        <LogoBlitzzQuizLarge />
      </View>

      <Text style={styles.success}>SUCCÈS</Text>

      <View style={styles.button}>
        <PrimaryButton label="Déconnexion" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  logo: {
    position: "absolute",
    top: 290,
    left: 0,
  },
  success: {
    position: "absolute",
    top: 598,
    left: 110,
    fontFamily: fonts.verdana,
    fontSize: 40,
    fontWeight: "700",
    color: colors.successBlue,
  },
  button: {
    position: "absolute",
    top: 712,
    left: 37,
    width: 328,
  },
});
