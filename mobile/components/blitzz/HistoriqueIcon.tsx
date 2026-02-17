import React from 'react';
import { View, StyleSheet } from 'react-native';
import { StatisticIsland } from './StatisticIsland';
import { ProfilIcon } from './ProfilIcon';
import { SearchIcon } from './SearchIcon';

interface DashboardHeaderProps {
  averageScore?: number;
  completedQuizzes?: number;
  onSearchClick?: () => void;
  onProfilClick?: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
                                                                  averageScore = 78,
                                                                  completedQuizzes = 23,
                                                                  onSearchClick,
                                                                  onProfilClick,
                                                                }) => {
  return (
      <View style={styles.headerContainer}>
        {/* Island 占据左侧所有剩余空间，内容不会再挤出来 */}
        <StatisticIsland
            averageScore={averageScore}
            completedQuizzes={completedQuizzes}
        />

        {/* 右侧按钮组：Search 和 Profil */}
        <View style={styles.buttonGroup}>
          <SearchIcon onPress={onSearchClick} />
          <View style={styles.gap} />
          <ProfilIcon onPress={onProfilClick} />
        </View>
      </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // 让 Island 和球组分居两侧
    width: '100%',
    height: 56, // 统一高度
    paddingHorizontal: 0, // 根据你的 Home.tsx padding 调整
  },
  buttonGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16, // Island 和球之间的“留空”
  },
  gap: {
    width: 12, // 两个圆球之间的间距
  }
});