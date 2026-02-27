import React, { useRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import LottieView from 'lottie-react-native';

interface HomeIconProps {
    onPress?: () => void;
}

export const HomeIcon = ({ onPress }: HomeIconProps) => {
    const animation = useRef<LottieView>(null);

    const handlePress = () => {
        animation.current?.reset();
        animation.current?.play();
        setTimeout(() => {
            if (onPress) onPress();
        }, 200);
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
                        }
                    ]}
                >
                    <LottieView
                        ref={animation}
                        source={require('../../assets/animated/system-regular-41-home-hover-pinch.json')}
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