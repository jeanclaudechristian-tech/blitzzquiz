import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { colors, fonts } from '../../components/blitzz/tokens';
import { DarkButton } from '../../components/blitzz/DarkButton';
import { useGroupDetail } from '@/services/GroupDetailContext';
import {LoadingScreen} from "@/components/blitzz/LoadingScreen";
import {DangerButton} from "@/components/blitzz/DangerButton";
import {useGroups} from "@/services/GroupContext";
import {useAuth} from "@/services/AuthContext"; // ✅ 导入你的新 Context
import { QuizCard } from '@/components/blitzz/QuizCard';
import { Quiz } from '@/types';
import api from '@/services/api';

export default function GroupDetail({ group, onBack, onSelectQuiz }: { group: any, onBack: () => void, onSelectQuiz: (quiz: Quiz) => void}) {
    // ✅ 召唤专属 Context 的能力
    const { user } = useAuth(); // ✅ 获取当前登录的用户
    const { fullGroup, isLoading, loadGroupDetail } = useGroupDetail();
    const { leaveGroup, deleteGroup, fetchGroupQuizzes: fetchQuizzesFromApi } = useGroups();
    // ✅ 控制当前显示哪个位面 ('members' 或 'quizzes')
    const [activeTab, setActiveTab] = useState<'members' | 'quizzes'>('members');
    // ✅ 存储该群组的测验列表
    const [groupQuizzes, setGroupQuizzes] = useState<Quiz[]>([]);
    const [isLoadingQuizzes, setIsLoadingQuizzes] = useState(false);


    useEffect(() => {
        loadGroupDetail(group.id); // 只有进入这个位面才触发深度加载
    }, [group.id]);

    useEffect(() => {
        if (activeTab === 'quizzes' && groupQuizzes.length === 0) {
            fetchGroupQuizzes();
        }
    }, [activeTab]);

    const fetchGroupQuizzes = async () => {
        setIsLoadingQuizzes(true);
        try {
            // ✅ 直接调用 Context 提供的方法
            const quizzes = await fetchQuizzesFromApi(group.id);
            setGroupQuizzes(quizzes);
        } catch (error) {
            // 错误已经在 Context 里拦截并 Alert 了，这里不需要额外处理
        } finally {
            setIsLoadingQuizzes(false);
        }
    };

    // 优先使用 fullGroup 的数据，如果还没加载完则回退到基础 group 信息
    const displayData = fullGroup || group;
    const isMeTheOwner = user?.id === (fullGroup?.owner_id || group?.owner_id);

    const sortedMembers = fullGroup?.members ? [...fullGroup.members].sort((a, b) => {
        const ownerId = fullGroup?.owner_id || group?.owner_id;

        // 如果 a 是所有者，排到前面 (-1)
        if (Number(a.id) === Number(ownerId)) return -1;
        // 如果 b 是所有者，排到后面 (1)
        if (Number(b.id) === Number(ownerId)) return 1;

        return 0; // 其他人维持原样
    }) : [];

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <View style={styles.headerTexts}>
                    <Text style={styles.title} numberOfLines={1}>{displayData.nom}</Text>
                    <Text style={styles.subtitle}>
                        {activeTab === 'members'
                            ? `Membres du groupe (${displayData.nb_membres || 0})`
                            : `Quiz du groupe`}
                    </Text>
                </View>

                {/* ✅ 切换按钮 */}
                <TouchableOpacity
                    style={styles.toggleButton}
                    onPress={() => setActiveTab(prev => prev === 'members' ? 'quizzes' : 'members')}
                >
                    <Text style={styles.toggleButtonText}>
                        {activeTab === 'members' ? 'Voir Quiz' : 'Voir Membres'}
                    </Text>
                </TouchableOpacity>
            </View>
            {isLoading || isLoadingQuizzes ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <LoadingScreen />
                </View>
            ) : activeTab === 'members' ? (
                // 👥 成员列表
                <FlatList
                    data={sortedMembers}
                    keyExtractor={(m) => m.id.toString()}
                    renderItem={({ item }) => {
                        const actualOwnerId = fullGroup?.owner_id || group?.owner_id;
                        const isGroupOwner = actualOwnerId && Number(item.id) === Number(actualOwnerId);
                        return (
                            <View style={styles.memberCard}>
                                <View>
                                    <Text style={styles.memberName}>{item.nickname}</Text>
                                    <Text style={styles.systemRole}>{item.role}</Text>
                                </View>
                                <Text style={[
                                    styles.groupRole,
                                    { color: isGroupOwner ? colors.primary : colors.secondaryText }
                                ]}>
                                    {isGroupOwner ? 'Propriétaire' : 'Membre'}
                                </Text>
                            </View>
                        );
                    }}
                    ListEmptyComponent={<Text style={styles.emptyText}>Aucun membre à afficher.</Text>}
                />
            ) : (
                // 📝 测验列表
                <FlatList
                    data={groupQuizzes}
                    keyExtractor={(q) => q.id.toString()}
                    style={{ marginHorizontal: -15 }} // 抵消父级 padding 保证阴影完整
                    contentContainerStyle={{ paddingHorizontal: 15, paddingBottom: 20 }}
                    renderItem={({ item }) => (
                        <QuizCard
                            quiz={item}
                            onPress={() => onSelectQuiz(item)} // ✅ 点击触发弹窗
                        />
                    )}
                    ListEmptyComponent={<Text style={styles.emptyText}>Aucun quiz assigné à ce groupe.</Text>}
                />
            )}

            <DangerButton
                // ✅ 根据身份切换标签
                label={isMeTheOwner ? "Dissoudre le groupe" : "Quitter le groupe"}
                confirmTitle={isMeTheOwner ? "Suppression Totale" : "Rompre le contrat"}
                confirmMessage={isMeTheOwner
                    ? "Voulez-vous vraiment supprimer ce groupe et tous ses membres ?"
                    : "Voulez-vous vraiment quitter ce plan de réalité ?"
                }
                onPress={async () => {
                    if (isMeTheOwner) {
                        await deleteGroup(group.id); // 执行遣散
                    } else {
                        await leaveGroup(group.id); // 执行退出
                    }
                    onBack(); // 无论哪种，执行完都回列表
                }}
                style={{ marginTop: 10 }}
            />

            <DarkButton label="Retour" onPress={onBack} style={{ marginTop: 20 }} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, paddingTop: 20 },
    // ✅ 新增 Header 布局样式
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    headerTexts: {
        flex: 1, // 占据剩余空间，防止文字过长推挤按钮
        paddingRight: 10,
    },
    toggleButton: {
        backgroundColor: colors.primary + '15', // 带一点透明度的品牌色
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
    },
    toggleButtonText: {
        color: colors.primary,
        fontFamily: fonts.inter,
        fontWeight: '700',
        fontSize: 14,
    },
    // 原有样式微调
    title: { fontFamily: fonts.inter, fontSize: 24, fontWeight: '700', color: colors.dark, marginBottom: 4 },
    subtitle: { fontSize: 16, color: colors.secondaryText },
    memberCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#EEE'
    },
    memberName: { fontSize: 18, fontWeight: '500' },
    systemRole: { fontSize: 12, color: '#999', textTransform: 'uppercase' },
    groupRole: { fontWeight: '700', fontSize: 14 },
    emptyText: {
        textAlign: 'center',
        color: colors.secondaryText,
        marginTop: 40,
        fontFamily: fonts.inter,
        fontSize: 14,
    },
});