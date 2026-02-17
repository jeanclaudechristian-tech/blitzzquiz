import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Platform } from "react-native";
import { useAuth } from "../../services/AuthContext";
import { useRouter, useNavigation, Stack, useLocalSearchParams } from "expo-router";
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

  // ✅ 新增 1：获取注册方法
  const { register } = useAuth();

  // ✅ 新增 2：接收上一页传来的数据
  const { nickname, email, password } = useLocalSearchParams();


  // ✅ 新增 3：定义身份选项和状态
  const [selectedRole, setSelectedRole] = useState("");
  const roleOptions = ["Étudiant", "Enseignant"];

  // 简单的映射表：把法语选项转成数据库的大写英文
  const roleMap: { [key: string]: string } = {
    "Étudiant": "STUDENT",
    "Enseignant": "TEACHER"
  };

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
  const handleRegister = async () => {
    if (!selectedRole) {
      // 如果没选身份，提示一下（这里简单用 console 或 Alert）
      console.log("Please select a role");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. 转换角色名 (例如 "Étudiant" -> "STUDENT")
      const dbRole = roleMap[selectedRole] || "STUDENT";

      // 2. 发送所有数据给后端
      // 注意：这里需要断言成 string，因为 searchParams 可能是数组
      await register(
          email as string,
          nickname as string,
          password as string,
          dbRole
      );

      // 3. 注册成功后，AuthContext 会自动跳转首页，这里不用管了
    } catch (e) {
      setIsSubmitting(false); // 失败停止转圈
    }
  };

  // 简单的返回函数
  const handleBack = () => {
    router.back();
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
                      Vous{"\n"}Êtes ?
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
                          options={roleOptions}
                          onSelect={setSelectedRole}
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
                            <TextLink label="Retour" onPress={() => handleBack()} />
                          </View>
                        </Animated.View>
                    )}

                    <Animated.View
                        entering={SlideInRight.delay(400).duration(600).springify()}
                        exiting={SlideOutLeft.delay(250).duration(500)}
                    >
                      <DarkButton
                          label="Confirmer"
                          onPress={() => handleRegister()}
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