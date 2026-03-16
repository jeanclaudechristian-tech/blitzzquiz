import { QCMModule } from '@/app/quiz/QCMQuestion';
import { QuestionModuleProps } from '@/types';
import {Alert, StyleSheet, View, BackHandler} from 'react-native';
import { SafeAreaView } from 'react-native';
import {useQuizzes} from "@/services/QuizContext";
import { colors } from '@/components/blitzz/tokens';
import {useEffect, useState} from "react";
import {useLocalSearchParams, useRouter} from "expo-router";
import Animated, {FadeIn, FadeInUp, FadeOut} from 'react-native-reanimated';
import { DarkButton } from '@/components/blitzz/DarkButton';
import { LoadingScreen } from '@/components/blitzz/LoadingScreen';
import { Stack } from 'expo-router'; // 引入 Stack 来锁定 iOS 侧滑
import { TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// 🎯 组件映射字典
const MODULE_MAP: Record<string, React.FC<QuestionModuleProps>> = {
    'QCM': QCMModule,
    // 'TRUE_FALSE': TrueFalseModule,
};

export default function QuizPlayer() {
    const [isVisible, setIsVisible] = useState(true);
    const router = useRouter();

    const handleNav = (path: string, params?: any) => {
        setIsVisible(false);
        setTimeout(() => {
            if (params) {
                router.replace({ pathname: path as any, params });
            } else {
                router.replace(path as any);
            }
        }, 400);
    };
    const handleExitAttempt = () => {
        Alert.alert(
            "Quitter l'épreuve ?",
            "Votre progression sera perdue.",
            [
                { text: "Rester", style: "cancel" },
                {
                    text: "Quitter",
                    onPress: () => handleNav("/(tabs)/Home"),
                    style: "destructive"
                }
            ]
        );
        return true;
    };

    const [hasAnswered, setHasAnswered] = useState(false);
    const [lastAnswerCorrect, setLastAnswerCorrect] = useState(false);

    const { currentQuestions } = useQuizzes();
    const [currentIndex, setCurrentIndex] = useState(0);

    const currentQuestion = currentQuestions[currentIndex];

    const [score, setScore] = useState(0);
    const { submitScore } = useQuizzes();

    const [isSubmitting, setIsSubmitting] = useState(false);

    // 根据类型选择组件，找不到则回退到 QCM
    const ActiveModule = MODULE_MAP[currentQuestion.type] || QCMModule;

    const handleAnswer = (answer: any, isCorrect: boolean) => {
        // 1. 记录得分（但不立即跳下一题）
        if (isCorrect) setScore(prev => prev + 1);
        setLastAnswerCorrect(isCorrect);
        setHasAnswered(true); // ✅ 激活“下一题”按钮的位面
    };

    useEffect(() => {
        const subscription = BackHandler.addEventListener('hardwareBackPress', handleExitAttempt);
        return () => subscription.remove();
    }, []);

    const nextStep = async () => {
        if (currentIndex < currentQuestions.length - 1) {
            // 前往下一题
            setHasAnswered(false);
            setCurrentIndex(prev => prev + 1);
        } else {
            // 🏁 最终结算
            // ✅ 开启加载动画
            setIsSubmitting(true);

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
                Alert.alert("Erreur", "La soumission a échoué. Veuillez réessayer.");
            }
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ gestureEnabled: false }} />
            {isSubmitting ? (
                // ✅ 提交期间，展示呼吸灯加载位面
                <LoadingScreen />
            ) : (
                <View style={{ flex: 1 }}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={handleExitAttempt} style={styles.backButton}>
                            <Ionicons name="chevron-back" size={24} color={colors.primary} />
                            <Text style={styles.backText}>Annuler</Text>
                        </TouchableOpacity>
                    </View>
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
                                        label={currentIndex === currentQuestions.length - 1 ? "Terminer l'épreuve" : "Question Suivante"}
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
    header: {
        height: 60,
        paddingHorizontal: 20,
        justifyContent: 'center',
    },
    backButton: {
        paddingVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },
    backText: {
        color: colors.primary,
        fontSize: 16,
        fontWeight: '600',
    },
});