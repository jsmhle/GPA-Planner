// app/(tabs)/timetable.tsx

import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../../constants/colors';
import { useFocusEffect } from '@react-navigation/native';

const STORAGE_KEY = 'timetableImageUri';

export default function TimetableScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 저장된 시간표 불러오기
  const loadTimetable = async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        setImageUri(saved);
      }
    } catch (e) {
      console.warn('시간표 불러오기 실패', e);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadTimetable();
    }, [])
  );

  // 갤러리에서 사진 선택
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('권한 필요', '시간표 사진을 불러오기 위해 사진 접근 권한이 필요합니다.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (result.canceled) {
      return;
    }

    const uri = result.assets[0]?.uri;
    if (!uri) return;

    try {
      await AsyncStorage.setItem(STORAGE_KEY, uri);
      setImageUri(uri);
      Alert.alert('저장 완료', '시간표 사진이 저장되었습니다.');
    } catch (e) {
      console.warn('시간표 저장 실패', e);
      Alert.alert('오류', '시간표를 저장하는 중 문제가 발생했습니다.');
    }
  };

  // 저장된 시간표 삭제
  const removeTimetable = async () => {
    Alert.alert('시간표 삭제', '저장된 시간표를 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            await AsyncStorage.removeItem(STORAGE_KEY);
            setImageUri(null);
          } catch (e) {
            console.warn('시간표 삭제 실패', e);
            Alert.alert('오류', '시간표를 삭제하는 중 문제가 발생했습니다.');
          }
        },
      },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>이번 학기 시간표</Text>
      <Text style={styles.subtitle}>
        자주 확인하는 시간표를 사진으로 업로드해서 한 번에 확인하실 수 있습니다.
      </Text>

      {isLoading ? (
        <View style={styles.placeholderBox}>
          <Text style={styles.placeholderText}>시간표를 불러오는 중입니다...</Text>
        </View>
      ) : imageUri ? (
        <View style={styles.imageWrapper}>
          <Image source={{ uri: imageUri }} style={styles.image} resizeMode="contain" />
        </View>
      ) : (
        <View style={styles.placeholderBox}>
          <Text style={styles.placeholderText}>
            아직 저장된 시간표가 없습니다.{'\n'}
            아래 버튼을 눌러 시간표 사진을 선택해 주세요.
          </Text>
        </View>
      )}

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.primaryButton} onPress={pickImage}>
          <Text style={styles.primaryButtonText}>
            {imageUri ? '시간표 사진 다시 선택하기' : '시간표 사진 선택하기'}
          </Text>
        </TouchableOpacity>

        {imageUri && (
          <TouchableOpacity style={styles.secondaryButton} onPress={removeTimetable}>
            <Text style={styles.secondaryButtonText}>저장된 시간표 삭제</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: colors.bg,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 16,
  },
  placeholderBox: {
    flex: 1,
    minHeight: 260,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginTop: 8,
    marginBottom: 16,
  },
  placeholderText: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
  },
  imageWrapper: {
    minHeight: 260,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: 320,
  },
  buttonRow: {
    gap: 10,
  },
  primaryButton: {
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  secondaryButton: {
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: colors.textMuted,
    fontSize: 14,
  },
});
