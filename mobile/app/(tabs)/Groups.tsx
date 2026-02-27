import React, { useEffect, useState } from 'react';
import {View, Text, StyleSheet, FlatList, TextInput, Modal, TouchableOpacity} from 'react-native';
import { useGroups } from '@/services/GroupContext'; //
import { DarkButton } from '../../components/blitzz/DarkButton';
import { colors, fonts } from '../../components/blitzz/tokens';
import Animated, { FadeInUp } from 'react-native-reanimated';
import {useAuth} from "@/services/AuthContext";
import {Group} from "@/types";

export default function Groups({ onBack, onSelectGroup }: { onBack: () => void, onSelectGroup: (g: Group) => void } ) {
    const { groups, isLoading, fetchGroups, joinGroup } = useGroups();
    const [modalVisible, setModalVisible] = useState(false);
    const [inviteCode, setInviteCode] = useState('');

    useEffect(() => {
        fetchGroups(); //
    }, []);

    const { user } = useAuth();

    const handleJoin = async () => {
        if (inviteCode.length !== 6) return;
        const success = await joinGroup(inviteCode); //
        if (success) {
            setModalVisible(false);
            setInviteCode('');
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Mes Groupes</Text>
                <DarkButton
                    label="Rejoindre"
                    onPress={() => setModalVisible(true)}
                    style={styles.joinBtn}
                />
            </View>

            <FlatList
                data={groups} //
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => {
                    const isOwner = user?.id === item.owner_id; // 比对数据库里的 owner_id

                    return (
                        <TouchableOpacity onPress={() => onSelectGroup(item)}>
                            <Animated.View entering={FadeInUp} style={styles.card}>
                                <View>
                                    <Text style={styles.groupName}>{item.nom}</Text>
                                    {/* 身份标识：根据 isOwner 切换显示内容和颜色 */}
                                    <Text style={[
                                        styles.roleBadge,
                                        { color: isOwner ? colors.primary : colors.secondaryText }
                                    ]}>
                                        {isOwner ? 'Propriétaire' : 'Membre'}
                                    </Text>
                                </View>
                                <View style={styles.rightInfo}>
                                    <Text style={styles.codeSubtitle}>Code: {item.code_invitation}</Text>
                                </View>
                            </Animated.View>
                        </TouchableOpacity>
                    );
                }}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>Vous n'avez rejoint aucun groupe.</Text>
                }
            />

            <DarkButton label="Retour" onPress={onBack} style={styles.footerBtn} />

            {/* 加入小组的弹窗 */}
            <Modal visible={modalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Entrer le code</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="6-char code"
                            maxLength={6}
                            autoCapitalize="characters"
                            value={inviteCode}
                            onChangeText={setInviteCode}
                        />
                        <View style={styles.modalActions}>
                            <DarkButton label="Annuler" onPress={() => setModalVisible(false)} style={styles.modalBtn} />
                            <DarkButton label="OK" onPress={handleJoin} isLoading={isLoading} style={styles.modalBtn} />
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, marginTop: 30 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    title: { fontFamily: fonts.inter, fontSize: 28, fontWeight: '700', color: colors.dark },
    joinBtn: { width: 100, height: 40 },
    card: {
        backgroundColor: '#FFF',
        padding: 20,
        borderRadius: 15,
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        // 阴影增加浮空感
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    groupName: { fontSize: 18, fontWeight: '600', color: colors.dark },
    memberCount: { fontSize: 14, color: colors.secondaryText, marginTop: 4 },
    codeHint: { fontFamily: fonts.inter, color: colors.primary, fontWeight: 'bold' },
    footerBtn: { marginTop: 20 },
    modalOverlay: { flex: 1, justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: '#FFF', borderRadius: 20, padding: 30, borderWidth: 1, borderColor: "black" },
    modalTitle: { fontSize: 20, fontWeight: '700', marginBottom: 20, textAlign: 'center' },
    input: {
        borderBottomWidth: 2,
        borderBottomColor: colors.primary,
        fontSize: 24,
        textAlign: 'center',
        marginBottom: 30,
        fontFamily: fonts.inter
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
        width: '100%', // 确保父容器占满 Modal 宽度
    },
    modalBtn: {
        width: '48%', // 直接给个百分比，剩下的留给 gap
    },
    emptyText: { textAlign: 'center', color: colors.secondaryText, marginTop: 40 },
    roleBadge: {
        fontFamily: fonts.inter,
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
        marginTop: 2,
    },
    rightInfo: {
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
    codeSubtitle: {
        fontFamily: fonts.inter,
        fontSize: 13,
        color: colors.secondaryText,
        fontWeight: '500',
    },
});