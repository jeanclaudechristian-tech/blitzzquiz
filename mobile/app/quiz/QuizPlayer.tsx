import React, { useEffect, useState } from 'react';
import { Alert, BackHandler, Platform, StyleSheet, View, SafeAreaView, TouchableOpacity, Text } from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import Animated, { FadeIn, FadeOut, FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import { useQuizzes } from "@/services/QuizContext";
import { colors } from '@/components/blitzz/tokens';
import { DarkButton } from '@/components/blitzz/DarkButton';
import { LoadingScreen } from '@/components/blitzz/LoadingScreen';

// 🎯 导入所有题型组件
import { QCMModule } from '@/app/quiz/QCMQuestion';
import { TFModule } from '@/app/quiz/TFQuestion';       // 确保路径正确
import { FillInModule } from '@/app/quiz/FillInQuestion'; // 确保路径正确
import { QuestionModuleProps } from '@/types';

// 🎯 统一组件映射表
const MODULE_MAP: Record<string, React.FC<QuestionModuleProps>> = {
    'QCM': QCMModule,
    'TF': TFModule,
    'FILL_IN': FillInModule,
};

export default function QuizPlayer() {
    const router = useRouter();
    const { currentQuestions, submitScore } = useQuizzes();

    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0); // 💡 支持浮点数总分
    const [hasAnswered, setHasAnswered] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isVisible, setIsVisible] = useState(true);

    const currentQuestion = currentQuestions[currentIndex];

    // 退出确认逻辑
    const handleExitAttempt = () => {
        Alert.alert("Quitter l'épreuve ?", "Votre progression sera perdue.", [
            { text: "Rester", style: "cancel" },
            { text: "Quitter", onPress: () => router.push("/(tabs)/Home"), style: "destructive" }
        ]);
        return true;
    };

    useEffect(() => {
        const sub = BackHandler.addEventListener('hardwareBackPress', handleExitAttempt);
        return () => sub.remove();
    }, []);

    // 🎯 处理答案收集：无论是 1 分还是 0.5 分，直接累加
    const handleAnswer = (answer: any, pointsEarned: number) => {
        setScore(prev => prev + pointsEarned);
        setHasAnswered(true);
    };

    const nextStep = async () => {
        if (currentIndex < currentQuestions.length - 1) {
            setHasAnswered(false);
            setCurrentIndex(prev => prev + 1);
        } else {
            setIsSubmitting(true);
            // 🏁 最终百分比结算：(总得分 / 总题数) * 100
            const finalPercentage = Math.round((score / currentQuestions.length) * 100);
            const success = await submitScore(currentQuestion.quiz_id, finalPercentage);

            if (success) {
                router.replace({
                    pathname: "/quiz/Result",
                    params: {
                        score: finalPercentage.toString(),
                        quizId: currentQuestion.quiz_id.toString()
                    }
                });
            } else {
                setIsSubmitting(false);
                Alert.alert("Erreur", "La soumission a échoué.");
            }
        }
    };

    if (!currentQuestion) return <LoadingScreen />;

    const ActiveModule = MODULE_MAP[currentQuestion.type] || QCMModule;

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ gestureEnabled: false }} />
            {isSubmitting ? <LoadingScreen /> : (
                <View style={{ flex: 1 }}>
                    {Platform.OS === 'ios' && (
                        <View style={styles.header}>
                            <TouchableOpacity onPress={handleExitAttempt}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Ionicons name="chevron-back" size={24} color={colors.primary} />
                                    <Text style={styles.backText}>Annuler</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    )}
                    <View style={styles.mainContent}>
                        <Animated.View
                            key={currentIndex}
                            entering={FadeIn.duration(400)}
                            exiting={FadeOut.duration(400)}
                            style={{ flex: 1, justifyContent: 'center' }}
                        >
                            <ActiveModule
                                question={currentQuestion}
                                onAnswer={handleAnswer}
                                disabled={hasAnswered}
                            />
                        </Animated.View>

                        <View style={styles.footer}>
                            {hasAnswered && (
                                <Animated.View entering={FadeInUp}>
                                    <DarkButton
                                        label={currentIndex === currentQuestions.length - 1 ? "Terminer" : "Suivant"}
                                        onPress={nextStep}
                                    />
                                </Animated.View>
                            )}
                        </View>
                    </View>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.light,
    },
    mainContent: {
        flex: 1,
        // ✅ 给予左右各 30 的标准留空
        paddingHorizontal: 30,
        // ✅ 整体内容在垂直位面上居中
        justifyContent: 'center',
    },
    footer: {
        paddingBottom: 40,
        height: 100, // 为按钮预留固定位面，防止布局抖动
    },
    backButton: {
        paddingVertical: 10,
        flexDirection: 'row',
        justifyContent: 'center',
    },
    backText: {
        color: colors.primary,
        fontSize: 16,
        fontWeight: '600',
    },
    header: {
        height: 60,
        paddingHorizontal: 20,
        justifyContent: 'center',
    },
});