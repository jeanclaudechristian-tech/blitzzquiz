import React, { useState } from 'react';
import {View, Text, TouchableOpacity, StyleSheet, StyleProp, ViewStyle} from 'react-native';
import { QuestionModuleProps } from '@/types';
import { colors } from '@/components/blitzz/tokens';
import LottieView from 'lottie-react-native';

export const QCMModule = ({ question, onAnswer, disabled }: QuestionModuleProps) => {
    const { metadata } = question;
    const [selectedKey, setSelectedKey] = useState<string | null>(null);

    const options = [
        { key: 'A', text: metadata.choixA },
        { key: 'B', text: metadata.choixB },
        { key: 'C', text: metadata.choixC },
        { key: 'D', text: metadata.choixD },
    ];

    const handlePress = (key: string) => {
        if (disabled || selectedKey) return;

        setSelectedKey(key);
        const isCorrect = key === metadata.bonneReponse;

        // ✅ 立即通知父组件结果，但不再使用延时跳转
        onAnswer(key, isCorrect);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.questionText}>{question.texte}</Text>
            <View style={styles.optionsList}>
                {options.map((opt) => {
                    const isCorrectAnswer = opt.key === metadata.bonneReponse;
                    const isSelected = opt.key === selectedKey;

                    // 核心逻辑：
                    // 1. 如果是正确答案且已经选了 -> 变绿
                    // 2. 如果选错了 -> 选中的变红，正确的依然变绿
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
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        // ✅ 确保容器撑开
        width: '100%',
    },
    lottieIcon: {
        width: 40,  // 根据你的 Lottie JSON 画幅大小适当调整
        height: 40,
        position: 'absolute',
        // 如果发现动画偏离中心，可以使用 transform 微调
        transform: [{ scale: 1.2 }],
    },
    lottieIcon2: {
        width: 90,  // 根据你的 Lottie JSON 画幅大小适当调整
        height: 90,
        position: 'absolute',
        // 如果发现动画偏离中心，可以使用 transform 微调
        transform: [{ scale: 1.2 }],
    },
    iconSlot: {
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
        // zIndex 确保动画层级在上面
        zIndex: 10,
    },
    questionText: {
        fontSize: 24,
        fontWeight: '800',
        color: colors.dark,
        marginBottom: 40,
        textAlign: 'center',
        // ✅ 增加行高让长题目更优雅
        lineHeight: 32,
    },
    optionsList: {
        width: '100%',
        gap: 15,
    },
    optionCard: {
        backgroundColor: '#FFF',
        padding: 20, // ✅ 增加内衬，让卡片更厚实
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
        borderWidth: 2,
        borderColor: 'transparent',
        // ✅ 增加阴影，让它在位面上“浮”起来
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    // ✅ 成功位面：生机勃勃的绿
    correctCard: {
        borderColor: '#4CAF50',
        backgroundColor: '#F1F8E9',
    },
    // ❌ 失败位面：警示之红
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
    },
    optionKey: { color: colors.primary, fontWeight: '700' },
    optionText: { fontSize: 16, color: colors.dark, flex: 1 }
});