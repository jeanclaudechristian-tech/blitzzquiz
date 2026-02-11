import React, { useRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import LottieView from 'lottie-react-native';

interface ProfilIconProps {
    onPress?: () => void;
}

export const ProfilIcon = ({ onPress }: ProfilIconProps) => {
    const animation = useRef<LottieView>(null);

    const handlePress = () => {
        animation.current?.reset();
        animation.current?.play();
        if (onPress) onPress();
    };

    return (
        <View style={styles.shadowContainer}>
            <View style={styles.visualContainer}>
                <Pressable
                    onPress={handlePress}
                    style={({ pressed }) => [
                        styles.content,
                        {
                            backgroundColor: pressed ? '#3bb5e6' : '#50CAFF',
                            transform: [{ scale: pressed ? 0.95 : 1 }]
                        }
                    ]}
                >
                    <LottieView
                        ref={animation}
                        source={require('../../assets/animated/system-regular-8-account-hover-pinch.json')}
                        style={styles.lottie}
                        autoPlay={false}
                        loop={false}
                    />
                </Pressable>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    shadowContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(0,0,0,0.01)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
    },
    visualContainer: {
        flex: 1,
        borderRadius: 28,
        overflow: 'hidden',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    lottie: {
        width: 40,
        height: 40,
    },
});