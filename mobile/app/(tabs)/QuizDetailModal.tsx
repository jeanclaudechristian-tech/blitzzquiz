// components/blitzz/QuizDetailModal.tsx
import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, Modal, Pressable, TouchableOpacity, ActivityIndicator, Platform} from 'react-native';
import { colors } from '@/components/blitzz/tokens';
import { Quiz } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import Animated, { SlideInDown, SlideOutDown } from 'react-native-reanimated';
import {useGroups} from "@/services/GroupContext";
import {useAuth} from "@/services/AuthContext";

interface QuizDetailModalProps {
    quiz: Quiz | null;
    isVisible: boolean;
    onClose: () => void;
    onStart: (quiz: Quiz) => void;
    groupId?: number;
    isStarting?: boolean;
}

export const QuizDetailModal = ({ quiz, isVisible, onClose, onStart, groupId, isStarting }: QuizDetailModalProps) => {
    const { fetchRanking } = useGroups();
    const { user } = useAuth(); // 获取当前用户，用来找自己的排名
    const [ranking, setRanking] = useState<any[]>([]);
    const [isLoadingRank, setIsLoadingRank] = useState(false);

    // ✅ 当弹窗打开且存在 groupId 时，拉取排行榜
    useEffect(() => {
        if (isVisible && quiz && groupId) {
            setIsLoadingRank(true);
            fetchRanking(groupId, quiz.id).then((data) => {
                setRanking(data || []);
                setIsLoadingRank(false);
            });
        } else {
            // 弹窗关闭或不在群组里时，清空排名数据
            setRanking([]);
        }
    }, [isVisible, quiz, groupId]);

    if (!quiz) return null;

    // 🏆 排名逻辑处理
    const top3 = ranking.slice(0, 3);
    const myRankIndex = ranking.findIndex((r) => r.user_id === user?.id);
    const amIOutsideTop3 = myRankIndex >= 3; // 如果我没进前三，就显示在下面

    return (
        <Modal visible={isVisible} transparent animationType="fade">
            <Pressable style={styles.overlay} onPress={onClose}>
                <Animated.View
                    entering={SlideInDown}
                    exiting={SlideOutDown}
                    style={styles.sheet}
                >
                    <Pressable style={{ width: '100%' }}>
                        <View style={styles.handle} />

                        <Text style={styles.category}>{quiz.category || 'Général'}</Text>
                        <Text style={styles.title}>{quiz.titre}</Text>
                        <Text style={styles.description}>{quiz.description}</Text>

                        {/* ✅ 排名位面：只有传递了 groupId 才会渲染 */}
                        {groupId && (
                            <View style={styles.rankingContainer}>
                                <Text style={styles.rankingTitle}>🏆 Classement du Groupe</Text>

                                {isLoadingRank ? (
                                    <ActivityIndicator color={colors.primary} style={{ marginVertical: 10 }} />
                                ) : ranking.length === 0 ? (
                                    <Text style={styles.noRankText}>Soyez le premier à relever le défi !</Text>
                                ) : (
                                    <View>
                                        {/* 前三名 */}
                                        {top3.map((r, index) => (
                                            <View key={r.id} style={styles.rankRow}>
                                                <Text style={styles.rankIcon}>
                                                    {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                                                </Text>
                                                <Text style={styles.rankName} numberOfLines={1}>
                                                    {r.user?.nickname} {r.user_id === user?.id && "(Moi)"}
                                                </Text>
                                                <Text style={styles.rankScore}>{r.score}%</Text>
                                            </View>
                                        ))}

                                        {/* 如果自己不在前三，单独在下方显示 */}
                                        {amIOutsideTop3 && (
                                            <>
                                                <View style={styles.rankDots}>
                                                    <View style={styles.dot} /><View style={styles.dot} />
                                                </View>
                                                <View style={[styles.rankRow, styles.myRankRow]}>
                                                    <Text style={styles.rankNumber}>{myRankIndex + 1}</Text>
                                                    <Text style={[styles.rankName, { color: colors.primary, fontWeight: '700' }]} numberOfLines={1}>
                                                        {ranking[myRankIndex].user?.nickname} (Moi)
                                                    </Text>
                                                    <Text style={styles.rankScore}>{ranking[myRankIndex].score}%</Text>
                                                </View>
                                            </>
                                        )}
                                    </View>
                                )}
                            </View>
                        )}

                        <View style={styles.infoGrid}>
                            <View style={styles.infoBox}>
                                <Ionicons name="help-circle-outline" size={20} color={colors.primary} />
                                <Text style={styles.infoValue}>{quiz.questions_count || '--'}</Text>
                                <Text style={styles.infoLabel}>Questions</Text>
                            </View>
                            <View style={styles.infoBox}>
                                <Ionicons name="time-outline" size={20} color={colors.primary} />
                                <Text style={styles.infoValue}>5 min</Text>
                                <Text style={styles.infoLabel}>Estimation</Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={styles.startButton}
                            onPress={() => onStart(quiz)}
                            disabled={isStarting}
                        >
                            {isStarting ? (
                                <ActivityIndicator size="small" color={colors.light} />
                            ) : (
                                <>
                                    <Text style={styles.startText}>Lancer le Quiz</Text>
                                    <Ionicons name="flash" size={20} color="#FFF" />
                                </>
                            )}
                        </TouchableOpacity>
                    </Pressable>
                </Animated.View>
            </Pressable>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    sheet: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 30,
        paddingTop: 15,
        alignItems: 'center',
        // 限制最大高度，防止排名太长超出屏幕
        maxHeight: '90%',
        paddingBottom: Platform.OS === 'ios' ? 40 : 30,
    },
    handle: { width: 40, height: 5, backgroundColor: '#EEE', borderRadius: 3, marginBottom: 25 },
    category: { color: colors.primary, fontWeight: '700', fontSize: 14, marginBottom: 8, textTransform: 'uppercase', textAlign: 'center' },
    title: { fontSize: 24, fontWeight: '800', color: colors.dark, textAlign: 'center', marginBottom: 12 },
    description: { fontSize: 16, color: '#666', textAlign: 'center', lineHeight: 24, marginBottom: 20 },

    // ✅ 排行榜专属样式
    rankingContainer: {
        width: '100%',
        backgroundColor: '#F8F9FA',
        borderRadius: 20,
        padding: 15,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#EEE',
    },
    rankingTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: colors.dark,
        marginBottom: 10,
        textAlign: 'center',
    },
    noRankText: {
        textAlign: 'center',
        color: '#888',
        fontStyle: 'italic',
        marginVertical: 10,
    },
    rankRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
    },
    myRankRow: {
        borderBottomWidth: 0,
        backgroundColor: colors.primary + '10', // 给自己的行加一点点背景色高亮
        borderRadius: 10,
        paddingHorizontal: 10,
    },
    rankIcon: { width: 30, fontSize: 18, textAlign: 'center' },
    rankNumber: { width: 30, fontSize: 14, fontWeight: '800', color: '#999', textAlign: 'center' },
    rankName: { flex: 1, fontSize: 14, fontWeight: '600', color: '#444', marginLeft: 10 },
    rankScore: { fontSize: 16, fontWeight: '900', color: colors.dark },
    rankDots: { alignItems: 'center', marginVertical: 4, gap: 4 },
    dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#CCC' },

    infoGrid: { flexDirection: 'row', gap: 20, marginBottom: 30 },
    infoBox: { flex: 1, backgroundColor: '#F8F9FA', padding: 15, borderRadius: 20, alignItems: 'center' },
    infoValue: { fontSize: 18, fontWeight: '700', color: colors.dark, marginTop: 5 },
    infoLabel: { fontSize: 12, color: '#999' },
    startButton: {
        backgroundColor: colors.primary,
        width: '100%',
        height: 60,
        borderRadius: 20,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10
    },
    startText: { color: '#FFF', fontSize: 18, fontWeight: '700' }
});