import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, Platform } from "react-native";
import { useRouter, useNavigation, Stack, useFocusEffect } from "expo-router";
import Animated, {
  SlideInLeft,
  SlideInRight,
  SlideOutLeft,
  SlideOutRight
} from "react-native-reanimated";
import { InputField } from "../../components/blitzz/InputField";
import { DarkButton } from "../../components/blitzz/DarkButton";
import { TextLink } from "../../components/blitzz/TextLink";
import { IconSvg } from "../../components/blitzz/IconSvg";
import { assets } from "../../components/blitzz/assets";
import { colors, fonts } from "../../components/blitzz/tokens";

export default function ForgotPasswordEmail() {
  const router = useRouter();
  const navigation = useNavigation();
  const [isVisible, setIsVisible] = useState(true);

  // 1. 拦截器：防止手滑导致动画崩坏
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

  // 2. 核心修复：确保返回时动画能正常播放
  useFocusEffect(
      useCallback(() => {
        // 使用 requestAnimationFrame 确保在下一帧执行，避免和导航动画冲突
        // 如果还不灵，可以改成 setTimeout(() => setIsVisible(true), 100);
        const task = requestAnimationFrame(() => {
          setIsVisible(true);
        });
        return () => cancelAnimationFrame(task);
      }, [])
  );

  // 3. 类型修复：允许接收任意路径字符串
  const handleNav = (path: string) => {
    if (path === 'back') {
      router.back();
    } else {
      setIsVisible(false);
      setTimeout(() => {
        router.push(path as any);
      }, 600);
    }
  };

  return (
      // 4. 关键修复：移除了 layout={Layout.springify()}，避免吞掉子组件的 entering 动画
      <Animated.View style={{ flex: 1 }}>
        <Stack.Screen options={{ gestureEnabled: false }} />

        <View style={styles.mainWrapper}>
          <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.headerSpacer} />

            {/* isVisible 为 true 时，组件挂载并播放 entering */}
            {isVisible && (
                <>
                  <Animated.View
                      entering={SlideInLeft.delay(100).duration(600).springify()}
                      exiting={SlideOutRight.duration(500)}
                  >
                    <Text style={styles.title}>
                      Quel est{"\n"}votre{"\n"}courriel ?
                    </Text>
                  </Animated.View>

                  <View style={styles.formSection}>
                    <Animated.View
                        entering={SlideInRight.delay(200).duration(600).springify()}
                        exiting={SlideOutLeft.delay(100).duration(500)}
                    >
                      <InputField
                          placeholder="Courriel"
                          leftIcon={<IconSvg uri={assets.emailIcon} width={24} height={24} />}
                      />
                    </Animated.View>
                  </View>

                  <View style={styles.buttonSection}>
                    {Platform.OS === 'ios' && (
                        <Animated.View
                            entering={SlideInLeft.delay(300).duration(600).springify()}
                            exiting={SlideOutRight.delay(200).duration(500)}
                        >
                          <View style={styles.backLink}>
                            <TextLink label="Retour" onPress={() => handleNav('back')} />
                          </View>
                        </Animated.View>
                    )}

                    <Animated.View
                        entering={SlideInLeft.delay(Platform.OS === 'ios' ? 400 : 300).duration(600).springify()}
                        exiting={SlideOutRight.delay(250).duration(500)}
                    >
                      {/* 这里传入路径现在安全了 */}
                      <DarkButton
                          label="Suivant"
                          onPress={() => handleNav("/auth/EmailSentVerification")}
                      />
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
    backgroundColor: colors.light,
  },
  headerSpacer: { height: 80 },
  title: {
    fontFamily: fonts.inter,
    fontWeight: "600",
    fontSize: 42,
    lineHeight: 50,
    color: colors.dark,
  },
  formSection: { marginTop: 60 },
  buttonSection: {
    flex: 1,
    justifyContent: "flex-end",
    marginTop: 30,
  },
  backLink: {
    alignItems: "center",
    marginBottom: 20,
  },
});