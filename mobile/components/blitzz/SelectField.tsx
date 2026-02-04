import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing
} from "react-native-reanimated";
import { colors, sizes, fonts } from "./tokens";
import { IconSvg } from "./IconSvg";
import { assets } from "./assets";

type SelectFieldProps = {
  label: string;
  icon?: React.ReactNode;
  options?: string[];
  onSelect?: (value: string) => void;
};

export function SelectField({
                              label,
                              icon,
                              options = ["Secondaire", "Cégep", "Université"],
                              onSelect
                            }: SelectFieldProps) {

  const isOpen = useSharedValue(false);
  const [selected, setSelected] = React.useState<string | null>(null);

  const toggleDropdown = () => {
    isOpen.value = !isOpen.value;
  };

  const handleSelect = (option: string) => {
    setSelected(option);
    isOpen.value = false;
    if (onSelect) onSelect(option);
  };

  const arrowStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: withTiming(isOpen.value ? '180deg' : '0deg', { duration: 300 }) }],
    };
  });

  const dropdownStyle = useAnimatedStyle(() => {
    return {
      // 这里的 200 是最大高度，确保超过这个高度时 ScrollView 会生效
      height: withTiming(isOpen.value ? 200 : 0, {
        duration: 300,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      }),
      opacity: withTiming(isOpen.value ? 1 : 0, { duration: 200 }),
    };
  });

  return (
      <View style={styles.wrapper}>
        {/* 按钮部分保持不变 */}
        <TouchableOpacity
            style={styles.container}
            onPress={toggleDropdown}
            activeOpacity={0.8}
        >
          <Text style={[styles.text, selected && styles.selectedText]}>
            {selected || label}
          </Text>
          <Animated.View style={arrowStyle}>
            {icon || <IconSvg uri={assets.dropdownIcon} width={24} height={24} />}
          </Animated.View>
        </TouchableOpacity>

        {/* ✅ 修复 2：修改下拉列表容器 */}
        <Animated.View
            style={[styles.dropdown, dropdownStyle]}
            // 核心黑魔法：告诉安卓，如果手指摸到了这里，就由我来接管，不要冒泡给父页面
            onStartShouldSetResponder={() => true}
        >
          <ScrollView
              nestedScrollEnabled={true}
              bounces={false}
              showsVerticalScrollIndicator={true}
              style={{ flex: 1 }}
              contentContainerStyle={{ flexGrow: 1 }}
              // 确保点击选项时键盘会收起（虽然这里没键盘，但为了好习惯）
              keyboardShouldPersistTaps="handled"
          >
            {options.map((option, index) => (
                <TouchableOpacity
                    key={index}
                    style={styles.optionItem}
                    onPress={() => handleSelect(option)}
                    // 确保点击事件不会穿透
                    activeOpacity={0.7}
                >
                  <Text style={styles.optionText}>{option}</Text>
                </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>
      </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    zIndex: 100,
  },
  container: {
    height: sizes.inputHeight,
    borderRadius: sizes.inputRadius,
    backgroundColor: colors.grayBg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    zIndex: 101,
  },
  text: {
    color: colors.secondaryText,
    fontFamily: fonts.inter,
    fontSize: 15,
  },
  selectedText: {
    color: colors.dark,
    fontWeight: "600",
  },
  dropdown: {
    position: 'absolute',
    top: sizes.inputHeight + 8,
    left: 0,
    right: 0,
    backgroundColor: colors.grayBg,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
    zIndex: 100,
  },
  optionItem: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.03)',
  },
  optionText: {
    fontFamily: fonts.inter,
    fontSize: 15,
    color: colors.dark,
  },
});