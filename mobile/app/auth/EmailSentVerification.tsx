import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Platform } from "react-native";
import { useRouter, useNavigation, Stack } from "expo-router";
// 引入动画库
import Animated, {
  Layout, SlideInLeft,
  SlideInRight, SlideOutLeft,
  SlideOutRight
} from "react-native-reanimated";
import { IconSvg } from "../../components/blitzz/IconSvg";
import { TextLink } from "../../components/blitzz/TextLink"; // 加个返回按钮方便测试
import { assets } from "../../components/blitzz/assets";
import { colors, fonts } from "../../components/blitzz/tokens";

export default function EmailSentVerification() {
  const router = useRouter();
  const navigation = useNavigation();
  const [isVisible, setIsVisible] = useState(true);

  // 1. 拦截器：处理返回动画
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (!isVisible) return;
      e.preventDefault();
      setIsVisible(false);
      setTimeout(() => {
        navigation.dispatch(e.data.action);
      }, 600);
    });
    return unsubscribe;
  }, [navigation, isVisible]);

  const handleBack = () => {
    router.back();
  };

  return (
      <Animated.View style={{ flex: 1 }} layout={Layout.springify()}>
        <Stack.Screen options={{ gestureEnabled: false }} />

        <View style={styles.mainWrapper}>
          <ScrollView contentContainerStyle={styles.container} bounces={false}>
            <View style={styles.headerSpacer} />

            {isVisible && (
                <>
                  {/* 1. 标题：从右飞入 */}
                  <Animated.View
                      entering={SlideInRight.delay(100).duration(600).springify()}
                      exiting={SlideOutLeft.duration(500)}
                  >
                    <Text style={styles.title}>
                      Valider{"\n"}l’opération{"\n"}à partir{"\n"}de votre courriel
                    </Text>
                  </Animated.View>

                  {/* 2. 信封图标：延迟飞入 */}
                  <View style={styles.iconContainer}>
                    <Animated.View
                        entering={SlideInLeft.delay(300).duration(600).springify()}
                        exiting={SlideOutRight.delay(100).duration(500)}
                    >
                      <IconSvg uri={assets.envelopeIcon} width={143} height={143} />
                    </Animated.View>
                  </View>

                  {/* 3. 底部加个返回按钮，万一用户填错邮箱了呢 */}
                  <View style={styles.buttonSection}>
                    <Animated.View
                        entering={SlideInRight.delay(500).duration(600).springify()}
                        exiting={SlideOutLeft.delay(200).duration(500)}
                    >
                      <TextLink label="Retour" onPress={handleBack} />
                    </Animated.View>
                  </View>
                </>
            )}
          </ScrollView>
        </View>
      </Animated.View>
  );
}

const styles = StyleSheet.create({
  mainWrapper: {
    flex: 1,
    backgroundColor: colors.light,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 36,
    paddingBottom: 40,
  },
  headerSpacer: { height: 80 },
  title: {
    fontFamily: fonts.inter,
    fontWeight: "600",
    fontSize: 42,
    lineHeight: 50,
    color: colors.dark,
  },
  iconContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -40,
  },
  buttonSection: {
    alignItems: 'center',
    marginBottom: 30
  }
});