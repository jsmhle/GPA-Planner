import React from 'react';
import { Stack } from 'expo-router';
import { HolidayProvider } from './context/HolidayContext';
import { CoursesProvider } from '../src/CoursesContext';
import { colors } from '../constants/colors';

export default function RootLayout() {
  return (
    <HolidayProvider>
      <CoursesProvider>
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.card },
            headerTintColor: colors.text,
            contentStyle: { backgroundColor: colors.bg },
          }}
        >
          {/* 첫 화면: 시작하기 버튼 있는 랜딩 페이지 */}
          <Stack.Screen
            name="index"
            options={{
              headerShown: false,
            }}
          />

          {/* 탭 화면들 */}
          <Stack.Screen
            name="(tabs)"
            options={{
              headerShown: false,
            }}
          />

          {/* 과목 추가 화면 */}
          <Stack.Screen
            name="add-course"
            options={{
              title: '과목 추가',
            }}
          />

          {/* 과목 설정 화면 */}
          <Stack.Screen
            name="course/[id]"
            options={{
              title: '과목 설정',
            }}
          />
        </Stack>
      </CoursesProvider>
    </HolidayProvider>
  );
}
