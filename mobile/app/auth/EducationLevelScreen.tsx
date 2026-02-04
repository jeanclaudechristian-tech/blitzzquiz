import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Platform } from "react-native";
import { useRouter, useNavigation, Stack } from "expo-router";
// 引入动画库：这次我们用左右滑动的动画，体现“流程感”
import Animated, {
  Layout,
  SlideInRight,
  SlideOutLeft,
  SlideOutRight,
  SlideInLeft
} from "react-native-reanimated";
import { SelectField } from "../../components/blitzz/SelectField";
import { DarkButton } from "../../components/blitzz/DarkButton";
import { TextLink } from "../../components/blitzz/TextLink"; // 加上返回按钮
import { IconSvg } from "../../components/blitzz/IconSvg";
import { assets } from "../../components/blitzz/assets";
import { colors, fonts } from "../../components/blitzz/tokens";

export default function EducationLevelScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const [isVisible, setIsVisible] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false); // 模拟加载

  const educationOptions = [
    "École secondaire", // 高中
    "Cégep / Collège",  // 学院
    "Université (Bac)", // 本科
    "Université (Maîtrise/Doctorat)", // 硕博
    "Autre"
  ];

  // 1. 拦截器：处理返回/退出动画
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (!isVisible) return;
      e.preventDefault();

      // 触发反向动画（向右滑出，模仿返回效果）
      setIsVisible(false);

      setTimeout(() => {
        navigation.dispatch(e.data.action);
      }, 600);
    });
    return unsubscribe;
  }, [navigation, isVisible]);

  // 2. 导航处理
  const handleNav = (action: 'back' | 'next') => {
    if (action === 'back') {
      router.back();
    } else {
      // 下一步逻辑：先转圈，再跳转
      setIsSubmitting(true);
      setTimeout(() => {
        setIsSubmitting(false);
        setIsVisible(false); // 触发离场动画
        setTimeout(() => {
          // 假设这是注册最后一步，跳转到主页或登录页
          console.log("Registration Complete");
          router.replace("/auth/LoginScreen" as any);
        }, 600);
      }, 1500);
    }
  };

  return (
      <Animated.View style={{ flex: 1 }} layout={Layout.springify()}>
        {/* 禁用手势，防止侧滑打断动画 */}
        <Stack.Screen options={{ gestureEnabled: false }} />

        <View style={styles.mainWrapper}>
          <ScrollView contentContainerStyle={styles.container} bounces={false} nestedScrollEnabled={true} keyboardShouldPersistTaps="handled">
            <View style={styles.headerSpacer} />

            {isVisible && (
                <>
                  {/* 1. 标题：从右入 */}
                  <Animated.View
                      entering={SlideInRight.delay(100).duration(600).springify()}
                      exiting={SlideOutLeft.duration(500)} // 往左飞走，表示去下一页
                  >
                    <Text style={styles.title}>
                      Quel est{"\n"}votre{"\n"}niveau d’étude ?
                    </Text>
                  </Animated.View>

                  {/* 2. 选择框：稍作延迟 */}
                  <View style={styles.selectSection}>
                    <Animated.View
                        entering={SlideInRight.delay(200).duration(600).springify()}
                        exiting={SlideOutLeft.delay(100).duration(500)}
                    >
                      <SelectField
                          label="Choisir"
                          options={educationOptions}
                          onSelect={(val) => console.log("Selected:", val)}
                          icon={<IconSvg uri={assets.dropdownIcon} width={24} height={24} />}
                      />
                    </Animated.View>
                  </View>

                  {/* 3. 底部按钮区 */}
                  <View style={styles.buttonSection}>
                    {/* iOS 显示返回按钮，Android 用物理键 */}
                    {Platform.OS === 'ios' && (
                        <Animated.View
                            entering={SlideInRight.delay(300).duration(600).springify()}
                            exiting={SlideOutLeft.delay(200).duration(500)}
                        >
                          <View style={styles.backLink}>
                            <TextLink label="Retour" onPress={() => handleNav('back')} />
                          </View>
                        </Animated.View>
                    )}

                    <Animated.View
                        entering={SlideInRight.delay(400).duration(600).springify()}
                        exiting={SlideOutLeft.delay(250).duration(500)}
                    >
                      <DarkButton
                          label="Suivant"
                          onPress={() => handleNav('next')}
                          isLoading={isSubmitting} // 加上 Loading 效果
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
  },
  headerSpacer: { height: 80 },
  title: {
    fontFamily: fonts.inter,
    fontWeight: "600",
    fontSize: 42,
    lineHeight: 50,
    color: colors.dark,
  },
  selectSection: { marginTop: 60 },
  buttonSection: {
    flex: 1,
    justifyContent: "flex-end",
    marginTop: 40,
  },
  backLink: {
    alignItems: 'center',
    marginBottom: 20
  }
});