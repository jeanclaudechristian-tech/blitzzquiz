import React, { useState } from "react";
import { View, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import { colors, sizes, fonts } from "./tokens";
import { IconSvg } from "./IconSvg";
import { assets } from "./assets";
// 1. 引入新做的动画组件
import { AnimatedSlashEye } from "./AnimatedSlashEye";

type InputFieldProps = {
  placeholder: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  secureTextEntry?: boolean;
};

export function InputField({ placeholder, leftIcon, rightIcon, secureTextEntry }: InputFieldProps) {
  const [isSecure, setIsSecure] = useState(!!secureTextEntry);

  const toggleSecureEntry = () => {
    setIsSecure(!isSecure);
  };

  const renderRightIcon = () => {
    if (secureTextEntry) {
      // 定义基础的睁眼图标
      const baseEyeIcon = rightIcon || (
          <IconSvg uri={assets.eyeIcon} width={24} height={24} />
      );

      return (
          <TouchableOpacity
              style={styles.iconButton}
              onPress={toggleSecureEntry}
              activeOpacity={1} // 点击时不改变透明度，让动画自己表现
          >
            {/* 2. 使用动画组件包裹 */}
            <AnimatedSlashEye
                isActive={isSecure} // 注意取反：isSecure为false时，isActive为true(要画杠)
                baseIcon={baseEyeIcon}
                color={colors.dark} // 确保杠的颜色和图标一致
                size={24}
            />
          </TouchableOpacity>
      );
    }

    if (rightIcon) {
      return <View style={styles.iconBox}>{rightIcon}</View>;
    }

    return null;
  };

  // @ts-ignore
  return (
      <View style={styles.container}>
        <View style={styles.iconBox}>{leftIcon}</View>
        <TextInput
            placeholder={placeholder}
            placeholderTextColor={colors.secondaryText}
            // 4. 核心：使用内部状态 isSecure 控制显示，而不是死板的 props
            secureTextEntry={isSecure}
            allowFontScaling={false}
            // @ts-ignore
            includeFontPadding={false}
            textAlignVertical="center"
            // 记得在这里也禁掉 lineHeight，保持你的完美修复
            // @ts-ignore
            style={[styles.input, { lineHeight: undefined }]}
        />

        {/* 渲染右侧区域 */}
        {renderRightIcon()}
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: sizes.inputHeight,
    borderRadius: sizes.inputRadius,
    backgroundColor: colors.grayBg,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
  },
  iconBox: {
    width: 50,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  // 新增：专门给点击区域用的样式，保持和大盒子一致的尺寸
  iconButton: {
    width: 50,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    flex: 1,
    height: "100%",
    paddingVertical: 0,
    fontSize: 14,
    color: colors.dark,
    fontFamily: fonts.inter,
    lineHeight: undefined,
  },
});