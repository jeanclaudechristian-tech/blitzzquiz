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
            style={styles.card}
            onPress={() => onPress(quiz)}
            activeOpacity={0.8}
        >
            <View style={styles.content}>
                {/* 顶部：类别标签 (使用 quiz.category) */}
                <View style={styles.header}>
                    <View style={styles.categoryBadge}>
                        <Text style={styles.categoryText}>
                            {quiz.category || 'Général'}
                        </Text>
                    </View>
                    {/* 使用 quiz.code_quiz 作为副标题或标识 */}
                    <Text style={styles.codeText}>#{quiz.code_quiz}</Text>
                </View>

                {/* 中部：使用 quiz.titre */}
                <HighlightText
                    text={quiz.titre}
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