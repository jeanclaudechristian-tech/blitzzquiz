import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
// 🎯 引入 Animated 和所需的动画
import Animated, { FadeInDown, FadeOutUp, LinearTransition } from 'react-native-reanimated';
import { QuestionModuleProps } from '@/types';
import { colors } from '@/components/blitzz/tokens';

export const FillInModule = ({ question, onAnswer, disabled }: QuestionModuleProps) => {
    const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
    const [isSubmitted, setIsSubmitted] = useState(false);
    const { metadata } = question;

    const handleSubmit = () => {
        const blanks = metadata.blanks || [];
        if (blanks.length === 0) {
            setIsSubmitted(true);
            onAnswer(userAnswers, 1);
            return;
        }

        let correctCount = 0;
        blanks.forEach((blank: any, index: number) => {
            const input = (userAnswers[index + 1] || '').trim().toLowerCase();
            const accepted = blank.accepted_answers.map((a: string) => a.toLowerCase().trim());
            if (accepted.includes(input)) correctCount++;
        });

        const points = correctCount / blanks.length;
        setIsSubmitted(true);
        onAnswer(userAnswers, points);
    };

    const renderContent = () => {
        if (!question.texte) return null;
        const parts = question.texte.split(/(\[\[\d+\]\])/g);

        return (
            <View style={styles.textFlow}>
                {parts.map(((part: string, i: number) => {
                    const match = part.match(/\[\[(\d+)\]\]/);
                    if (match) {
                        const num = match[1];
                        const blankData = metadata.blanks[parseInt(num) - 1];
                        const isActiveCheck = isSubmitted || disabled;
                        const isCorrect = isActiveCheck && blankData.accepted_answers.some(
                            (a: string) => a.toLowerCase().trim() === (userAnswers[num] || '').toLowerCase().trim()
                        );

                        // 🎯 修复：直接计算当前应该显示的背景色和边框色
                        const dynamicBg = isActiveCheck
                            ? (isCorrect ? '#F1F8E9' : '#FFEBEE')
                            : 'transparent';
                        const dynamicBorder = isActiveCheck
                            ? (isCorrect ? '#4CAF50' : '#FF5252')
                            : colors.primary;
                        const dynamicText = isActiveCheck
                            ? (isCorrect ? '#2E7D32' : '#C62828')
                            : colors.primary;

                        return (
                            <TextInput
                                key={i}
                                style={[
                                    styles.input,
                                    {
                                        backgroundColor: dynamicBg,
                                        borderBottomColor: dynamicBorder,
                                        color: dynamicText
                                    },
                                    { borderBottomColor: '#E0E0E0', opacity: 0.8 }
                                ]}
                                value={userAnswers[num] || ''}
                                onChangeText={(txt) => !isActiveCheck && setUserAnswers(prev => ({ ...prev, [num]: txt }))}
                                editable={!isActiveCheck}
                                placeholder="..."
                                placeholderTextColor={colors.primary + '50'}
                                textAlignVertical="center"
                            />
                        );
                    }
                    return <Text key={i} style={styles.plainText}>{part}</Text>;
                }))}
            </View>
        );
    };

    return (
        <Animated.View
            style={styles.container}
            layout={LinearTransition.duration(250)}
        >
            <View style={styles.contentWrapper}>
                {renderContent()}
            </View>

            {!isSubmitted && !disabled && (
                <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
                    <Text style={styles.submitBtnText}>Vérifier</Text>
                </TouchableOpacity>
            )}

            {(isSubmitted || disabled) && (
                <Animated.View
                    style={styles.feedback}
                    // 🎯 修复：确保使用 .duration() 实例化动画
                    entering={FadeInDown.duration(400)}
                    exiting={FadeOutUp.duration(200)}
                >
                    <Text style={styles.feedbackTitle}>Réponses attendues :</Text>
                    {metadata.blanks && metadata.blanks.map((b: any, i: number) => (
                        <Text key={i} style={styles.feedbackText}>
                            <Text style={{fontWeight: '600', color: colors.dark}}>#{i+1}</Text> : {b.accepted_answers.join(' / ')}
                        </Text>
                    ))}

                    {/* 🎯 新增：填空题的解释位面 */}
                    {question.explanation && (
                        <View style={styles.explanationBox}>
                            <View style={styles.explanationHeader}>
                                <Text style={styles.explanationTitle}>💡 Explication</Text>
                            </View>
                            <Text style={styles.explanationText}>{question.explanation}</Text>
                        </View>
                    )}
                </Animated.View>
            )}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        padding: 10,
        alignItems: 'center', // 确保按钮居中
    },
    contentWrapper: {
        // 💡 给题目内容加个下边距，防止跟按钮/答案贴太近
        marginBottom: 20,
    },
    textFlow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center',
    },
    plainText: {
        fontSize: 22, // 稍微调大一点点，更有质感
        lineHeight: 38, // 增加行高，让文字不拥挤
        color: colors.dark,
        fontWeight: '500'
    },
    input: {
        borderBottomWidth: 2,
        borderBottomColor: colors.primary,
        minWidth: 60, // 稍微加宽一点，防止文字溢出导致重绘
        marginHorizontal: 4,
        fontSize: 20,
        textAlign: 'center',
        color: colors.primary,
        fontWeight: 'bold',
        paddingVertical: 2, // 增加一点内衬，稳定文字位置
        paddingHorizontal: 8,
        borderRadius: 6,
        backgroundColor: 'transparent',
    },
    // 🎯 确保背景颜色优先级足够
    inputCorrectBg: {
        backgroundColor: '#F1F8E9',
        borderBottomColor: '#4CAF50',
        color: '#2E7D32', // 加深文字颜色提升可读性
    },
    inputWrongBg: {
        backgroundColor: '#FFEBEE',
        borderBottomColor: '#FF5252',
        color: '#C62828',
    },
    // 禁用态（Suivant点击后）
    inputDisabled: {
        borderBottomColor: '#E0E0E0',
        color: '#9E9E9E',
        backgroundColor: 'transparent',
    },
    errorText: { color: 'red', fontWeight: 'bold' },

    // 🎯 优化 Feedback 样式，看起来更高级
    feedback: {
        marginTop: 10, // 减小间距，让它更紧凑
        backgroundColor: '#FFF',
        padding: 18,
        borderRadius: 15,
        width: '100%',
        // 加一点阴影，让它更有层次感
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    feedbackTitle: {
        fontWeight: '800',
        fontSize: 16,
        color: colors.dark,
        marginBottom: 10,
    },
    feedbackText: {
        color: '#666',
        fontSize: 15,
        lineHeight: 24,
        marginBottom: 4,
    },

    // 🎯 优化提交按钮，圆润一些
    submitBtn: {
        backgroundColor: colors.primary,
        paddingVertical: 14,
        paddingHorizontal: 35,
        borderRadius: 25, // 全圆角
        marginTop: 10,
        alignItems: 'center',
        // 按钮阴影
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    explanationBox: {
        marginTop: 15,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#EEE', // 在 Feedback 内部加一条分割线
    },
    explanationHeader: {
        marginBottom: 6,
    },
    explanationTitle: {
        fontSize: 14,
        fontWeight: '800',
        color: colors.primary,
        textTransform: 'uppercase',
    },
    explanationText: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
        fontStyle: 'italic', // 填空题解释用斜体看起来更有“补充说明”的感觉
    },
    submitBtnText: { color: '#FFF', fontWeight: '700', fontSize: 16 }
});