import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { QuestionModuleProps } from '@/types';
import { colors } from '@/components/blitzz/tokens';
import LottieView from 'lottie-react-native';
import Animated, {FadeIn, LinearTransition} from 'react-native-reanimated';
import {Ionicons} from "@expo/vector-icons";

export const TFModule = ({ question, onAnswer, disabled }: QuestionModuleProps) => {
    const { metadata } = question;
    const [selectedKey, setSelectedKey] = useState<string | null>(null);

    // 🎯 强制模拟 QCM 的选项结构
    const options = [
        { key: 'A', text: 'Vrai' },
        { key: 'B', text: 'Faux' },
    ];

    const handlePress = (key: string) => {
        if (disabled || selectedKey) return;

        setSelectedKey(key);
        const isCorrect = key === metadata.bonneReponse;

        // 保持与 QuizPlayer 的兼容性
        onAnswer(key, isCorrect ? 1 : 0);
    };

    return (
        <Animated.View
            style={styles.container}
            layout={LinearTransition.duration(300)} // 🎯 这里的 layout 负责整体平滑移动
        >
            <Text style={styles.questionText}>{question.texte}</Text>
            <View style={styles.optionsList}>
                {options.map((opt) => {
                    const isCorrectAnswer = opt.key === metadata.bonneReponse;
                    const isSelected = opt.key === selectedKey;

                    // 🎯 完全复刻 QCM 的颜色切换逻辑
                    let cardStyle: StyleProp<ViewStyle> = styles.optionCard;
                    if (selectedKey) {
                        if (isCorrectAnswer) cardStyle = [styles.optionCard, styles.correctCard];
                        else if (isSelected) cardStyle = [styles.optionCard, styles.wrongCard];
                    }

                    return (
                        <TouchableOpacity
                            key={opt.key}
                            style={cardStyle}
                            disabled={disabled || !!selectedKey}
                            onPress={() => handlePress(opt.key)}
                        >
                            <View style={styles.iconSlot}>
                                {selectedKey && isCorrectAnswer ? (
                                    <LottieView
                                        source={require('../../assets/animated/Success-answer.json')}
                                        autoPlay
                                        loop={false}
                                        style={styles.lottieIcon}
                                    />
                                ) : selectedKey && isSelected && !isCorrectAnswer ? (
                                    <LottieView
                                        source={require('../../assets/animated/Error-animation.json')}
                                        autoPlay
                                        loop={false}
                                        style={styles.lottieIcon2}
                                        renderMode="SOFTWARE"
                                    />
                                ) : (
                                    <View style={styles.keyCircle}>
                                        <Text style={styles.optionKey}>{opt.key}</Text>
                                    </View>
                                )}
                            </View>

                            <Text style={styles.optionText}>{opt.text}</Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
            {selectedKey && question.explanation && (
                <Animated.View
                    entering={FadeIn.duration(400)}
                    style={styles.explanationContainer}
                >
                    <View style={styles.explanationHeader}>
                        <Ionicons name="information-circle" size={18} color={colors.primary} />
                        <Text style={styles.explanationTitle}>Explication</Text>
                    </View>
                    <Text style={styles.explanationText}>{question.explanation}</Text>
                </Animated.View>
            )}
        </Animated.View>
    );
};

// 🎯 样式完全照搬 QCM
const styles = StyleSheet.create({
    container: { width: '100%' },
    lottieIcon: {
        width: 40,
        height: 40,
        position: 'absolute',
        transform: [{ scale: 1.2 }],
    },
    lottieIcon2: {
        width: 90,
        height: 90,
        position: 'absolute',
        transform: [{ scale: 1.2 }],
    },
    iconSlot: {
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    questionText: {
        fontSize: 24,
        fontWeight: '800',
        color: colors.dark,
        marginBottom: 40,
        textAlign: 'center',
        lineHeight: 32,
    },
    optionsList: { width: '100%', gap: 15 },
    optionCard: {
        backgroundColor: '#FFF',
        padding: 20,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
        borderWidth: 2,
        borderColor: 'transparent',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    correctCard: {
        borderColor: '#4CAF50',
        backgroundColor: '#F1F8E9',
    },
    wrongCard: {
        borderColor: '#FF5252',
        backgroundColor: '#FFEBEE',
    },
    keyCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.primary + '15',
        justifyContent: 'center',
        alignItems: 'center'
    },explanationContainer: {
        marginTop: 20,
        padding: 20,
        backgroundColor: colors.primary + '08', // 极淡的主题色背景
        borderRadius: 15,
        borderLeftWidth: 4,
        borderLeftColor: colors.primary,
    },
    explanationHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    explanationTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.primary,
        textTransform: 'uppercase',
    },
    explanationText: {
        fontSize: 15,
        color: '#555',
        lineHeight: 22,
    },
    optionKey: { color: colors.primary, fontWeight: '700' },
    optionText: { fontSize: 18, color: colors.dark, flex: 1, fontWeight: '600' }
});