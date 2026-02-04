import React from "react";
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from "react-native";
import { useRouter } from "expo-router";
import { SelectField } from "../../components/blitzz/SelectField";
import { DarkButton } from "../../components/blitzz/DarkButton";
import { IconSvg } from "../../components/blitzz/IconSvg";
import { assets } from "../../components/blitzz/assets";
import { colors, fonts } from "../../components/blitzz/tokens";

export default function EducationLevelScreen() {
  const router = useRouter();

  return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.light }}>
        <ScrollView contentContainerStyle={styles.container}>

          {/* 顶部留白，保持与登录页一致 */}
          <View style={styles.headerSpacer} />

          {/* 标题区：去掉了多余的 \n，靠 Flexbox 和 lineHeight 控制间距 */}
          <Text style={styles.title}>
            Quel est{"\n"}votre{"\n"}niveau d’étude ?
          </Text>

          {/* 选择区 */}
          <View style={styles.selectSection}>
            <SelectField
                label="Choisir"
                icon={<IconSvg uri={assets.dropdownIcon} width={24} height={24} />}
            />
          </View>

          {/* 按钮区：使用 flex: 1 和 justifyContent 让按钮自然靠下 */}
          <View style={styles.buttonSection}>
            <DarkButton label="Suivant" />
          </View>

        </ScrollView>
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 36,
    paddingBottom: 40,
  },
  headerSpacer: {
    height: 80, // 与 LoginScreen 保持一致的顶部间距
  },
  title: {
    fontFamily: fonts.inter,
    fontWeight: "600",
    fontSize: 42,
    lineHeight: 50, // 修正行高，防止文字重叠
    color: colors.dark,
  },
  selectSection: {
    marginTop: 60, // 标题下方的间距
  },
  buttonSection: {
    flex: 1,
    justifyContent: "flex-end", // 将按钮推到底部
    marginTop: 40, // 最小间距防止触底
  },
});