import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Platform } from "react-native";
import { useRouter, useNavigation, Stack } from "expo-router";
// 引入左右横跳的动画包
import Animated, {
  Layout,
  SlideInLeft,
  SlideInRight,
  SlideOutLeft,
  SlideOutRight
} from "react-native-reanimated";
import { InputField } from "../../components/blitzz/InputField";
import { DarkButton } from "../../components/blitzz/DarkButton";
import { TextLink } from "../../components/blitzz/TextLink"; // 别忘了引入这个用于 iOS 返回
import { IconSvg } from "../../components/blitzz/IconSvg";
import { assets } from "../../components/blitzz/assets";
import { colors, fonts } from "../../components/blitzz/tokens";

export default function ResetPasswordScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const [isVisible, setIsVisible] = useState(true);

  // 1. 拦截器：搞定 Android 物理返回键 + 拦截系统侧滑退出
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (!isVisible) return; // 动画播放中，放行

      e.preventDefault(); // 拦截
      setIsVisible(false); // 触发飞出动画

      setTimeout(() => {
        navigation.dispatch(e.data.action); // 600ms 后放行
      }, 600);
    });

    return unsubscribe;
  }, [navigation, isVisible]);

  // 2. 按钮点击处理
  const handleNav = (action: 'back' | 'confirm') => {
    if (action === 'back') {
      router.back(); // 触发拦截器动画
    } else {
      // 确认修改：手动触发离场
      setIsVisible(false);
      setTimeout(() => {
        console.log("Password Reset Confirmed");
        // 这里通常是回到登录页，或者进主页
        router.replace('/auth/LoginScreen' as any);
      }, 600);
    }
  };

  return (
      <Animated.View style={{ flex: 1 }} layout={Layout.springify()}>
        {/* 禁用手势，保护动画不崩坏 */}
        <Stack.Screen options={{ gestureEnabled: false }} />

        <View style={styles.mainWrapper}>
          <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.headerSpacer} />

            {isVisible && (
                <>
                  {/* 1. 标题：从左飞入，向右飞出 */}
                  <Animated.View
                      entering={SlideInLeft.delay(100).duration(600).springify()}
                      exiting={SlideOutRight.duration(500)}
                  >
                    <Text style={styles.title}>
                      Changer{"\n"}votre{"\n"}mot de passe
                    </Text>
                  </Animated.View>

                  {/* 2. 输入框组：从右飞入，向左飞出 */}
                  <View style={styles.formSection}>
                    {/* 新密码 */}
                    <Animated.View
                        entering={SlideInRight.delay(200).duration(600).springify()}
                        exiting={SlideOutLeft.delay(100).duration(500)}
                    >
                      <InputField
                          placeholder="Nouveau mot de passe"
                          secureTextEntry
                          leftIcon={<IconSvg uri={assets.passwordIcon} width={24} height={24} />}
                          rightIcon={<IconSvg uri={assets.eyeIcon} width={24} height={24} />}
                      />
                    </Animated.View>

                    <View style={styles.spacer} />

                    {/* 确认密码 (稍慢一点进场) */}
                    <Animated.View
                        entering={SlideInRight.delay(300).duration(600).springify()}
                        exiting={SlideOutLeft.delay(150).duration(500)}
                    >
                      <InputField
                          placeholder="Confirmer mot de passe"
                          secureTextEntry
                          leftIcon={<IconSvg uri={assets.checkIcon} width={16} height={16} />}
                      />
                    </Animated.View>
                  </View>

                  {/* 3. 按钮区：从左飞入，向右飞出 */}
                  <View style={styles.buttonSection}>
                    {/* iOS 专属返回按钮 */}
                    {Platform.OS === 'ios' && (
                        <Animated.View
                            entering={SlideInLeft.delay(400).duration(600).springify()}
                            exiting={SlideOutRight.delay(200).duration(500)}
                        >
                          <View style={styles.backLink}>
                            <TextLink label="Retour" onPress={() => handleNav('back')} />
                          </View>
                        </Animated.View>
                    )}

                    {/* 确认按钮 */}
                    <Animated.View
                        entering={SlideInLeft.delay(Platform.OS === 'ios' ? 500 : 400).duration(600).springify()}
                        exiting={SlideOutRight.delay(250).duration(500)}
                    >
                      <DarkButton label="Confirmer" onPress={() => handleNav('confirm')} />
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
  spacer: { height: 15 },
  buttonSection: {
    flex: 1,
    justifyContent: "flex-end",
    marginTop: 40,
  },
  backLink: {
    alignItems: "center",
    marginBottom: 20,
  },
});