import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, { useAnimatedStyle, withTiming, FadeIn, FadeOut } from 'react-native-reanimated';
import { IconSvg } from './IconSvg';
import { assets } from './assets';

interface StatisticIslandProps {
  averageScore: number;
  completedQuizzes: number;
  isExpanded: boolean;
  onToggle: () => void;
  categories?: CategoryItem[];
}

interface CategoryItem {
  id: number;
  name: string;
  score: number;
}

const ROW_HEIGHT = 50; // 每一行详情的高度（包含 gap）
const BASE_HEIGHT = 56; // 闭合时的高度
const DETAILS_PADDING = 20; // details 容器的 marginTop

export const StatisticIsland = ({
                                  averageScore,
                                  completedQuizzes,
                                  isExpanded,
                                  onToggle,
                                  categories = []
                                }: StatisticIslandProps) =>
{
  // 计算展开后的总高度
  // 逻辑：基础高度 + 详情间距 + (行数 * 行高)
  const expandedHeight = BASE_HEIGHT + DETAILS_PADDING + (categories.length * ROW_HEIGHT);

  const containerStyle = useAnimatedStyle(() => {
    return {
      // 展开时使用计算出的高度，闭合时回落到 56
      height: withTiming(isExpanded ? expandedHeight : BASE_HEIGHT, { duration: 300 }),
    };
  }, [isExpanded, categories.length]); // 监听长度变化

  // 1. 定义间距动画
  const spacerStyle = useAnimatedStyle(() => {
    return {
      // 闭合时宽度为 20，展开时平滑滑开到 40 (或你喜欢的数值)
      width: withTiming(isExpanded ? 40 : 20, { duration: 300 }),
    };
  }, [isExpanded]);

  return (
      // Layer 1: 阴影 + 尺寸动画
      <Animated.View style={[styles.shadowContainer, containerStyle]}>

        {/* Layer 2: 视觉容器 (圆角/裁切/背景) */}
        <View style={styles.visualContainer}>
          <Pressable
              style={styles.pressable}
              onPress={onToggle}
              android_ripple={{ color: '#dcebec' }}
          >
            {/* 顶部常驻栏 */}
            <View style={styles.topRow}>
              {/* 左：平均分 */}
              <View style={styles.statGroup}>
                <View style={styles.iconWrapper}>
                  <IconSvg uri={assets.statIcon} width={26} height={26} />
                </View>
                <View style={styles.textStack}>
                  <View style={styles.valueRow}>
                    <Text style={styles.mainValue}>{averageScore}</Text>
                    <Text style={styles.unitText}>%</Text>
                  </View>
                  <Text style={styles.label}>moyenne</Text>
                </View>
              </View>

              {/* 中：分割线 (展开时淡出，保持干净) */}
              {/* {!isExpanded && <View style={styles.divider} />} */}
              <Animated.View style={spacerStyle} />

              {/* 右：完成数 */}
              <View style={[styles.statGroup]}>
                <View style={styles.iconWrapper}>
                  <IconSvg uri={assets.historyIcon} width={22} height={22} />
                </View>
                <View style={styles.textStack}>
                  <Text style={styles.mainValue}>{completedQuizzes}</Text>
                  <Text style={styles.label}>complétés</Text>
                </View>
              </View>
            </View>

            {/* 展开后的详情区域 */}
            {isExpanded && (
                <Animated.View
                    entering={FadeIn.duration(300).delay(100)}
                    exiting={FadeOut.duration(200)}
                    style={styles.details}
                >
                  {categories.map((cat, index) => (
                      <View key={index} style={[styles.detailRow, { height: ROW_HEIGHT - 15 }]}>
                        <View style={styles.placeholderIcon} />
                        <View>
                          <View style={styles.valueRow}>
                            <Text style={styles.mainValue}>{cat.score}</Text>
                            <Text style={styles.unitText}>%</Text>
                          </View>
                          <Text style={styles.label}>{cat.name}</Text>
                        </View>
                      </View>
                  ))}
                </Animated.View>
            )}

          </Pressable>
        </View>
      </Animated.View>
  );
};

const styles = StyleSheet.create({
  shadowContainer: {
    width: '100%',
    // height 由内部内容撑开或 AnimatedStyle 控制
    borderRadius: 28,
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    // ❌ 绝对不要在这里写 overflow: 'hidden'
  },
  visualContainer: {
    // ❌ 删掉 flex: 1
    width: '100%',
    height: '100%', // 继承 shadowContainer 的高度动画
    backgroundColor: '#edf8f9',
    borderRadius: 28,
    overflow: 'hidden', // 只在这一层切内容（水波纹等）
  },
  pressable: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },

  // 顶部常驻
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 36, // 锁定高度
  },
  statGroup: { flexDirection: 'row', alignItems: 'center' },
  iconWrapper: { marginRight: 8 },
  divider: { width: 1, height: 24, backgroundColor: 'rgba(0,0,0,0.08)', marginHorizontal: 12 },

  textStack: { justifyContent: 'center' },
  valueRow: { flexDirection: 'row', alignItems: 'baseline' },
  mainValue: { fontSize: 17, fontWeight: '700', color: '#24201d' },
  unitText: { fontSize: 10, fontWeight: '500', marginLeft: 1 },
  label: { fontSize: 9, fontWeight: '600', color: '#666', marginTop: -2 },

  // 详情
  details: {
    marginTop: 20,
    gap: 15,
  },
  detailRow: { flexDirection: 'row', alignItems: 'center' },
  placeholderIcon: {
    width: 32, height: 32, backgroundColor: '#24201d', borderRadius: 8, marginRight: 12
  },
  statSpacer: {
    width: 15, // ✅ 调节这个数值来控制左右间距
    height: '100%',
  },
});