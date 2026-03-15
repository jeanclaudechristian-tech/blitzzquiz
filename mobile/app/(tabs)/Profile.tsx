import React from 'react';
import { View, Text, StyleSheet, Animated, Image } from 'react-native';
import { DarkButton } from '../../components/blitzz/DarkButton';
import { colors, fonts } from '../../components/blitzz/tokens';
import {useAuth} from "@/services/AuthContext";
import {PrimaryButton} from "@/components/blitzz/PrimaryButton";
import {FadeInRight, useAnimatedStyle, withRepeat, withSequence, withTiming} from 'react-native-reanimated';

export default function Profile({ onViewGroups }: { onViewGroups: () => void }) {
    const { user, logout, isLoading } = useAuth();

    return (
        <View style={styles.container}>
            {/* 欢迎语 */}
            <View style={styles.headerContainer}>
                <View style={styles.textHeader}>
                    <Text style={styles.welcomeLabel}>Profil de</Text>
                    <Animated.Text
                        // @ts-ignore
                        entering={FadeInRight.delay(200)}
                        style={styles.username}>
                        {user?.nickname || 'Voyageur'}
                    </Animated.Text>
                </View>

                {user?.avatar && (
                    <View style={styles.avatarWrapper}>
                        <Image
                            source={{ uri: user.avatar }}
                            style={styles.avatar}
                        />
                        {/* 装饰性位面可以保留，也可以在里面塞你找的 Lottie */}
                        <View style={styles.avatarBorder} />
                    </View>
                )}
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
                    <Text style={styles.infoLabel}>Niveau d&#39;études</Text>
                    <Text style={[styles.infoValue, { color: colors.primary }]}>
                        {user?.education_level || 'Non spécifié'}
                    </Text>
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
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 40
    },
    textHeader: { flex: 1 },
    welcomeLabel: { fontFamily: fonts.inter, fontSize: 18, color: colors.secondaryText, marginBottom: 5 },
    username: { fontFamily: fonts.inter, fontSize: 36, fontWeight: '700', color: colors.dark },
    infoCard: { backgroundColor: colors.grayBg, borderRadius: 20, padding: 20 },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
    infoLabel: { fontFamily: fonts.inter, fontSize: 15, color: colors.secondaryText },
    infoValue: { fontFamily: fonts.inter, fontSize: 15, fontWeight: '600', color: colors.dark },
    divider: { height: 1, backgroundColor: colors.light, opacity: 0.5 },
    footer: { marginTop: 'auto', marginBottom: 20 },
    spacer: { flex: 0.1, flexDirection: 'row', justifyContent: 'space-between' },
    avatarWrapper: {
        width: 80,
        height: 80,
        position: 'relative',
        shadowColor: '#4285F4', // Google Blue
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 10,
        elevation: 5,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 3,
        borderColor: '#FFF',
    },
    avatarBorder: {
        position: 'absolute',
        top: -4,
        left: -4,
        right: -4,
        bottom: -4,
        borderRadius: 44,
        borderWidth: 1,
        borderColor: colors.primary,
        opacity: 0.2,
    },
});