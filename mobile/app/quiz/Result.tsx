// app/quiz/Result.tsx
import React, {useEffect, useRef, useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, SafeAreaView, TouchableWithoutFeedback} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors, fonts } from '@/components/blitzz/tokens';
import { Ionicons } from '@expo/vector-icons';
import Animated, {ZoomIn, FadeInUp, SlideOutDown, useSharedValue, useAnimatedStyle, withDelay, withSpring} from 'react-native-reanimated';
import LottieView from 'lottie-react-native';

export default function ResultPage() {
    const router = useRouter();
    const { score } = useLocalSearchParams<{ score: string }>();
    const finalScore = parseInt(score || '0');
    const lottieRef = useRef<LottieView>(null);

    // 评价位面：根据分数给出不同的称谓
    const getRankData = (score: number) => {
        if (score >= 90) {
            return {
                title: "L'Ancien",
                color: '#FFD700',
                // ⚠️ 替换为你的 90+ 专属动画（例如金奖杯、绚丽烟花）
                animation: require('../../assets/animated/Trophy.json'),
                loop: false,
                isInteractive: true
            };
        }
        if (score >= 60) {
            return {
                title: "Le Savant",
                color: '#4CAF50',
                // ⚠️ 替换为你的 60-89 专属动画（例如银牌、鼓掌）
                animation: require('../../assets/animated/good.json'),
                loop: true
            };
        }
        // 低于 60 分
        return {
            title: "Le Divinateur",
            color: '#9E9E9E',
            // ⚠️ 替换为你的 60- 专属动画（例如心碎、雨云、或者鼓励的表情）
            animation: require('../../assets/animated/faile.json'),
            loop: true // 失败动画通常播一次定格就好，不建议一直循环
        };
    };

    const handleReplayAnimation = () => {
        if (rankData.isInteractive && lottieRef.current) {
            lottieRef.current.reset(); // 重置到第一帧
            lottieRef.current.play();  // 重新播放
        }
    };

    const rankData = getRankData(finalScore);

    const scale = useSharedValue(0);

    const [isVisible, setIsVisible] = useState(true);

    const handleNav = (path: string, params?: any) => {
        setIsVisible(false);
        setTimeout(() => {
            if (params) {
                router.push({ pathname: path as any, params });
            } else {
                router.push(path as any);
            }
        }, 600);
    };

    const animatedTrophyStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
        };
    });

    useEffect(() => {
        // 奖杯的弹性入场动画
        scale.value = withDelay(300, withSpring(1, { damping: 10, stiffness: 80 }));
    }, [scale]);

    return (
        <SafeAreaView style={styles.container}>
            {/* ✅ 所有的内容都必须在 isVisible 的大括号内，并由一个顶级容器包裹 */}
            {isVisible && (
                <Animated.View
                    style={{ flex: 1 }}
                >
                    <View style={styles.content}>
                        {/* 勋章 */}
                        <View style={styles.trophyWrapper}>
                            <Animated.View style={animatedTrophyStyle}>
                                <TouchableWithoutFeedback onPress={handleReplayAnimation}>
                                    <LottieView
                                        ref={lottieRef} // ✅ 绑定 ref
                                        source={rankData.animation}
                                        style={styles.lottieTrophy}
                                        autoPlay
                                        loop={rankData.loop}
                                        speed={1}
                                    />
                                </TouchableWithoutFeedback>
                            </Animated.View>
                        </View>

                        {/* 分数 */}
                        <Animated.View entering={FadeInUp.delay(500)} exiting={SlideOutDown.duration(600).delay(140)}>
                            <Text style={[styles.rankTitle, { color: rankData.color }]}>{rankData.title}</Text>
                            <View style={styles.scoreContainer}>
                                <Text style={styles.scoreText}>{finalScore}</Text>
                                <Text style={styles.percentText}>%</Text>
                            </View>
                            <Text style={styles.description}>
                                {finalScore >= 60 ? "La vérité a été révélée!" : "Travailler plus fort!"}
                            </Text>
                        </Animated.View>

                        {/* 按钮 */}
                        <Animated.View entering={FadeInUp.delay(800)} exiting={SlideOutDown.duration(600).delay(80)} style={styles.footer}>
                            <TouchableOpacity
                                style={styles.mainButton}
                                onPress={() => handleNav("/(tabs)/Home")}
                            >
                                <Text style={styles.mainButtonText}>Retour au Sanctuaire</Text>
                            </TouchableOpacity>
                        </Animated.View>

                        <Animated.View entering={FadeInUp.delay(800)} exiting={SlideOutDown.duration(600).delay(0)} style={styles.footer}>
                            <TouchableOpacity
                                style={styles.secondaryButton}
                                onPress={() => router.back()}
                            >
                                <Text style={styles.secondaryButtonText}>Réessayer</Text>
                            </TouchableOpacity>
                        </Animated.View>
                    </View>
                </Animated.View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.light },
    content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 },
    iconContainer: { width: 150, height: 150, borderRadius: 75, justifyContent: 'center', alignItems: 'center', marginBottom: 30 },
    rankTitle: { fontSize: 20, fontWeight: '700', color: '#888', textTransform: 'uppercase', letterSpacing: 2, textAlign: 'center' },
    lottieTrophy: {
        width: 250, // 设定动画组件的大小，需要根据你的 JSON 调整
        height: 150,
        backgroundColor: 'transparent', // 确保背景透明
    },
    trophyWrapper: {
        marginBottom: 10,
    },
    scoreContainer: { flexDirection: 'row', alignItems: 'flex-end', marginVertical: 10, alignSelf: 'center' },
    scoreText: { fontSize: 80, fontWeight: '900', color: colors.dark },
    percentText: { fontSize: 30, fontWeight: '700', color: colors.primary, marginBottom: 15, marginLeft: 5 },
    description: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 50 },
    footer: { width: '100%', gap: 15, paddingTop: 20 },
    mainButton: {
        backgroundColor: colors.dark,
        height: 60,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5
    },
    mainButtonText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
    secondaryButton: { height: 60, borderRadius: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#EEE' },
    secondaryButtonText: { color: '#888', fontSize: 16, fontWeight: '600' }
});