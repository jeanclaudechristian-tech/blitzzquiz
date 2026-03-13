import React from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';
import { colors, fonts } from './tokens';

interface HighlightTextProps {
    text: string;
    style?: TextStyle;
    highlightKeyword?: string;
    numberOfLines?: number;
}

export const HighlightText = ({ text, style, highlightKeyword, numberOfLines }: HighlightTextProps) => {
    if (!text) return null;

    let parts: string[] = [];
    let isHtmlMark = text.includes('<mark>');

    if (isHtmlMark) {
        // 1. 如果有后端标记，按标签切
        parts = text.split(/(<mark>.*?<\/mark>)/g);
    } else if (highlightKeyword && highlightKeyword.trim().length > 0) {
        // 2. 如果没标签但有关键词，按关键词切（忽略大小写）
        const escapedKeyword = highlightKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(${escapedKeyword})`, 'gi');
        parts = text.split(regex);
    } else {
        // 3. 啥都没有，直接显示原文
        return <Text style={style} numberOfLines={numberOfLines}>{text}</Text>;
    }

    return (
        <Text style={style} numberOfLines={numberOfLines}>
            {parts.map((part, index) => {
                const isMatch = isHtmlMark
                    ? (part.startsWith('<mark>') && part.endsWith('</mark>'))
                    : (part.toLowerCase() === highlightKeyword?.toLowerCase());

                if (isMatch) {
                    const content = isHtmlMark ? part.replace(/<\/?mark>/g, '') : part;
                    return (
                        <Text key={index} style={styles.highlight}>
                            {content}
                        </Text>
                    );
                }
                return part;
            })}
        </Text>
    );
};

const styles = StyleSheet.create({
    base: {
        fontFamily: fonts.inter,
        fontSize: 14,
        color: colors.secondaryText,
    },
    highlight: {
        // 让关键词在位面中发光
        color: colors.primary,
        fontWeight: '700',
        backgroundColor: 'rgba(255, 107, 107, 0.1)', // 淡淡的底色
    },
});