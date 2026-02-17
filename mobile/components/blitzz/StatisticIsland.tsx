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
}

export const StatisticIsland = ({
                                  averageScore,
                                  completedQuizzes,
                                  isExpanded,
                                  onToggle
                                }: StatisticIslandProps) => {

  // 高度动画：56 -> 200
  const containerStyle = useAnimatedStyle(() => {
    return {
      height: withTiming(isExpanded ? 200 : 56, { duration: 300 }),
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
              {!isExpanded && <View style={styles.divider} />}

              {/* 右：完成数 */}
              <View style={[styles.statGroup, isExpanded && { marginLeft: 24 }]}>
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
                  {/* 模拟详情行 1 */}
                  <View style={styles.detailRow}>
                    <View style={styles.placeholderIcon} />
                    <View>
                      <View style={styles.valueRow}>
                        <Text style={styles.mainValue}>68</Text>
                        <Text style={styles.unitText}>%</Text>
                      </View>
                      <Text style={styles.label}>Science</Text>
                    </View>
                  </View>
                  {/* 模拟详情行 2 */}
                  <View style={styles.detailRow}>
                    <View style={styles.placeholderIcon} />
                    <View>
                      <View style={styles.valueRow}>
                        <Text style={styles.mainValue}>82</Text>
                        <Text style={styles.unitText}>%</Text>
                      </View>
                      <Text style={styles.label}>Math</Text>
                    </View>
                  </View>
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
  }
});