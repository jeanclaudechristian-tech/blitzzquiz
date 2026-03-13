// components/blitzz/QuizDetailModal.tsx
import React from 'react';
import { View, Text, StyleSheet, Modal, Pressable, TouchableOpacity } from 'react-native';
import { colors } from '@/components/blitzz/tokens';
import { Quiz } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import Animated, { SlideInDown, SlideOutDown } from 'react-native-reanimated';

interface QuizDetailModalProps {
    quiz: Quiz | null;
    isVisible: boolean;
    onClose: () => void;
    onStart: (quiz: Quiz) => void;
}

export const QuizDetailModal = ({ quiz, isVisible, onClose, onStart }: QuizDetailModalProps) => {
    if (!quiz) return null;

    return (
        <Modal visible={isVisible} transparent animationType="fade">
            <Pressable style={styles.overlay} onPress={onClose}>
                <Animated.View
                    entering={SlideInDown}
                    exiting={SlideOutDown}
                    style={styles.sheet}
                >
                    <Pressable style={{width: '100%'}}>
                        <View style={styles.handle} />

                        <Text style={styles.category}>{quiz.category || 'Général'}</Text>
                        <Text style={styles.title}>{quiz.titre}</Text>
                        <Text style={styles.description}>{quiz.description}</Text>

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
                        >
                            <Text style={styles.startText}>Lancer le Quiz</Text>
                            <Ionicons name="flash" size={20} color="#FFF" />
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
        alignItems: 'center'
    },
    handle: { width: 40, height: 5, backgroundColor: '#EEE', borderRadius: 3, marginBottom: 25 },
    category: { color: colors.primary, fontWeight: '700', fontSize: 14, marginBottom: 8, textTransform: 'uppercase' },
    title: { fontSize: 24, fontWeight: '800', color: colors.dark, textAlign: 'center', marginBottom: 12 },
    description: { fontSize: 16, color: '#666', textAlign: 'center', lineHeight: 24, marginBottom: 30 },
    infoGrid: { flexDirection: 'row', gap: 20, marginBottom: 35 },
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
        // 阴影
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10
    },
    startText: { color: '#FFF', fontSize: 18, fontWeight: '700' }
});