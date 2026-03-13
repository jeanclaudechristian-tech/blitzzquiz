import React, { useState, useEffect } from "react";
import {View, Text, StyleSheet, ScrollView, Platform, Alert} from "react-native";
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

  const [educationLevel, setEducationLevel] = useState("");

  // 简单的映射表：把法语选项转成数据库的大写英文
  const roleMap: { [key: string]: string } = {
    "Étudiant": "STUDENT",
    "Enseignant": "TEACHER"
  };

  // 选项列表（用于 SelectField 显示）
  const educationOptions = ["Primaire", "Secondaire", "Collégial", "Universitaire"];

  // 转换映射表：UI 文本 -> 数据库存储值
  const educationMap: { [key: string]: string } = {
    "Primaire": "primaire",
    "Secondaire": "secondaire",
    "Collégial": "collégiale", // 注意：去掉特殊字符，匹配 index.ts 中的 'Collegial'
    "Universitaire": "universitaire"
  };

  const [activeDropdown, setActiveDropdown] = useState<'role' | 'edu' | null>(null);

  const toggleDropdown = (type: 'role' | 'edu') => {
    setActiveDropdown(prev => (prev === type ? null : type));
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
    if (!selectedRole || !educationLevel) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs.");
      return;
    }

    setIsSubmitting(true);
    try {
      // 执行转换
      const dbRole = roleMap[selectedRole] || "STUDENT";
      const dbEducation = educationMap[educationLevel] || educationLevel;

      // ✅ 调用 AuthContext 的新顺序：email, nickname, password, educationLevel, role
      await register(
          email as string,
          nickname as string,
          password as string,
          dbEducation, // 传转换后的值
          dbRole
      );
    } catch (e) {
      setIsSubmitting(false);
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
                        style={{ zIndex: activeDropdown === 'role' ? 10 : 5 }}
                    >
                      <SelectField
                          label="Choisir"
                          options={roleOptions}
                          onSelect={setSelectedRole}
                          icon={<IconSvg uri={assets.dropdownIcon} width={24} height={24} />}
                          isOpenExternal={activeDropdown === 'role'} // 传入状态
                          onToggle={() => toggleDropdown('role')}
                      />
                    </Animated.View>

                    <View style={{ height: 20 }} />

                    {/* 2. 教育程度选择 (Role同款) */}
                    <Animated.View
                        entering={SlideInRight.delay(250).duration(600).springify()}
                        exiting={SlideOutLeft.delay(150).duration(500)}
                    >
                      <SelectField
                          label="Niveau d'études"
                          options={educationOptions}
                          onSelect={setEducationLevel}
                          icon={<IconSvg uri={assets.dropdownIcon} width={24} height={24} />}
                          isOpenExternal={activeDropdown === 'edu'} // 传入状态
                          onToggle={() => toggleDropdown('edu')}
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