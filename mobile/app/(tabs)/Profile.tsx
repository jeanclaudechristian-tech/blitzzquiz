import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DarkButton } from '../../components/blitzz/DarkButton';
import { colors, fonts } from '../../components/blitzz/tokens';
import {useAuth} from "@/services/AuthContext";
import {PrimaryButton} from "@/components/blitzz/PrimaryButton";

export default function Profile({ onViewGroups }: { onViewGroups: () => void }) {
    const { user, logout, isLoading } = useAuth();

    return (
        <View style={styles.container}>
            {/* 欢迎语 */}
            <View style={styles.header}>
                <Text style={styles.welcomeLabel}>Profil de</Text>
                <Text style={styles.username}>
                    {user?.nickname || 'Voyageur'}
                </Text>
            </View>

            {/* 用户信息卡片 */}
            <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>ID</Text>
                    <Text style={styles.infoValue}>{user?.id}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Email</Text>
                    <Text style={styles.infoValue}>{user?.email}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Rôle</Text>
                    <Text style={[styles.infoValue, { color: colors.primary }]}>
                        {user?.role}
                    </Text>
                </View>
            </View>

            <View style={styles.spacer}></View>

            <PrimaryButton
                label="Mes Groupes"
                onPress={onViewGroups}
                isLoading={isLoading}
            />

            {/* 底部操作 */}
            <View style={styles.footer}>
                <DarkButton
                    label="Se déconnecter"
                    onPress={logout}
                    isLoading={isLoading}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, marginTop: 40 },
    header: { marginBottom: 40 },
    welcomeLabel: { fontFamily: fonts.inter, fontSize: 18, color: colors.secondaryText, marginBottom: 5 },
    username: { fontFamily: fonts.inter, fontSize: 36, fontWeight: '700', color: colors.dark },
    infoCard: { backgroundColor: colors.grayBg, borderRadius: 20, padding: 20 },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
    infoLabel: { fontFamily: fonts.inter, fontSize: 15, color: colors.secondaryText },
    infoValue: { fontFamily: fonts.inter, fontSize: 15, fontWeight: '600', color: colors.dark },
    divider: { height: 1, backgroundColor: colors.light, opacity: 0.5 },
    footer: { marginTop: 'auto', marginBottom: 20 },
    spacer: { flex: 0.1, flexDirection: 'row', justifyContent: 'space-between' },
});