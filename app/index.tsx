// app/index.tsx

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../constants/colors';

export default function HomeScreen() {
  const router = useRouter();

  const handleStart = () => {
    // 처음 들어가면 과목 탭으로 이동 (원하면 gpa-sim이나 tasks로 바꿔도 됨)
    router.replace('/(tabs)/subjects');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.appTitle}>GPA Planner</Text>
      <Text style={styles.subtitle}>
        이번 학기 과목과 성적을 한눈에 관리하고{'\n'}
        목표 GPA를 쉽게 확인해 보세요.
      </Text>

      <TouchableOpacity style={styles.startButton} onPress={handleStart}>
        <Text style={styles.startButtonText}>시작하기</Text>
      </TouchableOpacity>

      <Text style={styles.helperText}>
        하단 탭에서 언제든지 과목, GPA 시뮬레이션,{'\n'}
        할 일 관리 화면으로 이동할 수 있습니다.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  startButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 999,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  helperText: {
    marginTop: 20,
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});
