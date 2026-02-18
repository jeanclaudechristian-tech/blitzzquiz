import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { colors, fonts } from '../../components/blitzz/tokens';
import { DarkButton } from '../../components/blitzz/DarkButton';
import { useGroupDetail } from '@/services/GroupDetailContext';
import {LoadingScreen} from "@/components/blitzz/LoadingScreen";
import {DangerButton} from "@/components/blitzz/DangerButton";
import {useGroups} from "@/services/GroupContext"; // ✅ 导入你的新 Context

export default function GroupDetail({ group, onBack }: { group: any, onBack: () => void }) {
    // ✅ 召唤专属 Context 的能力
    const { fullGroup, isLoading, loadGroupDetail } = useGroupDetail();
    const { leaveGroup } = useGroups();

    useEffect(() => {
        loadGroupDetail(group.id); // 只有进入这个位面才触发深度加载
    }, [group.id]);

    // 优先使用 fullGroup 的数据，如果还没加载完则回退到基础 group 信息
    const displayData = fullGroup || group;

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
            <Text style={styles.title}>{displayData.nom}</Text>
            <Text style={styles.subtitle}>Membres du groupe ({displayData.nb_membres || 0})</Text>
            {isLoading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <LoadingScreen />
                </View>
            ) : (
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
            )}

            <DangerButton
                label="Quitter le groupe"
                confirmTitle="Quitter ce groupe?"
                confirmMessage="Cette action est irréversible"
                onPress={async () => {
                    await leaveGroup(group.id);
                    onBack();
                }}
                style={{ marginTop: 10 }}
            />
            <DarkButton label="Retour" onPress={onBack} style={{ marginTop: 20 }} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, paddingTop: 20 },
    title: { fontFamily: fonts.inter, fontSize: 24, fontWeight: '700', color: colors.dark },
    subtitle: { fontSize: 16, color: colors.secondaryText, marginBottom: 20 },
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