import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { DarkButton } from '../../components/blitzz/DarkButton';
import { useAuth } from '../../services/AuthContext';
import { colors, fonts } from '../../components/blitzz/tokens';
import { DashboardHeader } from '../../components/blitzz/DashboardHeader'; // 确保路径正确

export default function HomeScreen() {
    // 从 Context 中获取用户信息和登出方法
    const { user, logout } = useAuth();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>

                <DashboardHeader
                    averageScore={78}
                    completedQuizzes={23}
                    onProfil={() => console.log('Profil Clicked')}
                />

                {/* 顶部欢迎语 */}
                <View style={styles.header}>
                    <Text style={styles.welcomeLabel}>Bonjour,</Text>
                    {/* 使用可选链 ?. 防止 user 为空时报错 */}
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
                        <Text style={styles.infoValue}>{user?.role || 'Étudiant'}</Text>
                    </View>
                </View>

                {/* 撑开空间，把退出按钮挤到底部 */}
                <View style={{ flex: 1 }} />

                {/* 退出按钮 */}
                <View style={styles.footer}>
                    <DarkButton label="Se déconnecter" onPress={logout} />
                </View>

            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.light,
    },
    content: {
        flex: 1,
        paddingHorizontal: 30,
        paddingTop: 40,
        paddingBottom: 20,
    },
    header: {
        marginBottom: 40,
    },
    welcomeLabel: {
        fontFamily: fonts.inter,
        fontSize: 18,
        color: colors.secondaryText,
        marginBottom: 5,
    },
    username: {
        fontFamily: fonts.inter,
        fontSize: 36,
        fontWeight: '700',
        color: colors.dark,
    },
    infoCard: {
        backgroundColor: colors.grayBg,
        borderRadius: 20,
        padding: 20,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
    },
    infoLabel: {
        fontFamily: fonts.inter,
        fontSize: 15,
        color: colors.secondaryText,
    },
    infoValue: {
        fontFamily: fonts.inter,
        fontSize: 16,
        fontWeight: '600',
        color: colors.dark,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
    footer: {
        marginBottom: 20,
    }
});