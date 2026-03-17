// app/(tabs)/SearchPage.tsx
import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { QuizCard } from '@/components/blitzz/QuizCard';
import { colors, fonts } from '@/components/blitzz/tokens';
import { Quiz } from '@/types';
interface SearchPageProps {
    results: Quiz[] | null;
    searchQuery: string;
    onSelectQuiz: (quiz: Quiz) => void;
}

export default function SearchPage({ results, searchQuery, onSelectQuiz }: SearchPageProps) {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Résultats de recherche</Text>
            <FlatList
                data={results}
                style={{ marginHorizontal: -15 }}
                contentContainerStyle={{
                    paddingHorizontal: 15, // 给阴影留出绝对安全的渲染区
                    paddingBottom: 20
                }}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <QuizCard
                        quiz={item}
                        searchQuery={searchQuery}
                        onPress={(q) => onSelectQuiz(q)}
                    />
                )}
                ListEmptyComponent={() => (
                    <View style={styles.empty}>
                        <Text style={styles.emptyText}>
                            {results === null ? "Commencez à taper..." : "Aucun quiz trouvé."}
                        </Text>
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.light },
    title: {
        fontFamily: fonts.inter,
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 15,
        color: colors.secondaryText
    },
    empty: { marginTop: 50, alignItems: 'center' },
    emptyText: { color: '#999', fontSize: 16 }
});