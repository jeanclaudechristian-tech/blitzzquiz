// components/blitzz/DangerButton.tsx
import React from "react";
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    View,
    ViewStyle,
    ActivityIndicator,
    Alert // ✅ 引入弹窗组件
} from "react-native";
import { colors, sizes, fonts } from "./tokens";

type DangerButtonProps = {
    label: string;
    confirmTitle?: string;    // ✅ 定制弹窗标题
    confirmMessage?: string;  // ✅ 定制弹窗内容
    icon?: React.ReactNode;
    style?: ViewStyle;
    onPress: () => void;      // 危险操作必须有回调
    isLoading?: boolean;
};

export function DangerButton({
                                 label,
                                 confirmTitle = "Action Dangereuse",
                                 confirmMessage = "Êtes-vous sûr de vouloir continuer ?",
                                 icon,
                                 style,
                                 onPress,
                                 isLoading = false
                             }: DangerButtonProps) {

    // ✅ 核心逻辑：先拦截，再执行
    const handlePress = () => {
        Alert.alert(
            confirmTitle,
            confirmMessage,
            [
                { text: "Annuler", style: "cancel" },
                {
                    text: "Confirmer",
                    style: "destructive", // iOS 上会显示红色文字
                    onPress: onPress
                }
            ]
        );
    };

    return (
        <TouchableOpacity
            style={[styles.button, style, isLoading && { opacity: 0.8 }]}
            onPress={handlePress}
            activeOpacity={0.8}
            disabled={isLoading}
        >
            {isLoading ? (
                <ActivityIndicator size="small" color={colors.light} />
            ) : (
                <>
                    {icon ? <View style={styles.iconWrap}>{icon}</View> : null}
                    <Text style={styles.text}>{label}</Text>
                </>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        height: sizes.buttonHeight,
        borderRadius: sizes.inputRadius,
        backgroundColor: '#FF3B30', // ✅ 醒目的警示红
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        gap: 10,
    },
    text: {
        color: colors.light,
        fontSize: 16,
        fontFamily: fonts.inter,
        fontWeight: "700", // ✅ 加粗显示
    },
    iconWrap: {
        width: 26,
        height: 26,
        alignItems: "center",
        justifyContent: "center",
    },
});