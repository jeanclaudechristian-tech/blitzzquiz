import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts } from '../../components/blitzz/tokens';

export default function Dashboard() {
    return (
        <View style={styles.container}>
            <View style={styles.placeholder}>
                <Text style={styles.title}>Dashboard</Text>
                <Text style={styles.subtitle}>Coming Soon...</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholder: {
        alignItems: 'center',
    },
    title: {
        fontFamily: fonts.inter,
        fontSize: 24,
        fontWeight: '700',
        color: colors.dark,
        marginBottom: 8,
    },
    subtitle: {
        fontFamily: fonts.inter,
        fontSize: 14,
        color: colors.secondaryText,
    },
});