import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Platform} from 'react-native';
import { colors } from './tokens';
import { Quiz } from '@/types'; // 确保指向你刚才上传的 index.ts
import { Ionicons } from '@expo/vector-icons';
import { HighlightText } from './HighlightText';

interface QuizCardProps {
    quiz: Quiz;
    onPress: (quiz: Quiz) => void;
    searchQuery?: string;
}

export const QuizCard = ({ quiz, onPress, searchQuery }: QuizCardProps) => {
    return (
        <TouchableOpacity
            style={[
                styles.card,
                // ✅ 动态注入金色边框逻辑
                quiz.is_recommended && styles.recommendedBorder
            ]}
            onPress={() => onPress(quiz)}
            activeOpacity={0.8}
        >
            <View style={styles.content}>
                {/* 顶部：类别标签 (使用 quiz.category) */}
                <View style={styles.header}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <View style={styles.categoryBadge}>
                            <Text style={styles.categoryText}>
                                {quiz.category || 'Général'}
                            </Text>
                        </View>

                        {/* 🎯 推荐标识：只在那前三个被标记的 Quiz 上闪耀 */}
                        {quiz.is_recommended && (
                            <View style={styles.recommendedBadge}>
                                <Ionicons name="sparkles" size={12} color={colors.primary} />
                                <Text style={styles.recommendedText}>Recommandé</Text>
                            </View>
                        )}
                    </View>
                    {/* 使用 quiz.code_quiz 作为副标题或标识 */}
                    <Text style={styles.codeText}>#{quiz.code_quiz}</Text>
                </View>

                {/* 中部：使用 quiz.titre */}
                <HighlightText
                    text={quiz.titre || "Titre inconnu"}
                    highlightKeyword={searchQuery} // 传入搜索词
                    style={styles.title}
                />

                {/* 使用 quiz.description */}
                {quiz.description || quiz.description_highlight ? (
                    <HighlightText
                        text={quiz.description_highlight || quiz.description || ''}
                        highlightKeyword={searchQuery}
                        style={styles.description}
                        numberOfLines={2}
                    />
                ) : null}

                {/* 底部：状态展示 */}
                <View style={styles.footer}>
                    <View style={styles.infoRow}>
                        <Ionicons name="time-outline" size={16} color="#666" />
                        <Text style={styles.infoText}>
                            {/* 格式化创建时间或显示公开状态 */}
                            {quiz.is_public ? 'Public' : 'Privé'}
                        </Text>
                    </View>

                    <View style={styles.playButton}>
                        <Ionicons name="information-circle-outline" size={24} color={colors.primary} />
                        <Text style={styles.playLabel}>Détails</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    content: { width: '100%' },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    recommendedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#FFF9C4', // 淡淡的金色背景
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
    },
    recommendedText: {
        color: colors.primary,
        fontSize: 10,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    recommendedBorder: {
        borderColor: colors.primary,
        borderWidth: 2, // 加粗一点更有质感
        // 增加淡淡的金色光晕感 (iOS)
        shadowColor: colors.primary,
        shadowOpacity: 0.3,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 0 },
        // Android 光晕效果有限，主要靠边框
        elevation: 5,
    },
    categoryBadge: {
        backgroundColor: colors.primary + '15',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 10,
    },
    categoryText: {
        color: colors.primary,
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    codeText: {
        color: '#BBB',
        fontSize: 12,
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    title: {
        fontSize: 20,
        fontWeight: '800',
        color: colors.dark,
        marginBottom: 6,
    },
    description: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
        marginBottom: 16,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        paddingTop: 12,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    infoText: {
        color: '#666',
        fontSize: 14,
        fontWeight: '500',
    },
    playButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    playLabel: {
        color: colors.primary,
        fontWeight: '700',
        fontSize: 14,
    }
});