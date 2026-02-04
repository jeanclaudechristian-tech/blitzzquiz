import React from "react";
import { View, Text, StyleSheet, SafeAreaView } from "react-native";
import { LogoBlitzzQuizLarge } from "../../components/blitzz/LogoBlitzzQuizLarge";
import { PrimaryButton } from "../../components/blitzz/PrimaryButton";
import { colors, fonts } from "../../components/blitzz/tokens";

export default function SuccessScreen() {
  return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
        <View style={styles.container}>

          {/* 内容主体区 */}
          <View style={styles.content}>
            <View style={styles.logoContainer}>
              <LogoBlitzzQuizLarge />
            </View>
            <Text style={styles.success}>SUCCÈS</Text>
          </View>

          {/* 底部按钮区 */}
          <View style={styles.buttonSection}>
            <PrimaryButton label="Déconnexion" />
          </View>

        </View>
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 36,
    paddingBottom: 40,
  },
  content: {
    flex: 1,
    justifyContent: "center", // 将 Logo 和文字在屏幕中间垂直居中
    alignItems: "center",
  },
  logoContainer: {
    marginBottom: 40,
  },
  success: {
    fontFamily: fonts.verdana,
    fontSize: 40,
    fontWeight: "700",
    color: colors.successBlue,
  },
  buttonSection: {
    width: "100%",
  },
});